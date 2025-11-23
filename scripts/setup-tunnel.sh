#!/bin/bash
# Setup remote access tunnel for Crozz-Coin dashboard testing
# This script provides multiple tunnel options for remote testing

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT="${BACKEND_PORT:-4000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"
TUNNEL_METHOD="${TUNNEL_METHOD:-cloudflared}"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Crozz-Coin Remote Testing Tunnel Setup${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i ":$1" >/dev/null 2>&1
}

# Function to install cloudflared
install_cloudflared() {
    echo -e "${YELLOW}Installing cloudflared...${NC}"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
        sudo dpkg -i cloudflared-linux-amd64.deb
        rm cloudflared-linux-amd64.deb
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command_exists brew; then
            brew install cloudflared
        else
            echo -e "${RED}Please install Homebrew first: https://brew.sh${NC}"
            exit 1
        fi
    else
        echo -e "${RED}Unsupported OS. Please install cloudflared manually.${NC}"
        exit 1
    fi
}

# Function to setup cloudflared tunnel
setup_cloudflared() {
    echo -e "${GREEN}Setting up Cloudflare Tunnel (cloudflared)...${NC}"
    
    if ! command_exists cloudflared; then
        echo -e "${YELLOW}cloudflared not found. Installing...${NC}"
        install_cloudflared
    fi
    
    echo ""
    echo -e "${BLUE}Starting tunnels...${NC}"
    echo ""
    
    # Create tunnel for backend
    # Create secure temporary directory
    TEMP_DIR=$(mktemp -d -t crozz-tunnel.XXXXXX)
    
    echo -e "${GREEN}Creating tunnel for Backend (port ${BACKEND_PORT})...${NC}"
    cloudflared tunnel --url http://localhost:${BACKEND_PORT} > "${TEMP_DIR}/backend-tunnel.log" 2>&1 &
    BACKEND_PID=$!
    sleep 3
    
    # Extract backend URL from log with error checking
    BACKEND_URL=$(grep -o 'https://[^[:space:]]*\.trycloudflare.com' "${TEMP_DIR}/backend-tunnel.log" | head -1)
    if [ -z "$BACKEND_URL" ]; then
        echo -e "${RED}Failed to extract backend tunnel URL. Check log: ${TEMP_DIR}/backend-tunnel.log${NC}"
        # Validate and kill PID
        if [ -n "$BACKEND_PID" ] && [[ "$BACKEND_PID" =~ ^[0-9]+$ ]] && ps -p "$BACKEND_PID" >/dev/null 2>&1; then
            kill "$BACKEND_PID" 2>/dev/null
        fi
        exit 1
    fi
    
    # Create tunnel for frontend
    echo -e "${GREEN}Creating tunnel for Frontend (port ${FRONTEND_PORT})...${NC}"
    cloudflared tunnel --url http://localhost:${FRONTEND_PORT} > "${TEMP_DIR}/frontend-tunnel.log" 2>&1 &
    FRONTEND_PID=$!
    sleep 3
    
    # Extract frontend URL from log with error checking
    FRONTEND_URL=$(grep -o 'https://[^[:space:]]*\.trycloudflare.com' "${TEMP_DIR}/frontend-tunnel.log" | head -1)
    if [ -z "$FRONTEND_URL" ]; then
        echo -e "${RED}Failed to extract frontend tunnel URL. Check log: ${TEMP_DIR}/frontend-tunnel.log${NC}"
        # Validate and kill PIDs
        for PID in "$BACKEND_PID" "$FRONTEND_PID"; do
            if [ -n "$PID" ] && [[ "$PID" =~ ^[0-9]+$ ]] && ps -p "$PID" >/dev/null 2>&1; then
                kill "$PID" 2>/dev/null
            fi
        done
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}✓ Tunnels created successfully!${NC}"
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}  Remote Access URLs:${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}Backend API:${NC}  ${BACKEND_URL}"
    echo -e "${YELLOW}Frontend:${NC}     ${FRONTEND_URL}"
    echo ""
    echo -e "${BLUE}Process IDs:${NC}"
    echo -e "  Backend tunnel PID: ${BACKEND_PID}"
    echo -e "  Frontend tunnel PID: ${FRONTEND_PID}"
    echo ""
    echo -e "${YELLOW}To stop tunnels:${NC}"
    echo -e "  kill ${BACKEND_PID} ${FRONTEND_PID}"
    echo -e "  or run: pkill cloudflared"
    echo ""
    
    # Save tunnel info
    cat > "${TEMP_DIR}/tunnel-info.txt" <<EOF
BACKEND_URL=${BACKEND_URL}
FRONTEND_URL=${FRONTEND_URL}
BACKEND_PID=${BACKEND_PID}
FRONTEND_PID=${FRONTEND_PID}
CREATED=$(date)
EOF
    
    echo -e "${GREEN}Tunnel information saved to: ${TEMP_DIR}/tunnel-info.txt${NC}"
    echo ""
    echo -e "${YELLOW}Note: Update your frontend .env with:${NC}"
    echo -e "  VITE_CROZZ_API_BASE_URL=${BACKEND_URL}"
    echo ""
}

