# Wallet Operations Demo - Visual Guide

This guide shows you what to expect when running the wallet operations demo.

## CLI Demo Output

When you run `node scripts/demo-wallet-operations.js`, you'll see:

### 1. Welcome Banner
```
╔═══════════════════════════════════════════════════════════════════╗
║         Crozz Coin - Wallet Operations Demo                       ║
╚═══════════════════════════════════════════════════════════════════╝

ℹ️  Network: testnet
ℹ️  Mint Amount: 1.00 CROZZ per wallet
```

### 2. Step 1: Sui Client Initialization
```
══════════════════════════════════════════════════════════════════════
Step 1: Initialize Sui Client
══════════════════════════════════════════════════════════════════════

✅ Sui client initialized successfully
ℹ️  Network: testnet
ℹ️  RPC URL: https://fullnode.testnet.sui.io:443
ℹ️  Chain ID: testnet
```

### 3. Step 2: Admin Keypair Setup
```
══════════════════════════════════════════════════════════════════════
Step 2: Setup Admin Keypair
══════════════════════════════════════════════════════════════════════

✅ Admin keypair loaded
ℹ️  Admin address: 0x1234567890abcdef...
ℹ️  Admin SUI balance: 1.0234 SUI
```

### 4. Step 3: Generate Wallets
```
══════════════════════════════════════════════════════════════════════
Step 3: Generate 3 New Wallets
══════════════════════════════════════════════════════════════════════

✅ Wallet 1 created
ℹ️    Address: 0xabc123def456...
ℹ️    Public Key: AbCdEf123456789...

✅ Wallet 2 created
ℹ️    Address: 0xghi789jkl012...
ℹ️    Public Key: GhIjKl789012345...

✅ Wallet 3 created
ℹ️    Address: 0xmno345pqr678...
ℹ️    Public Key: MnOpQr345678901...

✅ Successfully generated 3 wallets
```

### 5. Step 4: Mint Tokens
```
══════════════════════════════════════════════════════════════════════
Step 4: Mint Tokens to Each Wallet
══════════════════════════════════════════════════════════════════════

ℹ️  Minting 1.00 CROZZ to Wallet 1...
✅ ✓ Minted to Wallet 1
ℹ️    Transaction: AbCdEf123456789...

ℹ️  Minting 1.00 CROZZ to Wallet 2...
✅ ✓ Minted to Wallet 2
ℹ️    Transaction: GhIjKl789012345...

ℹ️  Minting 1.00 CROZZ to Wallet 3...
✅ ✓ Minted to Wallet 3
ℹ️    Transaction: MnOpQr345678901...

✅ Successfully minted tokens to all 3 wallets
```

### 6. Step 5: Make Transfers
```
══════════════════════════════════════════════════════════════════════
Step 5: Make Transfers Between Wallets
══════════════════════════════════════════════════════════════════════

ℹ️  Fetching coin objects for wallets...
ℹ️  Transferring 0.10 CROZZ from Wallet 1 to Wallet 2...
✅ ✓ Transfer completed
ℹ️    Transaction: StUvWx012345678...

ℹ️  Transferring 0.10 CROZZ from Wallet 2 to Wallet 3...
✅ ✓ Transfer completed
ℹ️    Transaction: YzAbCd345678901...

✅ Successfully completed transfers between wallets
```

### 7. Step 6: Freeze Wallets
```
══════════════════════════════════════════════════════════════════════
Step 6: Freeze Wallets
══════════════════════════════════════════════════════════════════════

ℹ️  Freezing Wallet 1 (0xabc123def456...)...
✅ ✓ Wallet 1 frozen successfully
ℹ️    Transaction: EfGhIj678901234...
ℹ️    Events emitted: 2

✅ Successfully froze wallet
```

### 8. Results Summary
```
══════════════════════════════════════════════════════════════════════
Step 7: Results Summary
══════════════════════════════════════════════════════════════════════

📊 Operation Results:

🔑 Wallets Created:
   1. Wallet 1
      Address: 0xabc123def456...
   2. Wallet 2
      Address: 0xghi789jkl012...
   3. Wallet 3
      Address: 0xmno345pqr678...

💰 Mint Operations:
   ✓ 1.00 CROZZ → Wallet 1
      Tx: AbCdEf123456789...
   ✓ 1.00 CROZZ → Wallet 2
      Tx: GhIjKl789012345...
   ✓ 1.00 CROZZ → Wallet 3
      Tx: MnOpQr345678901...

↔️  Transfer Operations:
   ✓ 0.10 CROZZ: Wallet 1 → Wallet 2
      Tx: StUvWx012345678...
   ✓ 0.10 CROZZ: Wallet 2 → Wallet 3
      Tx: YzAbCd345678901...

🔒 Freeze Operations:
   ✓ Wallet 1 FROZEN
      Tx: EfGhIj678901234...

✅ All operations completed!

📺 View on Dashboard:
   1. Start the backend: cd backend && npm run dev
   2. Start the frontend: cd frontend && npm run dev
   3. Open http://localhost:5173 in your browser
   4. Check the Events Feed for transaction updates
   5. View Job Queue for operation status
```

