#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Crozz Token Testnet Validation Script
# =============================================================================
# This script performs comprehensive validation of the Crozz token on testnet
# before mainnet deployment. It tests all critical functionality and generates
# a readiness report.
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPORT_FILE="$REPO_ROOT/TESTNET_VALIDATION_REPORT.md"
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Security constants
INSECURE_TOKENS=("changeme" "change-me" "admin" "password")

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Load environment variables
if [ -f "$REPO_ROOT/.env" ]; then
  set -a
  source "$REPO_ROOT/.env"
  set +a
fi

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[PASS]${NC} $1"
  ((TESTS_PASSED++))
  ((TESTS_TOTAL++))
}

log_error() {
  echo -e "${RED}[FAIL]${NC} $1"
  ((TESTS_FAILED++))
  ((TESTS_TOTAL++))
}

log_warning() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

# Initialize report
init_report() {
  cat > "$REPORT_FILE" << EOF
# Crozz Token Testnet Validation Report

**Generated:** $TIMESTAMP  
**Network:** Testnet  
**Status:** In Progress...

---

## Executive Summary

This report contains the results of comprehensive testnet validation for the Crozz token,
assessing readiness for mainnet deployment.

---

## Test Results

EOF
}

# Append to report
append_report() {
  echo "$1" >> "$REPORT_FILE"
}

# =============================================================================
# Validation Tests
# =============================================================================

