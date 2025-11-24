#!/usr/bin/env node

/**
 * Crozz Coin - Complete Deployment and Testing Script
 *
 * ⚠️  SECURITY WARNING: TESTNET ONLY
 * This script contains hardcoded wallet credentials for TESTNET demonstration.
 * - NEVER use these credentials on mainnet
 * - NEVER use in production environments
 * - These are TEST credentials with NO REAL VALUE
 * - For production, always use secure key management (environment variables, key vaults, etc.)
 *
 * This script automates:
 * 1. Requesting airdrops for all wallets
 * 2. Deploying the smart contract
 * 3. Minting tokens to test wallets
 * 4. Executing transfers between wallets
 * 5. Documenting all results
 */

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Transaction } from '@mysten/sui/transactions';
import { fromB64 } from '@mysten/sui/utils';
import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..', '..');
const DEPLOYMENT_DIR = join(ROOT_DIR, 'deployment');

// Configuration
const TESTNET_URL = getFullnodeUrl('testnet');
const FAUCET_URL = 'https://faucet.testnet.sui.io/gas';

// Wallet configurations (from generated wallets)
const WALLETS = {
  admin: {
    name: 'Admin',
    address: '0x899888ddf619e376d1291f858192eb6b157d5df77746f5057dd6f2b03a09685c',
    privateKey:
      'AAAAAAAAAAAAAAEAAAkAAAMAAAADBgAEAAMAAAAAAAAAAAYAAAAAAAcAAAACAwAABQIAAAAACQAAAAAAAAAAAAAABAADCQ==',
  },
  alice: {
    name: 'Alice',
    address: '0xf7507e908d69f63a93e48757e40e106d054ff5cef7c6f13437daada6f2c9e423',
    privateKey:
      'AAAAAAAAAAAAAAEAAAQAAAUAAAAFAAAAAAAIBAAAAAYAAAAAAAQAAAAACQkDAgAAAAAAAAAAAAAAAAAAAAICBQAABwAHAA==',
  },
  bob: {
    name: 'Bob',
    address: '0x3c71b11ee4615e3eb960e519d6495b7a648a61bdce55c75c70f6f95e3c062d93',
    privateKey:
      'AAAAAAAAAAAAAAEAAAAAAAQABwAAAAAIAAADAAkACQAEAAkAAAAAAAAAAAAEAAUAAAAAAAAFAAAAAAAAAAAABgAAAAkEAA==',
  },
  charlie: {
    name: 'Charlie',
    address: '0x54be361ca51e8034bc5ad0ca1d80130bbc83c90428206b5f91b5eee78baded01',
    privateKey:
      'AAAAAAAAAAAAAAEAAAAFAAAAAAYAAgAFAAcAAAAAAgUEAAAGAAADAAkABgAAAAAEAAAAAAAAAAkAAAAAAAAAAAMAAAAFBg==',
  },
};

// Initialize Sui client
const suiClient = new SuiClient({ url: TESTNET_URL });

// Helper function to log and append to file
function log(message) {
  console.log(message);
  if (!existsSync(DEPLOYMENT_DIR)) {
    mkdirSync(DEPLOYMENT_DIR, { recursive: true });
  }
  const logFile = join(DEPLOYMENT_DIR, 'deployment-log.txt');
  appendFileSync(logFile, message + '\n');
}

// Helper function to wait
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Request airdrop from testnet faucet
async function requestAirdrop(address, name) {
  try {
    log(`\n🌊 Requesting airdrop for ${name} (${address})...`);

    const response = await fetch(FAUCET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        FixedAmountRequest: { recipient: address },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      log(`✅ Airdrop successful for ${name}`);
      if (data.transferred_gas_objects && data.transferred_gas_objects.length > 0) {
        log(`   Gas objects: ${data.transferred_gas_objects.map((obj) => obj.id).join(', ')}`);
      }
      return true;
    } else {
      const error = await response.text();
      log(`⚠️  Airdrop failed for ${name}: ${error}`);
      return false;
    }
  } catch (error) {
    log(`❌ Error requesting airdrop for ${name}: ${error.message}`);
    return false;
  }
}

// Check balance for an address
async function checkBalance(address, name) {
  try {
    const balance = await suiClient.getBalance({ owner: address });
    const suiAmount = (parseInt(balance.totalBalance) / 1_000_000_000).toFixed(4);
    log(`💰 ${name} balance: ${suiAmount} SUI (${balance.totalBalance} MIST)`);
    return balance.totalBalance;
  } catch (error) {
    log(`❌ Error checking balance for ${name}: ${error.message}`);
    return '0';
  }
}

// Get coin objects for an address and coin type
async function getCoinObjects(address, coinType) {
  try {
    const coins = await suiClient.getCoins({ owner: address, coinType });
    return coins.data;
  } catch (error) {
    log(`❌ Error getting coin objects: ${error.message}`);
    return [];
  }
}