## Dashboard UI

### Wallet Manager Component

When you open the dashboard at `http://localhost:5173`, you'll see:

#### Header Section
```
┌─────────────────────────────────────────────────────────────┐
│ 🔐 Wallet Manager                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Create New Wallets:  [3] [Create 3 Wallets] [🔄 Refresh]  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Wallet Cards (After Creating Wallets)
```
┌─────────────────────────────────────────────────────────────┐
│ Demo Wallet 1                                    🔒 Frozen  │
│                                                             │
│ Address: 0xabc1...def4                                      │
│ Balance: 0 CROZZ                                            │
│ Created: 1/24/2025, 10:30:45 AM                            │
│                                                             │
│                    [💰 Mint]  [🔓 Unfreeze]  [🗑️ Delete]    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Demo Wallet 2                                               │
│                                                             │
│ Address: 0xghi7...jkl0                                      │
│ Balance: 0 CROZZ                                            │
│ Created: 1/24/2025, 10:30:46 AM                            │
│                                                             │
│                    [💰 Mint]  [🔒 Freeze]  [🗑️ Delete]      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Demo Wallet 3                                               │
│                                                             │
│ Address: 0xmno3...pqr6                                      │
│ Balance: 0 CROZZ                                            │
│ Created: 1/24/2025, 10:30:47 AM                            │
│                                                             │
│                    [💰 Mint]  [🔒 Freeze]  [🗑️ Delete]      │
└─────────────────────────────────────────────────────────────┘
```

#### Statistics Section
```
┌─────────────────────────────────────────────────────────────┐
│ Total Wallets: 3                                            │
│ Frozen Wallets: 1                                           │
│ Active Wallets: 2                                           │
└─────────────────────────────────────────────────────────────┘
```

### Events Feed Component

Shows real-time transaction updates:

```
┌─────────────────────────────────────────────────────────────┐
│ 📡 Events Feed                                [🔄 Refresh]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔒 Wallet Frozen                        Just now           │
│    Address: 0xabc1...def4                                   │
│    Transaction: EfGhIj67...                                 │
│                                                             │
│ ↔️  Transfer Completed                  1 minute ago        │
│    From: Wallet 2 → To: Wallet 3                            │
│    Amount: 0.10 CROZZ                                       │
│    Transaction: YzAbCd34...                                 │
│                                                             │
│ 💰 Mint Completed                       2 minutes ago       │
│    Wallet: Wallet 3                                         │
│    Amount: 1.00 CROZZ                                       │
│    Transaction: MnOpQr34...                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Job Queue Component

