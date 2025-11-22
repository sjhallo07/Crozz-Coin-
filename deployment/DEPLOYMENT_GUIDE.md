# Crozz Coin - Complete Deployment Guide

> ⚠️ **SECURITY WARNING**: This document contains TESTNET private keys for demonstration purposes only.
> 
> - **NEVER use these keys on mainnet**
> - **NEVER share or reuse these keys in production**
> - **ALWAYS generate new keys for production deployments**
> - These keys are for TESTNET TESTING ONLY and have no real value
> 
> For production deployments, use secure key management practices and never expose private keys in documentation.

## Overview
This guide provides step-by-step instructions to deploy and test Crozz Coin on Sui testnet, including wallet creation, token deployment, minting, and transfers.

## Token Specification
- **Token Name**: Crozz Coin
- **Symbol**: CROZZ
- **Decimals**: 9
- **Initial Supply**: To be minted as needed
- **Token Logo**: `https://crozz-token.com/icon.png`
- **Network**: Sui Testnet

---

## Generated Wallets

### 1. Admin Wallet (Treasury Management)
```
Address:     0x899888ddf619e376d1291f858192eb6b157d5df77746f5057dd6f2b03a09685c
Private Key: ed25519:AAAAAAAAAAAAAAEAAAkAAAMAAAADBgAEAAMAAAAAAAAAAAYAAAAAAAcAAAACAwAABQIAAAAACQAAAAAAAAAAAAAABAADCQ==
Public Key:  Hk54OTCXyZl5M7N2JsUfOlOHwSsGQ3nSYhxO/MvD3SA=
Purpose:     Contract deployment, treasury operations, admin functions
```

**Explorer Link**: https://testnet.suivision.xyz/account/0x899888ddf619e376d1291f858192eb6b157d5df77746f5057dd6f2b03a09685c

### 2. Test Wallet - Alice
```
Address:     0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423
Private Key: ed25519:AAAAAAAAAAAAAAEAAAQAAAUAAAAFAAAAAAAIBAAAAAYAAAAAAAQAAAAACQkDAgAAAAAAAAAAAAAAAAAAAAICBQAABwAHAA==
Public Key:  xUYqq3KGCl2bIcwVIfAXrj1rmbXPh19K9CI+hjnTZrQ=
Purpose:     Token recipient, transfer testing
```

**Explorer Link**: https://testnet.suivision.xyz/account/0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423

### 3. Test Wallet - Bob
```
Address:     0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93
Private Key: ed25519:AAAAAAAAAAAAAAEAAAAAAAQABwAAAAAIAAADAAkACQAEAAkAAAAAAAAAAAAEAAUAAAAAAAAFAAAAAAAAAAAABgAAAAkEAA==
Public Key:  Gok5Zzjfh1DaHyvDk4Ms1dOWtbLHucFWBF5lS8jLw5Y=
Purpose:     Token recipient, transfer testing
```

**Explorer Link**: https://testnet.suivision.xyz/account/0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93

### 4. Test Wallet - Charlie
```
Address:     0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01
Private Key: ed25519:AAAAAAAAAAAAAAEAAAAFAAAAAAYAAgAFAAcAAAAAAgUEAAAGAAADAAkABgAAAAAEAAAAAAAAAAkAAAAAAAAAAAMAAAAFBg==
Public Key:  FDhrQyerg4UdqHCuc7u1iSKvHpbSu5yjqt2gyK813Vk=
Purpose:     Token recipient, transfer testing
```

**Explorer Link**: https://testnet.suivision.xyz/account/0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01

---

## Deployment Steps

### Step 1: Request Airdrops for All Wallets

Request SUI tokens from the testnet faucet for each wallet to pay for gas fees.

#### For Admin Wallet:
```bash
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "FixedAmountRequest": {
      "recipient": "0x899888ddf619e376d1291f858192eb6b157d5df77746f5057dd6f2b03a09685c"
    }
  }'
```

