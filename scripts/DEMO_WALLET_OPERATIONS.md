# Wallet Operations Demo

This script demonstrates a complete workflow for creating and managing wallets on the Sui blockchain with CROZZ tokens.

## Overview

The `demo-wallet-operations.js` script performs the following operations:

1. **Initialize Sui Client** - Connects to the Sui network (testnet by default)
2. **Generate 3 New Wallets** - Creates Ed25519 keypairs for testing
3. **Mint Tokens** - Mints CROZZ tokens to each wallet
4. **Make Transfers** - Transfers tokens between wallets
5. **Freeze Wallets** - Demonstrates wallet freeze functionality
6. **Display Results** - Shows a summary on the console and dashboard

## Prerequisites

Before running the demo, ensure you have:

1. **Node.js** v18+ installed
2. **Deployed CROZZ Contract** on Sui testnet
3. **Environment Configuration** - Set up your `.env` file with:
   - `CROZZ_PACKAGE_ID` - Your deployed package ID
   - `CROZZ_TREASURY_CAP_ID` - Treasury capability object ID
   - `CROZZ_ADMIN_CAP_ID` - Admin capability object ID
   - `CROZZ_REGISTRY_ID` - Anti-bot registry shared object ID
   - `SUI_ADMIN_PRIVATE_KEY` - Admin wallet private key (ed25519:BASE64)
   - `SUI_RPC_URL` - Sui RPC endpoint (default: testnet)
4. **Funded Admin Account** - The admin wallet needs SUI for gas fees

## Installation

```bash
# Install dependencies (if not already done)
cd /home/runner/work/Crozz-Coin-/Crozz-Coin-
npm install

# Or install in backend directory
cd backend
npm install
```

## Usage

### Basic Usage

Run the demo with default settings (testnet, 1 CROZZ per wallet):

```bash
node scripts/demo-wallet-operations.js
```

### Custom Network

Run on a different network:

```bash
node scripts/demo-wallet-operations.js --network testnet
node scripts/demo-wallet-operations.js --network localnet
```

### Custom Mint Amount

Mint a different amount (in base units with 9 decimals):

```bash
# Mint 5 CROZZ to each wallet
node scripts/demo-wallet-operations.js --mint-amount 5000000000

# Mint 0.1 CROZZ to each wallet
node scripts/demo-wallet-operations.js --mint-amount 100000000
```

### Combined Options

```bash
node scripts/demo-wallet-operations.js --network testnet --mint-amount 2000000000
```

## Configuration

### Environment Variables

Create or update your `.env` file in the project root:

```env
# Sui Network Configuration
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_DEFAULT_GAS_BUDGET=10000000

# Admin Credentials
SUI_ADMIN_PRIVATE_KEY=ed25519:YOUR_BASE64_PRIVATE_KEY

# Contract Deployment IDs (from sui client publish output)
CROZZ_PACKAGE_ID=0xYOUR_PACKAGE_ID
CROZZ_TREASURY_CAP_ID=0xYOUR_TREASURY_CAP_OBJECT
CROZZ_ADMIN_CAP_ID=0xYOUR_ADMIN_CAP_OBJECT
CROZZ_REGISTRY_ID=0xYOUR_REGISTRY_SHARED_OBJECT

# Optional
CROZZ_MODULE=crozz_token
CROZZ_DEFAULT_SIGNER=0xFALLBACK_RECIPIENT
```

### Getting Your Keys

To generate a new admin keypair:

```bash
node scripts/setup-sui-client.js --update-env --network testnet
```

This will generate a new Ed25519 keypair and optionally update your `.env` file.

## Output

The script provides detailed console output showing:

### Step 1: Sui Client Initialization
- Network information
- RPC URL
- Chain ID

### Step 2: Admin Keypair Setup
- Admin address
- Admin SUI balance

### Step 3: Wallet Generation
- 3 new wallet addresses
- Public keys for each wallet

### Step 4: Mint Operations
- Mint transaction for each wallet
- Transaction digests
- Success confirmations

### Step 5: Transfer Operations
- Transfer between Wallet 1 → Wallet 2
- Transfer between Wallet 2 → Wallet 3
- Transaction digests

### Step 6: Freeze Operations
- Freeze status for Wallet 1
- Transaction digest

### Step 7: Results Summary
```
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
   ✓ 1.00 CROZZ → Wallet 2
      Tx: GhIjKl456...
   ✓ 1.00 CROZZ → Wallet 3
      Tx: MnOpQr789...

↔️  Transfer Operations:
   ✓ 0.10 CROZZ: Wallet 1 → Wallet 2
      Tx: StUvWx012...
   ✓ 0.10 CROZZ: Wallet 2 → Wallet 3
      Tx: YzAbCd345...

🔒 Freeze Operations:
   ✓ Wallet 1 FROZEN
      Tx: EfGhIj678...
```

## Dashboard Integration

After running the script, view the results on the dashboard:

1. **Start Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open Dashboard**:
   Navigate to http://localhost:5173

4. **View Operations**:
   - Check the **Events Feed** for real-time transaction updates
   - View the **Job Queue** for operation status
   - Use the **Wallet Manager** card to see created wallets

## API Endpoints

The script triggers backend operations that can be monitored via API:

### Wallet Management
- `POST /api/admin/wallets/create` - Create new wallets
- `GET /api/admin/wallets` - List all wallets
- `POST /api/admin/wallets/freeze` - Freeze/unfreeze wallet
- `POST /api/admin/wallets/mint` - Mint to specific wallet

### Jobs
- `GET /api/admin/jobs` - View transaction queue status

## Troubleshooting

### Error: "Please configure your .env file"
**Solution**: Ensure all required environment variables are set in `.env`

### Error: "Admin balance is low"
**Solution**: Fund your admin wallet using the testnet faucet:
```bash
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{ "FixedAmountRequest": { "recipient": "<YOUR_ADMIN_ADDRESS>" } }'
```

### Error: "No coins found for wallet"
**Solution**: This occurs during transfers if wallets don't have enough SUI for gas. You can:
1. Fund each wallet with SUI using the faucet
2. Skip the transfer step (script will continue)

### Error: "Invalid private key format"
**Solution**: Ensure your private key is in the format `ed25519:BASE64_STRING`

### Error: "Transaction failed"
**Solution**: Check that:
1. Package ID and object IDs are correct
2. Admin has sufficient SUI balance
3. Contract is deployed on the correct network

## Next Steps

After running the demo:

1. **Explore the Dashboard** - Use the Wallet Manager UI to interact with created wallets
2. **Try Manual Operations** - Use the dashboard buttons to mint, transfer, or freeze
3. **Check Transaction History** - View all operations in the Events Feed
4. **Test Freeze Functionality** - Try transferring from a frozen wallet (should fail)

## Security Notes

⚠️ **Important**: This is a demo script for testnet use only!

- **Never** use testnet keys or patterns for mainnet
- **Never** commit private keys to version control
- **Always** use environment variables for sensitive data
- **Always** use a secrets manager for production deployments

## Support

For issues or questions:
1. Check the [main README](../README.md)
2. Review [SETUP_GUIDE.md](../SETUP_GUIDE.md)
3. See [scripts/README.md](./README.md) for other utilities
