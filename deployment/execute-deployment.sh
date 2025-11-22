#!/bin/bash

################################################################################
# Crozz Coin - Complete Deployment Execution Script
# 
# ⚠️  SECURITY WARNING: TESTNET ONLY
# This script contains wallet addresses for TESTNET demonstration.
# - NEVER use these addresses/keys on mainnet
# - NEVER use in production environments
# - These are TEST credentials with NO REAL VALUE
# - Always generate fresh keys for production deployments
#
# This script automates the complete deployment workflow:
# 1. Requests airdrops for all wallets
# 2. Provides instructions for contract deployment
# 3. Saves all transaction data
#
# Usage: ./execute-deployment.sh
################################################################################

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Wallet addresses
ADMIN_ADDR="0x899888ddf619e376d1291f858192eb6b157d5df77746f5057dd6f2b03a09685c"
ALICE_ADDR="0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423"
BOB_ADDR="0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93"
CHARLIE_ADDR="0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01"

FAUCET_URL="https://faucet.testnet.sui.io/gas"
RESULTS_FILE="deployment-results.md"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Crozz Coin - Deployment Execution Script              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to request airdrop
request_airdrop() {
    local name=$1
    local address=$2
    
    echo -e "${YELLOW}🌊 Requesting airdrop for $name...${NC}"
    
    response=$(curl -s -X POST "$FAUCET_URL" \
        -H "Content-Type: application/json" \
        -d "{\"FixedAmountRequest\":{\"recipient\":\"$address\"}}")
    
    if echo "$response" | grep -q "transferred_gas_objects"; then
        echo -e "${GREEN}✅ Airdrop successful for $name${NC}"
        echo "$response" | jq '.'
        return 0
    else
        echo -e "${RED}❌ Airdrop failed for $name${NC}"
        echo "$response"
        return 1
    fi
}

# Function to wait with countdown
wait_with_countdown() {
    local seconds=$1
    local message=$2
    
    echo -e "${YELLOW}$message${NC}"
    for ((i=$seconds; i>0; i--)); do
        echo -ne "${YELLOW}⏳ Waiting... $i seconds remaining\r${NC}"
        sleep 1
    done
    echo -e "\n${GREEN}✅ Wait complete${NC}"
}

# Initialize results file
echo "# Crozz Coin Deployment Results" > "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "**Deployment Date**: $(date -u +"%Y-%m-%d %H:%M:%S UTC")" >> "$RESULTS_FILE"
echo "**Network**: Sui Testnet" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

