# Crozz-Coin Development Scripts

This directory contains utility scripts for development, testing, security, and deployment of the Crozz-Coin project.

## Quick Start

### Complete Environment Setup

Run the comprehensive setup script to configure your entire development environment:

```bash
./scripts/setup-environment.sh
```

This script will:
- Install all dependencies (root, backend, frontend)
- Set up environment files
- Configure Git hooks
- Optionally install Sui CLI
- Run security audit
- Verify environment

## Development Scripts

### Environment Setup

#### `setup-environment.sh` ⭐ **Recommended for first-time setup**
Complete one-command setup for the entire development environment.

```bash
./scripts/setup-environment.sh
```

#### `install-sui-cli.sh`
Install Sui CLI, Move Analyzer, and related tools for Move smart contract development.

```bash
./scripts/install-sui-cli.sh
```

Requirements: Rust toolchain (script will install if missing)

#### `setup-git-hooks.sh`
Configure Git hooks for security checks, linting, and commit message validation.

```bash
./scripts/setup-git-hooks.sh
```

Hooks installed:
- **pre-commit**: Secret detection, linting, formatting
- **commit-msg**: Conventional commit format validation
- **pre-push**: Tests and security audit

### Verification Scripts

#### `verify-environment.js`
Comprehensive environment verification checks.

```bash
node scripts/verify-environment.js
# or
npm run verify
```

Checks:
- Node.js and npm versions
- TypeScript configuration
- Sui tools installation
- Security tools setup
- Dependencies health
- Environment files

#### `check-dependencies.sh`
Health check for project dependencies.

```bash
./scripts/check-dependencies.sh
```

Features:
- Check for outdated packages
- Security vulnerability scanning
- Deprecated package detection
- Update recommendations

### Security Scripts

#### `security-audit.sh` 🔒 **Run before every deployment**
Comprehensive security audit of the entire project.

```bash
./scripts/security-audit.sh
```

Performs:
1. NPM security audit
2. Secret scanning
3. Environment file security check
4. Deprecated package detection
5. ESLint security checks
6. TypeScript strict mode verification
7. Move contract security validation

#### `move-security-check.sh`
Specialized security analysis for Move smart contracts.

```bash
./scripts/move-security-check.sh
```

Checks:
- Move package builds correctly
- All Move tests pass
- Security anti-patterns
- Access control patterns
- Error handling
- Test coverage

### Testing Scripts

#### `test-ecosystem.sh`
End-to-end testing of the complete ecosystem.

```bash
./scripts/test-ecosystem.sh
```

#### `test_crozz.sh`
Quick smoke tests for Crozz token functionality.

```bash
./scripts/test_crozz.sh
```

### Deployment Scripts

#### `testnet-validation.sh`
Validate deployment on Sui testnet.

```bash
./scripts/testnet-validation.sh
```

#### `quick-start.sh`
Quick deployment and testing on testnet.

```bash
./scripts/quick-start.sh
```

#### `setup-cloud-runtime.ps1`
Provision IBM Cloud compute targets (VSI builder, Code Engine apps, IBM Kubernetes cluster, GitHub Actions secrets)
in the recommended order. Supports dry-run previews by default; pass `-Apply` to execute the generated commands.

```powershell
# Preview Code Engine-only flow
pwsh ./scripts/setup-cloud-runtime.ps1 -Targets CodeEngine

# Provision VSI + Code Engine + IKS using custom names/region
pwsh ./scripts/setup-cloud-runtime.ps1 -Targets VSI,CodeEngine,IKS -Region us-south -ResourceGroup Crozz -RegistryNamespace crozz-dev -Apply
```

Key parameters:

| Parameter                                                   | Description                                                               |
| ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| `-Targets`                                                  | Any combination of `VSI`, `CodeEngine`, `IKS`, `GitHubActions`, or `All`. |
| `-ApiKey`                                                   | IBM Cloud API key (defaults to `IBM_CLOUD_API_KEY`).                      |
| `-RegistryNamespace`                                        | Container Registry namespace to guard/create.                             |
| `-VpcName`, `-SubnetName`, `-VsiName`                       | Identifiers for VSI infrastructure.                                       |
| `-CodeEngineProject`, `-BackendAppName`, `-FrontendAppName` | Names for Code Engine resources.                                          |
| `-IksClusterName`, `-KustomizePath`                         | IBM Kubernetes Service cluster + manifest path to apply.                  |
| `-Apply`                                                    | Execute commands instead of printing the ordered plan.                    |

## Script Usage Examples

### First-Time Setup

```bash
# Complete setup (recommended)
./scripts/setup-environment.sh

# Or manual step-by-step
npm install
cd backend && npm install
cd ../frontend && npm install
./scripts/install-sui-cli.sh
./scripts/setup-git-hooks.sh
node scripts/verify-environment.js
```

