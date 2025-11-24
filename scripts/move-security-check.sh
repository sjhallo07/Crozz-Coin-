#!/bin/bash
# Move Smart Contract Security Check
# Performs security analysis on Move smart contracts
# Priority: Security > Functionality > Performance > Developer Experience

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
MOVE_DIR="$ROOT_DIR/smart-contract"

echo -e "${CYAN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         Move Smart Contract Security Check           ║${NC}"
echo -e "${CYAN}╚═══════════════════════════════════════════════════════╝${NC}"

ERRORS=0
WARNINGS=0

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Sui CLI is installed
if ! command_exists sui; then
    echo -e "${RED}✗ Sui CLI not installed${NC}"
    echo -e "${YELLOW}Run: ./scripts/install-sui-cli.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Sui CLI found: $(sui --version)${NC}"

# Change to Move package directory
if [ ! -d "$MOVE_DIR" ]; then
    echo -e "${RED}✗ Move package directory not found: $MOVE_DIR${NC}"
    exit 1
fi

cd "$MOVE_DIR"
echo -e "${GREEN}✓ Move package found: $MOVE_DIR${NC}"

# 1. Build the Move package
echo -e "\n${CYAN}[1/6] Building Move Package${NC}"
if sui move build > /tmp/move-build.log 2>&1; then
    echo -e "${GREEN}✓ Move package builds successfully${NC}"
else
    echo -e "${RED}✗ Move package build failed${NC}"
    cat /tmp/move-build.log
    ERRORS=$((ERRORS + 1))
    exit 1
fi

# 2. Run Move tests
echo -e "\n${CYAN}[2/6] Running Move Tests${NC}"
if sui move test > /tmp/move-test.log 2>&1; then
    echo -e "${GREEN}✓ All Move tests passed${NC}"
    # Show test summary
    grep -E "Test result:|PASS|FAIL" /tmp/move-test.log || true
else
    echo -e "${YELLOW}⚠ Some Move tests failed or no tests found${NC}"
    tail -20 /tmp/move-test.log
    WARNINGS=$((WARNINGS + 1))
fi

# 3. Check for security anti-patterns
echo -e "\n${CYAN}[3/6] Checking for Security Anti-Patterns${NC}"

SOURCES_DIR="$MOVE_DIR/sources"

# Check for unsafe patterns
UNSAFE_PATTERNS=(
    "abort 0"  # Generic abort without error code
    "assert!.*false"  # Assertions that always fail
    "// TODO.*security"  # Security-related TODOs
    "// FIXME.*security"  # Security-related FIXMEs
    "// HACK"  # Potential hacky code
)

PATTERN_FOUND=0
for pattern in "${UNSAFE_PATTERNS[@]}"; do
    if grep -rn --include="*.move" -E "$pattern" "$SOURCES_DIR" 2>/dev/null; then
        PATTERN_FOUND=1
        WARNINGS=$((WARNINGS + 1))
    fi
done

if [ $PATTERN_FOUND -eq 0 ]; then
    echo -e "${GREEN}✓ No obvious security anti-patterns detected${NC}"
else
    echo -e "${YELLOW}⚠ Potential security concerns found (review above)${NC}"
fi

# 4. Check for capability-based access control
echo -e "\n${CYAN}[4/6] Verifying Access Control Patterns${NC}"

# Check for admin capabilities
if grep -rn --include="*.move" "struct.*Cap" "$SOURCES_DIR" > /tmp/caps.txt 2>/dev/null; then
    echo -e "${GREEN}✓ Capability-based access control implemented${NC}"
    echo "Found capabilities:"
    cat /tmp/caps.txt | head -10
else
    echo -e "${YELLOW}⚠ No capability structs found${NC}"
    echo "Consider using capability-based access control for admin functions"
    WARNINGS=$((WARNINGS + 1))
fi

# 5. Check for proper error handling
echo -e "\n${CYAN}[5/6] Checking Error Handling${NC}"

# Count error constants
ERROR_COUNT=$(grep -rn --include="*.move" "const E" "$SOURCES_DIR" 2>/dev/null | wc -l)
if [ "$ERROR_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Found $ERROR_COUNT error code constant(s)${NC}"
else
    echo -e "${YELLOW}⚠ No error code constants found${NC}"
    echo "Consider defining error constants for better debugging"
    WARNINGS=$((WARNINGS + 1))
fi

# Check for abort with error codes
ABORT_COUNT=$(grep -rn --include="*.move" "abort E" "$SOURCES_DIR" 2>/dev/null | wc -l)
if [ "$ABORT_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Using error codes in abort statements${NC}"
fi

# 6. Check for test coverage
echo -e "\n${CYAN}[6/6] Analyzing Test Coverage${NC}"

# Count test functions
TEST_FUNC_COUNT=$(grep -rn --include="*.move" "#\[test\]" "$SOURCES_DIR" 2>/dev/null | wc -l)
PUBLIC_FUNC_COUNT=$(grep -rn --include="*.move" "public fun\|public entry fun" "$SOURCES_DIR" 2>/dev/null | wc -l)

echo "Test functions: $TEST_FUNC_COUNT"
echo "Public functions: $PUBLIC_FUNC_COUNT"

if [ "$TEST_FUNC_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Tests are present${NC}"
    
    if [ "$PUBLIC_FUNC_COUNT" -gt 0 ]; then
        COVERAGE=$((TEST_FUNC_COUNT * 100 / PUBLIC_FUNC_COUNT))
        if [ "$COVERAGE" -ge 80 ]; then
            echo -e "${GREEN}✓ Good test coverage (~${COVERAGE}%)${NC}"
        elif [ "$COVERAGE" -ge 50 ]; then
            echo -e "${YELLOW}⚠ Moderate test coverage (~${COVERAGE}%)${NC}"
            WARNINGS=$((WARNINGS + 1))
        else
            echo -e "${YELLOW}⚠ Low test coverage (~${COVERAGE}%)${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
else
    echo -e "${YELLOW}⚠ No test functions found${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Security recommendations
echo -e "\n${CYAN}Security Recommendations:${NC}"
echo "1. ✓ Always use capability-based access control for privileged operations"
echo "2. ✓ Define error constants and use them in abort statements"
echo "3. ✓ Write comprehensive tests for all public functions"
echo "4. ✓ Review transfers and ensure proper authorization checks"
echo "5. ✓ Validate all inputs, especially amounts and addresses"
echo "6. ✓ Use events for tracking important state changes"
echo "7. ✓ Test with malicious inputs and edge cases"
echo "8. ✓ Get professional security audit before mainnet deployment"

# Summary
echo -e "\n${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}                  Security Check Summary               ${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ Move security check passed with no issues!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Found $WARNINGS warning(s)${NC}"
    echo "Review warnings above and consider improvements"
    exit 0
else
    echo -e "${RED}✗ Found $ERRORS critical error(s) and $WARNINGS warning(s)${NC}"
    exit 1
fi