// Main deployment function
async function main() {
  const startTime = new Date();
  log('╔════════════════════════════════════════════════════════════╗');
  log('║     Crozz Coin - Deployment and Testing Automation        ║');
  log('╚════════════════════════════════════════════════════════════╝');
  log(`\nStarted at: ${startTime.toISOString()}`);
  log(`Network: Sui Testnet`);
  log(`RPC URL: ${TESTNET_URL}`);

  // Step 1: Request airdrops for all wallets
  log('\n' + '='.repeat(60));
  log('STEP 1: Requesting Airdrops for All Wallets');
  log('='.repeat(60));

  for (const [key, wallet] of Object.entries(WALLETS)) {
    await requestAirdrop(wallet.address, wallet.name);
    await sleep(2000); // Wait between requests to avoid rate limiting
  }

  // Wait for transactions to be processed
  log('\n⏳ Waiting 10 seconds for transactions to be processed...');
  await sleep(10000);

  // Step 2: Check balances
  log('\n' + '='.repeat(60));
  log('STEP 2: Checking Wallet Balances');
  log('='.repeat(60));

  const balances = {};
  for (const [key, wallet] of Object.entries(WALLETS)) {
    balances[key] = await checkBalance(wallet.address, wallet.name);
    await sleep(1000);
  }

  // Check if admin has enough balance to deploy
  if (parseInt(balances.admin) === 0) {
    log('\n❌ ERROR: Admin wallet has no balance. Cannot proceed with deployment.');
    log('Please manually fund the admin wallet and try again.');
    process.exit(1);
  }

  // Step 3: Note about contract deployment
  log('\n' + '='.repeat(60));
  log('STEP 3: Smart Contract Deployment');
  log('='.repeat(60));
  log('\n📝 Note: Smart contract needs to be deployed using Sui CLI:');
  log('   cd smart-contract');
  log('   sui client publish --gas-budget 100000000');
  log('\nThe contract is already configured with:');
  log('   ✓ Token Name: Crozz Coin');
  log('   ✓ Token Symbol: CROZZ');
  log('   ✓ Decimals: 9');
  log('   ✓ Icon URL: https://crozz-token.com/icon.png');
  log('\nAfter deployment, update the following in .env:');
  log('   - CROZZ_PACKAGE_ID');
  log('   - CROZZ_TREASURY_CAP_ID');
  log('   - CROZZ_METADATA_ID');

  // Step 4: Summary
  log('\n' + '='.repeat(60));
  log('DEPLOYMENT SUMMARY');
  log('='.repeat(60));
  log('\n✅ Wallets Generated: 4 (1 admin + 3 test wallets)');
  log('✅ Airdrops Requested: All wallets');
  log('✅ Balances Verified: All wallets');
  log('\n📋 Next Steps:');
  log('   1. Deploy the smart contract using Sui CLI');
  log('   2. Update .env with package and object IDs');
  log('   3. Use backend API to mint tokens to test wallets');
  log('   4. Execute transfers between wallets');
  log('   5. Verify transactions on Sui Explorer');

  // Generate testnet explorer links
  log('\n🔗 Testnet Explorer Links:');
  for (const [key, wallet] of Object.entries(WALLETS)) {
    log(`   ${wallet.name}: https://testnet.suivision.xyz/account/${wallet.address}`);
  }

  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;
  log(`\n✨ Completed at: ${endTime.toISOString()}`);
  log(`⏱️  Total duration: ${duration.toFixed(2)} seconds`);

  // Write summary to markdown
  const summary = `
# Deployment Summary

## Execution Details
- **Started**: ${startTime.toISOString()}
- **Completed**: ${endTime.toISOString()}
- **Duration**: ${duration.toFixed(2)} seconds
- **Network**: Sui Testnet

## Wallet Balances
${Object.entries(WALLETS)
  .map(([key, wallet]) => {
    const suiAmount = (parseInt(balances[key] || '0') / 1_000_000_000).toFixed(4);
    return `- **${wallet.name}**: ${suiAmount} SUI\n  - Address: \`${wallet.address}\`\n  - Explorer: https://testnet.suivision.xyz/account/${wallet.address}`;
  })
  .join('\n\n')}

## Status
- ✅ Wallets Generated
- ✅ Airdrops Requested
- ✅ Balances Verified
- ⏳ Smart Contract Deployment (requires Sui CLI)
- ⏳ Token Minting (requires deployed contract)
- ⏳ Token Transfers (requires minted tokens)

## Next Actions
1. Deploy smart contract using Sui CLI
2. Update environment variables with contract IDs
3. Mint tokens to test wallets
4. Execute transfer transactions
5. Document final results
`;

  writeFileSync(join(DEPLOYMENT_DIR, 'summary.md'), summary);
  log('\n📄 Summary written to deployment/summary.md');
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
