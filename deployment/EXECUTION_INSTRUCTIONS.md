# Crozz Coin - Execution Instructions

> **Quick Start**: This document provides simple, copy-paste instructions to complete the deployment.

> ⚠️ **CRITICAL SECURITY WARNING**: 
> This document contains TESTNET-ONLY private keys for demonstration.
> - **NEVER use these keys on mainnet or in production**
> - **NEVER share these keys outside of testnet testing**
> - **ALWAYS generate fresh keys for production**
> - These are TEST credentials with NO REAL VALUE

## 🎯 Current Status

✅ **COMPLETED:**
- Wallet generation (4 wallets)
- Smart contract configuration
- Documentation creation
- Automation scripts

⏳ **PENDING:**
- Airdrop requests
- Contract deployment
- Token minting
- Transfer execution
- Results documentation

---

## 📋 Step-by-Step Execution

### Step 1: Request Airdrops (5 minutes)

Copy and paste these commands one at a time in your terminal:

```bash
# Navigate to deployment directory
cd deployment

# Request airdrop for Admin wallet
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{"FixedAmountRequest":{"recipient":"0x899888ddf619e376d1291f858192eb6b157d5df77746f5057dd6f2b03a09685c"}}'

# Wait 5 seconds
sleep 5

# Request airdrop for Alice wallet
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{"FixedAmountRequest":{"recipient":"0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423"}}'

# Wait 5 seconds
sleep 5

# Request airdrop for Bob wallet
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{"FixedAmountRequest":{"recipient":"0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93"}}'

# Wait 5 seconds
sleep 5

# Request airdrop for Charlie wallet
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{"FixedAmountRequest":{"recipient":"0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01"}}'

# Wait for blockchain confirmations
echo "Waiting 15 seconds for blockchain confirmations..."
sleep 15

echo "✅ Airdrops requested for all wallets!"
```

**Alternative**: Run the automated script:
```bash
./execute-deployment.sh
```

---

### Step 2: Deploy Smart Contract (2 minutes)

```bash
# Navigate to smart contract directory
cd ../smart-contract

# Build the contract (verify it compiles)
sui move build

# If you need to configure Sui CLI first:
sui client

# Publish the contract to testnet
sui client publish --gas-budget 100000000

# ⚠️ IMPORTANT: Save the output!
# You will need:
# - Package ID
# - TreasuryCap object ID
# - CoinMetadata object ID
# - AdminCap object ID
```

**After deployment, fill in these values:**
```
PACKAGE_ID=0x________________
TREASURY_CAP_ID=0x________________
METADATA_ID=0x________________
ADMIN_CAP_ID=0x________________
```

**Update .env file:**
```bash
cd ..
echo "CROZZ_PACKAGE_ID=$PACKAGE_ID" >> .env
echo "CROZZ_TREASURY_CAP_ID=$TREASURY_CAP_ID" >> .env
echo "CROZZ_METADATA_ID=$METADATA_ID" >> .env
echo "CROZZ_ADMIN_CAP_ID=$ADMIN_CAP_ID" >> .env
```

---

### Step 3: Mint Tokens (5 minutes)

Replace `<PACKAGE_ID>` and `<TREASURY_CAP_ID>` with your actual IDs:

```bash
# Mint 1,000 CROZZ to Alice
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_token \
  --function mint \
  --args <TREASURY_CAP_ID> 1000000000000 0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423 \
  --gas-budget 10000000

# Save the transaction digest: _______________

# Mint 2,000 CROZZ to Bob
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_token \
  --function mint \
  --args <TREASURY_CAP_ID> 2000000000000 0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93 \
  --gas-budget 10000000

# Save the transaction digest: _______________

# Mint 3,000 CROZZ to Charlie
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_token \
  --function mint \
  --args <TREASURY_CAP_ID> 3000000000000 0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01 \
  --gas-budget 10000000

# Save the transaction digest: _______________
```

**Verify mints:**
```bash
# Check Alice's coins
sui client objects --owned-by 0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423

# Check Bob's coins
sui client objects --owned-by 0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93

# Check Charlie's coins
sui client objects --owned-by 0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01
```

---

### Step 4: Execute Transfers (10 minutes)

