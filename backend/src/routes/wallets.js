import { Router } from 'express';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { toB64 } from '@mysten/sui/utils';
import { transactionService } from '../services/TransactionService.js';
import { successResponse, errorResponse } from '../utils/humanize.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// In-memory wallet storage (for demo purposes)
// ⚠️ WARNING: This is NOT production-ready!
// In production:
// - Use encrypted database storage (PostgreSQL with pgcrypto)
// - Encrypt private keys at rest
// - Implement proper key rotation
// - Use hardware wallets for admin keys
// - Add audit logging for all wallet operations
const wallets = new Map();

// Configuration constants
// eslint-disable-next-line no-unused-vars
const MAX_WALLETS_PER_REQUEST = 10;

/**
 * POST /api/admin/wallets/create
 * Create new wallets
 */
router.post('/create', authMiddleware, (req, res) => {
  try {
    const { count = 1, prefix = 'Wallet' } = req.body;
    
    if (count < 1 || count > 10) {
      return res.status(400).json(
        errorResponse('Count must be between 1 and 10', { field: 'count' })
      );
    }
    
    const createdWallets = [];
    
    for (let i = 0; i < count; i++) {
      const keypair = new Ed25519Keypair();
      const address = keypair.getPublicKey().toSuiAddress();
      const publicKey = keypair.getPublicKey().toBase64();
      const privateKeyBytes = keypair.getSecretKey();
      const privateKey = `ed25519:${toB64(privateKeyBytes)}`;
      
      const walletId = `wallet_${Date.now()}_${i}`;
      const wallet = {
        id: walletId,
        name: `${prefix} ${wallets.size + 1}`,
        address,
        publicKey,
        privateKey, // ⚠️ SECURITY: In production, encrypt this with AES-256-GCM or similar!
        createdAt: new Date().toISOString(),
        frozen: false,
        balance: '0',
      };
      
      wallets.set(walletId, wallet);
      
      // Return wallet without private key in response
      // eslint-disable-next-line no-unused-vars
      const { privateKey: _pk, ...walletInfo } = wallet;
      createdWallets.push(walletInfo);
    }
    
    res.status(201).json(
      successResponse(
        `Successfully created ${count} wallet${count > 1 ? 's' : ''}`,
        { wallets: createdWallets }
      )
    );
  } catch (error) {
    res.status(500).json(
      errorResponse('Failed to create wallets', { error: error.message })
    );
  }
});

/**
 * GET /api/admin/wallets
 * List all managed wallets
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const walletList = Array.from(wallets.values()).map(wallet => {
      // eslint-disable-next-line no-unused-vars
      const { privateKey, ...walletInfo } = wallet;
      return walletInfo;
    });
    
    res.json(
      successResponse(
        `Retrieved ${walletList.length} wallet${walletList.length !== 1 ? 's' : ''}`,
        { wallets: walletList, total: walletList.length }
      )
    );
  } catch (error) {
    res.status(500).json(
      errorResponse('Failed to retrieve wallets', { error: error.message })
    );
  }
});

/**
 * GET /api/admin/wallets/:id
 * Get specific wallet details
 */
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const wallet = wallets.get(id);
    
    if (!wallet) {
      return res.status(404).json(
        errorResponse('Wallet not found', { id })
      );
    }
    
    // eslint-disable-next-line no-unused-vars
    const { privateKey, ...walletInfo } = wallet;
    
    res.json(
      successResponse('Wallet retrieved successfully', { wallet: walletInfo })
    );
  } catch (error) {
    res.status(500).json(
      errorResponse('Failed to retrieve wallet', { error: error.message })
    );
  }
});

/**
 * POST /api/admin/wallets/freeze
 * Freeze or unfreeze a wallet
 */
