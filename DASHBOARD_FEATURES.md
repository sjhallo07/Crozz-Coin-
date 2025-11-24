# Dashboard Features Documentation

This document describes the comprehensive dashboard features for the CROZZ token, including user actions and admin operations.

## Overview

The CROZZ dashboard provides two types of interfaces:

1. **User Actions** - Available to any connected wallet
2. **Admin Actions** - Require AdminCap or TreasuryCap ownership

## User Actions

The User Actions panel provides the following functionality:

### View Balance

Check the balance of a specific CROZZ coin object.

- **Input**: Coin object ID
- **Output**: Balance in base units
- **Smart Contract Function**: `get_balance`

### Verify as Human

Submit verification from an off-chain oracle to register as a verified user.

- **Inputs**:
  - Signature (hex or base64)
  - Public key
  - Message
- **Smart Contract Function**: `verify_human`
- **Requirements**: Valid signature from authorized oracle

### Interact

Primary gating call for arbitrary interactions. Must be called within the verification window.

- **Smart Contract Function**: `interact`
- **Requirements**: Recent verification (within 5 minutes)

### Transfer Tokens

#### Standard Transfer

Transfer CROZZ tokens without anti-bot checks.

- **Inputs**:
  - Coin object ID
  - Recipient address
- **Smart Contract Function**: `transfer`

#### Guarded Transfer

Transfer CROZZ tokens with anti-bot protection.

- **Inputs**:
  - Coin object ID
  - Recipient address
- **Smart Contract Function**: `guarded_transfer`
- **Requirements**: Verified session and recent interaction

## Admin Actions

Admin Actions are wallet-based operations that require holding the AdminCap or TreasuryCap objects. These are organized into three categories:

### Minting & Burning

#### Mint Tokens

Create new CROZZ tokens to a specific address.

- **Inputs**:
  - Amount (in base units)
  - Recipient address (optional, defaults to your wallet)
- **Smart Contract Function**: `mint`
- **Requirements**: TreasuryCap ownership

#### Mint to Self

Create new CROZZ tokens directly to your connected wallet.

- **Input**: Amount (in base units)
- **Smart Contract Function**: `mint_to_self`
- **Requirements**: TreasuryCap ownership

#### Burn Tokens

Permanently destroy CROZZ tokens.

- **Input**: Coin object ID
- **Smart Contract Function**: `burn`
- **Requirements**: TreasuryCap ownership

### Freeze Controls

#### Freeze Wallet

Prevent a specific wallet from interacting with the registry.

- **Input**: Target address
- **Smart Contract Function**: `set_wallet_freeze` (with freeze=true)
- **Requirements**: AdminCap ownership

#### Unfreeze Wallet

Restore a previously frozen wallet's ability to interact.

- **Input**: Target address
- **Smart Contract Function**: `set_wallet_freeze` (with freeze=false)
- **Requirements**: AdminCap ownership

#### Global Freeze

Emergency halt of all token operations system-wide.

- **Smart Contract Function**: `set_global_freeze` (with freeze=true)
- **Requirements**: AdminCap ownership
- **Note**: Use with caution - affects all users

#### Global Unfreeze

Resume all token operations after a global freeze.

- **Smart Contract Function**: `set_global_freeze` (with freeze=false)
- **Requirements**: AdminCap ownership

### Metadata Updates

#### Update Name

Change the token name in metadata.

- **Input**: New name
- **Smart Contract Function**: `update_name`
- **Requirements**: AdminCap and TreasuryCap ownership

#### Update Symbol

Change the token symbol in metadata.

- **Input**: New symbol (ASCII string only)
- **Smart Contract Function**: `update_symbol`
- **Requirements**: AdminCap and TreasuryCap ownership

#### Update Description

Change the token description in metadata.

- **Input**: New description
- **Smart Contract Function**: `update_description`
- **Requirements**: AdminCap and TreasuryCap ownership

#### Update Icon URL

Change the token icon URL in metadata.

- **Input**: New icon URL
- **Smart Contract Function**: `update_icon_url`
- **Requirements**: AdminCap and TreasuryCap ownership