#### Transfer 1: Alice → Bob (500 CROZZ)

```bash
# ⚠️ WARNING: This private key is TESTNET ONLY. NEVER hardcode keys in production!
# In production, use: sui keytool import ${PRIVATE_KEY_FROM_ENV} ed25519
# Import Alice's wallet (paste the private key without ed25519: prefix)
sui keytool import AAAAAAAAAAAAAAEAAAQAAAUAAAAFAAAAAAAIBAAAAAYAAAAAAAQAAAAACQkDAgAAAAAAAAAAAAAAAAAAAAICBQAABwAHAA== ed25519

# Switch to Alice
sui client switch --address 0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423

# List Alice's coin objects
sui client objects --owned-by 0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423

# Find the CROZZ coin object ID, then transfer 500 CROZZ
# Replace <ALICE_COIN_ID> with the actual coin object ID
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_token \
  --function transfer \
  --args <ALICE_COIN_ID> 0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93 \
  --gas-budget 10000000

# Save the transaction digest: _______________
```

#### Transfer 2: Bob → Charlie (800 CROZZ)

```bash
# ⚠️ WARNING: TESTNET KEY ONLY. Production: Use secure key management!
# Import Bob's wallet
sui keytool import AAAAAAAAAAAAAAEAAAAAAAQABwAAAAAIAAADAAkACQAEAAkAAAAAAAAAAAAEAAUAAAAAAAAFAAAAAAAAAAAABgAAAAkEAA== ed25519

# Switch to Bob
sui client switch --address 0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93

# List Bob's coin objects
sui client objects --owned-by 0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93

# Transfer 800 CROZZ from Bob to Charlie
# Replace <BOB_COIN_ID> with the actual coin object ID
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_token \
  --function transfer \
  --args <BOB_COIN_ID> 0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01 \
  --gas-budget 10000000

# Save the transaction digest: _______________
```

#### Transfer 3: Charlie → Alice (1,200 CROZZ)

```bash
# ⚠️ WARNING: TESTNET KEY ONLY. Production: Never expose private keys!
# Import Charlie's wallet
sui keytool import AAAAAAAAAAAAAAEAAAAFAAAAAAYAAgAFAAcAAAAAAgUEAAAGAAADAAkABgAAAAAEAAAAAAAAAAkAAAAAAAAAAAMAAAAFBg== ed25519

# Switch to Charlie
sui client switch --address 0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01

# List Charlie's coin objects
sui client objects --owned-by 0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01

# Transfer 1,200 CROZZ from Charlie to Alice
# Replace <CHARLIE_COIN_ID> with the actual coin object ID
sui client call \
  --package <PACKAGE_ID> \
  --module crozz_token \
  --function transfer \
  --args <CHARLIE_COIN_ID> 0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423 \
  --gas-budget 10000000

# Save the transaction digest: _______________
```

---

### Step 5: Verify Final Balances (2 minutes)

```bash
# Check Alice's final balance (should have 1,700 CROZZ)
sui client objects --owned-by 0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423

# Check Bob's final balance (should have 1,700 CROZZ)
sui client objects --owned-by 0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93

# Check Charlie's final balance (should have 2,600 CROZZ)
sui client objects --owned-by 0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01
```

**Expected Results:**
- Alice: 1,700 CROZZ (1000 - 500 + 1200)
- Bob: 1,700 CROZZ (2000 + 500 - 800)
- Charlie: 2,600 CROZZ (3000 + 800 - 1200)
- Total: 6,000 CROZZ

---

### Step 6: Document Results (5 minutes)

Visit the following URLs and capture screenshots:

#### Wallet Explorer Links
```
Admin:   https://testnet.suivision.xyz/account/0x899888ddf619e376d1291f858192eb6b157d5df77746f5057dd6f2b03a09685c
Alice:   https://testnet.suivision.xyz/account/0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423
Bob:     https://testnet.suivision.xyz/account/0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93
Charlie: https://testnet.suivision.xyz/account/0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01
```

#### Package Explorer Link
```
https://testnet.suivision.xyz/package/<YOUR_PACKAGE_ID>
```

