#!/usr/bin/env bash
# Smoke-test script for the CROZZ token package: mints sample tokens, updates and freezes metadata, and queries icon URL and total supply via `sui client call`.
set -euo pipefail

# CROZZ token smoke test script
# Replace the placeholder IDs below with real values from your deployment
PACKAGE_ID="<your_package_id>"
ADMIN_CAP_ID="<your_admin_cap_id>"
TREASURY_CAP_ID="<your_treasury_cap_id>"
METADATA_ID="<your_metadata_id>"
RECIPIENT_ADDRESS="<recipient_address>"
ICON_URL="https://new-crozz-icon.com/icon.png"
GAS_BUDGET="${SUI_DEFAULT_GAS_BUDGET:-10000000}"

if [[ "$PACKAGE_ID" == "<your_package_id>" ]]; then
  echo "[!] Please edit scripts/test_crozz.sh with real IDs before running." >&2
  exit 1
fi

run_call() {
  echo -e "\n>> sui client call $*"
  sui client call "$@"
}

# 1. Mint tokens
run_call \
  --function mint \
  --module crozz_token \
  --package "$PACKAGE_ID" \
  --args "$TREASURY_CAP_ID" 1000 "$RECIPIENT_ADDRESS" \
  --gas-budget "$GAS_BUDGET"

# 2. Update icon URL
run_call \
  --function update_icon_url \
  --module crozz_token \
  --package "$PACKAGE_ID" \
  --args "$ADMIN_CAP_ID" "$TREASURY_CAP_ID" "$METADATA_ID" "$ICON_URL" \
  --gas-budget "$GAS_BUDGET"

# 3. Freeze metadata
run_call \
  --function freeze_metadata \
  --module crozz_token \
  --package "$PACKAGE_ID" \
  --args "$ADMIN_CAP_ID" "$METADATA_ID" \
  --gas-budget "$GAS_BUDGET"

# 4. Get icon URL (view)
run_call \
  --function get_icon_url \
  --module crozz_token \
  --package "$PACKAGE_ID" \
  --args "$METADATA_ID" \
  --gas-budget "$GAS_BUDGET"

# 5. Get total supply (view)
run_call \
  --function get_total_supply \
  --module crozz_token \
  --package "$PACKAGE_ID" \
  --args "$TREASURY_CAP_ID" \
  --gas-budget "$GAS_BUDGET"

echo -e "\nCROZZ test script completed successfully."
