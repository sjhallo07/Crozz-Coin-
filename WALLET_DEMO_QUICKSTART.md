# Wallet Demo Quick Start Guide

This guide helps you quickly run the wallet operations demo to see wallet creation, minting, transfers, and freezing in action.

## Quick Setup (5 Minutes)

### 1. Prerequisites Check

```bash
# Check Node.js version (need v18+)
node --version

# Check if sui CLI is installed (optional for this demo)
sui --version
```

### 2. Install Dependencies

```bash
# From project root
npm install

# Or install separately
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure Environment

You need a deployed CROZZ contract on Sui testnet. If you don't have one:

**Option A: Use Quick Deploy Script**
```bash
# This will deploy the contract and update .env automatically
cd smart-contract
sui client publish --gas-budget 100000000
# Note the package ID and object IDs from output
```

**Option B: Use Existing Deployment**
Update `.env` in the project root:

```env
# Sui Network Configuration
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_DEFAULT_GAS_BUDGET=10000000

# Admin Credentials (generate with: node scripts/setup-sui-client.js)
SUI_ADMIN_PRIVATE_KEY=ed25519:YOUR_BASE64_PRIVATE_KEY

# Contract Deployment IDs
CROZZ_PACKAGE_ID=0xYOUR_PACKAGE_ID
CROZZ_TREASURY_CAP_ID=0xYOUR_TREASURY_CAP_OBJECT
CROZZ_ADMIN_CAP_ID=0xYOUR_ADMIN_CAP_OBJECT
CROZZ_REGISTRY_ID=0xYOUR_REGISTRY_SHARED_OBJECT

# Module name (usually crozz_token)
CROZZ_MODULE=crozz_token
```

### 4. Generate Admin Keys (if needed)

```bash
node scripts/setup-sui-client.js --update-env --network testnet
```

This will:
- Generate a new Ed25519 keypair
- Display your admin address
- Update your `.env` file
- Provide faucet URL to fund your address

### 5. Fund Your Admin Wallet

```bash
# Copy your admin address from step 4, then:
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{ "FixedAmountRequest": { "recipient": "YOUR_ADMIN_ADDRESS" } }'
```

## Running the Demo

### CLI Demo (Simplest)

Run the complete demonstration script:

```bash
node scripts/demo-wallet-operations.js
```

This will:
1. ✅ Initialize Sui client and connect to testnet
2. ✅ Generate 3 new wallets (Wallet 1, 2, 3)
3. ✅ Mint 1 CROZZ token to each wallet
4. ✅ Transfer 0.1 CROZZ from Wallet 1 → Wallet 2
5. ✅ Transfer 0.1 CROZZ from Wallet 2 → Wallet 3
6. ✅ Freeze Wallet 1
7. ✅ Display complete results summary

**Expected Output:**
```
╔═══════════════════════════════════════════════════════════════════╗
║         Crozz Coin - Wallet Operations Demo                       ║
╚═══════════════════════════════════════════════════════════════════╝

══════════════════════════════════════════════════════════════════════
Step 1: Initialize Sui Client
══════════════════════════════════════════════════════════════════════

✅ Sui client initialized successfully
ℹ️  Network: testnet
ℹ️  RPC URL: https://fullnode.testnet.sui.io:443
ℹ️  Chain ID: testnet

══════════════════════════════════════════════════════════════════════
Step 2: Setup Admin Keypair
══════════════════════════════════════════════════════════════════════

✅ Admin keypair loaded
ℹ️  Admin address: 0xabc123...
ℹ️  Admin SUI balance: 1.0000 SUI

[... more steps ...]

📊 Operation Results:

🔑 Wallets Created:
   1. Wallet 1
      Address: 0xabc123...
   2. Wallet 2
      Address: 0xdef456...
   3. Wallet 3
      Address: 0xghi789...

💰 Mint Operations:
   ✓ 1.00 CROZZ → Wallet 1
      Tx: AbCdEf123...

[... complete summary ...]
```

### Custom Demo Parameters

```bash
# Mint 5 CROZZ to each wallet
node scripts/demo-wallet-operations.js --mint-amount 5000000000

# Use different network
node scripts/demo-wallet-operations.js --network localnet

# Combined
node scripts/demo-wallet-operations.js --network testnet --mint-amount 2000000000
```

## View Results on Dashboard

### 1. Start Backend Server

```bash
cd backend
npm run dev
```

Wait for: `Backend running on port 4000`

### 2. Start Frontend Dashboard

```bash
# In a new terminal
cd frontend
npm run dev
```

Wait for: `Local: http://localhost:5173/`

