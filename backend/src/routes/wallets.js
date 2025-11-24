import { Router } from 'express';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { toB64 } from '@mysten/sui/utils';
import { transactionService } from '../services/TransactionService.js';
import { successResponse, errorResponse } from '../utils/humanize.js';
import authMiddleware from '../middleware/auth.js';

const router = Router();

// In-memory wallet storage (for demo purposes)
// In production, use a secure database
const wallets = new Map();

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
        privateKey, // In production, encrypt this!
        createdAt: new Date().toISOString(),
        frozen: false,
        balance: '0',
      };
      
      wallets.set(walletId, wallet);
      
      // Return wallet without private key in response
      const { privateKey: _, ...walletInfo } = wallet;
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
 * Transfer tokens between wallets
 */
router.post('/transfer', authMiddleware, (req, res) => {
  try {
    const { fromWalletId, toAddress, amount } = req.body;
    
    if (!fromWalletId || !toAddress) {
      return res.status(400).json(
        errorResponse('Source wallet ID and destination address are required', {
          fields: ['fromWalletId', 'toAddress'],
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
        fromAddress: fromWallet.address,
        toAddress,
        amount,
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