router.post('/freeze', authMiddleware, (req, res) => {
  try {
    const { address, freeze = true } = req.body;
    
    if (!address) {
      return res.status(400).json(
        errorResponse('Wallet address is required', { field: 'address' })
      );
    }
    
    // Enqueue freeze operation
    const record = transactionService.enqueue({
      type: 'freeze_wallet',
      payload: { address, freeze },
    });
    
    // Update local wallet status if it exists
    const wallet = Array.from(wallets.values()).find(w => w.address === address);
    if (wallet) {
      wallet.frozen = freeze;
    }
    
    res.status(202).json(
      successResponse(
        `Wallet ${freeze ? 'freeze' : 'unfreeze'} request queued successfully`,
        {
          job: record,
          address: address.slice(0, 10) + '...',
          frozen: freeze,
        }
      )
    );
  } catch (error) {
    res.status(500).json(
      errorResponse('Failed to queue freeze operation', { error: error.message })
    );
  }
});

/**
 * POST /api/admin/wallets/mint
 * Mint tokens to a specific wallet
 */
router.post('/mint', authMiddleware, (req, res) => {
  try {
    const { walletId, amount } = req.body;
    
    if (!walletId) {
      return res.status(400).json(
        errorResponse('Wallet ID is required', { field: 'walletId' })
      );
    }
    
    const wallet = wallets.get(walletId);
    if (!wallet) {
      return res.status(404).json(
        errorResponse('Wallet not found', { walletId })
      );
    }
    
    // Enqueue mint operation
    const record = transactionService.enqueue({
      type: 'mint',
      payload: { amount, recipient: wallet.address },
    });
    
    res.status(202).json(
      successResponse(
        `Mint request queued for ${wallet.name}`,
        {
          job: record,
          wallet: {
            id: wallet.id,
            name: wallet.name,
            address: wallet.address,
          },
        }
      )
    );
  } catch (error) {
    res.status(500).json(
      errorResponse('Failed to queue mint operation', { error: error.message })
    );
  }
});

/**
 * DELETE /api/admin/wallets/:id
 * Delete a wallet from management
 */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    
    if (!wallets.has(id)) {
      return res.status(404).json(
        errorResponse('Wallet not found', { id })
      );
    }
    
    wallets.delete(id);
    
    res.json(
      successResponse('Wallet deleted successfully', { id })
    );
  } catch (error) {
    res.status(500).json(
      errorResponse('Failed to delete wallet', { error: error.message })
    );
  }
});

/**
 * POST /api/admin/wallets/transfer
 * Transfer a specific CROZZ coin object between wallets
 * 
 * Note: On Sui, transfers require the coin object ID (not amount).
 * The coinId must be a CROZZ coin object owned by the source wallet.
 * 
 * To find coin object IDs owned by a wallet, use the Sui CLI:
 *   sui client objects --address <WALLET_ADDRESS>
 * Or query via RPC:
 *   suiClient.getOwnedObjects({ owner: '<WALLET_ADDRESS>', filter: { StructType: '<PACKAGE>::crozz_token::CROZZ' } })
 */
router.post('/transfer', authMiddleware, (req, res) => {
  try {
    const { fromWalletId, toAddress, coinId } = req.body;
    
    if (!fromWalletId || !toAddress || !coinId) {
      return res.status(400).json(
        errorResponse('Source wallet ID, destination address, and coin ID are required', {
          fields: ['fromWalletId', 'toAddress', 'coinId'],
          note: 'On Sui, transfers require a coin object ID. Query owned objects to find coin IDs.',
        })
      );
    }
    
    const fromWallet = wallets.get(fromWalletId);
    if (!fromWallet) {
      return res.status(404).json(
        errorResponse('Source wallet not found', { fromWalletId })
      );
    }
    
    if (fromWallet.frozen) {
      return res.status(403).json(
        errorResponse('Source wallet is frozen', { walletId: fromWalletId })
      );
    }
    
    // Enqueue transfer operation
    const record = transactionService.enqueue({
      type: 'transfer',
      payload: {
        coinId,
        toAddress,
      },
    });
    
    res.status(202).json(
      successResponse(
        `Transfer request queued from ${fromWallet.name}`,
        {
          job: record,
          from: fromWallet.address.slice(0, 10) + '...',
          to: toAddress.slice(0, 10) + '...',
        }
      )
    );
  } catch (error) {
    res.status(500).json(
      errorResponse('Failed to queue transfer operation', { error: error.message })
    );
  }
});

export default router;