# Step 1: Request airdrops
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}STEP 1: Requesting Airdrops${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo "## Airdrop Transactions" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

airdrops_successful=true

if request_airdrop "Admin" "$ADMIN_ADDR"; then
    echo "- ✅ Admin wallet funded" >> "$RESULTS_FILE"
else
    echo "- ❌ Admin wallet funding failed" >> "$RESULTS_FILE"
    airdrops_successful=false
fi
wait_with_countdown 3 "Waiting between faucet requests to avoid rate limiting..."

if request_airdrop "Alice" "$ALICE_ADDR"; then
    echo "- ✅ Alice wallet funded" >> "$RESULTS_FILE"
else
    echo "- ❌ Alice wallet funding failed" >> "$RESULTS_FILE"
    airdrops_successful=false
fi
wait_with_countdown 3 "Waiting between faucet requests..."

if request_airdrop "Bob" "$BOB_ADDR"; then
    echo "- ✅ Bob wallet funded" >> "$RESULTS_FILE"
else
    echo "- ❌ Bob wallet funding failed" >> "$RESULTS_FILE"
    airdrops_successful=false
fi
wait_with_countdown 3 "Waiting between faucet requests..."

if request_airdrop "Charlie" "$CHARLIE_ADDR"; then
    echo "- ✅ Charlie wallet funded" >> "$RESULTS_FILE"
else
    echo "- ❌ Charlie wallet funding failed" >> "$RESULTS_FILE"
    airdrops_successful=false
fi

echo "" >> "$RESULTS_FILE"

# Wait for transactions to be processed
wait_with_countdown 15 "⏳ Waiting for airdrop transactions to be processed on-chain..."

# Step 2: Contract deployment instructions
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}STEP 2: Deploy Smart Contract${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo "## Smart Contract Deployment" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "Execute the following commands to deploy the contract:" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo '```bash' >> "$RESULTS_FILE"
echo "cd ../smart-contract" >> "$RESULTS_FILE"
echo "sui move build" >> "$RESULTS_FILE"
echo "sui client publish --gas-budget 100000000" >> "$RESULTS_FILE"
echo '```' >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

echo -e "${YELLOW}📝 To deploy the contract, run:${NC}"
echo ""
echo -e "${GREEN}cd ../smart-contract${NC}"
echo -e "${GREEN}sui move build${NC}"
echo -e "${GREEN}sui client publish --gas-budget 100000000${NC}"
echo ""
echo -e "${YELLOW}After deployment, save the following IDs:${NC}"
echo "  - Package ID"
echo "  - TreasuryCap ID"
echo "  - Metadata ID"
echo "  - AdminCap ID"
echo ""

# Step 3: Minting instructions
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}STEP 3: Mint Tokens${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo "## Token Minting" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "Execute these commands after deploying (replace PACKAGE_ID and TREASURY_CAP_ID):" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo '```bash' >> "$RESULTS_FILE"
echo "# Mint 1,000 CROZZ to Alice" >> "$RESULTS_FILE"
echo "sui client call \\" >> "$RESULTS_FILE"
echo "  --package <PACKAGE_ID> \\" >> "$RESULTS_FILE"
echo "  --module crozz_token \\" >> "$RESULTS_FILE"
echo "  --function mint \\" >> "$RESULTS_FILE"
echo "  --args <TREASURY_CAP_ID> 1000000000000 $ALICE_ADDR \\" >> "$RESULTS_FILE"
echo "  --gas-budget 10000000" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "# Mint 2,000 CROZZ to Bob" >> "$RESULTS_FILE"
echo "sui client call \\" >> "$RESULTS_FILE"
echo "  --package <PACKAGE_ID> \\" >> "$RESULTS_FILE"
echo "  --module crozz_token \\" >> "$RESULTS_FILE"
echo "  --function mint \\" >> "$RESULTS_FILE"
echo "  --args <TREASURY_CAP_ID> 2000000000000 $BOB_ADDR \\" >> "$RESULTS_FILE"
echo "  --gas-budget 10000000" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "# Mint 3,000 CROZZ to Charlie" >> "$RESULTS_FILE"
echo "sui client call \\" >> "$RESULTS_FILE"
echo "  --package <PACKAGE_ID> \\" >> "$RESULTS_FILE"
echo "  --module crozz_token \\" >> "$RESULTS_FILE"
echo "  --function mint \\" >> "$RESULTS_FILE"
echo "  --args <TREASURY_CAP_ID> 3000000000000 $CHARLIE_ADDR \\" >> "$RESULTS_FILE"
echo "  --gas-budget 10000000" >> "$RESULTS_FILE"
echo '```' >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

echo -e "${YELLOW}📝 Mint tokens using the commands in $RESULTS_FILE${NC}"
echo ""

# Step 4: Transfer instructions
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}STEP 4: Execute Transfers${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo "## Token Transfers" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "Execute these transfer commands:" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo '```bash' >> "$RESULTS_FILE"
echo "# Transfer 1: Alice → Bob (500 CROZZ)" >> "$RESULTS_FILE"
echo "# First, switch to Alice's wallet and get her coin object ID" >> "$RESULTS_FILE"
echo "sui client switch --address $ALICE_ADDR" >> "$RESULTS_FILE"
echo "sui client objects --owned-by $ALICE_ADDR" >> "$RESULTS_FILE"
echo "sui client call --package <PACKAGE_ID> --module crozz_token --function transfer --args <ALICE_COIN_ID> $BOB_ADDR --gas-budget 10000000" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "# Transfer 2: Bob → Charlie (800 CROZZ)" >> "$RESULTS_FILE"
echo "sui client switch --address $BOB_ADDR" >> "$RESULTS_FILE"
echo "sui client objects --owned-by $BOB_ADDR" >> "$RESULTS_FILE"
echo "sui client call --package <PACKAGE_ID> --module crozz_token --function transfer --args <BOB_COIN_ID> $CHARLIE_ADDR --gas-budget 10000000" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "# Transfer 3: Charlie → Alice (1,200 CROZZ)" >> "$RESULTS_FILE"
echo "sui client switch --address $CHARLIE_ADDR" >> "$RESULTS_FILE"
echo "sui client objects --owned-by $CHARLIE_ADDR" >> "$RESULTS_FILE"
echo "sui client call --package <PACKAGE_ID> --module crozz_token --function transfer --args <CHARLIE_COIN_ID> $ALICE_ADDR --gas-budget 10000000" >> "$RESULTS_FILE"
echo '```' >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

echo -e "${YELLOW}📝 Execute transfers using the commands in $RESULTS_FILE${NC}"
echo ""

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}DEPLOYMENT SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo "## Summary" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "### Wallet Addresses" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "| Wallet | Address | Explorer |" >> "$RESULTS_FILE"
echo "|--------|---------|----------|" >> "$RESULTS_FILE"
echo "| Admin | \`$ADMIN_ADDR\` | https://testnet.suivision.xyz/account/$ADMIN_ADDR |" >> "$RESULTS_FILE"
echo "| Alice | \`$ALICE_ADDR\` | https://testnet.suivision.xyz/account/$ALICE_ADDR |" >> "$RESULTS_FILE"
echo "| Bob | \`$BOB_ADDR\` | https://testnet.suivision.xyz/account/$BOB_ADDR |" >> "$RESULTS_FILE"
echo "| Charlie | \`$CHARLIE_ADDR\` | https://testnet.suivision.xyz/account/$CHARLIE_ADDR |" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

