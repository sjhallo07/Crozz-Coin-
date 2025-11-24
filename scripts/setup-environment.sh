#!/bin/bash
# Comprehensive Development Environment Setup Script
# One-command setup for Crozz-Coin development
# Priority: Security > Functionality > Performance > Developer Experience

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

clear

echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          CROZZ-COIN DEVELOPMENT ENVIRONMENT SETUP             ║
║                                                               ║
║     Priority: Security > Functionality > Performance > DX     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}This script will set up your complete development environment.${NC}"
echo -e "${BLUE}It includes Node.js packages, security tools, Sui CLI, and more.${NC}"
echo ""

# Function to print step header
print_step() {
    echo ""
    echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}${BOLD}  $1${NC}"
    echo -e "${CYAN}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to confirm action
confirm() {
    read -p "$(echo -e ${YELLOW}$1 [Y/n]: ${NC})" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]] && [[ ! -z $REPLY ]]; then
        return 1
    fi
    return 0
}

STEP=1
TOTAL_STEPS=10

# Step 1: Check prerequisites
print_step "[$STEP/$TOTAL_STEPS] Checking Prerequisites"
STEP=$((STEP + 1))

echo -e "${YELLOW}Checking for required software...${NC}"

if ! command_exists node; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js 18.x or higher from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js $NODE_VERSION${NC}"

if ! command_exists npm; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓ npm $NPM_VERSION${NC}"

if ! command_exists git; then
    echo -e "${RED}✗ Git is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Git $(git --version | cut -d' ' -f3)${NC}"

# Step 2: Install root dependencies
print_step "[$STEP/$TOTAL_STEPS] Installing Root Dependencies"
STEP=$((STEP + 1))

cd "$ROOT_DIR"
echo "Installing security tools, linters, and formatters..."
npm install

# Step 3: Install backend dependencies
print_step "[$STEP/$TOTAL_STEPS] Installing Backend Dependencies"
STEP=$((STEP + 1))

cd "$ROOT_DIR/backend"
echo "Installing Express, Sui SDK, and testing tools..."
npm install

# Step 4: Install frontend dependencies
print_step "[$STEP/$TOTAL_STEPS] Installing Frontend Dependencies"
STEP=$((STEP + 1))

cd "$ROOT_DIR/frontend"
echo "Installing React, Sui dApp Kit, and development tools..."
npm install

# Step 5: Setup environment files
print_step "[$STEP/$TOTAL_STEPS] Setting Up Environment Files"
STEP=$((STEP + 1))

cd "$ROOT_DIR"

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
        cp .env.example .env
        echo -e "${GREEN}✓ .env file created${NC}"
        echo -e "${YELLOW}⚠ Please edit .env file with your configuration${NC}"
    else
        echo -e "${YELLOW}⚠ .env.example not found${NC}"
    fi
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

if [ ! -f frontend/.env ]; then
    if [ -f frontend/.env.example ]; then
        echo -e "${YELLOW}Creating frontend/.env file...${NC}"
        cp frontend/.env.example frontend/.env
        echo -e "${GREEN}✓ frontend/.env file created${NC}"
    fi
else
    echo -e "${GREEN}✓ frontend/.env file already exists${NC}"
fi

# Step 6: Setup Git hooks
print_step "[$STEP/$TOTAL_STEPS] Setting Up Git Hooks"
STEP=$((STEP + 1))

if confirm "Do you want to set up Git hooks for security and quality checks?"; then
    "$SCRIPT_DIR/setup-git-hooks.sh"
else
    echo -e "${YELLOW}⚠ Skipped Git hooks setup${NC}"
fi

# Step 7: Install Sui CLI (optional)
print_step "[$STEP/$TOTAL_STEPS] Sui CLI Installation"
STEP=$((STEP + 1))

if command_exists sui; then
    echo -e "${GREEN}✓ Sui CLI is already installed: $(sui --version)${NC}"
