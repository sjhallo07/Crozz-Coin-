#!/bin/bash
# Quick Start Script for Crozz-Coin Complete Ecosystem
# This script sets up and runs the entire ecosystem for testing

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# Check if running in CI
IS_CI="${CI:-false}"

echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Crozz-Coin Complete Ecosystem Quick Start     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    if command -v lsof >/dev/null 2>&1; then
        lsof -i ":$1" >/dev/null 2>&1
    elif command -v netstat >/dev/null 2>&1; then
        netstat -an | grep -q ":$1.*LISTEN" 2>/dev/null
    elif command -v ss >/dev/null 2>&1; then
        ss -ln | grep -q ":$1" 2>/dev/null
    else
        # If no tool available, assume port is free
        return 1
    fi
}

# Step 1: Check prerequisites
echo -e "${CYAN}Step 1: Checking prerequisites...${NC}"
echo ""

if ! command_exists node; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo -e "  Please install Node.js v18 or later from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"

if ! command_exists npm; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm found: $(npm --version)${NC}"

echo ""

# Step 2: Setup environment files
echo -e "${CYAN}Step 2: Setting up environment files...${NC}"
echo ""

# Copy .env.example to .env if not exists
if [ ! -f "$ROOT_DIR/.env" ]; then
    if [ -f "$ROOT_DIR/.env.example" ]; then
        echo -e "${YELLOW}Creating .env from .env.example...${NC}"
        cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
        echo -e "${GREEN}✓ Created .env file${NC}"
    else
        echo -e "${YELLOW}⚠ .env.example not found, .env file must be created manually${NC}"
    fi
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Create backend .env if not exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env (symlink to root .env)...${NC}"
    ln -s "$ROOT_DIR/.env" "$BACKEND_DIR/.env"
    echo -e "${GREEN}✓ Created backend/.env symlink${NC}"
else
    echo -e "${GREEN}✓ backend/.env already exists${NC}"
fi

# Create frontend .env if not exists
if [ ! -f "$FRONTEND_DIR/.env" ]; then
    echo -e "${YELLOW}Creating frontend/.env...${NC}"
    cat > "$FRONTEND_DIR/.env" <<EOF
# Crozz-Coin Frontend Configuration
VITE_CROZZ_API_BASE_URL=http://localhost:4000
VITE_CROZZ_PACKAGE_ID=0xPACKAGE
VITE_CROZZ_MODULE=crozz_token
VITE_CROZZ_METADATA_ID=0xMETADATA
VITE_CROZZ_VIEW_FUNCTION=get_icon_url
VITE_CROZZ_GAS_BUDGET=10000000
VITE_CROZZ_ADMIN_TOKEN=change-me
VITE_SUI_NETWORK=testnet
VITE_CROZZ_REGISTRY_ID=0xYOUR_REGISTRY_SHARED_OBJECT
VITE_CROZZ_TREASURY_CAP_ID=0xYOUR_TREASURY_CAP_OBJECT
VITE_CROZZ_ADMIN_CAP_ID=0xYOUR_ADMIN_CAP_OBJECT
VITE_SUI_CLOCK_OBJECT=0x6
EOF
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
else
    echo -e "${GREEN}✓ frontend/.env already exists${NC}"
fi

echo ""

# Step 3: Install dependencies
echo -e "${CYAN}Step 3: Installing dependencies...${NC}"
echo ""

# Check if node_modules exists
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd "$BACKEND_DIR" && npm install
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd "$FRONTEND_DIR" && npm install
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

echo ""

# Step 4: Check ports
echo -e "${CYAN}Step 4: Checking port availability...${NC}"
echo ""

if port_in_use 4000; then
    echo -e "${YELLOW}⚠ Port 4000 is already in use (Backend)${NC}"
    echo -e "  Please stop the service using port 4000 or change BACKEND_PORT"
else
    echo -e "${GREEN}✓ Port 4000 is available (Backend)${NC}"
fi

if port_in_use 5173; then
    echo -e "${YELLOW}⚠ Port 5173 is already in use (Frontend)${NC}"
    echo -e "  Please stop the service using port 5173 or change FRONTEND_PORT"
else
    echo -e "${GREEN}✓ Port 5173 is available (Frontend)${NC}"
fi

echo ""

# Step 5: Display configuration
echo -e "${CYAN}Step 5: Configuration Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${YELLOW}Environment:${NC}      ${NODE_ENV:-development}"
echo -e "${YELLOW}Backend Port:${NC}     4000"
echo -e "${YELLOW}Frontend Port:${NC}    5173"
echo -e "${YELLOW}Sui Network:${NC}      testnet"
echo -e "${YELLOW}Backend URL:${NC}      http://localhost:4000"
echo -e "${YELLOW}Frontend URL:${NC}     http://localhost:5173"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""

# Step 6: Run mode selection
echo -e "${CYAN}Step 6: Select run mode${NC}"
echo ""
echo -e "${GREEN}Select how to run the ecosystem:${NC}"
echo -e "  ${YELLOW}1)${NC} Start Backend only"
echo -e "  ${YELLOW}2)${NC} Start Frontend only"
echo -e "  ${YELLOW}3)${NC} Start Both (Recommended)"
echo -e "  ${YELLOW}4)${NC} Start with Docker Compose"
echo -e "  ${YELLOW}5)${NC} Setup Remote Tunnel (for external testing)"
echo -e "  ${YELLOW}6)${NC} Exit"
echo ""

