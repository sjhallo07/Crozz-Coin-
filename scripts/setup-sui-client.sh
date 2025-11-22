#!/usr/bin/env bash
#
# Sui Client Address Setup - Bash Wrapper
# 
# This is a convenient wrapper around setup-sui-client.js
# that handles the Node.js execution and provides a simpler interface.
#
# Usage:
#   ./scripts/setup-sui-client.sh [options]
#
# Options:
#   --update-env     Update .env file with generated credentials
#   --network        Network to use (testnet, mainnet, localnet) [default: testnet]
#   --gas-budget     Default gas budget [default: 10000000]
#   --help           Show this help message
#

set -euo pipefail

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "$ROOT_DIR/backend/node_modules/@mysten/sui" ]; then
    echo -e "${YELLOW}Warning: Backend dependencies not found${NC}"
    echo "Installing dependencies..."
    cd "$ROOT_DIR/backend"
    npm install
fi

# Run the Node.js script from backend directory (where @mysten/sui is installed)
echo -e "${GREEN}Running Sui Client Address Setup...${NC}\n"
cd "$ROOT_DIR/backend"
node "$ROOT_DIR/backend/scripts/setup-sui-client.js" "$@"

exit $?
