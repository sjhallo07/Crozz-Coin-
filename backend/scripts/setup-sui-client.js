#!/usr/bin/env node

/**
 * Sui Client Address Setup Script
 * 
 * This script generates a new Ed25519 keypair for use with Sui blockchain
 * and optionally updates the .env file with the credentials.
 * 
 * Usage:
 *   node scripts/setup-sui-client.js [options]
 *   or run from project root: cd backend && node ../scripts/setup-sui-client.js [options]
 * 
 * Options:
 *   --update-env     Update .env file with generated credentials
 *   --network        Network to use (testnet, mainnet, localnet) [default: testnet]
 *   --gas-budget     Default gas budget [default: 10000000]
 *   --help           Show this help message
 */

import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { toB64 } from '@mysten/sui/utils';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Navigate up to root directory from scripts/
const ROOT_DIR = resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const updateEnv = args.includes('--update-env');
const showHelp = args.includes('--help');
const networkIndex = args.indexOf('--network');
const network = networkIndex !== -1 && args[networkIndex + 1] ? args[networkIndex + 1] : 'testnet';
const gasBudgetIndex = args.indexOf('--gas-budget');
const gasBudget = gasBudgetIndex !== -1 && args[gasBudgetIndex + 1] ? args[gasBudgetIndex + 1] : '10000000';

// Network RPC URLs
const NETWORK_URLS = {
  testnet: 'https://fullnode.testnet.sui.io:443',
  mainnet: 'https://fullnode.mainnet.sui.io:443',
  localnet: 'http://127.0.0.1:9000'
};

// Faucet URLs
const FAUCET_URLS = {
  testnet: 'https://faucet.testnet.sui.io/gas',
  mainnet: 'N/A - Use a real wallet',
  localnet: 'http://127.0.0.1:9123/gas'
};

if (showHelp) {
  console.log(`
Sui Client Address Setup Script

This script generates a new Ed25519 keypair for use with Sui blockchain
and optionally updates the .env file with the credentials.

Usage:
  node scripts/setup-sui-client.js [options]

Options:
  --update-env     Update .env file with generated credentials
  --network        Network to use (testnet, mainnet, localnet) [default: testnet]
  --gas-budget     Default gas budget [default: 10000000]
  --help           Show this help message

Examples:
  # Generate a new keypair and display it
  node scripts/setup-sui-client.js

  # Generate a new keypair and update .env file
  node scripts/setup-sui-client.js --update-env

  # Generate for mainnet with custom gas budget
  node scripts/setup-sui-client.js --network mainnet --gas-budget 20000000 --update-env
`);
  process.exit(0);
}

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║      Sui Client Address Generator & Configuration         ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Generate new Ed25519 keypair
console.log('🔑 Generating new Ed25519 keypair...\n');
const keypair = new Ed25519Keypair();

// Get address and keys
const address = keypair.getPublicKey().toSuiAddress();
const publicKeyBase58 = keypair.getPublicKey().toBase64();
const privateKeyBytes = keypair.getSecretKey();
const privateKeyBase64 = toB64(privateKeyBytes);

// Display credentials
console.log('✅ Keypair generated successfully!\n');
console.log('═══════════════════════════════════════════════════════════');
console.log('📍 ADDRESS:');
console.log('  ', address);
console.log('\n🔐 PUBLIC KEY (Base64):');
console.log('  ', publicKeyBase58);
console.log('\n🔒 PRIVATE KEY (Base64):');
console.log('  ', privateKeyBase64);
console.log('\n🔒 PRIVATE KEY (with prefix for .env):');
console.log('   ed25519:' + privateKeyBase64);
console.log('═══════════════════════════════════════════════════════════\n');

// Display network information
console.log('🌐 Network Configuration:');
console.log('   Network:    ', network);
console.log('   RPC URL:    ', NETWORK_URLS[network] || NETWORK_URLS.testnet);
console.log('   Gas Budget: ', gasBudget);
console.log('   Faucet URL: ', FAUCET_URLS[network] || FAUCET_URLS.testnet);
console.log();

// Security warning
console.log('⚠️  SECURITY WARNING:');
console.log('   • Never share your private key with anyone!');
console.log('   • Store it securely (use environment variables, not hardcoded)');
console.log('   • This private key gives full control over the address');
console.log();

// Update .env file if requested
if (updateEnv) {
  console.log('📝 Updating .env file...\n');
  
  const envPath = join(ROOT_DIR, '.env');
  let envContent = '';
  
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, 'utf-8');
    console.log('   ℹ️  Existing .env file found, updating values...');
  } else {
    console.log('   ℹ️  Creating new .env file...');
    // Start with .env.example if available
    const envExamplePath = join(ROOT_DIR, '.env.example');
    if (existsSync(envExamplePath)) {
      envContent = readFileSync(envExamplePath, 'utf-8');
    }
  }

  // Update or add environment variables
  const updates = {
    'SUI_ADMIN_PRIVATE_KEY': `ed25519:${privateKeyBase64}`,
    'SUI_RPC_URL': NETWORK_URLS[network] || NETWORK_URLS.testnet,
    'SUI_DEFAULT_GAS_BUDGET': gasBudget,
    'VITE_SUI_NETWORK': network
  };

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
      console.log(`   ✓ Updated ${key}`);
    } else {
      envContent += `\n${key}=${value}`;
      console.log(`   ✓ Added ${key}`);
    }
  }

  // Write back to .env
  writeFileSync(envPath, envContent.trim() + '\n');
  console.log('\n   ✅ .env file updated successfully!');
  console.log();
}

// Next steps
console.log('📋 Next Steps:');
console.log();
console.log('1. Fund your address with testnet SUI tokens:');
if (network === 'testnet') {
  console.log('   curl --location --request POST \'https://faucet.testnet.sui.io/gas\' \\');
  console.log(`     --header 'Content-Type: application/json' \\`);
  console.log(`     --data-raw '{ "FixedAmountRequest": { "recipient": "${address}" } }'`);
  console.log();
  console.log('   Or use the web faucet:');
  console.log('   https://docs.sui.io/guides/developer/getting-started/get-coins');
} else if (network === 'localnet') {
  console.log('   sui client faucet');
} else {
  console.log('   Use a real wallet to transfer SUI tokens to:', address);
}
console.log();
console.log('2. Verify your balance:');
console.log('   sui client balance', address);
console.log();
console.log('3. Use the address for Crozz operations:');
console.log('   - Set CROZZ_DEFAULT_SIGNER=' + address);
console.log('   - Use this address as the recipient for mint operations');
console.log('   - Configure as the admin signer for privileged operations');
console.log();

if (!updateEnv) {
  console.log('💡 Tip: Run with --update-env to automatically update .env file');
  console.log();
}

// Export as JSON for scripting
const output = {
  address,
  publicKey: publicKeyBase58,
  privateKey: privateKeyBase64,
  privateKeyWithPrefix: `ed25519:${privateKeyBase64}`,
  network,
  rpcUrl: NETWORK_URLS[network] || NETWORK_URLS.testnet,
  gasBudget,
  faucetUrl: FAUCET_URLS[network] || FAUCET_URLS.testnet
};

console.log('═══════════════════════════════════════════════════════════');
console.log('📄 JSON Output (for scripting):');
console.log(JSON.stringify(output, null, 2));
console.log('═══════════════════════════════════════════════════════════\n');

console.log('✨ Done! Your Sui client address is ready to use.\n');
