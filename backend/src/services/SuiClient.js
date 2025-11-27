import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

// Determine network from environment
const envNetwork = process.env.SUI_NETWORK ?? 'testnet';

// Get the network URL based on the validated network name
const getNetworkUrl = (name) => {
  if (name === 'mainnet') return getFullnodeUrl('mainnet');
  if (name === 'localnet') return 'http://127.0.0.1:9000';
  return getFullnodeUrl('testnet');
};

// Validate network name
const validNetwork =
  envNetwork === 'mainnet' || envNetwork === 'localnet' ? envNetwork : 'testnet';
const rpcUrl = process.env.SUI_RPC_URL ?? getNetworkUrl(validNetwork);

// Log network configuration at startup
console.log(`[SuiClient] Connecting to ${validNetwork}: ${rpcUrl}`);

export const suiClient = new SuiClient({ url: rpcUrl });
export const currentNetwork = validNetwork;
export const isMainnet = validNetwork === 'mainnet';
export const isTestnet = validNetwork === 'testnet';
