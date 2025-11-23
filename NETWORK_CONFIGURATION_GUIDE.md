# Network Configuration Guide

This guide explains how to configure and switch between Testnet, Mainnet, and Localnet for the Crozz Token application.

---

## Network Overview

The Crozz Token application supports three Sui networks:

| Network | Purpose | RPC URL | Use Case |
|---------|---------|---------|----------|
| **Testnet** | Testing & Development | `https://fullnode.testnet.sui.io:443` | Safe testing with no real value |
| **Mainnet** | Production | `https://fullnode.mainnet.sui.io:443` | Live deployment with real assets |
| **Localnet** | Local Development | `http://127.0.0.1:9000` | Development with local Sui node |

---

## Quick Start

### Current Network Setup (Testnet)

The repository is currently configured for **Testnet** by default. This is the safe configuration for testing and development.

### Switching Networks

To switch networks, update the `VITE_SUI_NETWORK` environment variable:

```bash
# For Testnet (default, recommended for testing)
VITE_SUI_NETWORK=testnet

# For Mainnet (production only - see warnings below)
VITE_SUI_NETWORK=mainnet

# For Localnet (local development)
VITE_SUI_NETWORK=localnet
```

---

## Testnet Configuration (Current)

### Purpose
- Safe testing environment
- No real assets at risk
- Free test tokens from faucet
- Identical functionality to mainnet

### Configuration

#### Environment Variables

**Root `.env`:**
```env
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
VITE_SUI_NETWORK=testnet
SUI_DEFAULT_GAS_BUDGET=10000000
CROZZ_EXECUTOR_DRY_RUN=false
```

**Frontend:**
```env
VITE_SUI_NETWORK=testnet
VITE_CROZZ_API_BASE_URL=http://localhost:4000
VITE_CROZZ_PACKAGE_ID=<YOUR_TESTNET_PACKAGE_ID>
VITE_CROZZ_METADATA_ID=<YOUR_TESTNET_METADATA_ID>
```

### Getting Test Tokens

```bash
# Using curl
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{ "FixedAmountRequest": { "recipient": "<YOUR_ADDRESS>" } }'

# Or use the web faucet
# https://docs.sui.io/guides/developer/getting-started/get-coins
```

### Testing Workflow

1. **Deploy to Testnet**
   ```bash
   cd smart-contract
   sui client publish --gas-budget 100000000
   ```

2. **Update Configuration**
   - Copy package ID, treasury cap ID, etc. from publish output
   - Update `.env` files with testnet IDs

3. **Run Validation**
   ```bash
   ./scripts/testnet-validation.sh
   ```

4. **Review Report**
   ```bash
   cat TESTNET_VALIDATION_REPORT.md
   ```

---

## Mainnet Configuration

### ⚠️ CRITICAL WARNINGS

**STOP! Before configuring mainnet, ensure:**

- ✅ All testnet tests passing
- ✅ Smart contract professionally audited
- ✅ Security vulnerabilities resolved
- ✅ Team trained and ready
- ✅ Legal documentation complete
- ✅ See `MAINNET_READINESS_GUIDE.md` for full checklist

### Never Reuse Testnet Configuration

❌ **DO NOT:**
- Reuse testnet package IDs on mainnet
- Copy testnet private keys to mainnet
- Use testnet admin tokens on mainnet
- Deploy without security audit

✅ **ALWAYS:**
- Generate fresh keys for mainnet
- Deploy new package to mainnet
- Use secure key storage (HSM/Vault)
- Implement multi-signature for treasury

### Configuration

#### Environment Variables

