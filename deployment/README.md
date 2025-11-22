# Crozz Coin - Deployment Package

This directory contains all resources needed to deploy and test Crozz Coin on Sui testnet.

## 📁 Contents

- **DEPLOYMENT_GUIDE.md** - Complete step-by-step deployment instructions
- **QUICK_REFERENCE.md** - Quick reference card with commands and addresses
- **crozz-deployment.md** - Deployment tracking document
- **wallet-*.txt** - Generated wallet information files
- **deploy-and-test.js** - Automated deployment script (backend/scripts/)

## 🚀 Quick Start

### Option 1: Follow the Complete Guide
Read `DEPLOYMENT_GUIDE.md` for detailed step-by-step instructions covering:
- Wallet generation ✅ (Already completed)
- Airdrop requests
- Contract deployment
- Token minting
- Transfer testing
- Result documentation

### Option 2: Use the Quick Reference
If you're already familiar with Sui, use `QUICK_REFERENCE.md` for:
- Command snippets
- Wallet addresses
- Explorer links
- Amount conversions

## ✅ What's Already Done

### 1. Wallet Generation
Four wallets have been generated and saved:

| Wallet | File | Address |
|--------|------|---------|
| Admin | `wallet-admin.txt` | `0x899888...09685c` |
| Alice | `wallet-alice.txt` | `0xf7507e...c9e423` |
| Bob | `wallet-bob.txt` | `0x3c71b1...062d93` |
| Charlie | `wallet-charlie.txt` | `0x54be36...aded01` |

### 2. Smart Contract Configuration
The smart contract (`../smart-contract/sources/crozz_token.move`) is configured with:
- ✅ Token Name: "Crozz Coin"
- ✅ Token Symbol: "CROZZ"
- ✅ Decimals: 9
- ✅ Icon URL: "https://crozz-token.com/icon.png"

### 3. Documentation
- ✅ Complete deployment guide
- ✅ Quick reference card
- ✅ Wallet information
- ✅ Test scenario defined

## 📋 Next Steps

### Step 1: Request Airdrops
Use the curl commands in `QUICK_REFERENCE.md` or `DEPLOYMENT_GUIDE.md` to request SUI tokens from the testnet faucet for all 4 wallets.

### Step 2: Deploy Contract
```bash
cd ../smart-contract
sui client publish --gas-budget 100000000
```

### Step 3: Save Deployment IDs
After deployment, save these IDs:
- Package ID
- TreasuryCap ID
- Metadata ID
- AdminCap ID

Update them in:
- `.env` file (root)
- `QUICK_REFERENCE.md` (for tracking)

### Step 4: Mint Tokens
Mint tokens to the three test wallets:
- Alice: 1,000 CROZZ
- Bob: 2,000 CROZZ
- Charlie: 3,000 CROZZ

### Step 5: Execute Transfers
Perform the planned transfers:
1. Alice → Bob: 500 CROZZ
2. Bob → Charlie: 800 CROZZ
3. Charlie → Alice: 1,200 CROZZ

### Step 6: Document Results
Capture:
- Transaction digests
- Explorer URLs
- Final balances
- Screenshots

Fill in the results section in `DEPLOYMENT_GUIDE.md`.

## 🎯 Test Scenario

### Initial Distribution
After minting:
```
Alice:   1,000 CROZZ
Bob:     2,000 CROZZ
Charlie: 3,000 CROZZ
Total:   6,000 CROZZ
```

### After Transfers
Expected final balances:
```
Alice:   1,700 CROZZ (1000 - 500 + 1200)
Bob:     1,700 CROZZ (2000 + 500 - 800)
Charlie: 2,600 CROZZ (3000 + 800 - 1200)
Total:   6,000 CROZZ (unchanged)
```

## 🔍 Verification Checklist

Use this checklist to verify your deployment:

- [ ] All 4 wallets have SUI for gas fees
- [ ] Smart contract deployed successfully
- [ ] Package ID recorded
- [ ] TreasuryCap ID recorded
- [ ] Metadata ID recorded
- [ ] AdminCap ID recorded
- [ ] Token metadata verified (name, symbol, decimals, icon)
- [ ] Tokens minted to Alice (1,000 CROZZ)
- [ ] Tokens minted to Bob (2,000 CROZZ)
- [ ] Tokens minted to Charlie (3,000 CROZZ)
- [ ] Transfer Alice → Bob completed
- [ ] Transfer Bob → Charlie completed
- [ ] Transfer Charlie → Alice completed
- [ ] Final balances verified
- [ ] All transactions documented with explorer URLs
- [ ] Screenshots captured

## 🌐 Explorer Links

### Wallet Explorers
- **Admin**: https://testnet.suivision.xyz/account/0x899888ddf619e376d1291f858192eb6b157d5df77746f5057dd6f2b03a09685c
- **Alice**: https://testnet.suivision.xyz/account/0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423
- **Bob**: https://testnet.suivision.xyz/account/0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93
- **Charlie**: https://testnet.suivision.xyz/account/0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01

### After Deployment
Once deployed, add your package explorer link here:
- **Package**: https://testnet.suivision.xyz/package/0xYOUR_PACKAGE_ID

## 📞 Support

- **Sui Documentation**: https://docs.sui.io/
- **Testnet Faucet**: https://docs.sui.io/guides/developer/getting-started/get-coins
- **Sui Discord**: https://discord.gg/sui
- **Repository Issues**: https://github.com/sjhallo07/Crozz-Coin-/issues

## 📝 Notes

- All private keys are stored in the individual wallet files
- Keep private keys secure and never share them
- These are testnet wallets - do not use for mainnet
- The testnet faucet has rate limits - wait between requests if needed
- All amounts use 9 decimals (1 CROZZ = 1,000,000,000 in raw units)

---

**Generated**: 2025-11-22  
**Network**: Sui Testnet  
**Status**: Ready for deployment
