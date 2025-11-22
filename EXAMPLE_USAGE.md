# Example Usage: Complete Sui Client Setup Flow

This document demonstrates a complete example of setting up a Sui client address, configuring the environment, and verifying the setup.

## Example 1: Quick Setup for Development

This is the fastest way to get started with Crozz-Coin on testnet.

```bash
# Step 1: Generate a new Sui address and update environment files
./scripts/setup-sui-client.sh --update-env --network testnet

# Expected output:
# ╔═══════════════════════════════════════════════════════════╗
# ║      Sui Client Address Generator & Configuration         ║
# ╚═══════════════════════════════════════════════════════════╝
#
# 🔑 Generating new Ed25519 keypair...
#
# ✅ Keypair generated successfully!
#
# ═══════════════════════════════════════════════════════════
# 📍 ADDRESS:
#    0x77f64012a07c9fdba8d230a05d871b12327a1c5cd154af9ec2d56b423184d294
#
# 🔐 PUBLIC KEY (Base64):
#    HGKdcn1RgjXrae5Jy10HRCMXtFs0pTv2+ziZZmquvLQ=
#
# 🔒 PRIVATE KEY (with prefix for .env):
#    ed25519:AAA...
# ═══════════════════════════════════════════════════════════
#
# 📝 Updating environment files...
#    ✓ Updated backend SUI_ADMIN_PRIVATE_KEY
#    ✓ Updated backend SUI_RPC_URL
#    ✓ Updated backend SUI_DEFAULT_GAS_BUDGET
#    ✓ Updated backend VITE_SUI_NETWORK
#    ✅ Backend .env file updated!
#
#    ✓ Updated root SUI_ADMIN_PRIVATE_KEY
#    ✓ Updated root SUI_RPC_URL
#    ✓ Updated root SUI_DEFAULT_GAS_BUDGET
#    ✓ Updated root VITE_SUI_NETWORK
#    ✅ Root .env file updated!

# Step 2: Fund your address (copy the curl command from output)
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{ "FixedAmountRequest": { "recipient": "0x77f64012a07c9fdba8d230a05d871b12327a1c5cd154af9ec2d56b423184d294" } }'

# Expected response:
# {"transferred_gas_objects":[{"id":"0x...","version":"..."}]}

# Step 3: Start the backend
cd backend
npm run start

# Expected output:
# [tx-executor] Worker started with interval 3000 ms
# Backend running on port 4000

# Step 4: Test the API (in a new terminal)
curl http://localhost:4000/api/tokens/summary

# Expected response:
# {
#   "totalSupply": "0",
#   "circulating": "0",
#   "holderCount": 0,
#   "message": "Token summary retrieved successfully"
# }
```

## Example 2: Generate Address Without Updating .env

Sometimes you want to generate an address but review it before updating configuration:

```bash
cd backend
node scripts/setup-sui-client.js

# The script displays all credentials but doesn't modify .env files
# You can manually copy values or redirect to a file:
node scripts/setup-sui-client.js > my-wallet.json
```

## Example 3: Generate Multiple Test Wallets

Create several wallets for testing different user scenarios:

```bash
cd backend

# Create admin wallet
node scripts/setup-sui-client.js --update-env --network testnet

# Create additional test wallets (saves JSON to files)
node scripts/setup-sui-client.js > test-wallet-alice.json
node scripts/setup-sui-client.js > test-wallet-bob.json
node scripts/setup-sui-client.js > test-wallet-charlie.json

# Extract addresses for funding
cat test-wallet-alice.json | grep '"address"' | cut -d'"' -f4
cat test-wallet-bob.json | grep '"address"' | cut -d'"' -f4
cat test-wallet-charlie.json | grep '"address"' | cut -d'"' -f4

# Fund each address using faucet (see Step 2 in Example 1)
```

## Example 4: Custom Gas Budget for Mainnet

When setting up for mainnet with higher gas requirements:

```bash
./scripts/setup-sui-client.sh --update-env --network mainnet --gas-budget 20000000

# ⚠️ WARNING: Mainnet requires real SUI tokens!
# Make sure you understand the costs before proceeding
```

## Example 5: Switch Between Networks

```bash
# Switch to localnet for local development
./scripts/setup-sui-client.sh --update-env --network localnet

# Verify localnet node is running
curl http://127.0.0.1:9000 -I

# Switch back to testnet
./scripts/setup-sui-client.sh --update-env --network testnet
```

## Example 6: Programmatic Usage

Use the JSON output in scripts:

```bash
#!/bin/bash

# Generate a wallet and capture JSON
WALLET_JSON=$(cd backend && node scripts/setup-sui-client.js)

# Extract specific fields using jq
ADDRESS=$(echo "$WALLET_JSON" | jq -r '.address')
PRIVATE_KEY=$(echo "$WALLET_JSON" | jq -r '.privateKeyWithPrefix')

echo "Generated address: $ADDRESS"

# Fund the address
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw "{ \"FixedAmountRequest\": { \"recipient\": \"$ADDRESS\" } }"

# Wait for funding to complete
sleep 5

# Update .env programmatically
echo "SUI_ADMIN_PRIVATE_KEY=$PRIVATE_KEY" >> backend/.env
echo "CROZZ_DEFAULT_SIGNER=$ADDRESS" >> backend/.env

echo "Setup complete!"
```