### 3. Open Dashboard

Navigate to: http://localhost:5173

### 4. View Operations

**In the Dashboard:**

1. **Wallet Manager Card** (Bottom of page)
   - Click "Create 3 Wallets" to create wallets via UI
   - See all created wallets with addresses
   - Use "Mint" button to mint tokens to individual wallets
   - Use "Freeze" button to freeze/unfreeze wallets
   - See frozen status with 🔒 icon

2. **Events Feed Card**
   - Real-time transaction updates
   - See mint, transfer, freeze events
   - Transaction digests and timestamps

3. **Job Queue Card**
   - View queued operations
   - Check operation status (queued/completed/failed)
   - Click rows to see detailed payloads

## Demo Workflow Example

### Complete End-to-End Test

```bash
# Step 1: Run CLI demo
node scripts/demo-wallet-operations.js --mint-amount 1000000000

# Step 2: Start services (in separate terminals)
cd backend && npm run dev
cd frontend && npm run dev

# Step 3: Open browser to http://localhost:5173

# Step 4: In the Wallet Manager card:
# - Click "Create 3 Wallets"
# - Wait for wallets to appear
# - Click "Mint" on each wallet
# - Click "Freeze" on one wallet
# - Try to mint to frozen wallet (should queue operation)

# Step 5: Check Events Feed and Job Queue
# - See all operations in real-time
# - Check transaction digests
# - Verify frozen wallet operations
```

## Troubleshooting

### "Please configure your .env file"
**Fix:** Make sure you've set all required environment variables:
```bash
# Check if variables are set
cat .env | grep CROZZ_PACKAGE_ID
```

### "Admin balance is low"
**Fix:** Fund your wallet:
```bash
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{ "FixedAmountRequest": { "recipient": "YOUR_ADDRESS" } }'
```

### "No coins found for wallet"
**Why:** Wallets need SUI for gas fees to make transfers

**Fix:** Skip transfer step (demo continues) or fund wallets individually

### "Module 'dotenv' not found"
**Fix:** Install dependencies:
```bash
cd backend && npm install
```

### Frontend shows "Admin token not configured"
**Fix:** Add to `frontend/.env`:
```env
VITE_CROZZ_ADMIN_TOKEN=change-me
```
(Must match backend `ADMIN_TOKEN`)

## What Each Operation Does

### 1. **Create Sui Client**
- Connects to Sui RPC endpoint
- Validates network connectivity
- Gets chain identifier

### 2. **Generate Wallets**
- Creates Ed25519 keypairs
- Generates Sui addresses
- Stores keys (in-memory for demo)

### 3. **Mint Tokens**
- Calls `mint` function on smart contract
- Uses Treasury Cap to create new tokens
- Transfers to recipient addresses

### 4. **Make Transfers**
- Transfers CROZZ between wallets
- Uses `transfer` function
- Requires SUI for gas

### 5. **Freeze Wallets**
- Calls `set_wallet_freeze` with Admin Cap
- Updates registry with frozen status
- Prevents frozen wallets from operations

### 6. **Display Results**
- Shows transaction digests
- Lists all wallet addresses
- Summarizes operations

## Next Steps

After running the demo:

1. **Explore Smart Contract**
   ```bash
   cd smart-contract
   cat sources/crozz_token.move
   ```

2. **Test More Operations**
   - Try unfreezing wallets
   - Burn tokens
   - Update metadata

3. **Check Documentation**
   - [DEMO_WALLET_OPERATIONS.md](scripts/DEMO_WALLET_OPERATIONS.md) - Full documentation
   - [README.md](README.md) - Project overview
   - [SETUP_GUIDE.md](SETUP_GUIDE.md) - Complete setup

4. **Production Considerations**
   - Never use testnet keys for mainnet
   - Use hardware wallets for admin keys
   - Implement proper key management
   - Add monitoring and alerts

## Support & Resources

- **Sui Documentation**: https://docs.sui.io
- **Sui Testnet Faucet**: https://faucet.testnet.sui.io
- **Sui Explorer**: https://suiexplorer.com/?network=testnet
- **CROZZ Issues**: https://github.com/sjhallo07/Crozz-Coin-/issues

## Summary

This demo provides a complete workflow showing:
- ✅ Sui client initialization
- ✅ Wallet generation (3 wallets)
- ✅ Token minting
- ✅ Transfers between wallets
- ✅ Wallet freezing
- ✅ Dashboard visualization

Run time: ~30 seconds (excluding setup)
Gas cost: ~0.1 SUI (for all operations)