#### For Alice Wallet:
```bash
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "FixedAmountRequest": {
      "recipient": "0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423"
    }
  }'
```

#### For Bob Wallet:
```bash
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "FixedAmountRequest": {
      "recipient": "0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93"
    }
  }'
```

#### For Charlie Wallet:
```bash
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "FixedAmountRequest": {
      "recipient": "0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01"
    }
  }'
```

**Alternative**: Use the web faucet at https://docs.sui.io/guides/developer/getting-started/get-coins

---

### Step 2: Install Sui CLI (if not already installed)

The Sui CLI is required to publish the smart contract.

```bash
# Install Sui CLI
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui

# Verify installation
sui --version
```

---

### Step 3: Configure Sui CLI with Admin Wallet

Import the admin wallet into Sui CLI for contract deployment:

```bash
# Initialize Sui CLI
sui client

# Import the admin wallet
# You'll be prompted to paste the private key (use the one without ed25519: prefix)
sui keytool import <PRIVATE_KEY> ed25519

# Set the active address
sui client switch --address 0x899888ddf619e376d1291f858192eb6b157d5df77746f5057dd6f2b03a09685c

# Verify balance
sui client balance
```

---

### Step 4: Deploy the Smart Contract

Navigate to the smart contract directory and publish:

```bash
cd smart-contract

# Build the contract first to verify it compiles
sui move build

# Publish to testnet
sui client publish --gas-budget 100000000
```

**Expected Output:**
- Package ID (save this as `CROZZ_PACKAGE_ID`)
- TreasuryCap object ID (save this as `CROZZ_TREASURY_CAP_ID`)
- CoinMetadata object ID (save this as `CROZZ_METADATA_ID`)
- AdminCap object ID (save this as `CROZZ_ADMIN_CAP_ID`)

**Example Output:**
```
----- Transaction Digest ----
<TRANSACTION_DIGEST>

----- Transaction Data ----
Package ID: 0x<PACKAGE_ID>

----- Transaction Effects ----
Created Objects:
  ┌──
  │ ObjectID: 0x<TREASURY_CAP_ID>
  │ Type: 0x2::coin::TreasuryCap<PACKAGE_ID::crozz_token::CROZZ>
  ...
  │ ObjectID: 0x<METADATA_ID>
  │ Type: 0x2::coin::CoinMetadata<PACKAGE_ID::crozz_token::CROZZ>
  ...
  │ ObjectID: 0x<ADMIN_CAP_ID>
  │ Type: PACKAGE_ID::crozz_token::AdminCap
```

---

### Step 5: Update Environment Variables

Update the `.env` file with the deployment information:

```bash
# Root .env file
SUI_ADMIN_PRIVATE_KEY=ed25519:AAAAAAAAAAAAAAEAAAkAAAMAAAADBgAEAAMAAAAAAAAAAAYAAAAAAAcAAAACAwAABQIAAAAACQAAAAAAAAAAAAAABAADCQ==
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_DEFAULT_GAS_BUDGET=10000000
CROZZ_PACKAGE_ID=0x<YOUR_PACKAGE_ID>
CROZZ_TREASURY_CAP_ID=0x<YOUR_TREASURY_CAP_OBJECT>
CROZZ_METADATA_ID=0x<YOUR_METADATA_OBJECT>
CROZZ_ADMIN_CAP_ID=0x<YOUR_ADMIN_CAP_OBJECT>
CROZZ_MODULE=crozz_token
CROZZ_EXECUTOR_DRY_RUN=false
```

---

### Step 6: Verify Token Metadata

Use Sui CLI to verify the token was created with correct parameters:

```bash
# View the metadata object
sui client object <METADATA_ID>

# Check decimals (should be 9)
# Check name (should be "Crozz Coin")
# Check symbol (should be "CROZZ")
# Check icon URL (should be "https://crozz-token.com/icon.png")
```