echo "### Expected Final Balances" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "After all transfers:" >> "$RESULTS_FILE"
echo "- Alice: 1,700 CROZZ (1000 - 500 + 1200)" >> "$RESULTS_FILE"
echo "- Bob: 1,700 CROZZ (2000 + 500 - 800)" >> "$RESULTS_FILE"
echo "- Charlie: 2,600 CROZZ (3000 + 800 - 1200)" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

echo "### Checklist" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"
echo "- [x] Wallets generated" >> "$RESULTS_FILE"
echo "- [ ] Airdrops completed" >> "$RESULTS_FILE"
echo "- [ ] Contract deployed" >> "$RESULTS_FILE"
echo "- [ ] Tokens minted" >> "$RESULTS_FILE"
echo "- [ ] Transfers executed" >> "$RESULTS_FILE"
echo "- [ ] Results documented" >> "$RESULTS_FILE"
echo "" >> "$RESULTS_FILE"

if [ "$airdrops_successful" = true ]; then
    echo -e "${GREEN}✅ Airdrops completed successfully${NC}"
else
    echo -e "${RED}⚠️  Some airdrops failed - check the output above${NC}"
fi

echo -e "${GREEN}✅ Wallets Generated: 4${NC}"
echo -e "${YELLOW}⏳ Contract Deployment: Requires manual execution${NC}"
echo -e "${YELLOW}⏳ Token Minting: Requires deployed contract${NC}"
echo -e "${YELLOW}⏳ Transfers: Requires minted tokens${NC}"
echo ""
echo -e "${BLUE}📄 Results saved to: $RESULTS_FILE${NC}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "  1. Follow the contract deployment instructions above"
echo "  2. Save all deployment IDs"
echo "  3. Execute the minting commands"
echo "  4. Execute the transfer commands"
echo "  5. Verify final balances"
echo "  6. Capture screenshots and document results"
echo ""
echo -e "${GREEN}🌐 Explorer Links:${NC}"
echo "  Admin:   https://testnet.suivision.xyz/account/$ADMIN_ADDR"
echo "  Alice:   https://testnet.suivision.xyz/account/$ALICE_ADDR"
echo "  Bob:     https://testnet.suivision.xyz/account/$BOB_ADDR"
echo "  Charlie: https://testnet.suivision.xyz/account/$CHARLIE_ADDR"
echo ""
echo -e "${GREEN}✨ Script completed!${NC}"