**Root `.env` (Mainnet):**
```env
# Network
NODE_ENV=production
SUI_RPC_URL=https://fullnode.mainnet.sui.io:443
VITE_SUI_NETWORK=mainnet
SUI_DEFAULT_GAS_BUDGET=20000000

# Security - GENERATE NEW VALUES
ADMIN_TOKEN=<STRONG_RANDOM_TOKEN_MIN_32_CHARS>
JWT_SECRET=<STRONG_RANDOM_SECRET_MIN_64_CHARS>
BCRYPT_SALT_ROUNDS=14

# Sui - DEPLOY NEW TO MAINNET
SUI_ADMIN_PRIVATE_KEY=<NEW_MAINNET_KEY_FROM_SECURE_VAULT>
CROZZ_PACKAGE_ID=<MAINNET_PACKAGE_ID>
CROZZ_TREASURY_CAP_ID=<MAINNET_TREASURY_CAP>
CROZZ_ADMIN_CAP_ID=<MAINNET_ADMIN_CAP>
CROZZ_REGISTRY_ID=<MAINNET_REGISTRY_ID>
CROZZ_MODULE=crozz_token
CROZZ_EXECUTOR_DRY_RUN=false
```

**Frontend `.env` (Mainnet):**
```env
VITE_SUI_NETWORK=mainnet
VITE_CROZZ_API_BASE_URL=https://api.crozz.io
VITE_CROZZ_PACKAGE_ID=<MAINNET_PACKAGE_ID>
VITE_CROZZ_MAINNET_PACKAGE_ID=<MAINNET_PACKAGE_ID>
VITE_CROZZ_METADATA_ID=<MAINNET_METADATA_ID>
VITE_CROZZ_MAINNET_METADATA_ID=<MAINNET_METADATA_ID>
VITE_CROZZ_ADMIN_TOKEN=<MAINNET_ADMIN_TOKEN>
```

### Deployment Process

See `MAINNET_READINESS_GUIDE.md` for complete deployment process.

---

## Localnet Configuration

### Purpose
- Local development and testing
- Fast iteration without network delays
- Complete control over blockchain state

### Prerequisites

1. **Install Sui Locally**
   ```bash
   cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui
   ```

2. **Start Local Node**
   ```bash
   sui start
   ```

### Configuration

**Environment Variables:**
```env
SUI_RPC_URL=http://127.0.0.1:9000
VITE_SUI_NETWORK=localnet
SUI_DEFAULT_GAS_BUDGET=10000000
```

### Local Development Workflow

1. **Start local Sui node**
   ```bash
   sui start
   ```

2. **Deploy contract**
   ```bash
   cd smart-contract
   sui client publish --gas-budget 100000000
   ```

3. **Update configuration** with local IDs

4. **Run backend and frontend**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev

   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

---

## Dashboard Network Indicator

The dashboard displays the current network prominently:

### Visual Indicators

- **🟢 Mainnet** - Green badge with "⚠️ LIVE" warning
- **🟡 Testnet** - Yellow badge with info message
- **⚪ Localnet** - Gray badge

### Network Banner

- **Mainnet**: Red warning banner about real assets
- **Testnet**: Blue info banner about test environment

### Location
- Header: Network badge next to dashboard title
- Main content: Detailed NetworkIndicator card at top

---

## User vs Admin Mode

The dashboard supports two modes:

### User Mode (👤)
- Basic token operations
- Wallet interactions
- Transfer and balance checking
- No privileged operations

### Admin Mode (👨‍💼)
- Token minting and burning
- Metadata management
- Freeze operations
- Registry management
- Requires `VITE_CROZZ_ADMIN_TOKEN`

### Switching Modes

Click the role switcher button in the header:
- Shows only if `VITE_CROZZ_ADMIN_TOKEN` is configured
- Persists selection in browser localStorage
- Header title changes: "User Dashboard" or "Admin Dashboard"

---

## Network-Specific Features

### Testnet Features
✅ All features enabled
✅ Free test tokens from faucet
✅ Safe for experimentation
✅ Dry-run mode available
✅ Unlimited testing

### Mainnet Features
⚠️ All features use real assets
⚠️ Transactions are irreversible
⚠️ Gas costs real SUI tokens
⚠️ Requires security measures
⚠️ Should have monitoring

### Localnet Features
✅ Complete control
✅ Fast iteration
✅ No external dependencies
✅ Reset state anytime
✅ Free unlimited tokens

---

## Troubleshooting

### Wrong Network Connected

**Symptoms:**
- Transactions fail
- Package not found errors
- Wrong token balances