#### Freeze Metadata

Permanently freeze metadata (irreversible operation).

- **Smart Contract Function**: `freeze_metadata`
- **Requirements**: AdminCap ownership
- **Warning**: This action is permanent and cannot be undone!

## Environment Configuration

To use the admin features, configure the following environment variables in your `frontend/.env` file:

```env
# Required for all admin actions
VITE_CROZZ_PACKAGE_ID=0xYOUR_PACKAGE_ID
VITE_CROZZ_MODULE=crozz_token
VITE_CROZZ_GAS_BUDGET=10000000

# Required for minting/burning operations
VITE_CROZZ_TREASURY_CAP_ID=0xYOUR_TREASURY_CAP_OBJECT

# Required for admin operations (freeze, metadata updates)
VITE_CROZZ_ADMIN_CAP_ID=0xYOUR_ADMIN_CAP_OBJECT
VITE_CROZZ_METADATA_ID=0xYOUR_METADATA_OBJECT_ID

# Required for anti-bot operations
VITE_CROZZ_REGISTRY_ID=0xYOUR_REGISTRY_SHARED_OBJECT
VITE_SUI_CLOCK_OBJECT=0x6
```

## Architecture

### Hook System

All smart contract interactions are managed through the `useCrozzActions` hook located at `frontend/src/hooks/useCrozzActions.ts`. This hook provides:

- Wallet connection management
- Transaction building and signing
- Gas budget configuration
- Error handling
- Type-safe function signatures

### Component Structure

- **UserActions**: `frontend/src/components/Dashboard/UserActions.tsx`
  - Handles user-level operations
  - Always visible to connected wallets
- **AdminActions**: `frontend/src/components/Dashboard/AdminActions.tsx`
  - Handles admin-level operations
  - Requires wallet connection
  - Shows message when wallet not connected
  - Organized into logical sections with modal dialogs

### Transaction Flow

1. User initiates action from UI
2. Form validation in component
3. Hook constructs transaction via Sui TypeScript SDK
4. Transaction sent to connected wallet for signing
5. Signed transaction submitted to blockchain
6. Success/error feedback via toast notifications

## Backend Operations

In addition to wallet-based admin actions, the dashboard also includes backend-powered operations through the "Admin token controls" panel:

- **Mint tokens**: Server-side minting via authenticated API
- **Burn coins**: Server-side burning via authenticated API
- **Distribute**: Bulk distribution of tokens to multiple addresses

These operations use the backend Express API and require the `ADMIN_TOKEN` for authentication.

## Security Considerations

1. **Object Ownership**: Admin actions require ownership of specific on-chain objects (AdminCap, TreasuryCap)
2. **Wallet Security**: All transactions require wallet signature approval
3. **Environment Variables**: Store sensitive IDs securely, never commit to version control
4. **Gas Budget**: Configure appropriate gas budgets to prevent failed transactions
5. **Metadata Freeze**: This is a permanent operation - verify all metadata before freezing
6. **Global Freeze**: Emergency use only - affects all users immediately

## Troubleshooting

### "Set VITE*CROZZ*\*\_ID" Error

- Ensure all required environment variables are configured
- Check that IDs are valid on-chain objects
- Verify you're using the correct network (testnet/mainnet)

### Transaction Failures

- Confirm wallet has sufficient SUI for gas
- Verify you own the required cap objects (AdminCap/TreasuryCap)
- Check that global freeze is not active
- Ensure the registry is properly initialized

### Wallet Connection Issues

- Install and configure a compatible Sui wallet (Sui Wallet, Suiet, etc.)
- Ensure wallet is connected to the correct network
- Try refreshing the page and reconnecting

## Development

To test admin features locally:

1. Deploy the smart contract to testnet
2. Note the package ID and all object IDs from deployment
3. Configure `.env` with all required IDs
4. Connect a wallet that owns the AdminCap and TreasuryCap
5. Test each operation individually

## Support

For issues or questions:

- Check the main README for setup instructions
- Review smart contract source at `smart-contract/sources/crozz_token.move`
- See integration examples in `EXAMPLE_USAGE.md`
