# Crozz-Coin Scripts

This directory contains utility scripts for managing and testing the Crozz-Coin ecosystem.

## Available Scripts

### 1. setup-sui-client.js

**Purpose:** Generate new Ed25519 keypairs for Sui blockchain and configure environment variables.

**Location:** `backend/scripts/setup-sui-client.js`

**Usage:**
```bash
# From the backend directory
cd backend
node scripts/setup-sui-client.js [options]
```

**Options:**
- `--update-env` - Automatically update the .env file with generated credentials
- `--network <network>` - Choose network: testnet (default), mainnet, or localnet
- `--gas-budget <amount>` - Set default gas budget (default: 10000000)
- `--help` - Display help message

**Examples:**

```bash
# Generate a new keypair and display credentials
cd backend
node scripts/setup-sui-client.js

# Generate and update .env file
cd backend
node scripts/setup-sui-client.js --update-env

# Generate for mainnet with custom gas budget
cd backend
node scripts/setup-sui-client.js --network mainnet --gas-budget 20000000 --update-env

# Generate for localnet
cd backend
node scripts/setup-sui-client.js --network localnet --update-env
```

**What it does:**
1. Generates a new Ed25519 keypair using @mysten/sui SDK
2. Displays the Sui address, public key, and private key
3. Optionally updates the `.env` file with:
   - `SUI_ADMIN_PRIVATE_KEY` - Private key with ed25519: prefix
   - `SUI_RPC_URL` - Network RPC endpoint
   - `SUI_DEFAULT_GAS_BUDGET` - Default gas budget for transactions
   - `VITE_SUI_NETWORK` - Network name for frontend
4. Provides instructions for funding the address from faucet
5. Outputs JSON format for scripting integration

**Security Notes:**
- ⚠️ **Never share your private key with anyone!**
- Store private keys securely (environment variables, secrets manager)
- The private key gives full control over the address and its funds
- Use different keypairs for development, testing, and production

**Next Steps After Running:**

1. **Fund your address** (for testnet):
   ```bash
   curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
     --header 'Content-Type: application/json' \
     --data-raw '{ "FixedAmountRequest": { "recipient": "<YOUR_ADDRESS>" } }'
   ```
   
   Or use the web faucet at: https://docs.sui.io/guides/developer/getting-started/get-coins

2. **Update additional environment variables:**
   ```bash
   # In your .env file
   CROZZ_DEFAULT_SIGNER=<YOUR_ADDRESS>
   ```

3. **Verify your setup:**
   ```bash
   # Check balance (requires sui CLI)
   sui client balance <YOUR_ADDRESS>
   
   # Or test through the backend
   npm run start
   ```

### 2. setup-sui-client.sh

**Purpose:** Bash wrapper for the setup-sui-client.js script (convenience wrapper).

**Location:** `scripts/setup-sui-client.sh`

**Usage:**
```bash
# From the repository root
./scripts/setup-sui-client.sh [options]
```

This script:
- Checks if Node.js is installed
- Ensures backend dependencies are installed
- Runs the Node.js script with the provided options

### 3. test_crozz.sh

**Purpose:** Smoke test script for Crozz token operations on Sui blockchain.

**Location:** `scripts/test_crozz.sh`

**Prerequisites:**
- Sui CLI installed and configured
- Published Crozz token package
- Admin and Treasury capabilities

**Configuration:**
Edit the script to set your deployment values:
```bash
PACKAGE_ID="<your_package_id>"
ADMIN_CAP_ID="<your_admin_cap_id>"
TREASURY_CAP_ID="<your_treasury_cap_id>"
METADATA_ID="<your_metadata_id>"
RECIPIENT_ADDRESS="<recipient_address>"
```

**Usage:**
```bash
chmod +x scripts/test_crozz.sh
./scripts/test_crozz.sh
```

**What it tests:**
1. Minting new tokens
2. Updating icon URL
3. Freezing metadata
4. Reading icon URL (view function)
5. Reading total supply (view function)

### 4. run-crozz-automation.ps1

**Purpose:** PowerShell automation script for comprehensive Crozz token deployment and testing.

**Location:** `scripts/run-crozz-automation.ps1`

**Platform:** Windows PowerShell / PowerShell Core

**Usage:**
```powershell
# Full deployment
pwsh ./scripts/run-crozz-automation.ps1 -MovePackagePath "../smart-contract" -MintAmount 1000000000 -MintRecipient 0xYOURADDRESS

# Reuse existing package
pwsh ./scripts/run-crozz-automation.ps1 -SkipPublish -PackageId 0xPACKAGE -MintAmount 1000
```