#### Transaction Links
For each transaction digest you saved:
```
https://testnet.suivision.xyz/txblock/<TRANSACTION_DIGEST>
```

**Screenshots to capture:**
1. ✅ Deployment transaction on explorer
2. ✅ Mint transaction for Alice
3. ✅ Mint transaction for Bob
4. ✅ Mint transaction for Charlie
5. ✅ Transfer 1: Alice → Bob
6. ✅ Transfer 2: Bob → Charlie
7. ✅ Transfer 3: Charlie → Alice
8. ✅ Final balance for Alice
9. ✅ Final balance for Bob
10. ✅ Final balance for Charlie

---

## 📝 Results Template

Create a file `deployment/FINAL_RESULTS.md` with this content:

```markdown
# Crozz Coin - Deployment Results

## Deployment Information
- **Date**: YYYY-MM-DD
- **Network**: Sui Testnet
- **Package ID**: `0x________________`
- **Package URL**: https://testnet.suivision.xyz/package/________________

## Deployment Objects
- **TreasuryCap ID**: `0x________________`
- **Metadata ID**: `0x________________`
- **AdminCap ID**: `0x________________`

## Minting Transactions
| Wallet | Amount | Transaction Digest | Explorer URL |
|--------|--------|-------------------|--------------|
| Alice  | 1,000 CROZZ | `_______________` | https://testnet.suivision.xyz/txblock/_______________ |
| Bob    | 2,000 CROZZ | `_______________` | https://testnet.suivision.xyz/txblock/_______________ |
| Charlie | 3,000 CROZZ | `_______________` | https://testnet.suivision.xyz/txblock/_______________ |

## Transfer Transactions
| From | To | Amount | Transaction Digest | Explorer URL |
|------|-----|--------|-------------------|--------------|
| Alice | Bob | 500 CROZZ | `_______________` | https://testnet.suivision.xyz/txblock/_______________ |
| Bob | Charlie | 800 CROZZ | `_______________` | https://testnet.suivision.xyz/txblock/_______________ |
| Charlie | Alice | 1,200 CROZZ | `_______________` | https://testnet.suivision.xyz/txblock/_______________ |

## Final Balances
| Wallet | Balance | Explorer URL |
|--------|---------|--------------|
| Alice  | 1,700 CROZZ | https://testnet.suivision.xyz/account/0xf7507e... |
| Bob    | 1,700 CROZZ | https://testnet.suivision.xyz/account/0x3c71b1... |
| Charlie | 2,600 CROZZ | https://testnet.suivision.xyz/account/0x54be36... |

## Verification
- [x] Total supply matches (6,000 CROZZ)
- [x] All transfers successful
- [x] Final balances correct
- [x] All transactions confirmed on-chain
```

---

## 🎯 Success Criteria

You'll know the deployment is successful when:

1. ✅ All 4 wallets have SUI for gas
2. ✅ Smart contract is deployed and visible on explorer
3. ✅ Token metadata shows:
   - Name: "Crozz Coin"
   - Symbol: "CROZZ"
   - Decimals: 9
4. ✅ All mint transactions confirmed
5. ✅ All transfer transactions confirmed
6. ✅ Final balances match expected amounts
7. ✅ All transactions visible on Sui testnet explorer

---

## 🆘 Troubleshooting

**Issue: Faucet request fails**
- Wait 5 minutes and try again
- Use web faucet: https://docs.sui.io/guides/developer/getting-started/get-coins

**Issue: Insufficient gas**
- Request more SUI from faucet
- Increase gas budget in commands

**Issue: Object not found**
- Verify you're using the correct Package ID
- Check that coin objects exist for the wallet
- Use `sui client objects` to list owned objects

**Issue: Transaction fails**
- Check wallet has sufficient SUI for gas
- Verify object IDs are correct
- Ensure you're on the right network (testnet)

---

## 📞 Support Resources

- **Sui Docs**: https://docs.sui.io/
- **Discord**: https://discord.gg/sui
- **Explorer**: https://testnet.suivision.xyz/
- **Faucet**: https://docs.sui.io/guides/developer/getting-started/get-coins

---

**Estimated Total Time**: 30-40 minutes

**Good luck! 🚀**
