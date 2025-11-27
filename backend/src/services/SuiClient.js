import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

// Determine network from environment
const envNetwork = process.env.SUI_NETWORK ?? 'testnet';

// Get the network URL using SDK's getFullnodeUrl for consistency
const getNetworkUrl = (name) => {
  if (name === 'mainnet') return getFullnodeUrl('mainnet');
  if (name === 'localnet') return getFullnodeUrl('localnet');
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