### Daily Development

```bash
# Before starting work
npm run verify
./scripts/check-dependencies.sh

# Before committing (automatic via git hooks)
npm run lint
npm run format

# Before pushing (automatic via git hooks)
npm test
npm run security:check
```

### Pre-Deployment

```bash
# Security audit
./scripts/security-audit.sh

# Move contract check
./scripts/move-security-check.sh

# Full test suite
npm test

# Environment verification
npm run verify
```

### Maintenance

```bash
# Check for updates
./scripts/check-dependencies.sh

# Update dependencies (carefully!)
ncu -u
npm install

# Run tests after updates
npm test
```

## Environment Variables

Scripts respect the following environment variables:

- `NODE_ENV`: Set to `development`, `test`, or `production`
- `SUI_RPC_URL`: Sui network RPC endpoint
- `ADMIN_TOKEN`: Admin authentication token
- `SUI_ADMIN_PRIVATE_KEY`: Private key for admin operations

## Troubleshooting

### Script Won't Execute

```bash
# Make script executable
chmod +x scripts/<script-name>.sh
```

### Sui CLI Installation Fails

```bash
# Install Rust first
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Retry Sui installation
./scripts/install-sui-cli.sh
```

### Security Audit Fails

```bash
# Fix vulnerabilities
npm audit fix

# Check again
./scripts/security-audit.sh
```

### Move Build Fails

```bash
# Clean and rebuild
cd smart-contract
rm -rf build/
sui move build
```

## Best Practices

### Security

1. **Always run security-audit.sh before deployment**
2. **Never commit .env files** (git hooks will prevent this)
3. **Review security scan results carefully**
4. **Keep dependencies up to date**

### Testing

1. **Run tests before committing** (automatic via git hooks)
2. **Write tests for new features**
3. **Use move-security-check.sh for Move changes**
4. **Test on testnet before mainnet**

### Development

1. **Run verify-environment.js after setup changes**
2. **Use check-dependencies.sh weekly**
3. **Follow conventional commit format**
4. **Let git hooks do their job** (don't use --no-verify unless necessary)

## Integration with npm Scripts

Many scripts can be run via npm:

```bash
npm run verify           # verify-environment.js
npm run lint             # ESLint
npm run format           # Prettier
npm run security:check   # Quick security check
npm test                 # Run all tests
```

## Documentation

For detailed documentation, see:

- [Development Environment Guide](../docs/DEVELOPMENT_ENVIRONMENT.md)
- [Code Security Guidelines](../docs/CODE_SECURITY.md)
- [Main README](../README.md)

## Support

If you encounter issues with any script:

1. Check script output for error messages
2. Verify prerequisites are installed
3. Review relevant documentation
4. Check GitHub issues
5. Contact the development team

---

**Priority: Security > Functionality > Performance > Developer Experience**

*Last Updated: 2025-11-24*

This directory contains utility scripts for managing and testing the Crozz-Coin ecosystem.

## Quick Links

- [Network Configuration Guide](../NETWORK_CONFIGURATION_GUIDE.md) - How to switch between testnet/mainnet/localnet
- [Mainnet Readiness Guide](../MAINNET_READINESS_GUIDE.md) - Complete checklist before mainnet deployment
- [Testnet Deployment Notice](../TESTNET_DEPLOYMENT_NOTICE.md) - Important security information

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

### 3. testnet-validation.sh

**Purpose:** Comprehensive testnet validation and mainnet readiness assessment.

**Location:** `scripts/testnet-validation.sh`

**Usage:**

```bash
./scripts/testnet-validation.sh
```

**What it does:**

1. **Environment Validation** - Checks all required environment variables
2. **Sui CLI Check** - Verifies Sui CLI installation
3. **Backend API Tests** - Tests health and token endpoints
4. **Smart Contract Validation** - Verifies contract deployment
5. **Security Checks** - Validates admin tokens and JWT secrets
6. **Backend Test Suite** - Runs automated backend tests
7. **Report Generation** - Creates `TESTNET_VALIDATION_REPORT.md`

**Output:**

- Console summary with pass/fail status
- Detailed report in `TESTNET_VALIDATION_REPORT.md`
- Mainnet readiness checklist with 50+ items
- Security audit requirements
- Deployment configuration checklist

**When to run:**

- Before considering mainnet deployment
- After significant code changes
- As part of CI/CD pipeline
- Regular validation of testnet setup

**Report includes:**

- Test results (passed/failed)
- Environment configuration status
- Security assessment
- Complete mainnet readiness checklist
- Pre-deployment requirements

### 4. test_crozz.sh

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