## Example 7: Verify Generated Configuration

After running the setup script, verify your configuration:

```bash
# Check backend .env
cat backend/.env | grep "SUI_"

# Expected output:
# SUI_ADMIN_PRIVATE_KEY=ed25519:AAA...
# SUI_RPC_URL=https://fullnode.testnet.sui.io:443
# SUI_DEFAULT_GAS_BUDGET=10000000

# Check root .env
cat .env | grep "SUI_"

# Test the private key is valid (requires backend dependencies)
cd backend
node -e "
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64 } from '@mysten/sui/utils';
import * as dotenv from 'dotenv';
dotenv.config();

const key = process.env.SUI_ADMIN_PRIVATE_KEY.replace('ed25519:', '');
const keypair = Ed25519Keypair.fromSecretKey(fromB64(key));
console.log('✅ Valid keypair. Address:', keypair.getPublicKey().toSuiAddress());
"
```

## Example 8: Complete End-to-End Setup

Full setup from scratch to running application:

```bash
# 1. Clone repository (if not already done)
git clone https://github.com/sjhallo07/Crozz-Coin-.git
cd Crozz-Coin-

# 2. Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# 3. Generate Sui address and configure environment
./scripts/setup-sui-client.sh --update-env --network testnet

# 4. Extract the generated address
ADDRESS=$(grep "CROZZ_DEFAULT_SIGNER" .env | cut -d'=' -f2)
echo "Your address: $ADDRESS"

# 5. Fund the address
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw "{\"FixedAmountRequest\":{\"recipient\":\"$ADDRESS\"}}"

# 6. Wait for funding confirmation
echo "Waiting 10 seconds for funding to complete..."
sleep 10

# 7. Start backend (in background)
cd backend
npm run start &
BACKEND_PID=$!
cd ..

# 8. Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 5

# 9. Test backend API
curl -s http://localhost:4000/api/tokens/summary | jq

# 10. Start frontend (in new terminal or background)
# cd frontend && npm run dev

# 11. Open browser to http://localhost:5173

# 12. When done, stop backend
kill $BACKEND_PID
```

## Example 9: Docker Setup

Using Docker Compose with generated credentials:

```bash
# 1. Generate credentials
./scripts/setup-sui-client.sh --update-env --network testnet

# 2. Update docker-compose.yml environment section with your keys
# (or use .env file which Docker Compose reads automatically)

# 3. Start services
docker compose up --build

# 4. Test the services
curl http://localhost:4000/api/tokens/summary
# Frontend available at http://localhost:5173
```

## Example 10: CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Deploy to Testnet

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Generate Sui wallet
        run: |
          cd backend
          node scripts/setup-sui-client.js > wallet.json
          echo "WALLET_ADDRESS=$(jq -r '.address' wallet.json)" >> $GITHUB_ENV
      
      - name: Fund wallet
        run: |
          curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
            --header 'Content-Type: application/json' \
            --data-raw "{\"FixedAmountRequest\":{\"recipient\":\"$WALLET_ADDRESS\"}}"
      
      - name: Deploy
        run: |
          # Your deployment commands here
          cd backend && npm run start
```

## Troubleshooting Examples

### Fix: "Cannot find package '@mysten/sui'"

```bash
cd backend
npm install
# Then run the script again
node scripts/setup-sui-client.js
```

### Fix: "Invalid private key"

```bash
# Check the format in .env
cat backend/.env | grep SUI_ADMIN_PRIVATE_KEY

# Should start with ed25519:
# SUI_ADMIN_PRIVATE_KEY=ed25519:AAA...

# If not, regenerate:
cd backend
node scripts/setup-sui-client.js --update-env
```

### Fix: "Insufficient gas"

```bash
# Extract your address
ADDRESS=$(grep "SUI_ADMIN_PRIVATE_KEY" backend/.env | cut -d'=' -f2)

# Re-fund from faucet
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw "{\"FixedAmountRequest\":{\"recipient\":\"$ADDRESS\"}}"
```

## Best Practices

1. **Never commit .env files**: They contain sensitive private keys
2. **Use different addresses for different environments**: dev, staging, production
3. **Backup your private keys**: Store securely in password manager or vault
4. **Test with testnet first**: Always validate on testnet before mainnet
5. **Monitor your gas usage**: Keep track of transaction costs
6. **Rotate keys regularly**: Generate new addresses for production deployments

## Next Steps

After generating your address:
1. ✅ Fund it from the faucet
2. ✅ Verify the backend starts correctly
3. ✅ Test the API endpoints
4. ✅ Deploy the Move smart contract
5. ✅ Update environment with contract IDs
6. ✅ Start the frontend dashboard

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for the complete setup process.
