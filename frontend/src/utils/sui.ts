export const SUI_NETWORKS = {
  localnet: 'http://127.0.0.1:9000',
  testnet: 'https://fullnode.testnet.sui.io:443',
  mainnet: 'https://fullnode.mainnet.sui.io:443',
} as const;

export type NetworkType = keyof typeof SUI_NETWORKS;

/**
 * Type guard to check if a string is a valid network type
 */
export const isValidNetwork = (network: string): network is NetworkType => {
  return network in SUI_NETWORKS;
};

export const getNetworkRpc = () => {
  const network = import.meta.env.VITE_SUI_NETWORK;
  if (network && isValidNetwork(network)) {
    return SUI_NETWORKS[network];
  }
  return SUI_NETWORKS.testnet;
};

export const getCurrentNetwork = (): NetworkType => {
  const network = import.meta.env.VITE_SUI_NETWORK;
  if (network && isValidNetwork(network)) {
    return network;
  }
  return 'testnet';
};

export const isMainnet = () => {
  return getCurrentNetwork() === 'mainnet';
};

export const isTestnet = () => {
  return getCurrentNetwork() === 'testnet';
};
