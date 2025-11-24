#!/bin/bash
# Dependency Health Check Script
# Checks for outdated, deprecated, and vulnerable dependencies
# Priority: Security > Functionality > Performance > Developer Experience

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         Dependency Health Check                       ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"

ISSUES_FOUND=0

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install npm-check-updates if not present
if ! command_exists ncu; then
    echo -e "${YELLOW}Installing npm-check-updates...${NC}"
    npm install -g npm-check-updates
fi

echo -e "\n${CYAN}[1/4] Checking Root Dependencies${NC}"
cd "$ROOT_DIR"
echo "Current directory: $(pwd)"

# Check for outdated packages
echo -e "\n${YELLOW}Checking for outdated packages...${NC}"
if ncu --target minor; then
    echo -e "${GREEN}✓ All root packages are up to date${NC}"
else
    echo -e "${YELLOW}⚠ Some root packages have updates available${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Security audit
echo -e "\n${YELLOW}Running security audit...${NC}"
if npm audit --audit-level=moderate; then
    echo -e "${GREEN}✓ No moderate or higher vulnerabilities in root${NC}"
else
    echo -e "${RED}✗ Vulnerabilities found in root dependencies${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo -e "\n${CYAN}[2/4] Checking Backend Dependencies${NC}"
cd "$ROOT_DIR/backend"
echo "Current directory: $(pwd)"

echo -e "\n${YELLOW}Checking for outdated packages...${NC}"
if ncu --target minor; then
    echo -e "${GREEN}✓ All backend packages are up to date${NC}"
else
    echo -e "${YELLOW}⚠ Some backend packages have updates available${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo -e "\n${YELLOW}Running security audit...${NC}"
if npm audit --audit-level=moderate; then
    echo -e "${GREEN}✓ No moderate or higher vulnerabilities in backend${NC}"
else
    echo -e "${RED}✗ Vulnerabilities found in backend dependencies${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo -e "\n${CYAN}[3/4] Checking Frontend Dependencies${NC}"
cd "$ROOT_DIR/frontend"
echo "Current directory: $(pwd)"

echo -e "\n${YELLOW}Checking for outdated packages...${NC}"
if ncu --target minor; then
    echo -e "${GREEN}✓ All frontend packages are up to date${NC}"
else
    echo -e "${YELLOW}⚠ Some frontend packages have updates available${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo -e "\n${YELLOW}Running security audit...${NC}"
if npm audit --audit-level=moderate; then
    echo -e "${GREEN}✓ No moderate or higher vulnerabilities in frontend${NC}"
else
    echo -e "${RED}✗ Vulnerabilities found in frontend dependencies${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo -e "\n${CYAN}[4/4] Checking for Deprecated Packages${NC}"
cd "$ROOT_DIR"

# Check for deprecated packages across all package.json files
DEPRECATED_COUNT=0

for pkg_dir in . backend frontend; do
    if [ -f "$ROOT_DIR/$pkg_dir/package.json" ]; then
        echo -e "\n${YELLOW}Checking $pkg_dir/package.json...${NC}"
        cd "$ROOT_DIR/$pkg_dir"
        
        # Use npm ls to find deprecated packages
        if npm ls --depth=0 2>&1 | grep -i "deprecated" > /tmp/deprecated_$pkg_dir.txt; then
            echo -e "${YELLOW}⚠ Deprecated packages found in $pkg_dir:${NC}"
            cat /tmp/deprecated_$pkg_dir.txt
            DEPRECATED_COUNT=$((DEPRECATED_COUNT + 1))
            ISSUES_FOUND=$((ISSUES_FOUND + 1))
        else
            echo -e "${GREEN}✓ No deprecated packages in $pkg_dir${NC}"
        fi
    fi
done

# Summary
echo -e "\n${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                  Summary                              ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✓ All dependencies are healthy!${NC}"
    echo -e "${GREEN}✓ No security vulnerabilities found${NC}"
    echo -e "${GREEN}✓ All packages are up to date${NC}"
else
    echo -e "${YELLOW}⚠ Found $ISSUES_FOUND issue(s)${NC}"
    
    echo -e "\n${CYAN}Recommended Actions:${NC}"
    echo "1. Review outdated packages and update carefully"
    echo "2. Run 'npm audit fix' to fix vulnerabilities"
    echo "3. Test thoroughly after updates"
    echo "4. Replace deprecated packages where possible"
    
    echo -e "\n${CYAN}Commands to fix issues:${NC}"
    echo "  Update packages:     ncu -u && npm install"
    echo "  Fix vulnerabilities: npm audit fix"
    echo "  Force fixes:         npm audit fix --force (use with caution)"
fi

echo ""
exit 0