Shows operation status:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚙️ Job Queue                                  [🔄 Refresh]  │
├─────────────────────────────────────────────────────────────┤
│ Status    Type           Created              Actions       │
├─────────────────────────────────────────────────────────────┤
│ ✅ Done   freeze_wallet  10:35:12 AM         [👁️ View]     │
│ ✅ Done   mint           10:34:45 AM         [👁️ View]     │
│ ✅ Done   mint           10:34:30 AM         [👁️ View]     │
│ ✅ Done   mint           10:34:15 AM         [👁️ View]     │
│ ⏳ Queue  mint           10:36:00 AM         [👁️ View]     │
└─────────────────────────────────────────────────────────────┘
```

When you click [👁️ View], a modal shows:

```
┌─────────────────────────────────────────────────────────────┐
│                    Job Details                          [×] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Job ID: job_1234567890                                      │
│ Type: mint                                                  │
│ Status: completed                                           │
│ Created: 1/24/2025, 10:34:45 AM                            │
│                                                             │
│ Payload:                                                    │
│ {                                                           │
│   "amount": "1000000000",                                   │
│   "recipient": "0xabc123..."                                │
│ }                                                           │
│                                                             │
│ Result:                                                     │
│ {                                                           │
│   "digest": "AbCdEf123...",                                 │
│   "status": "success"                                       │
│ }                                                           │
│                                                             │
│                              [Close]                        │
└─────────────────────────────────────────────────────────────┘
```

## Interactive Workflow

### Scenario: Create and Mint to 3 Wallets

1. **Open Dashboard**
   - Navigate to http://localhost:5173
   - See the Wallet Manager card at the bottom

2. **Create Wallets**
   - Set count to "3"
   - Click "Create 3 Wallets"
   - Wait 1-2 seconds
   - See 3 wallet cards appear

3. **Mint to First Wallet**
   - Click "💰 Mint" on Demo Wallet 1
   - Toast notification: "Mint request queued"
   - Check Job Queue - see new mint job
   - Wait ~3-5 seconds for executor
   - Job status changes to ✅ Done
   - Events Feed shows: "💰 Mint Completed"

4. **Freeze Wallet**
   - Click "🔒 Freeze" on Demo Wallet 1
   - Wallet card updates with "🔒 Frozen" badge
   - Mint button becomes disabled
   - Job Queue shows freeze_wallet job
   - Events Feed shows: "🔒 Wallet Frozen"

5. **Unfreeze Wallet**
   - Click "🔓 Unfreeze" on Demo Wallet 1
   - Frozen badge disappears
   - Mint button becomes enabled
   - Events Feed shows: "🔓 Wallet Unfrozen"

6. **Delete Wallet**
   - Click "🗑️ Delete" on Demo Wallet 3
   - Wallet card disappears
   - Statistics update: Total Wallets: 2

## Browser Console

While the dashboard is open, you can check the browser console (F12) to see:

```
[WalletManager] Fetching wallets...
[WalletManager] Found 3 wallets
[WalletManager] Creating 0 new wallets...
[WalletManager] Wallets created successfully
[WalletManager] Refreshing wallet list...
[WalletManager] Minting to wallet: wallet_1234567890_0
[WalletManager] Mint request queued
[WebSocket] Connected to events stream
[WebSocket] Event received: { type: "mint_completed", ... }
```

## What You Can Test

### CLI Demo
- ✅ Different mint amounts: `--mint-amount 5000000000`
- ✅ Different networks: `--network localnet`
- ✅ View transaction digests
- ✅ Check wallet addresses
- ✅ Verify operations completed

### Dashboard UI
- ✅ Create 1-10 wallets at once
- ✅ Mint tokens to any wallet
- ✅ Freeze/unfreeze wallets
- ✅ Delete wallets
- ✅ View operation history
- ✅ Check job queue status
- ✅ See real-time events

### Backend API
Using curl or Postman:

```bash
# Create wallets
curl -X POST http://localhost:4000/api/admin/wallets/create \
  -H "Authorization: Bearer change-me" \
  -H "Content-Type: application/json" \
  -d '{"count": 3, "prefix": "Test Wallet"}'

# List wallets
curl http://localhost:4000/api/admin/wallets \
  -H "Authorization: Bearer change-me"

# Freeze wallet
curl -X POST http://localhost:4000/api/admin/wallets/freeze \
  -H "Authorization: Bearer change-me" \
  -H "Content-Type: application/json" \
  -d '{"address": "0xabc123...", "freeze": true}'
```

## Expected Results

After completing the demo, you should have:

✅ 3 new wallets created on Sui testnet
✅ CROZZ tokens minted to each wallet
✅ Transfer transactions recorded (if wallets have gas)
✅ At least 1 wallet frozen
✅ All operations visible in dashboard
✅ Transaction digests for blockchain verification
✅ Job queue showing completed operations
✅ Events feed showing real-time updates

## Verification

You can verify everything worked by:

1. **Check Sui Explorer**
   - Go to https://suiexplorer.com/?network=testnet
   - Enter transaction digests from CLI output
   - Verify mint, transfer, freeze operations

2. **Check Wallet Balances**
   - Copy wallet addresses from CLI or dashboard
   - Search on Sui Explorer
   - Verify CROZZ token balances

3. **Check Admin Activity**
   - Search admin address on Sui Explorer
   - See all transactions initiated
   - Verify gas consumption

## Troubleshooting Visual Indicators

### ❌ Red Error Messages
```
┌─────────────────────────────────────────────────────────────┐
│ ❌ Error: Admin token not configured                        │
│ Please set VITE_CROZZ_ADMIN_TOKEN in your environment.     │
└─────────────────────────────────────────────────────────────┘
```
**Solution**: Configure `.env` and `frontend/.env` files

### ⚠️ Yellow Warnings
```
⚠️  Admin balance is low. Consider funding the address.
```
**Solution**: Use testnet faucet to fund admin wallet

### ℹ️ Blue Information
```
ℹ️  No coins found for Wallet 1. Skipping transfer.
```
**Solution**: Normal if wallets don't have SUI for gas

### ✅ Green Success
```
✅ All operations completed!
```
**Result**: Everything worked correctly!

## Summary

This visual guide shows you exactly what to expect when running the wallet operations demo. The implementation provides clear, color-coded output in the CLI and an intuitive dashboard UI for managing wallets interactively.
