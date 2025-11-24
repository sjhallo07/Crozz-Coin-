#!/bin/bash
# Security Audit Script for Crozz-Coin
# Performs comprehensive security checks on the codebase
# Priority: Security > Functionality > Performance > Developer Experience

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         Crozz-Coin Security Audit                     ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"

ERRORS=0
WARNINGS=0

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. NPM Audit
echo -e "\n${CYAN}[1/7] Running NPM Security Audit...${NC}"
cd "$ROOT_DIR"
if npm audit --audit-level=moderate; then
    echo -e "${GREEN}✓ No moderate or higher vulnerabilities found${NC}"
else
    echo -e "${YELLOW}⚠ Vulnerabilities detected. Review output above.${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 2. Check for hardcoded secrets
echo -e "\n${CYAN}[2/7] Scanning for Hardcoded Secrets...${NC}"
SECRET_PATTERNS=(
    "password.*=.*['\"][^'\"]+['\"]"
    "api[_-]?key.*=.*['\"][^'\"]+['\"]"
    "secret.*=.*['\"][^'\"]+['\"]"
    "token.*=.*['\"][^'\"]+['\"]"
    "private[_-]?key.*=.*['\"][^'\"]+['\"]"
    "PRIVATE_KEY.*=.*[^e][^x][^a][^m][^p][^l][^e]"
    "BEGIN.*PRIVATE.*KEY"
)

SECRET_FOUND=0
for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -rIn --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" \
        --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=build \
        -E "$pattern" "$ROOT_DIR" 2>/dev/null | grep -v ".env.example" | grep -v "scripts/security-audit.sh"; then
        SECRET_FOUND=1
    fi
done

if [ $SECRET_FOUND -eq 0 ]; then
    echo -e "${GREEN}✓ No hardcoded secrets detected${NC}"
else
    echo -e "${RED}✗ Potential hardcoded secrets found!${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Check .env files are not committed
echo -e "\n${CYAN}[3/7] Checking Environment File Security...${NC}"
if git ls-files | grep -E "^\.env$" >/dev/null 2>&1; then
    echo -e "${RED}✗ .env file is tracked by git!${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ .env file not tracked by git${NC}"
fi

if [ -f "$ROOT_DIR/.env" ]; then
    if grep -q ".env" "$ROOT_DIR/.gitignore"; then
        echo -e "${GREEN}✓ .env is in .gitignore${NC}"
    else
        echo -e "${RED}✗ .env not in .gitignore${NC}"
        ERRORS=$((ERRORS + 1))
    fi
fi

# 4. Check for insecure dependencies
echo -e "\n${CYAN}[4/7] Checking for Deprecated Packages...${NC}"
cd "$ROOT_DIR"
if command_exists npm-check-updates; then
    ncu --target minor > /tmp/ncu-output.txt 2>&1 || true
    if grep -i "deprecated" /tmp/ncu-output.txt >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠ Deprecated packages found${NC}"
        cat /tmp/ncu-output.txt | grep -i "deprecated" || true
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✓ No deprecated packages detected${NC}"
    fi
else
    echo -e "${YELLOW}⚠ npm-check-updates not installed. Run: npm install -g npm-check-updates${NC}"
fi

# 5. ESLint Security Check
echo -e "\n${CYAN}[5/7] Running ESLint Security Checks...${NC}"
if [ -f "$ROOT_DIR/.eslintrc.json" ]; then
    cd "$ROOT_DIR"
    if npm run lint > /tmp/eslint-output.txt 2>&1; then
        echo -e "${GREEN}✓ No ESLint errors found${NC}"
    else
        echo -e "${YELLOW}⚠ ESLint issues detected${NC}"
        tail -20 /tmp/eslint-output.txt
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠ ESLint not configured${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 6. Check TypeScript strict mode
echo -e "\n${CYAN}[6/7] Checking TypeScript Security Settings...${NC}"
TSCONFIG_FILES=(
    "$ROOT_DIR/frontend/tsconfig.json"
    "$ROOT_DIR/backend/tsconfig.json"
)

for tsconfig in "${TSCONFIG_FILES[@]}"; do
    if [ -f "$tsconfig" ]; then
        if grep -q '"strict".*:.*true' "$tsconfig"; then
            echo -e "${GREEN}✓ Strict mode enabled in $(basename $(dirname $tsconfig))${NC}"
        else
            echo -e "${RED}✗ Strict mode not enabled in $(basename $(dirname $tsconfig))${NC}"
            ERRORS=$((ERRORS + 1))
        fi
        
        if grep -q '"noImplicitAny".*:.*true' "$tsconfig"; then
            echo -e "${GREEN}✓ noImplicitAny enabled in $(basename $(dirname $tsconfig))${NC}"
        else
            echo -e "${YELLOW}⚠ noImplicitAny not enabled in $(basename $(dirname $tsconfig))${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
done

# 7. Check Move contract security
echo -e "\n${CYAN}[7/7] Checking Move Smart Contract...${NC}"
MOVE_DIR="$ROOT_DIR/smart-contract"
if [ -d "$MOVE_DIR" ]; then
    if command_exists sui; then
        cd "$MOVE_DIR"
        if sui move build > /tmp/move-build.txt 2>&1; then
            echo -e "${GREEN}✓ Move contract builds successfully${NC}"
            
            # Check for test coverage
            if sui move test > /tmp/move-test.txt 2>&1; then
                echo -e "${GREEN}✓ Move tests pass${NC}"
            else
                echo -e "${YELLOW}⚠ Move tests failed or not present${NC}"
                tail -10 /tmp/move-test.txt
                WARNINGS=$((WARNINGS + 1))
            fi
        else
            echo -e "${RED}✗ Move contract build failed${NC}"
            tail -10 /tmp/move-build.txt
            ERRORS=$((ERRORS + 1))
        fi
    else
        echo -e "${YELLOW}⚠ Sui CLI not installed. Cannot check Move contract.${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}⚠ Move contract directory not found${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo -e "\n${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                  Security Audit Summary                ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All security checks passed!${NC}"
    exit 0
else
    if [ $ERRORS -gt 0 ]; then
        echo -e "${RED}✗ Found $ERRORS critical security issue(s)${NC}"
    fi
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ Found $WARNINGS warning(s)${NC}"
    fi
    
    echo -e "\n${CYAN}Recommendations:${NC}"
    echo "1. Fix all critical security issues immediately"
    echo "2. Run 'npm audit fix' to automatically fix vulnerabilities"
    echo "3. Review and address ESLint security warnings"
    echo "4. Ensure no secrets are committed to the repository"
    echo "5. Keep dependencies up-to-date"
    
    [ $ERRORS -gt 0 ] && exit 1 || exit 0
fi
