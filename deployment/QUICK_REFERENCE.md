# Crozz Coin - Quick Reference Card

## 🎯 Quick Setup Commands

```bash
# 1. Request airdrops for all wallets
curl -X POST 'https://faucet.testnet.sui.io/gas' \
  -H 'Content-Type: application/json' \
  -d '{"FixedAmountRequest":{"recipient":"0x899888ddf619e376d1291f858192eb6b157d5df77746f5057dd6f2b03a09685c"}}'

curl -X POST 'https://faucet.testnet.sui.io/gas' \
  -H 'Content-Type: application/json' \
  -d '{"FixedAmountRequest":{"recipient":"0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423"}}'

curl -X POST 'https://faucet.testnet.sui.io/gas' \
  -H 'Content-Type: application/json' \
  -d '{"FixedAmountRequest":{"recipient":"0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93"}}'

curl -X POST 'https://faucet.testnet.sui.io/gas' \
  -H 'Content-Type: application/json' \
  -d '{"FixedAmountRequest":{"recipient":"0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01"}}'

# 2. Deploy contract
cd smart-contract
sui move build
sui client publish --gas-budget 100000000

# 3. Update .env with deployment IDs

# 4. Mint tokens (replace <PACKAGE_ID> and <TREASURY_CAP_ID>)
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_token \
  --function mint \
  --args <TREASURY_CAP_ID> 1000000000000 0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423 \
  --gas-budget 10000000
```

## 📋 Wallet Addresses

| Wallet | Address |
|--------|---------|
| **Admin** | `0x899888ddf619e376d1291f858192eb6b157d5df77746f5057dd6f2b03a09685c` |
| **Alice** | `0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423` |
| **Bob** | `0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93` |
| **Charlie** | `0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01` |

## 🔗 Explorer Links

- **Admin**: https://testnet.suivision.xyz/account/0x899888ddf619e376d1291f858192eb6b157d5df77746f5057dd6f2b03a09685c
- **Alice**: https://testnet.suivision.xyz/account/0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423
- **Bob**: https://testnet.suivision.xyz/account/0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93
- **Charlie**: https://testnet.suivision.xyz/account/0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01

## 🪙 Token Information

- **Name**: Crozz Coin
- **Symbol**: CROZZ
- **Decimals**: 9
- **Logo**: https://crozz-token.com/icon.png
- **Network**: Sui Testnet

## 🔢 Amount Conversion

| Human Readable | Raw Amount (9 decimals) |
|---------------|------------------------|
| 1 CROZZ | 1000000000 |
| 10 CROZZ | 10000000000 |
| 100 CROZZ | 100000000000 |
| 1,000 CROZZ | 1000000000000 |
| 10,000 CROZZ | 10000000000000 |

## 🎬 Test Scenario

### Mint Distribution
- Alice: 1,000 CROZZ
- Bob: 2,000 CROZZ  
- Charlie: 3,000 CROZZ

### Transfers
1. Alice → Bob: 500 CROZZ
2. Bob → Charlie: 800 CROZZ
3. Charlie → Alice: 1,200 CROZZ

### Expected Final Balances
- Alice: 1,700 CROZZ (1000 - 500 + 1200)
- Bob: 1,700 CROZZ (2000 + 500 - 800)
- Charlie: 2,600 CROZZ (3000 + 800 - 1200)

## 📦 Important IDs (Fill after deployment)

```
CROZZ_PACKAGE_ID=0x________
CROZZ_TREASURY_CAP_ID=0x________
CROZZ_METADATA_ID=0x________
CROZZ_ADMIN_CAP_ID=0x________
```

## 🛠️ Common Commands

```bash
# Check balance
sui client balance <ADDRESS>

# View objects owned by address
sui client objects --owned-by <ADDRESS>

# View object details
sui client object <OBJECT_ID>

# Switch active address
sui client switch --address <ADDRESS>

# Import wallet
sui keytool import <PRIVATE_KEY> ed25519
```

## 🌐 Useful Links

- **Testnet Faucet**: https://faucet.testnet.sui.io/
- **SuiVision Explorer**: https://testnet.suivision.xyz/
- **SuiScan Explorer**: https://testnet.suiscan.xyz/
- **Sui Docs**: https://docs.sui.io/
- **Repository**: https://github.com/sjhallo07/Crozz-Coin-