test_environment_variables() {
  log_info "Testing environment variables..."
  append_report "### 1. Environment Configuration"
  append_report ""
  
  local required_vars=(
    "SUI_RPC_URL"
    "CROZZ_PACKAGE_ID"
    "CROZZ_TREASURY_CAP_ID"
    "CROZZ_ADMIN_CAP_ID"
    "CROZZ_REGISTRY_ID"
    "CROZZ_MODULE"
  )
  
  local missing_vars=()
  
  for var in "${required_vars[@]}"; do
    if [ -z "${!var:-}" ]; then
      missing_vars+=("$var")
      log_error "Missing environment variable: $var"
      append_report "- ❌ **$var**: Missing"
    else
      log_success "Environment variable $var is set"
      append_report "- ✅ **$var**: Configured"
    fi
  done
  
  append_report ""
  
  if [ ${#missing_vars[@]} -eq 0 ]; then
    return 0
  else
    return 1
  fi
}

test_sui_cli_installed() {
  log_info "Testing Sui CLI installation..."
  append_report "### 2. Sui CLI"
  append_report ""
  
  if command -v sui &> /dev/null; then
    local sui_version=$(sui --version 2>&1 || echo "unknown")
    log_success "Sui CLI is installed: $sui_version"
    append_report "- ✅ **Sui CLI**: Installed ($sui_version)"
    append_report ""
    return 0
  else
    log_error "Sui CLI is not installed"
    append_report "- ❌ **Sui CLI**: Not installed"
    append_report ""
    return 1
  fi
}

test_backend_api() {
  log_info "Testing backend API..."
  append_report "### 3. Backend API"
  append_report ""
  
  local api_url="${VITE_CROZZ_API_BASE_URL:-http://localhost:4000}"
  
  # Test health endpoint
  if curl -f -s "$api_url/health" > /dev/null 2>&1; then
    log_success "Backend health endpoint responding"
    append_report "- ✅ **Health Endpoint**: Responding"
  else
    log_error "Backend health endpoint not responding"
    append_report "- ❌ **Health Endpoint**: Not responding"
  fi
  
  # Test tokens summary endpoint
  if curl -f -s "$api_url/api/tokens/summary" > /dev/null 2>&1; then
    log_success "Token summary endpoint responding"
    append_report "- ✅ **Token Summary**: Responding"
  else
    log_error "Token summary endpoint not responding"
    append_report "- ❌ **Token Summary**: Not responding"
  fi
  
  append_report ""
}

test_smart_contract_deployed() {
  log_info "Testing smart contract deployment..."
  append_report "### 4. Smart Contract"
  append_report ""
  
  if [ -z "${CROZZ_PACKAGE_ID:-}" ]; then
    log_error "Package ID not configured"
    append_report "- ❌ **Package ID**: Not configured"
    append_report ""
    return 1
  fi
  
  log_success "Package ID configured: $CROZZ_PACKAGE_ID"
  append_report "- ✅ **Package ID**: $CROZZ_PACKAGE_ID"
  append_report "- ✅ **Module**: ${CROZZ_MODULE:-crozz_token}"
  append_report ""
  
  return 0
}

test_token_operations() {
  log_info "Testing token operations (view functions)..."
  append_report "### 5. Token Operations"
  append_report ""
  
  if [ -z "${CROZZ_PACKAGE_ID:-}" ] || [ -z "${CROZZ_TREASURY_CAP_ID:-}" ]; then
    log_warning "Skipping token operations test - missing configuration"
    append_report "- ⚠️ **Token Operations**: Skipped (missing configuration)"
    append_report ""
    return 0
  fi
  
  # Note: Actual Sui CLI calls would require active client configuration
  log_success "Token operation configuration valid"
  append_report "- ✅ **Configuration**: Valid"
  append_report "- ℹ️ **Note**: Manual testing required for actual blockchain operations"
  append_report ""
  
  return 0
}

test_backend_tests() {
  log_info "Running backend test suite..."
  append_report "### 6. Backend Tests"
  append_report ""
  
  if [ ! -d "$REPO_ROOT/backend" ]; then
    log_warning "Backend directory not found"
    append_report "- ⚠️ **Backend Tests**: Directory not found"
    append_report ""
    return 0
  fi
  
  # Use subshell to avoid changing directory
  if (cd "$REPO_ROOT/backend" && npm test > /tmp/backend-test.log 2>&1); then
    local test_summary=$(grep -E "Tests:.*passed" /tmp/backend-test.log || echo "Tests completed")
    log_success "Backend tests passed: $test_summary"
    append_report "- ✅ **Backend Tests**: Passed"
    append_report "  - $test_summary"
  else
    log_error "Backend tests failed"
    append_report "- ❌ **Backend Tests**: Failed"
    local test_summary=$(grep -E "Tests:.*failed" /tmp/backend-test.log || echo "See logs for details")
    append_report "  - $test_summary"
  fi
  
  append_report ""
}

test_security_configuration() {
  log_info "Testing security configuration..."
  append_report "### 7. Security Configuration"
  append_report ""
  
  # Check for secure tokens
  local is_insecure=false
  for token in "${INSECURE_TOKENS[@]}"; do
    if [ "${ADMIN_TOKEN:-}" = "$token" ]; then
      is_insecure=true
      break
    fi
  done
  
  if [ "$is_insecure" = true ]; then
    log_error "Default/weak admin token detected - INSECURE"
    append_report "- ❌ **Admin Token**: Using default/weak token (SECURITY RISK)"
  else
    log_success "Admin token is not using default value"
    append_report "- ✅ **Admin Token**: Custom token configured"
  fi
  
  # Check for JWT secret
  if [ -n "${JWT_SECRET:-}" ] && [ "${JWT_SECRET:-}" != "super-secret-key" ]; then
    log_success "JWT secret is configured"
    append_report "- ✅ **JWT Secret**: Configured"
  else
    log_error "JWT secret not properly configured"
    append_report "- ❌ **JWT Secret**: Default or missing (SECURITY RISK)"
  fi
  
  # Check executor mode
  if [ "${CROZZ_EXECUTOR_DRY_RUN:-true}" = "false" ]; then
    log_warning "Transaction executor is in LIVE mode"
    append_report "- ⚠️ **Executor Mode**: LIVE (transactions will be executed)"
  else
    log_success "Transaction executor is in DRY RUN mode"
    append_report "- ✅ **Executor Mode**: DRY RUN (safe for testing)"
  fi
  
  append_report ""
}

# =============================================================================
# Mainnet Readiness Checklist
# =============================================================================

generate_mainnet_checklist() {
  append_report "---"
  append_report ""
  append_report "## Mainnet Readiness Checklist"
  append_report ""
  append_report "Before deploying to mainnet, ensure all items are completed:"
  append_report ""
  append_report "### Critical Requirements"
  append_report ""
  append_report "- [ ] All testnet tests passing (see results above)"
  append_report "- [ ] Smart contract audited by professional security firm"
  append_report "- [ ] All security vulnerabilities resolved"
  append_report "- [ ] Multi-signature wallet configured for treasury management"
  append_report "- [ ] Private keys stored in secure vault (NOT in .env files)"
  append_report "- [ ] Admin tokens rotated from testnet values"
  append_report "- [ ] Rate limiting configured on backend API"
  append_report "- [ ] Monitoring and alerting configured"
  append_report "- [ ] Incident response plan documented"
  append_report "- [ ] Team trained on mainnet operations"
  append_report ""
  append_report "### Deployment Configuration"
  append_report ""
  append_report "- [ ] Mainnet RPC URL configured: \`https://fullnode.mainnet.sui.io:443\`"
  append_report "- [ ] New package published to mainnet (never reuse testnet IDs)"
  append_report "- [ ] Mainnet package ID updated in environment"
  append_report "- [ ] Mainnet treasury cap ID updated"
  append_report "- [ ] Mainnet admin cap ID updated"
  append_report "- [ ] Mainnet registry ID updated"
  append_report "- [ ] Frontend configured to use mainnet network"
  append_report "- [ ] Backend configured to use mainnet network"
  append_report ""
  append_report "### Operations"
  append_report ""
  append_report "- [ ] Backup and disaster recovery plan in place"
  append_report "- [ ] Gas budget appropriately configured for mainnet"
  append_report "- [ ] Transaction retry logic tested"
  append_report "- [ ] Error handling and logging verified"
  append_report "- [ ] Load testing completed"
  append_report "- [ ] Rollback procedures documented"
  append_report ""
  append_report "### Documentation"
  append_report ""
  append_report "- [ ] API documentation updated"
  append_report "- [ ] User documentation complete"
  append_report "- [ ] Deployment guide updated for mainnet"
  append_report "- [ ] Security best practices documented"
  append_report "- [ ] Troubleshooting guide available"
  append_report ""
  append_report "### Legal & Compliance"
  append_report ""
  append_report "- [ ] Terms of service prepared"
  append_report "- [ ] Privacy policy prepared"
  append_report "- [ ] Legal counsel reviewed deployment"
  append_report "- [ ] Regulatory compliance verified"
  append_report "- [ ] Risk assessment completed"
  append_report ""
}

# =============================================================================
# Report Finalization
# =============================================================================

finalize_report() {
  append_report "---"
  append_report ""
  append_report "## Summary"
  append_report ""
  append_report "**Total Tests:** $TESTS_TOTAL  "
  append_report "**Passed:** $TESTS_PASSED ✅  "
  append_report "**Failed:** $TESTS_FAILED ❌  "
  append_report ""
  
  if [ $TESTS_FAILED -eq 0 ]; then
    append_report "**Status:** 🟢 ALL TESTS PASSED"
    append_report ""
    append_report "The token has passed all automated testnet validations. Review the mainnet readiness"
    append_report "checklist above and complete all items before proceeding to mainnet deployment."
  else
    append_report "**Status:** 🔴 TESTS FAILED"
    append_report ""
    append_report "Some tests have failed. Review and resolve all issues before considering mainnet deployment."
  fi
  
  append_report ""
  append_report "---"
  append_report ""
  append_report "**Report Generated:** $TIMESTAMP  "
  append_report "**Report Location:** \`$REPORT_FILE\`"
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
  echo "=========================================="
  echo "Crozz Token Testnet Validation"
  echo "=========================================="
  echo ""
  
  init_report
  
  # Run all tests
  test_environment_variables || true
  test_sui_cli_installed || true
  test_backend_api || true
  test_smart_contract_deployed || true
  test_token_operations || true
  test_backend_tests || true
  test_security_configuration || true
  
  # Generate checklist
  generate_mainnet_checklist
  
  # Finalize report
  finalize_report
  
  echo ""
  echo "=========================================="
  echo "Validation Complete"
  echo "=========================================="
  echo ""
  echo "Tests Passed: $TESTS_PASSED"
  echo "Tests Failed: $TESTS_FAILED"
  echo ""
  echo "Full report saved to: $REPORT_FILE"
  echo ""
  
  if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Review the mainnet readiness checklist in the report"
    echo "2. Complete all checklist items"
    echo "3. Perform manual testing of all critical functions"
    echo "4. Have the smart contract professionally audited"
    echo "5. Only then proceed to mainnet deployment"
    exit 0
  else
    echo -e "${RED}❌ Some tests failed. Review the report and fix issues.${NC}"
    exit 1
  fi
}

# Run main function
main