if [ "$IS_CI" = "true" ]; then
    echo -e "${YELLOW}Running in CI mode - selecting option 3 (Start Both)${NC}"
    choice=3
else
    read -p "Enter choice [1-6]: " choice
fi

case $choice in
    1)
        echo ""
        echo -e "${GREEN}Starting Backend Server...${NC}"
        echo -e "${BLUE}═══════════════════════════════════════${NC}"
        cd "$BACKEND_DIR"
        npm run dev
        ;;
    2)
        echo ""
        echo -e "${GREEN}Starting Frontend Server...${NC}"
        echo -e "${BLUE}═══════════════════════════════════════${NC}"
        cd "$FRONTEND_DIR"
        npm run dev
        ;;
    3)
        echo ""
        echo -e "${GREEN}Starting Complete Ecosystem...${NC}"
        echo -e "${BLUE}═══════════════════════════════════════${NC}"
        echo ""
        # Create secure temporary directory for logs
        TEMP_DIR=$(mktemp -d -t crozz-logs.XXXXXX)
        
        echo -e "${YELLOW}Starting Backend in background...${NC}"
        cd "$BACKEND_DIR"
        npm run dev > "${TEMP_DIR}/crozz-backend.log" 2>&1 &
        BACKEND_PID=$!
        echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
        echo -e "  Logs: tail -f ${TEMP_DIR}/crozz-backend.log"
        
        # Wait for backend to start
        echo -e "${YELLOW}Waiting for backend to start...${NC}"
        sleep 5
        
        if kill -0 $BACKEND_PID 2>/dev/null; then
            echo -e "${GREEN}✓ Backend is running${NC}"
        else
            echo -e "${RED}✗ Backend failed to start. Check logs: /tmp/crozz-backend.log${NC}"
            exit 1
        fi
        
        echo ""
        echo -e "${YELLOW}Starting Frontend in foreground...${NC}"
        cd "$FRONTEND_DIR"
        
        # Save PIDs for cleanup
        echo "$BACKEND_PID" > "${TEMP_DIR}/crozz-pids.txt"
        
        # Trap SIGINT to cleanup
        trap "echo ''; echo 'Shutting down...'; \
              if [ -f '${TEMP_DIR}/crozz-pids.txt' ]; then \
                  PID=\$(cat '${TEMP_DIR}/crozz-pids.txt' 2>/dev/null); \
                  if [ -n \"\$PID\" ] && [[ \"\$PID\" =~ ^[0-9]+$ ]] && ps -p \"\$PID\" >/dev/null 2>&1; then \
                      kill \"\$PID\" 2>/dev/null; \
                  fi; \
              fi; \
              rm -rf '${TEMP_DIR}'; exit" INT TERM
        
        npm run dev
        ;;
    4)
        echo ""
        echo -e "${GREEN}Starting with Docker Compose...${NC}"
        echo -e "${BLUE}═══════════════════════════════════════${NC}"
        cd "$ROOT_DIR"
        
        if ! command_exists docker; then
            echo -e "${RED}✗ Docker is not installed${NC}"
            exit 1
        fi
        
        if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
            echo -e "${RED}✗ Docker Compose is not installed${NC}"
            exit 1
        fi
        
        # Use docker compose (v2) or docker-compose (v1)
        if docker compose version >/dev/null 2>&1; then
            docker compose up --build
        else
            docker-compose up --build
        fi
        ;;
    5)
        echo ""
        echo -e "${GREEN}Setting up Remote Tunnel...${NC}"
        echo -e "${BLUE}═══════════════════════════════════════${NC}"
        
        if [ -f "$SCRIPT_DIR/setup-tunnel.sh" ]; then
            bash "$SCRIPT_DIR/setup-tunnel.sh"
        else
            echo -e "${RED}✗ Tunnel setup script not found at: $SCRIPT_DIR/setup-tunnel.sh${NC}"
            exit 1
        fi
        ;;
    6)
        echo -e "${GREEN}Exiting...${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Quick Start Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Access the application:${NC}"
echo -e "  Backend API:  ${CYAN}http://localhost:4000${NC}"
echo -e "  Frontend UI:  ${CYAN}http://localhost:5173${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
if [ -n "${TEMP_DIR}" ] && [ -d "${TEMP_DIR}" ]; then
    echo -e "  View backend logs:  ${CYAN}tail -f ${TEMP_DIR}/crozz-backend.log${NC}"
    echo -e "  Stop background:    ${CYAN}kill \$(cat ${TEMP_DIR}/crozz-pids.txt)${NC}"
else
    echo -e "  View backend logs:  ${CYAN}Check console output${NC}"
fi
echo -e "  Setup tunnel:       ${CYAN}./scripts/setup-tunnel.sh${NC}"
echo ""
echo -e "${BLUE}For more information, see README.md and docs/REMOTE_TESTING.md${NC}"
echo ""