---

### Step 7: Mint Tokens to Test Wallets

Mint tokens to each test wallet using the backend API or Sui CLI:

#### Using Sui CLI:

**Mint 1,000 CROZZ to Alice:**
```bash
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_token \
  --function mint \
  --args <TREASURY_CAP_ID> 1000000000000 0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423 \
  --gas-budget 10000000
```

**Mint 2,000 CROZZ to Bob:**
```bash
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_token \
  --function mint \
  --args <TREASURY_CAP_ID> 2000000000000 0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93 \
  --gas-budget 10000000
```

**Mint 3,000 CROZZ to Charlie:**
```bash
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_token \
  --function mint \
  --args <TREASURY_CAP_ID> 3000000000000 0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01 \
  --gas-budget 10000000
```

*Note: Amounts are in the smallest unit (9 decimals). 1000000000000 = 1,000 CROZZ*

#### Using Backend API:

Start the backend server:
```bash
cd backend
npm run dev
```

Then use the API to mint tokens:
```bash
# Mint to Alice
curl -X POST http://localhost:4000/api/tokens/mint \
  -H "Content-Type: application/json" \
  -d '{"amount": "1000000000000", "recipient": "0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423"}'

# Mint to Bob
curl -X POST http://localhost:4000/api/tokens/mint \
  -H "Content-Type: application/json" \
  -d '{"amount": "2000000000000", "recipient": "0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93"}'

# Mint to Charlie
curl -X POST http://localhost:4000/api/tokens/mint \
  -H "Content-Type: application/json" \
  -d '{"amount": "3000000000000", "recipient": "0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01"}'
```

---

### Step 8: Execute Token Transfers Between Wallets

Transfer tokens between the test wallets to demonstrate functionality.

#### Transfer 1: Alice → Bob (500 CROZZ)

First, import Alice's wallet and switch to it:
```bash
sui keytool import <ALICE_PRIVATE_KEY> ed25519
sui client switch --address 0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423
```

Get Alice's CROZZ coin objects:
```bash
sui client objects --owned-by 0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423
```

Transfer 500 CROZZ from Alice to Bob:
```bash
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_token \
  --function transfer \
  --args <ALICE_COIN_OBJECT_ID> 0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93 \
  --gas-budget 10000000
```

#### Transfer 2: Bob → Charlie (800 CROZZ)

Switch to Bob's wallet:
```bash
sui keytool import <BOB_PRIVATE_KEY> ed25519
sui client switch --address 0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93
```

Get Bob's CROZZ coin objects:
```bash
sui client objects --owned-by 0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93
```

Transfer 800 CROZZ from Bob to Charlie:
```bash
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_token \
  --function transfer \
  --args <BOB_COIN_OBJECT_ID> 0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01 \
  --gas-budget 10000000
```

#### Transfer 3: Charlie → Alice (1,200 CROZZ)

Switch to Charlie's wallet:
```bash
sui keytool import <CHARLIE_PRIVATE_KEY> ed25519
sui client switch --address 0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01
```

Get Charlie's CROZZ coin objects:
```bash
sui client objects --owned-by 0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01
```

Transfer 1,200 CROZZ from Charlie to Alice:
```bash
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_token \
  --function transfer \
  --args <CHARLIE_COIN_OBJECT_ID> 0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423 \
  --gas-budget 10000000
```

---

### Step 9: Verify Balances and Transactions

#### Check Final Balances:

```bash
# Check Alice's CROZZ balance
# Expected: 1000 - 500 + 1200 = 1700 CROZZ
sui client objects --owned-by 0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423

# Check Bob's CROZZ balance  
# Expected: 2000 + 500 - 800 = 1700 CROZZ
sui client objects --owned-by 0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93

# Check Charlie's CROZZ balance
# Expected: 3000 + 800 - 1200 = 2600 CROZZ
sui client objects --owned-by 0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01
```