else
    echo -e "${YELLOW}Sui CLI is not installed${NC}"
    echo "Sui CLI is required for Move smart contract development"
    
    if confirm "Do you want to install Sui CLI now? (This may take 10-30 minutes)"; then
        "$SCRIPT_DIR/install-sui-cli.sh"
    else
        echo -e "${YELLOW}⚠ Skipped Sui CLI installation${NC}"
        echo "You can install it later by running: ./scripts/install-sui-cli.sh"
    fi
fi

# Step 8: Run security audit
print_step "[$STEP/$TOTAL_STEPS] Running Security Audit"
STEP=$((STEP + 1))

cd "$ROOT_DIR"
echo -e "${YELLOW}Checking for vulnerabilities...${NC}"

if npm audit --audit-level=high > /tmp/audit.log 2>&1; then
    echo -e "${GREEN}✓ No high-severity vulnerabilities found${NC}"
else
    echo -e "${YELLOW}⚠ Some vulnerabilities detected${NC}"
    echo "Run 'npm audit' for details and 'npm audit fix' to fix them"
fi

# Step 9: Verify environment
print_step "[$STEP/$TOTAL_STEPS] Verifying Environment"
STEP=$((STEP + 1))

echo -e "${YELLOW}Running environment verification...${NC}"
if node "$SCRIPT_DIR/verify-environment.js"; then
    echo -e "${GREEN}✓ Environment verification passed${NC}"
else
    echo -e "${YELLOW}⚠ Some verification checks failed${NC}"
    echo "Review the output above for details"
fi

# Step 10: Display next steps
print_step "[$STEP/$TOTAL_STEPS] Setup Complete!"
STEP=$((STEP + 1))

echo -e "${GREEN}${BOLD}✓ Development environment setup completed successfully!${NC}"
echo ""
echo -e "${CYAN}${BOLD}Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Configure environment variables:${NC}"
echo "   Edit .env and frontend/.env with your settings"
echo ""
echo -e "${YELLOW}2. Start development servers:${NC}"
echo "   npm run dev                   # Start both backend and frontend"
echo "   cd backend && npm run dev     # Start backend only"
echo "   cd frontend && npm run dev    # Start frontend only"
echo ""
echo -e "${YELLOW}3. Build smart contract (if Sui CLI installed):${NC}"
echo "   cd smart-contract && sui move build"
echo ""
echo -e "${YELLOW}4. Run tests:${NC}"
echo "   npm test                      # Run all tests"
echo "   cd backend && npm test        # Run backend tests"
echo ""
echo -e "${YELLOW}5. Run security checks:${NC}"
echo "   npm run security:check        # Quick security check"
echo "   ./scripts/security-audit.sh   # Comprehensive security audit"
echo ""
echo -e "${YELLOW}6. Useful commands:${NC}"
echo "   npm run lint                  # Lint all code"
echo "   npm run format                # Format all code"
echo "   npm run verify                # Verify environment"
echo "   ./scripts/check-dependencies.sh  # Check dependency health"
echo ""
echo -e "${CYAN}${BOLD}Documentation:${NC}"
echo "   docs/DEVELOPMENT_ENVIRONMENT.md - Complete setup guide"
echo "   README.md                       - Project overview"
echo ""
echo -e "${CYAN}${BOLD}VSCode Users:${NC}"
echo "   Install recommended extensions for the best experience"
echo "   Open Command Palette (Ctrl/Cmd + Shift + P)"
echo "   Select: Extensions: Show Recommended Extensions"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""

# Save setup log
SETUP_LOG="$ROOT_DIR/.setup-complete"
date > "$SETUP_LOG"
echo "Environment setup completed successfully" >> "$SETUP_LOG"
echo "Node.js: $NODE_VERSION" >> "$SETUP_LOG"
echo "npm: $NPM_VERSION" >> "$SETUP_LOG"

exit 0
