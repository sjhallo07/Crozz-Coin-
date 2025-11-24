#!/usr/bin/env node

/**
 * Comprehensive Wallet Operations Demo
 * 
 * This script demonstrates:
 * 1. Creating a Sui client
 * 2. Generating 3 new wallets
 * 3. Minting tokens to wallets
 * 4. Making transfers between wallets
 * 5. Freezing wallets
 * 6. Displaying results on dashboard
 * 
 * Usage:
 *   node scripts/demo-wallet-operations.js [--network testnet] [--mint-amount 1000000000]
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { toB64, fromB64 } from '@mysten/sui/utils';
import { readFileSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');

// Load environment variables
dotenv.config({ path: join(ROOT_DIR, '.env') });

// Parse command line arguments
const args = process.argv.slice(2);
const networkIndex = args.indexOf('--network');
const network = networkIndex !== -1 && args[networkIndex + 1] ? args[networkIndex + 1] : 'testnet';
const mintAmountIndex = args.indexOf('--mint-amount');
const mintAmount = mintAmountIndex !== -1 && args[mintAmountIndex + 1] 
  ? args[mintAmountIndex + 1] 
  : '1000000000'; // 1 CROZZ (with 9 decimals)

// Configuration from environment
const PACKAGE_ID = process.env.CROZZ_PACKAGE_ID;
const TREASURY_CAP_ID = process.env.CROZZ_TREASURY_CAP_ID;
const ADMIN_CAP_ID = process.env.CROZZ_ADMIN_CAP_ID;
const REGISTRY_ID = process.env.CROZZ_REGISTRY_ID;
const ADMIN_PRIVATE_KEY = process.env.SUI_ADMIN_PRIVATE_KEY;
const MODULE_NAME = process.env.CROZZ_MODULE || 'crozz_token';
const GAS_BUDGET = process.env.SUI_DEFAULT_GAS_BUDGET || '10000000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '═'.repeat(70));
  log(title, colors.bright + colors.cyan);
  console.log('═'.repeat(70) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class WalletOperationsDemo {
  constructor() {
    this.client = null;
    this.adminKeypair = null;
    this.wallets = [];
    this.results = {
      wallets: [],
      mints: [],
      transfers: [],
      freezes: [],
    };
  }

  // Step 1: Initialize Sui Client
  async initializeSuiClient() {
    logSection('Step 1: Initialize Sui Client');
    
    try {
      const rpcUrl = process.env.SUI_RPC_URL || getFullnodeUrl(network);
      this.client = new SuiClient({ url: rpcUrl });
      
      logSuccess(`Sui client initialized successfully`);
      logInfo(`Network: ${network}`);
      logInfo(`RPC URL: ${rpcUrl}`);
      
      // Test connection
      const chainId = await this.client.getChainIdentifier();
      logInfo(`Chain ID: ${chainId}`);
      
      return true;
    } catch (error) {
      logError(`Failed to initialize Sui client: ${error.message}`);
      return false;
    }
  }

  // Step 2: Setup Admin Keypair
  async setupAdminKeypair() {
    logSection('Step 2: Setup Admin Keypair');
    
    try {
      if (!ADMIN_PRIVATE_KEY) {
        throw new Error('SUI_ADMIN_PRIVATE_KEY not found in .env file');
      }

      // Parse the private key (format: ed25519:BASE64)
      const keyParts = ADMIN_PRIVATE_KEY.split(':');
      if (keyParts.length !== 2 || keyParts[0] !== 'ed25519') {
        throw new Error('Invalid private key format. Expected: ed25519:BASE64');
      }

      const privateKeyBytes = fromB64(keyParts[1]);
      this.adminKeypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
      
      const adminAddress = this.adminKeypair.getPublicKey().toSuiAddress();
      logSuccess(`Admin keypair loaded`);
      logInfo(`Admin address: ${adminAddress}`);
      
      // Check admin balance
      const balance = await this.client.getBalance({
        owner: adminAddress,
      });
      logInfo(`Admin SUI balance: ${(parseInt(balance.totalBalance) / 1e9).toFixed(4)} SUI`);
      
      if (parseInt(balance.totalBalance) < 100000000) { // Less than 0.1 SUI
        logWarning('Admin balance is low. Consider funding the address.');
      }
      
      return true;
    } catch (error) {
      logError(`Failed to setup admin keypair: ${error.message}`);
      return false;
    }
  }

  // Step 3: Generate 3 New Wallets
  async generateWallets() {
    logSection('Step 3: Generate 3 New Wallets');
    
    try {
      for (let i = 1; i <= 3; i++) {
        const keypair = new Ed25519Keypair();
        const address = keypair.getPublicKey().toSuiAddress();
        const publicKey = keypair.getPublicKey().toBase64();
        const privateKeyBytes = keypair.getSecretKey();
        const privateKey = `ed25519:${toB64(privateKeyBytes)}`;
        
        const wallet = {
          id: i,
          name: `Wallet ${i}`,
          address,
          publicKey,
          privateKey,
          keypair,
          balance: '0',
        };
        
        this.wallets.push(wallet);
        this.results.wallets.push({
          id: i,
          name: wallet.name,
          address: wallet.address,
          publicKey: wallet.publicKey,
        });
        
        logSuccess(`Wallet ${i} created`);
        logInfo(`  Address: ${address}`);
        logInfo(`  Public Key: ${publicKey.substring(0, 20)}...`);
      }
      
      logSuccess(`Successfully generated ${this.wallets.length} wallets`);
      return true;
    } catch (error) {
      logError(`Failed to generate wallets: ${error.message}`);
      return false;
    }
  }

  // Step 4: Mint Tokens to Each Wallet
  async mintTokensToWallets() {
    logSection('Step 4: Mint Tokens to Each Wallet');
    
    if (!PACKAGE_ID || !TREASURY_CAP_ID) {
      logWarning('Package ID or Treasury Cap ID not configured. Skipping mint operations.');
      logInfo('Please configure CROZZ_PACKAGE_ID and CROZZ_TREASURY_CAP_ID in .env');
      return false;
    }
    
    try {
      for (const wallet of this.wallets) {
        logInfo(`Minting ${(parseInt(mintAmount) / 1e9).toFixed(2)} CROZZ to ${wallet.name}...`);
        
        const tx = new Transaction();
        tx.moveCall({
          target: `${PACKAGE_ID}::${MODULE_NAME}::mint`,
          arguments: [
            tx.object(TREASURY_CAP_ID),
            tx.pure(mintAmount),
            tx.pure(wallet.address),
          ],
        });
        
        tx.setGasBudget(parseInt(GAS_BUDGET));
        
        const result = await this.client.signAndExecuteTransaction({
          transaction: tx,
          signer: this.adminKeypair,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        });
        
        if (result.effects?.status?.status === 'success') {
          logSuccess(`✓ Minted to ${wallet.name}`);
          logInfo(`  Transaction: ${result.digest}`);
          
          this.results.mints.push({
            wallet: wallet.name,
            address: wallet.address,
            amount: mintAmount,
            digest: result.digest,
            status: 'success',
          });
          
          // Small delay to avoid rate limiting
          await sleep(1000);
        } else {
          throw new Error(`Transaction failed: ${result.effects?.status?.error || 'Unknown error'}`);
        }
      }
      
      logSuccess(`Successfully minted tokens to all ${this.wallets.length} wallets`);
      return true;
    } catch (error) {
      logError(`Failed to mint tokens: ${error.message}`);
      return false;
    }
  }

  // Step 5: Make Transfers Between Wallets
  async makeTransfers() {
    logSection('Step 5: Make Transfers Between Wallets');
    
    if (!PACKAGE_ID) {
      logWarning('Package ID not configured. Skipping transfer operations.');
      return false;
    }
    
    try {
      // Get coin objects for each wallet
      logInfo('Fetching coin objects for wallets...');
      
      for (let i = 0; i < this.wallets.length - 1; i++) {
        const fromWallet = this.wallets[i];
        const toWallet = this.wallets[i + 1];
        const transferAmount = Math.floor(parseInt(mintAmount) / 10).toString(); // Transfer 10%
        
        logInfo(`Transferring ${(parseInt(transferAmount) / 1e9).toFixed(2)} CROZZ from ${fromWallet.name} to ${toWallet.name}...`);
        
        // Get coins owned by fromWallet
        const coins = await this.client.getCoins({
          owner: fromWallet.address,
          coinType: `${PACKAGE_ID}::${MODULE_NAME}::CROZZ`,
        });
        
        if (!coins.data || coins.data.length === 0) {
          logWarning(`  No coins found for ${fromWallet.name}. Skipping transfer.`);
          continue;
        }
        
        const coinId = coins.data[0].coinObjectId;
        
        const tx = new Transaction();
        tx.moveCall({
          target: `${PACKAGE_ID}::${MODULE_NAME}::transfer`,
          arguments: [
            tx.object(coinId),
            tx.pure(toWallet.address),
          ],
        });
        
        tx.setGasBudget(parseInt(GAS_BUDGET));
        
        const result = await this.client.signAndExecuteTransaction({
          transaction: tx,
          signer: fromWallet.keypair,
          options: {
            showEffects: true,
          },
        });
        
        if (result.effects?.status?.status === 'success') {
          logSuccess(`✓ Transfer completed`);
          logInfo(`  Transaction: ${result.digest}`);
          
          this.results.transfers.push({
            from: fromWallet.name,
            to: toWallet.name,
            amount: transferAmount,
            digest: result.digest,
            status: 'success',
          });
          
          await sleep(1000);
        } else {
          throw new Error(`Transfer failed: ${result.effects?.status?.error || 'Unknown error'}`);
        }
      }
      
      logSuccess(`Successfully completed transfers between wallets`);
      return true;
    } catch (error) {
      logError(`Failed to make transfers: ${error.message}`);
      logWarning('Note: Transfers require the wallets to have SUI for gas fees.');
      return false;
    }
  }

  // Step 6: Freeze Wallets
  async freezeWallets() {
    logSection('Step 6: Freeze Wallets');
    
    if (!PACKAGE_ID || !ADMIN_CAP_ID || !REGISTRY_ID) {
      logWarning('Admin Cap ID or Registry ID not configured. Skipping freeze operations.');
      logInfo('Please configure CROZZ_ADMIN_CAP_ID and CROZZ_REGISTRY_ID in .env');
      return false;
    }
    
    try {
      // Freeze the first wallet
      const wallet = this.wallets[0];
      
      logInfo(`Freezing ${wallet.name} (${wallet.address})...`);
      
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::${MODULE_NAME}::set_wallet_freeze`,
        arguments: [
          tx.object(ADMIN_CAP_ID),
          tx.object(REGISTRY_ID),
          tx.pure(wallet.address),
          tx.pure(true),
        ],
      });
      
      tx.setGasBudget(parseInt(GAS_BUDGET));
      
      const result = await this.client.signAndExecuteTransaction({
        transaction: tx,
        signer: this.adminKeypair,
        options: {
          showEffects: true,
          showEvents: true,
        },
      });
      
      if (result.effects?.status?.status === 'success') {
        logSuccess(`✓ ${wallet.name} frozen successfully`);
        logInfo(`  Transaction: ${result.digest}`);
        
        this.results.freezes.push({
          wallet: wallet.name,
          address: wallet.address,
          frozen: true,
          digest: result.digest,
          status: 'success',
        });
        
        // Check for events
        if (result.events && result.events.length > 0) {
          logInfo(`  Events emitted: ${result.events.length}`);
        }
      } else {
        throw new Error(`Freeze failed: ${result.effects?.status?.error || 'Unknown error'}`);
      }
      
      logSuccess(`Successfully froze wallet`);
      return true;
    } catch (error) {
      logError(`Failed to freeze wallets: ${error.message}`);
      return false;
    }
  }

  // Step 7: Display Results Summary
  displayResults() {
    logSection('Step 7: Results Summary');
    
    console.log('\n📊 Operation Results:\n');
    
    // Wallets Created
    log('🔑 Wallets Created:', colors.bright);
    this.results.wallets.forEach(wallet => {
      console.log(`   ${wallet.id}. ${wallet.name}`);
      console.log(`      Address: ${wallet.address}`);
    });
    
    // Mint Operations
    if (this.results.mints.length > 0) {
      console.log();
      log('💰 Mint Operations:', colors.bright);
      this.results.mints.forEach(mint => {
        const amountFormatted = (parseInt(mint.amount) / 1e9).toFixed(2);
        console.log(`   ✓ ${amountFormatted} CROZZ → ${mint.wallet}`);
        console.log(`      Tx: ${mint.digest}`);
      });
    }
    
    // Transfer Operations
    if (this.results.transfers.length > 0) {
      console.log();
      log('↔️  Transfer Operations:', colors.bright);
      this.results.transfers.forEach(transfer => {
        const amountFormatted = (parseInt(transfer.amount) / 1e9).toFixed(2);
        console.log(`   ✓ ${amountFormatted} CROZZ: ${transfer.from} → ${transfer.to}`);
        console.log(`      Tx: ${transfer.digest}`);
      });
    }
    
    // Freeze Operations
    if (this.results.freezes.length > 0) {
      console.log();
      log('🔒 Freeze Operations:', colors.bright);
      this.results.freezes.forEach(freeze => {
        console.log(`   ✓ ${freeze.wallet} ${freeze.frozen ? 'FROZEN' : 'UNFROZEN'}`);
        console.log(`      Tx: ${freeze.digest}`);
      });
    }
    
    console.log();
    logSuccess('All operations completed!');
    
    // Dashboard instructions
    console.log();
    log('📺 View on Dashboard:', colors.bright + colors.blue);
    console.log('   1. Start the backend: cd backend && npm run dev');
    console.log('   2. Start the frontend: cd frontend && npm run dev');
    console.log('   3. Open http://localhost:5173 in your browser');
    console.log('   4. Check the Events Feed for transaction updates');
    console.log('   5. View Job Queue for operation status');
    console.log();
  }

  // Main execution flow
  async run() {
    console.log();
    log('╔═══════════════════════════════════════════════════════════════════╗', colors.bright + colors.cyan);
    log('║         Crozz Coin - Wallet Operations Demo                       ║', colors.bright + colors.cyan);
    log('╚═══════════════════════════════════════════════════════════════════╝', colors.bright + colors.cyan);
    console.log();
    
    logInfo(`Network: ${network}`);
    logInfo(`Mint Amount: ${(parseInt(mintAmount) / 1e9).toFixed(2)} CROZZ per wallet`);
    console.log();
    
    // Check configuration
    if (!PACKAGE_ID || PACKAGE_ID === '0xYOUR_PACKAGE_ID') {
      logError('Please configure your .env file with deployed contract addresses.');
      logInfo('Required: CROZZ_PACKAGE_ID, CROZZ_TREASURY_CAP_ID, CROZZ_ADMIN_CAP_ID, CROZZ_REGISTRY_ID');
      logInfo('Run: node scripts/setup-sui-client.js --update-env');
      process.exit(1);
    }
    
    // Execute steps
    const steps = [
      () => this.initializeSuiClient(),
      () => this.setupAdminKeypair(),
      () => this.generateWallets(),
      () => this.mintTokensToWallets(),
      () => this.makeTransfers(),
      () => this.freezeWallets(),
    ];
    
    for (const step of steps) {
      const success = await step();
      if (!success) {
        logWarning('Some operations were skipped or failed. See messages above.');
      }
      await sleep(500);
    }
    
    this.displayResults();
  }
}

// Run the demo
const demo = new WalletOperationsDemo();
demo.run().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