#### View Transactions on Explorer:

All transactions can be viewed on Sui testnet explorer:
- **SuiVision**: https://testnet.suivision.xyz/
- **SuiScan**: https://testnet.suiscan.xyz/

Search by:
- Wallet addresses
- Transaction digests
- Package ID
- Object IDs

---

## Results Documentation Template

After completing all steps, document your results:

### Deployment Summary

- **Package ID**: `0x<YOUR_PACKAGE_ID>`
- **Package Explorer**: https://testnet.suivision.xyz/package/0x<YOUR_PACKAGE_ID>
- **TreasuryCap ID**: `0x<YOUR_TREASURY_CAP_ID>`
- **Metadata ID**: `0x<YOUR_METADATA_ID>`
- **AdminCap ID**: `0x<YOUR_ADMIN_CAP_ID>`

### Mint Transactions

| Wallet | Amount | Transaction Digest | Explorer Link |
|--------|--------|-------------------|---------------|
| Alice  | 1,000 CROZZ | `<TX_DIGEST>` | https://testnet.suivision.xyz/txblock/<TX_DIGEST> |
| Bob    | 2,000 CROZZ | `<TX_DIGEST>` | https://testnet.suivision.xyz/txblock/<TX_DIGEST> |
| Charlie | 3,000 CROZZ | `<TX_DIGEST>` | https://testnet.suivision.xyz/txblock/<TX_DIGEST> |

### Transfer Transactions

| From | To | Amount | Transaction Digest | Explorer Link |
|------|-------|--------|-------------------|---------------|
| Alice | Bob | 500 CROZZ | `<TX_DIGEST>` | https://testnet.suivision.xyz/txblock/<TX_DIGEST> |
| Bob | Charlie | 800 CROZZ | `<TX_DIGEST>` | https://testnet.suivision.xyz/txblock/<TX_DIGEST> |
| Charlie | Alice | 1,200 CROZZ | `<TX_DIGEST>` | https://testnet.suivision.xyz/txblock/<TX_DIGEST> |

### Final Balances

| Wallet | Final Balance | Explorer Link |
|--------|--------------|---------------|
| Alice  | 1,700 CROZZ | https://testnet.suivision.xyz/account/0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423 |
| Bob    | 1,700 CROZZ | https://testnet.suivision.xyz/account/0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93 |
| Charlie | 2,600 CROZZ | https://testnet.suivision.xyz/account/0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01 |

---

## Screenshots Checklist

Capture the following screenshots for documentation:

- [ ] Sui CLI wallet addresses and balances after airdrops
- [ ] Contract deployment output (showing Package ID and object IDs)
- [ ] Token metadata view (decimals, name, symbol, icon)
- [ ] Each mint transaction receipt
- [ ] Each transfer transaction receipt
- [ ] Final balances for all wallets
- [ ] Sui Explorer views for key transactions
- [ ] Total supply and circulation stats

---

## Troubleshooting

### Issue: Faucet request fails
**Solution**: Wait a few minutes and try again. The testnet faucet has rate limits.

### Issue: Insufficient gas
**Solution**: Request more SUI from the faucet or use a higher gas budget.

### Issue: Object not found
**Solution**: Ensure you're using the correct object IDs from the deployment output.

### Issue: Transaction fails
**Solution**: Check that:
- The wallet has sufficient SUI for gas
- The coin objects exist and are owned by the sender
- You're using the correct package and module names

---

## Additional Resources

- **Sui Documentation**: https://docs.sui.io/
- **Sui Move by Example**: https://examples.sui.io/
- **Testnet Faucet**: https://docs.sui.io/guides/developer/getting-started/get-coins
- **Sui Discord**: https://discord.gg/sui
- **Crozz Coin Repository**: https://github.com/sjhallo07/Crozz-Coin-

---

**Generated**: 2025-11-22  
**Network**: Sui Testnet  
**Version**: 1.0.0
