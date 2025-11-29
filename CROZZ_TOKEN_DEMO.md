# 🪙 Crozz Coin Token - Complete Demo & Proof of Implementation

**Token Name:** Crozz Coin  
**Symbol:** CROZZ  
**Blockchain:** Sui  
**Decimals:** 9  
**Creator:** Carlo Hung

---

## 📸 Token Logo

![Crozz Coin Logo](frontend/public/crozz-logo.png)

The CROZZ token logo features a distinctive red geometric cross/plus design with elegant curved lines, representing connectivity and value exchange.

---

## 🔗 Token Information

| Property | Value |
|----------|-------|
| **Token Name** | Crozz Coin |
| **Symbol** | CROZZ |
| **Decimals** | 9 |
| **Blockchain** | Sui |
| **Standard** | Sui Coin Standard |
| **Smart Contract** | `smart-contract/sources/crozz_token.move` |

---

## 📍 Pre-Generated Wallet Addresses (4 Wallets)

The following 4 wallet addresses have been pre-generated for demonstration purposes:

### Wallet 1: Admin Wallet
```
Address: 0x899888ddf619e376d1291f858192eb6b157d5df77746f5057dd6f2b03a09685c
Public Key: Hk54OTCXyZl5M7N2JsUfOlOHwSsGQ3nSYhxO/MvD3SA=
Network: Sui Testnet
Purpose: Admin operations (minting, burning, freeze controls)
```

### Wallet 2: Alice Wallet
```
Address: 0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423
Public Key: xUYqq3KGCl2bIcwVIfAXrj1rmbXPh19K9CI+hjnTZrQ=
Network: Sui Testnet
Purpose: Token holder / distribution recipient
```

### Wallet 3: Bob Wallet
```
Address: 0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93
Public Key: Gok5Zzjfh1DaHyvDk4Ms1dOWtbLHucFWBF5lS8jLw5Y=
Network: Sui Testnet
Purpose: Token holder / transfer testing
```

### Wallet 4: Charlie Wallet
```
Address: 0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01
Public Key: FDhrQyerg4UdqHCuc7u1iSKvHpbSu5yjqt2gyK813Vk=
Network: Sui Testnet
Purpose: Token holder / freeze testing
```

---

## 🌐 Network Configuration

### Testnet (Default)
```
RPC URL: https://fullnode.testnet.sui.io:443
Faucet: https://faucet.testnet.sui.io/gas
Explorer: https://suiscan.xyz/testnet
```

### Mainnet
```
RPC URL: https://fullnode.mainnet.sui.io:443
Explorer: https://suiscan.xyz/mainnet
```

---

## 🖥️ Dashboard Features

### Admin Dashboard Features
- **Mint Tokens**: Create new CROZZ tokens to specified addresses
- **Burn Tokens**: Permanently destroy CROZZ tokens
- **Freeze Wallet**: Block specific wallets from transactions
- **Unfreeze Wallet**: Restore wallet transaction capability
- **Global Freeze**: Emergency halt of ALL token operations
- **Global Unfreeze**: Resume all operations after global freeze
- **Update Metadata**: Modify token name, symbol, description, icon

### User Dashboard Features
- **View Balance**: Check CROZZ token balance
- **Transfer**: Send tokens to other addresses
- **Transaction History**: View past transactions
- **Wallet Connection**: Connect Sui wallets (Suiet, Ethos, etc.)

---

## ❄️ Freeze Wallet Functionality

The CROZZ token includes comprehensive freeze controls:

### Individual Wallet Freeze
```move
public entry fun set_wallet_freeze(
    _admin: &AdminCap,
    registry: &mut AntiBotRegistry,
    target: address,
    freeze: bool,
    _ctx: &mut TxContext
)
```

### Global Freeze (Emergency Halt)
```move
public entry fun set_global_freeze(
    _admin: &AdminCap,
    registry: &mut AntiBotRegistry,
    freeze: bool
)
```

### Anti-Bot Protection
- Verification window system
- Guarded transfers with verification requirement
- Dynamic field storage for per-wallet records

---

## 📊 Smart Contract Functions

### Token Operations
| Function | Description |
|----------|-------------|
| `mint` | Create new tokens to recipient |
| `mint_to_self` | Mint tokens to caller's wallet |
| `burn` | Destroy tokens permanently |
| `transfer` | Transfer tokens to another address |
| `guarded_transfer` | Transfer with anti-bot verification |

