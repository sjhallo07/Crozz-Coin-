#!/bin/bash
# Test script to verify the complete Crozz-Coin ecosystem
# This script tests backend, frontend build, and connectivity

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   Crozz-Coin Ecosystem Test Suite     ${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Create secure temporary directory
TEMP_DIR=$(mktemp -d -t crozz-test.XXXXXX)
trap "rm -rf '${TEMP_DIR}'" EXIT

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${YELLOW}Testing: ${test_name}${NC}"
    
    if eval "$test_command" > "${TEMP_DIR}/test-output.log" 2>&1; then
        echo -e "${GREEN}✓ PASS: ${test_name}${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAIL: ${test_name}${NC}"
        echo -e "${RED}  Error details:${NC}"
        tail -5 "${TEMP_DIR}/test-output.log" | sed 's/^/  /'
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Test 1: Check Node.js installed
run_test "Node.js installed" "command -v node"

# Test 2: Check npm installed
run_test "npm installed" "command -v npm"

# Test 3: Backend dependencies installed
run_test "Backend dependencies exist" "test -d $BACKEND_DIR/node_modules"

# Test 4: Frontend dependencies installed
run_test "Frontend dependencies exist" "test -d $FRONTEND_DIR/node_modules"

# Test 5: Environment files exist
run_test "Root .env exists" "test -f $ROOT_DIR/.env"
run_test "Frontend .env exists" "test -f $FRONTEND_DIR/.env"

# Test 6: Start backend in background
echo -e "${YELLOW}Starting backend server...${NC}"
cd "$BACKEND_DIR"
npm run start > "${TEMP_DIR}/backend-test.log" 2>&1 &
BACKEND_PID=$!

# Validate PID
if [ -z "$BACKEND_PID" ] || ! [[ "$BACKEND_PID" =~ ^[0-9]+$ ]]; then
    echo -e "${RED}✗ FAIL: Invalid backend PID${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    BACKEND_PID=""
else
    echo "$BACKEND_PID" > "${TEMP_DIR}/backend-test-pid.txt"
    
    # Wait for backend to start
    sleep 8
    
    # Test 7: Backend is running
    if [ -n "$BACKEND_PID" ] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo -e "${GREEN}✓ PASS: Backend server started (PID: $BACKEND_PID)${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAIL: Backend server failed to start${NC}"
        cat "${TEMP_DIR}/backend-test.log"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        BACKEND_PID=""
    fi
fi

# Test 8: Backend responds to health check
if curl -s -f http://localhost:4000/api/tokens/summary > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS: Backend API responds${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    
    # Show sample response
    echo -e "${BLUE}  Sample response:${NC}"
    curl -s http://localhost:4000/api/tokens/summary | head -c 200
    echo ""
else
    echo -e "${RED}✗ FAIL: Backend API not responding${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 9: Frontend builds successfully
echo -e "${YELLOW}Building frontend...${NC}"
if cd "$FRONTEND_DIR" && npm run build > "${TEMP_DIR}/frontend-build.log" 2>&1; then
    echo -e "${GREEN}✓ PASS: Frontend builds successfully${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}✗ FAIL: Frontend build failed${NC}"
    tail -10 "${TEMP_DIR}/frontend-build.log"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test 10: Check tunnel script exists
run_test "Tunnel setup script exists" "test -x $SCRIPT_DIR/setup-tunnel.sh"

# Test 11: Check quick-start script exists
run_test "Quick-start script exists" "test -x $SCRIPT_DIR/quick-start.sh"

# Test 12: Check documentation exists
run_test "Remote testing docs exist" "test -f $ROOT_DIR/docs/REMOTE_TESTING.md"
run_test "Testing environments docs exist" "test -f $ROOT_DIR/docs/TESTING_ENVIRONMENTS.md"

# Cleanup
echo ""
echo -e "${YELLOW}Cleaning up...${NC}"
if [ -f "${TEMP_DIR}/backend-test-pid.txt" ]; then
    BACKEND_PID=$(cat "${TEMP_DIR}/backend-test-pid.txt")
    if [ -n "$BACKEND_PID" ] && [[ "$BACKEND_PID" =~ ^[0-9]+$ ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
        kill "$BACKEND_PID"
        echo -e "${GREEN}✓ Backend server stopped${NC}"
    fi
fi

# Summary
echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   Test Results Summary                 ${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Failed: ${TESTS_FAILED}${NC}"
echo -e "Total:  $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}   All Tests Passed! ✓                  ${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}The ecosystem is ready to use!${NC}"
    echo -e "  • Start services: ${YELLOW}./scripts/quick-start.sh${NC}"
    echo -e "  • Setup tunnel:   ${YELLOW}./scripts/setup-tunnel.sh${NC}"
    echo -e "  • Read docs:      ${YELLOW}docs/REMOTE_TESTING.md${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}════════════════════════════════════════${NC}"
    echo -e "${RED}   Some Tests Failed ✗                  ${NC}"
    echo -e "${RED}════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Please fix the failing tests before proceeding.${NC}"
    echo ""
    exit 1
fi
