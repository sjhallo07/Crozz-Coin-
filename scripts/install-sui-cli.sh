#!/bin/bash
# Script to install Sui CLI and development tools
# Priority: Security > Functionality > Performance > Developer Experience

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Installing Sui CLI and Development Tools${NC}"
echo "=========================================="

# Check if running on supported OS
OS="$(uname -s)"
ARCH="$(uname -m)"

echo -e "${YELLOW}Detected OS: $OS $ARCH${NC}"

# Function to check command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command_exists curl; then
    echo -e "${RED}Error: curl is required but not installed.${NC}"
    exit 1
fi

if ! command_exists git; then
    echo -e "${RED}Error: git is required but not installed.${NC}"
    exit 1
fi

# Check if Rust is installed
if ! command_exists cargo; then
    echo -e "${YELLOW}Rust is not installed. Installing Rust...${NC}"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
else
    echo -e "${GREEN}Rust is already installed.${NC}"
fi

# Update Rust to latest stable
echo -e "\n${YELLOW}Updating Rust to latest stable version...${NC}"
rustup update stable

# Install Sui CLI
echo -e "\n${YELLOW}Installing Sui CLI...${NC}"

if command_exists sui; then
    CURRENT_VERSION=$(sui --version 2>/dev/null || echo "unknown")
    echo -e "${GREEN}Sui CLI is already installed: $CURRENT_VERSION${NC}"
    echo -e "${YELLOW}Updating Sui CLI...${NC}"
fi

# Install from cargo
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui

# Verify installation
if command_exists sui; then
    SUI_VERSION=$(sui --version)
    echo -e "\n${GREEN}✓ Sui CLI installed successfully!${NC}"
    echo -e "Version: $SUI_VERSION"
else
    echo -e "\n${RED}✗ Failed to install Sui CLI${NC}"
    exit 1
fi

# Initialize Sui client config if not exists
echo -e "\n${YELLOW}Initializing Sui client configuration...${NC}"
if [ ! -f "$HOME/.sui/sui_config/client.yaml" ]; then
    sui client
else
    echo -e "${GREEN}Sui client already configured.${NC}"
fi

# Install Move Analyzer (LSP for Move)
echo -e "\n${YELLOW}Installing Move Analyzer...${NC}"
cargo install --git https://github.com/move-language/move move-analyzer --branch main --features "address32"

# Install Move Prover dependencies (optional but recommended for formal verification)
echo -e "\n${YELLOW}Installing Move Prover dependencies...${NC}"
if command_exists apt-get; then
    echo -e "${YELLOW}Detected apt-get package manager...${NC}"
    echo -e "${YELLOW}Note: Move Prover requires additional dependencies. Install manually if needed.${NC}"
elif command_exists brew; then
    echo -e "${YELLOW}Detected Homebrew package manager...${NC}"
    echo -e "${YELLOW}Note: Move Prover requires additional dependencies. Install manually if needed.${NC}"
fi

# Verify Move tools
echo -e "\n${YELLOW}Verifying Move tools...${NC}"
if command_exists move-analyzer; then
    echo -e "${GREEN}✓ Move Analyzer installed successfully!${NC}"
else
    echo -e "${YELLOW}⚠ Move Analyzer not found. This is optional but recommended.${NC}"
fi

# Create Sui client aliases
echo -e "\n${YELLOW}Setting up helpful aliases...${NC}"
cat >> "$HOME/.bashrc" << 'EOF' || true

# Sui CLI aliases
alias sui-test='sui move test'
alias sui-build='sui move build'
alias sui-publish='sui client publish --gas-budget 100000000'
alias sui-call='sui client call --gas-budget 10000000'
alias sui-gas='sui client gas'
alias sui-balance='sui client balance'
EOF

echo -e "\n${GREEN}Installation complete!${NC}"
echo -e "${YELLOW}Please run 'source ~/.bashrc' or restart your terminal to use the aliases.${NC}"

# Display helpful information
echo -e "\n${GREEN}Next steps:${NC}"
echo "1. Configure your Sui client: sui client"
echo "2. Get test tokens: Visit https://discord.gg/sui for testnet faucet"
echo "3. Test your setup: sui client active-address"
echo "4. Build the smart contract: cd smart-contract && sui move build"
echo ""
echo -e "${GREEN}Useful commands:${NC}"
echo "- sui client active-address    : Show current active address"
echo "- sui client envs              : List available environments"
echo "- sui client switch --env testnet : Switch to testnet"
echo "- sui move test                : Run Move tests"
echo "- sui move build               : Build Move package"
echo ""

exit 0