### Metadata Management
| Function | Description |
|----------|-------------|
| `update_name` | Change token name |
| `update_symbol` | Change token symbol |
| `update_description` | Change token description |
| `update_icon_url` | Change token logo URL |
| `freeze_metadata` | Permanently lock metadata |

### Admin Controls
| Function | Description |
|----------|-------------|
| `init_registry` | Initialize anti-bot registry |
| `verify_human` | Record human verification |
| `set_wallet_freeze` | Freeze/unfreeze specific wallet |
| `set_global_freeze` | Global emergency freeze |

### View Functions
| Function | Description |
|----------|-------------|
| `get_total_supply` | Get total token supply |
| `get_balance` | Get coin balance |
| `get_decimals` | Get decimal places |
| `get_name` | Get token name |
| `get_symbol` | Get token symbol |
| `get_description` | Get token description |
| `get_icon_url` | Get logo URL |

---

## 🔧 Backend API Endpoints

### Token Endpoints
- `GET /api/tokens/summary` - Token metadata and supply info
- `POST /api/tokens/mint` - Mint new tokens
- `POST /api/tokens/burn` - Burn tokens
- `POST /api/tokens/transfer` - Transfer tokens

### Admin Endpoints (Protected)
- `GET /api/admin/jobs` - View job queue
- `GET /api/admin/wallets` - List managed wallets
- `POST /api/admin/wallets/create` - Create new wallets
- `POST /api/admin/wallets/freeze` - Freeze/unfreeze wallet

### Health Endpoints
- `GET /health` - Backend health check
- `GET /ready` - Readiness probe

---

## 🚀 Quick Start Commands

### Install Dependencies
```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### Start Services
```bash
# Start backend (port 4000)
cd backend && npm run dev

# Start frontend (port 5173)
cd frontend && npm run dev
```

### Fund Testnet Wallets
```bash
# Fund Admin wallet
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{ "FixedAmountRequest": { "recipient": "0x899888ddf619e376d1291f858192eb6b157d5df77746f5057dd6f2b03a09685c" } }'
```

---

## 📁 Project Structure

```
Crozz-Coin-/
├── smart-contract/           # Move smart contract
│   ├── sources/
│   │   └── crozz_token.move  # Main token contract
│   └── Move.toml             # Package configuration
├── backend/                   # Express.js API server
│   └── src/
│       ├── server.js         # Main server
│       ├── routes/           # API routes
│       └── services/         # Business logic
├── frontend/                  # React dashboard
│   └── src/
│       ├── components/       # UI components
│       │   └── Dashboard/    # Dashboard cards
│       └── providers/        # Context providers
├── deployment/               # Pre-generated wallets
│   ├── wallet-admin.txt
│   ├── wallet-alice.txt
│   ├── wallet-bob.txt
│   └── wallet-charlie.txt
└── scripts/                  # Automation scripts
```

---

## ✅ Implementation Checklist

- [x] Smart contract with CROZZ token
- [x] Token name: "Crozz Coin"
- [x] Token symbol: "CROZZ"
- [x] Token logo: Red geometric cross design
- [x] 4 pre-generated wallet addresses
- [x] Mint functionality
- [x] Burn functionality
- [x] Transfer functionality
- [x] Individual wallet freeze
- [x] Global freeze (all wallets)
- [x] Anti-bot protection
- [x] Backend API with database
- [x] Frontend dashboard
- [x] Testnet configuration
- [x] Mainnet configuration
- [x] Network indicators
- [x] Admin/User role switching
- [x] WebSocket live updates
- [x] Job queue system

---

## 🔐 Security Features

1. **AdminCap Required**: Privileged operations require AdminCap ownership
2. **TreasuryCap Control**: Minting requires TreasuryCap
3. **Anti-Bot Registry**: Verification window for transfers
4. **Global Freeze**: Emergency halt capability
5. **Individual Freeze**: Per-wallet blocking
6. **Metadata Freeze**: Permanent metadata lock option

---

## 📖 Related Documentation

- [README.md](README.md) - Main project documentation
- [TESTNET_DEPLOYMENT_NOTICE.md](TESTNET_DEPLOYMENT_NOTICE.md) - Security notice
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Implementation details
- [MAINNET_READINESS_GUIDE.md](MAINNET_READINESS_GUIDE.md) - Mainnet preparation
- [deployment/README.md](deployment/README.md) - Deployment guide

---

**Created:** 2025-11-29  
**Version:** 1.0  
**Network:** Sui Blockchain (Testnet/Mainnet)