**Solution:**
1. Check `VITE_SUI_NETWORK` in `.env`
2. Verify RPC URL matches network
3. Ensure package IDs are for correct network
4. Restart backend and frontend after changing

### Network Mismatch

**Symptoms:**
- Dashboard shows wrong network
- Environment says testnet but connecting to mainnet

**Solution:**
1. Clear browser cache and localStorage
2. Verify ALL environment files have correct `VITE_SUI_NETWORK`
3. Check wallet is connected to correct network
4. Rebuild frontend: `npm run build`

### Cannot Switch Networks

**Symptoms:**
- Network stuck on testnet
- Environment changes not taking effect

**Solution:**
1. Stop backend and frontend
2. Update `.env` files
3. Clear build cache: `rm -rf frontend/dist`
4. Rebuild: `cd frontend && npm run build`
5. Restart services

### Mainnet Accidentally Configured

**Symptoms:**
- Dashboard shows mainnet
- Red warning banners
- Real assets at risk

**Immediate Actions:**
1. **STOP ALL OPERATIONS**
2. Set `CROZZ_EXECUTOR_DRY_RUN=true`
3. Change `VITE_SUI_NETWORK=testnet`
4. Restart all services
5. Verify testnet configuration

---

## Environment File Management

### Multiple Environments

Consider separate environment files:

```
.env.testnet          # Testnet configuration
.env.mainnet          # Mainnet configuration (secure!)
.env.localnet         # Local development
.env                  # Current active (copy from above)
```

**Usage:**
```bash
# Switch to testnet
cp .env.testnet .env

# Switch to localnet
cp .env.localnet .env

# NEVER: Switch to mainnet without full preparation
# cp .env.mainnet .env  # Only after mainnet readiness checklist
```

### Security Best Practices

1. **Never commit mainnet credentials**
   ```bash
   # .gitignore should include:
   .env
   .env.mainnet
   .env.production
   .env.local
   ```

2. **Use environment-specific naming**
   - `TESTNET_PACKAGE_ID` vs `MAINNET_PACKAGE_ID`
   - Clear what belongs where

3. **Secure mainnet files**
   ```bash
   # Restrict permissions
   chmod 600 .env.mainnet
   ```

---

## Verification Commands

### Check Current Network

```bash
# Check environment
grep VITE_SUI_NETWORK .env

# Check frontend build
cat frontend/dist/index.html | grep -o 'network'

# Check backend
curl http://localhost:4000/health
```

### Verify Configuration

```bash
# Run validation script
./scripts/testnet-validation.sh

# Check report
cat TESTNET_VALIDATION_REPORT.md | grep "Network:"
```

### Test Network Connection

```bash
# Testnet
curl https://fullnode.testnet.sui.io:443/health

# Mainnet
curl https://fullnode.mainnet.sui.io:443/health

# Localnet
curl http://127.0.0.1:9000/health
```

---

## Summary

| Action | Testnet | Mainnet | Localnet |
|--------|---------|---------|----------|
| **Default** | ✅ Yes | ❌ No | ❌ No |
| **Safe Testing** | ✅ Yes | ❌ No | ✅ Yes |
| **Real Assets** | ❌ No | ⚠️ Yes | ❌ No |
| **Free Tokens** | ✅ Yes | ❌ No | ✅ Yes |
| **Security Audit Required** | ❌ No | ✅ Yes | ❌ No |
| **Recommended For** | Testing | Production | Development |

---

## Next Steps

1. **Stay on Testnet**: Continue testing until ready
2. **Run Validation**: `./scripts/testnet-validation.sh`
3. **Review Readiness**: Read `MAINNET_READINESS_GUIDE.md`
4. **When Ready**: Follow mainnet deployment checklist
5. **Get Help**: Sui Discord, documentation, security audit firms

---

**Important:** Take your time on testnet. Rushing to mainnet can result in permanent loss of funds or security vulnerabilities. Test thoroughly, audit professionally, and deploy confidently.

**Last Updated:** 2025-11-23  
**Version:** 1.0