**Key Parameters:**
- `-MovePackagePath` - Path to Move package
- `-SkipPublish` - Skip publishing, reuse existing package
- `-PackageId`, `-AdminCapId`, `-TreasuryCapId`, `-MetadataId` - Object IDs
- `-MintAmount`, `-MintRecipient` - Minting parameters
- `-IconUrl` - Custom icon URL
- `-FreezeMetadata` - Freeze metadata after update
- `-PublishGasBudget`, `-CallGasBudget` - Gas budgets

## Environment Configuration

After generating a new address, update your environment files:

### Backend `.env`:
```env
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_DEFAULT_GAS_BUDGET=10000000
SUI_ADMIN_PRIVATE_KEY=ed25519:<BASE64_KEY>
CROZZ_DEFAULT_SIGNER=<YOUR_ADDRESS>
CROZZ_PACKAGE_ID=<PACKAGE_ID>
CROZZ_TREASURY_CAP_ID=<TREASURY_CAP_ID>
CROZZ_ADMIN_CAP_ID=<ADMIN_CAP_ID>
CROZZ_REGISTRY_ID=<REGISTRY_ID>
CROZZ_MODULE=crozz_token
CROZZ_EXECUTOR_DRY_RUN=false
```

### Frontend `.env`:
```env
VITE_CROZZ_API_BASE_URL=http://localhost:4000
VITE_CROZZ_PACKAGE_ID=<PACKAGE_ID>
VITE_CROZZ_MODULE=crozz_token
VITE_CROZZ_METADATA_ID=<METADATA_ID>
VITE_CROZZ_VIEW_FUNCTION=get_icon_url
VITE_CROZZ_GAS_BUDGET=10000000
VITE_SUI_NETWORK=testnet
```

## Common Workflows

### 1. Setting Up a New Environment

```bash
# Step 1: Generate a new address
cd backend
node scripts/setup-sui-client.js --update-env --network testnet

# Step 2: Fund the address
# Use the faucet URL provided in the script output

# Step 3: Publish the Move package
cd ../smart-contract
sui client publish --gas-budget 100000000

# Step 4: Update .env with package IDs
# Copy the package ID, treasury cap ID, admin cap ID from publish output

# Step 5: Test the setup
cd ../backend
npm run start
```

### 2. Creating Multiple Test Addresses

```bash
# Generate addresses without updating .env
cd backend
node scripts/setup-sui-client.js > test-address-1.json
node scripts/setup-sui-client.js > test-address-2.json
node scripts/setup-sui-client.js > test-address-3.json
```

### 3. Switching Networks

```bash
# Switch to localnet
cd backend
node scripts/setup-sui-client.js --update-env --network localnet

# Switch back to testnet
node scripts/setup-sui-client.js --update-env --network testnet
```

## Troubleshooting

### "Cannot find package '@mysten/sui'"

**Solution:** Install backend dependencies first:
```bash
cd backend
npm install
```

### "SUI_ADMIN_PRIVATE_KEY is invalid"

**Solution:** Ensure the private key has the `ed25519:` prefix:
```bash
# Correct format
SUI_ADMIN_PRIVATE_KEY=ed25519:AAA...

# Wrong format
SUI_ADMIN_PRIVATE_KEY=AAA...
```

### "Insufficient gas"

**Solution:** 
1. Fund your address from the faucet
2. Increase the gas budget in .env: `SUI_DEFAULT_GAS_BUDGET=20000000`

### Running scripts from wrong directory

The setup-sui-client.js script must be run from the `backend` directory where the `@mysten/sui` package is installed:

```bash
# Correct
cd backend
node scripts/setup-sui-client.js

# Wrong
cd scripts
node setup-sui-client.js  # Will fail
```

## Additional Resources

- [Sui Documentation](https://docs.sui.io/)
- [Sui TypeScript SDK](https://sui-typescript-docs.vercel.app/)
- [Sui CLI Guide](https://docs.sui.io/references/cli)
- [Sui Testnet Faucet](https://docs.sui.io/guides/developer/getting-started/get-coins)

## Contributing

When adding new scripts:
1. Add comprehensive help text (`--help` flag)
2. Include error handling and validation
3. Document the script in this README
4. Add examples of common usage patterns
5. Consider security implications (especially for key handling)