# Function to setup using localhost.run (SSH-based tunnel)
setup_localhost_run() {
    echo -e "${GREEN}Setting up localhost.run SSH tunnel...${NC}"
    
    if ! command_exists ssh; then
        echo -e "${RED}SSH not found. Please install OpenSSH client.${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${BLUE}Starting SSH tunnels...${NC}"
    echo ""
    
    # Create secure temporary directory
    TEMP_DIR=$(mktemp -d -t crozz-tunnel.XXXXXX)
    
    # Create tunnel for backend
    echo -e "${GREEN}Creating tunnel for Backend (port ${BACKEND_PORT})...${NC}"
    ssh -R 80:localhost:${BACKEND_PORT} localhost.run > "${TEMP_DIR}/backend-ssh-tunnel.log" 2>&1 &
    BACKEND_PID=$!
    sleep 5
    
    # Create tunnel for frontend
    echo -e "${GREEN}Creating tunnel for Frontend (port ${FRONTEND_PORT})...${NC}"
    ssh -R 80:localhost:${FRONTEND_PORT} localhost.run > "${TEMP_DIR}/frontend-ssh-tunnel.log" 2>&1 &
    FRONTEND_PID=$!
    sleep 5
    
    # Extract URLs with error checking
    BACKEND_URL=$(grep -o 'https://[^[:space:]]*localhost.run' "${TEMP_DIR}/backend-ssh-tunnel.log" | head -1)
    FRONTEND_URL=$(grep -o 'https://[^[:space:]]*localhost.run' "${TEMP_DIR}/frontend-ssh-tunnel.log" | head -1)
    
    if [ -z "$BACKEND_URL" ] || [ -z "$FRONTEND_URL" ]; then
        echo -e "${RED}Failed to extract tunnel URLs. Check logs in: ${TEMP_DIR}/${NC}"
        # Validate and kill PIDs
        for PID in "$BACKEND_PID" "$FRONTEND_PID"; do
            if [ -n "$PID" ] && [[ "$PID" =~ ^[0-9]+$ ]] && ps -p "$PID" >/dev/null 2>&1; then
                kill "$PID" 2>/dev/null
            fi
        done
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}✓ Tunnels created successfully!${NC}"
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}  Remote Access URLs:${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${YELLOW}Backend API:${NC}  ${BACKEND_URL}"
    echo -e "${YELLOW}Frontend:${NC}     ${FRONTEND_URL}"
    echo ""
    echo -e "${BLUE}Process IDs:${NC}"
    echo -e "  Backend tunnel PID: ${BACKEND_PID}"
    echo -e "  Frontend tunnel PID: ${FRONTEND_PID}"
    echo ""
}

# Function to show manual tunnel options
show_manual_options() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${GREEN}  Alternative Tunnel Options:${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}1. Ngrok (Requires account):${NC}"
    echo -e "   npm install -g ngrok"
    echo -e "   ngrok http ${BACKEND_PORT}    # Backend"
    echo -e "   ngrok http ${FRONTEND_PORT}   # Frontend (in another terminal)"
    echo ""
    echo -e "${YELLOW}2. Serveo (SSH-based, no installation):${NC}"
    echo -e "   ssh -R 80:localhost:${BACKEND_PORT} serveo.net    # Backend"
    echo -e "   ssh -R 80:localhost:${FRONTEND_PORT} serveo.net   # Frontend"
    echo ""
    echo -e "${YELLOW}3. Localtunnel (NPM package):${NC}"
    echo -e "   npm install -g localtunnel"
    echo -e "   lt --port ${BACKEND_PORT}    # Backend"
    echo -e "   lt --port ${FRONTEND_PORT}   # Frontend"
    echo ""
    echo -e "${YELLOW}4. Bore (Rust-based):${NC}"
    echo -e "   cargo install bore-cli"
    echo -e "   bore local ${BACKEND_PORT} --to bore.pub"
    echo ""
}

# Main menu
echo -e "${YELLOW}Select tunnel method:${NC}"
echo -e "  ${GREEN}1)${NC} Cloudflare Tunnel (cloudflared) - Recommended"
echo -e "  ${GREEN}2)${NC} localhost.run (SSH-based)"
echo -e "  ${GREEN}3)${NC} Show manual options"
echo -e "  ${GREEN}4)${NC} Exit"
echo ""

if [ -n "$TUNNEL_METHOD" ] && [ "$TUNNEL_METHOD" != "menu" ]; then
    # Use environment variable
    case $TUNNEL_METHOD in
        cloudflared|1)
            setup_cloudflared
            ;;
        localhost|2)
            setup_localhost_run
            ;;
        manual|3)
            show_manual_options
            ;;
        *)
            echo -e "${RED}Invalid tunnel method: $TUNNEL_METHOD${NC}"
            exit 1
            ;;
    esac
else
    # Interactive menu
    read -p "Enter choice [1-4]: " choice
    case $choice in
        1)
            setup_cloudflared
            ;;
        2)
            setup_localhost_run
            ;;
        3)
            show_manual_options
            ;;
        4)
            echo -e "${GREEN}Exiting...${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Exiting.${NC}"
            exit 1
            ;;
    esac
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Make sure backend is running on port ${BACKEND_PORT}"
echo -e "  2. Make sure frontend is running on port ${FRONTEND_PORT}"
echo -e "  3. Share the URLs with your team/clients"
echo -e "  4. Test the dashboard remotely"
echo ""
echo -e "${BLUE}For more details, see: docs/REMOTE_TESTING.md${NC}"
echo ""
