import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

// Supported networks for CROZZ token deployment
const NETWORKS = {
  mainnet: getFullnodeUrl('mainnet'),
  testnet: getFullnodeUrl('testnet'),
  localnet: 'http://127.0.0.1:9000',
};

// Determine network from environment with safe lookup
const network = process.env.SUI_NETWORK ?? 'testnet';
const getNetworkUrl = (networkName) => {
  if (networkName === 'mainnet') return NETWORKS.mainnet;
  if (networkName === 'localnet') return NETWORKS.localnet;
  return NETWORKS.testnet;
};
const rpcUrl = process.env.SUI_RPC_URL ?? getNetworkUrl(network);

// Log network configuration at startup
console.log(`[SuiClient] Connecting to ${network}: ${rpcUrl}`);

export const suiClient = new SuiClient({ url: rpcUrl });
export const currentNetwork = network;
export const isMainnet = network === 'mainnet';
export const isTestnet = network === 'testnet';
