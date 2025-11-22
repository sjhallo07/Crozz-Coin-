# Crozz-Coin Setup Guide

This guide will help you set up the Crozz-Coin ecosystem from scratch, including generating Sui addresses, configuring environment variables, and deploying the smart contract.

## Prerequisites

Before you begin, ensure you have:
- **Node.js** v18 or later installed
- **npm** package manager
- Internet connection for downloading dependencies and accessing testnet

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/sjhallo07/Crozz-Coin-.git
cd Crozz-Coin-

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

## Step 2: Generate Sui Client Address

The most important step is to generate a new Sui address for your admin operations. This address will be used to sign transactions, mint tokens, and perform administrative actions.

### Quick Start (Recommended)

```bash
# From the repository root
./scripts/setup-sui-client.sh --update-env --network testnet
```

This will:
✅ Generate a new Ed25519 keypair  
✅ Update both root `.env` and `backend/.env` files  
✅ Configure testnet network settings  
✅ Set default gas budget to 10,000,000 MIST  

### Manual Setup (Alternative)

If you prefer to run the Node.js script directly:

```bash
cd backend
node scripts/setup-sui-client.js --update-env --network testnet
```

### What Gets Generated

The script will output:
- **Sui Address**: Your unique address on the Sui blockchain (e.g., `0xabcd...`)
- **Public Key**: Your public identity (Base64 encoded)
- **Private Key**: Your secret key (Base64 encoded with `ed25519:` prefix)
- **Network Configuration**: RPC URL, gas budget, and faucet information

**⚠️ SECURITY WARNING**: The private key gives full control over your address. Never share it or commit it to version control!

## Step 3: Fund Your Address

Your newly generated address needs SUI tokens to pay for gas fees.

### For Testnet (Recommended for Development)

Use the Sui testnet faucet to get free test tokens:

```bash
# The setup script provides this command for you
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{ "FixedAmountRequest": { "recipient": "YOUR_ADDRESS_HERE" } }'
```

Or use the web faucet:
- Visit: https://docs.sui.io/guides/developer/getting-started/get-coins
- Paste your address
- Request tokens

You should receive 1 SUI (1,000,000,000 MIST) which is sufficient for multiple transactions.

### Verify Your Balance

If you have the Sui CLI installed:
```bash
sui client balance YOUR_ADDRESS_HERE
```

## Step 4: Configure Environment Variables

After running the setup script, your environment files should look like this:

### Root `.env` File

```env
# Crozz Ecosystem configuration
PORT=4000
ADMIN_TOKEN=change-me-to-secure-token

# Sui Configuration (Auto-generated)
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_ADMIN_PRIVATE_KEY=ed25519:YOUR_GENERATED_KEY
SUI_DEFAULT_GAS_BUDGET=10000000

# Crozz Smart Contract IDs (Update after deployment)
CROZZ_PACKAGE_ID=0xYOUR_PACKAGE_ID
CROZZ_TREASURY_CAP_ID=0xYOUR_TREASURY_CAP_OBJECT
CROZZ_ADMIN_CAP_ID=0xYOUR_ADMIN_CAP_OBJECT
CROZZ_REGISTRY_ID=0xYOUR_REGISTRY_SHARED_OBJECT
CROZZ_MODULE=crozz_token
CROZZ_EXECUTOR_DRY_RUN=false

# Frontend Configuration
VITE_SUI_NETWORK=testnet
VITE_CROZZ_PACKAGE_ID=0xPACKAGE
VITE_CROZZ_METADATA_ID=0xMETADATA
VITE_CROZZ_MODULE=crozz_token
VITE_CROZZ_VIEW_FUNCTION=get_icon_url
VITE_CROZZ_GAS_BUDGET=10000000
```

### Backend `.env` File

```env
SUI_ADMIN_PRIVATE_KEY=ed25519:YOUR_GENERATED_KEY
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_DEFAULT_GAS_BUDGET=10000000
VITE_SUI_NETWORK=testnet
```

### Frontend `.env` File

Create `frontend/.env`:

```env
VITE_CROZZ_API_BASE_URL=http://localhost:4000
VITE_CROZZ_PACKAGE_ID=0xYOUR_PACKAGE_ID
VITE_CROZZ_MODULE=crozz_token
VITE_CROZZ_METADATA_ID=0xYOUR_METADATA_OBJECT_ID
VITE_CROZZ_VIEW_FUNCTION=get_icon_url
VITE_CROZZ_GAS_BUDGET=10000000
VITE_CROZZ_ADMIN_TOKEN=change-me-to-secure-token
VITE_SUI_NETWORK=testnet
```

## Step 5: Deploy the Smart Contract (Optional)

If you want to deploy the Crozz token smart contract:

