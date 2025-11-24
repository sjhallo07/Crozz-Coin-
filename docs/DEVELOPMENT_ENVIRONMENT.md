# Development Environment Setup Guide

This guide provides comprehensive instructions for setting up the Crozz-Coin development environment with a security-first approach.

**Priority: Security > Functionality > Performance > Developer Experience**

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Security Configuration](#security-configuration)
5. [Development Tools](#development-tools)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Git** >= 2.x
- **Rust** (for Sui CLI)
- **Docker** (optional, for containerized development)

### Operating System Support

- Linux (Ubuntu 20.04+, Debian 11+)
- macOS (11.0+)
- Windows (with WSL2 recommended)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/sjhallo07/Crozz-Coin-.git
cd Crozz-Coin-

# Install all dependencies
npm run install:all

# Install Sui CLI and tools
./scripts/install-sui-cli.sh

# Setup Git hooks
./scripts/setup-git-hooks.sh

# Verify environment
npm run verify

# Start development
npm run dev
```

## Detailed Setup

### 1. Install Dependencies

#### Root Dependencies
```bash
cd /path/to/Crozz-Coin-
npm install
```

This installs:
- ESLint with security plugins
- Prettier for code formatting
- Husky for Git hooks
- Security auditing tools

#### Backend Dependencies
```bash
cd backend
npm install
```

Includes:
- Express.js framework
- Sui SDK (@mysten/sui)
- Security middleware (helmet)
- Testing tools (Jest, Supertest)

#### Frontend Dependencies
```bash
cd frontend
npm install
```

Includes:
- React 18.x
- Sui dApp Kit
- TypeScript
- Tailwind CSS
- Security-focused ESLint plugins

### 2. Configure TypeScript

TypeScript is configured with strict security settings:

**Frontend (`frontend/tsconfig.json`)**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    // ... other strict options
  }
}
```

**Backend (`backend/tsconfig.json`)**
- Supports ES2022 features
- Enables all strict type checking
- Configured for Node.js environment

### 3. Setup Sui Move Development

#### Install Sui CLI
```bash
./scripts/install-sui-cli.sh
```

This script:
- Installs Rust toolchain if needed
- Compiles and installs Sui CLI from source
- Installs Move Analyzer (LSP)
- Sets up useful aliases
- Initializes Sui client configuration

#### Verify Sui Installation
```bash
sui --version
sui client active-address
```

#### Build Smart Contract
```bash
cd smart-contract
sui move build
sui move test
```

### 4. Security Tooling Setup

#### ESLint Configuration

ESLint is configured with security-focused plugins:
- `eslint-plugin-security`: Detects common security issues
- `eslint-plugin-no-secrets`: Prevents committing secrets
- TypeScript-specific security rules

Configuration file: `.eslintrc.json`

#### Run Security Checks
```bash
# Lint all code
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Run security audit
npm run security:check

# Comprehensive security scan
./scripts/security-audit.sh
```

#### Git Hooks

Pre-commit hooks automatically:
- Check for secrets in staged files
- Run linting and formatting
- Prevent committing `.env` files
- Validate commit message format

Setup:
```bash
./scripts/setup-git-hooks.sh
```

### 5. IDE Configuration

#### VSCode Settings

The repository includes VSCode configuration (`.vscode/`):

**Recommended Extensions** (`.vscode/extensions.json`):
- GitHub Copilot
- Move Language Support
- ESLint
- Prettier
- GitLens
- Docker
- PowerShell
- Markdown All in One
- Code Spell Checker

**Settings** (`.vscode/settings.json`):
- Auto-format on save
- Security-focused linting
- Move language support
- Git integration
- Copilot configuration

**Tasks** (`.vscode/tasks.json`):
- Sui Move build
- Sui Move test
- Publish package
- Call Move functions

#### Install Recommended Extensions
Open VSCode and accept the prompt to install recommended extensions, or:
```
Cmd/Ctrl + Shift + P → "Extensions: Show Recommended Extensions"
```

### 6. Environment Configuration

#### Create Environment File
```bash
cp .env.example .env
```

#### Configure Variables
Edit `.env` with your settings:
```env
# Sui Configuration
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_ADMIN_PRIVATE_KEY=your_private_key_here
CROZZ_PACKAGE_ID=0xPACKAGE_ID
CROZZ_TREASURY_CAP_ID=0xTREASURY_CAP_ID
CROZZ_METADATA_ID=0xMETADATA_ID
CROZZ_REGISTRY_ID=0xREGISTRY_ID

# Backend Configuration
ADMIN_TOKEN=your_secure_token_here
SUI_DEFAULT_GAS_BUDGET=100000000

# Frontend Configuration (in frontend/.env)
VITE_CROZZ_API_BASE_URL=http://localhost:4000
VITE_CROZZ_PACKAGE_ID=0xPACKAGE_ID
```

**⚠️ Security Warning**: Never commit `.env` files to version control!

### 7. Verification Scripts

#### Environment Verification
```bash
npm run verify
```

Checks:
- Node.js and npm versions
- TypeScript configuration
- Sui tools installation
- Move package structure
- Security tools configuration
- Dependencies installation
- Environment files

#### Security Audit
```bash
./scripts/security-audit.sh
```

Performs:
- NPM vulnerability scanning
- Secret detection
- Environment file security
- Deprecated package detection
- ESLint security checks
- TypeScript strict mode validation
- Move contract building and testing

## Security Configuration

### Automated Security Scanning

#### GitHub Actions

The repository includes automated security workflows (`.github/workflows/security-scan.yml`):

- **NPM Audit**: Scans for vulnerable dependencies
- **CodeQL Analysis**: Static code analysis for security vulnerabilities
- **ESLint Security**: Runs security-focused linting
- **Dependency Review**: Reviews dependency changes in PRs
- **Secret Scanning**: Detects committed secrets
- **Move Security**: Builds and tests smart contracts

Runs on:
- Every push to main/develop branches
- Pull requests
- Daily at 00:00 UTC
- Manual trigger

#### Pre-commit Security

Husky pre-commit hooks:
1. Check for secrets in staged files
2. Prevent committing `.env` files
3. Run lint-staged for code quality
4. Format code with Prettier

### Security Best Practices

#### Code Security
- ✅ Use TypeScript strict mode
- ✅ Enable all ESLint security rules
- ✅ Never commit secrets or API keys
- ✅ Use environment variables for configuration
- ✅ Validate all user inputs with Zod schemas
- ✅ Use helmet.js for Express security headers

#### Dependency Security
- ✅ Run `npm audit` regularly
- ✅ Keep dependencies up-to-date
- ✅ Use `npm ci` in CI/CD pipelines
- ✅ Review dependency changes in PRs
- ✅ Avoid deprecated packages

#### Smart Contract Security
- ✅ Test all Move functions thoroughly
- ✅ Use capability-based access control
- ✅ Implement proper error handling
- ✅ Audit contracts before mainnet deployment
- ✅ Use testnet for initial testing

## Development Tools

### NPM Scripts

#### Root Level
```bash
npm run install:all      # Install all dependencies
npm run dev             # Start backend and frontend
npm run build           # Build all packages
npm run lint            # Lint all code
npm run lint:fix        # Fix linting issues
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run security:check  # Run security checks
npm run test            # Run all tests
npm run verify          # Verify environment
```

#### Backend
```bash
cd backend
npm run dev             # Start dev server with nodemon
npm run start           # Start production server
npm run build           # Type-check with TypeScript
npm run test            # Run Jest tests
npm run test:coverage   # Run tests with coverage
npm run lint            # Lint backend code
npm run security:audit  # Security audit
```

#### Frontend
```bash
cd frontend
npm run dev             # Start Vite dev server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Lint frontend code
npm run security:audit  # Security audit
```

### Sui CLI Commands

```bash
# Build Move package
sui move build --path smart-contract

# Run Move tests
sui move test --path smart-contract

# Publish to testnet
sui client publish --gas-budget 100000000 --path smart-contract

# Call Move function
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_token \
  --function mint \
  --args <TREASURY_CAP> <AMOUNT> <RECIPIENT> \
  --gas-budget 10000000

# Check gas balance
sui client gas

# Get active address
sui client active-address

# Switch environment
sui client switch --env testnet
```

### Docker Development

#### Start All Services
```bash
docker-compose up -d
```

#### Stop Services
```bash
docker-compose down
```

#### Rebuild Containers
```bash
docker-compose up -d --build
```

Services:
- Backend: http://localhost:4000
- Frontend: http://localhost:5173

## LLM Integration

### GitHub Copilot Configuration

VSCode settings include Copilot optimization:
- Enabled for all file types
- Code actions enabled
- Chat and search features enabled
- Custom prompts for security patterns

### AI-Assisted Development

Use Copilot for:
- Security-first code generation
- Smart contract development
- Test creation
- Documentation writing
- Code review suggestions

### Security Prompts

Example prompts for secure development:
```
// Generate a secure API endpoint with input validation
// Add comprehensive error handling with Zod validation
// Create a Move function with capability-based access control
// Implement rate limiting for API endpoint
```

## Blockchain/Sui Workflows

### Local Development Flow

1. **Write Move Code**: Edit smart contract in `smart-contract/sources/`
2. **Build**: `sui move build --path smart-contract`
3. **Test**: `sui move test --path smart-contract`
4. **Deploy to Testnet**: `sui client publish`
5. **Update Environment**: Add package ID to `.env`
6. **Test Integration**: Run backend and frontend
7. **Verify**: Use dashboard to interact with contract

### Testnet Deployment

```bash
# Ensure you're on testnet
sui client switch --env testnet

# Get testnet tokens
# Visit Discord: https://discord.gg/sui

# Publish package
cd smart-contract
sui client publish --gas-budget 100000000

# Save output IDs
# Update .env and frontend/.env with:
# - CROZZ_PACKAGE_ID
# - CROZZ_TREASURY_CAP_ID
# - CROZZ_METADATA_ID
# - CROZZ_REGISTRY_ID
```

### Contract Interaction

```bash
# Using backend API
curl -X POST http://localhost:4000/api/admin/mint \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient":"0xRECIPIENT","amount":"1000000"}'

# Using Sui CLI directly
sui client call \
  --package $CROZZ_PACKAGE_ID \
  --module crozz_token \
  --function mint \
  --args $CROZZ_TREASURY_CAP_ID 1000000 0xRECIPIENT \
  --gas-budget 10000000
```

## Verification

### Run Full Verification
```bash
npm run verify
```

Expected output:
```
✓ Node.js v20.x.x (>= 18.x required)
✓ npm 10.x.x
✓ TypeScript strict mode enabled
✓ Sui CLI installed
✓ Move package configured
✓ ESLint security plugin enabled
✓ All dependencies installed
✓ Environment files configured
```

### Manual Verification Steps

1. **Check Node.js**: `node --version` (should be >= 18.x)
2. **Check Sui**: `sui --version` (should show version)
3. **Build Move**: `cd smart-contract && sui move build`
4. **Run Tests**: `npm test`
5. **Start Services**: `npm run dev`
6. **Access Frontend**: http://localhost:5173
7. **Access Backend**: http://localhost:4000/api/tokens

## Troubleshooting

### Common Issues

#### Sui CLI Installation Failed
```bash
# Install Rust manually
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Retry Sui installation
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui
```

#### Move Build Errors
```bash
# Clean and rebuild
cd smart-contract
rm -rf build/
sui move build
```

#### TypeScript Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Port Already in Use
```bash
# Backend (default 4000)
lsof -ti:4000 | xargs kill -9

# Frontend (default 5173)
lsof -ti:5173 | xargs kill -9
```

#### Git Hooks Not Working
```bash
# Reinstall hooks
rm -rf .husky
./scripts/setup-git-hooks.sh
```

### Getting Help

1. Check existing documentation in `docs/`
2. Review GitHub issues
3. Run verification script for diagnostics: `npm run verify`
4. Check logs: `backend/logs/` and browser console
5. Contact the development team

## Additional Resources

- [Sui Documentation](https://docs.sui.io/)
- [Move Language Book](https://move-book.com/)
- [Sui TypeScript SDK](https://sdk.mystenlabs.com/typescript)
- [Repository Wiki](https://github.com/sjhallo07/Crozz-Coin-/wiki)

---

**Last Updated**: 2025-11-24

For questions or issues, please open a GitHub issue or contact the maintainers.