### Prerequisites
- Sui CLI installed (`cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui`)
- Your address is funded (see Step 3)

### Deployment

```bash
# Navigate to the smart contract directory
cd smart-contract

# Build the contract
sui move build

# Publish to testnet
sui client publish --gas-budget 100000000

# Note the output:
# - Package ID
# - TreasuryCap object ID
# - AdminCap object ID
# - Metadata object ID
# - Registry object ID
```

### Update Environment Variables

After deployment, update your `.env` files with the actual IDs from the publish output:

```bash
CROZZ_PACKAGE_ID=0x<your_package_id>
CROZZ_TREASURY_CAP_ID=0x<your_treasury_cap_id>
CROZZ_ADMIN_CAP_ID=0x<your_admin_cap_id>
CROZZ_REGISTRY_ID=0x<your_registry_id>
```

## Step 6: Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server should start on `http://localhost:4000`.

**Verify it's running:**
```bash
curl http://localhost:4000/api/tokens/summary
```

## Step 7: Start the Frontend

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend should start on `http://localhost:5173`.

**Open your browser:**
- Navigate to http://localhost:5173
- You should see the Crozz dashboard

## Step 8: Test the Setup

### Backend API Tests

```bash
# Get token summary
curl http://localhost:4000/api/tokens/summary

# Test mint endpoint (requires admin authentication)
curl -X POST http://localhost:4000/api/tokens/mint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "amount": 1000,
    "recipient": "YOUR_ADDRESS"
  }'
```

### Frontend Dashboard

1. **Connect Wallet** (if you have a Sui wallet extension)
2. **View Token Overview** - See total supply, holders, etc.
3. **View Events Feed** - Monitor real-time blockchain events
4. **Admin Panel** (with admin token) - Mint, burn, transfer tokens

## Common Workflows

### Create Multiple Test Addresses

```bash
# Generate addresses for testing
cd backend
node scripts/setup-sui-client.js > test-wallet-1.json
node scripts/setup-sui-client.js > test-wallet-2.json
node scripts/setup-sui-client.js > test-wallet-3.json

# Fund each address using the faucet
# Extract addresses from JSON and fund them
```

### Switch Networks

```bash
# Switch to localnet
./scripts/setup-sui-client.sh --update-env --network localnet

# Switch to mainnet (be careful!)
./scripts/setup-sui-client.sh --update-env --network mainnet

# Switch back to testnet
./scripts/setup-sui-client.sh --update-env --network testnet
```

### Run Automated Tests

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

## Troubleshooting

### "Cannot find package '@mysten/sui'"

**Solution:** Install backend dependencies:
```bash
cd backend
npm install
```

### "Insufficient gas" or "Balance too low"

**Solution:** Fund your address from the faucet (Step 3)

### "Invalid private key format"

**Solution:** Ensure the private key has the `ed25519:` prefix:
```env
# Correct
SUI_ADMIN_PRIVATE_KEY=ed25519:AAA...

# Wrong
SUI_ADMIN_PRIVATE_KEY=AAA...
```

### Backend won't start

**Check:**
1. Port 4000 is not in use: `lsof -i :4000`
2. Environment variables are set correctly
3. Dependencies are installed: `cd backend && npm install`

### Frontend won't connect to backend

**Check:**
1. Backend is running on port 4000
2. `VITE_CROZZ_API_BASE_URL=http://localhost:4000` in frontend/.env
3. CORS is enabled in backend (should be by default)

## Next Steps

1. **Explore the Dashboard**: Familiarize yourself with the token overview, events feed, and admin panel
2. **Read the Documentation**: Check out `scripts/README.md` for detailed script documentation
3. **Customize**: Modify the smart contract, backend APIs, or frontend components to suit your needs
4. **Deploy to Production**: When ready, deploy to mainnet with proper security measures

## Security Best Practices

- ✅ Never commit `.env` files to version control
- ✅ Use different keys for development, staging, and production
- ✅ Store private keys in secure secrets managers (not plain text files)
- ✅ Regularly rotate admin tokens and keys
- ✅ Use hardware wallets for production mainnet operations
- ✅ Audit smart contracts before mainnet deployment
- ✅ Implement rate limiting on API endpoints
- ✅ Monitor for suspicious activity

## Additional Resources

- [Sui Documentation](https://docs.sui.io/)
- [Sui TypeScript SDK](https://sui-typescript-docs.vercel.app/)
- [Move Programming Language](https://move-language.github.io/move/)
- [Crozz-Coin GitHub Repository](https://github.com/sjhallo07/Crozz-Coin-)

## Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review the logs in terminal output
3. Search existing GitHub issues
4. Create a new issue with detailed error messages and steps to reproduce

---

**Congratulations!** 🎉 You've successfully set up the Crozz-Coin ecosystem. Happy coding!
