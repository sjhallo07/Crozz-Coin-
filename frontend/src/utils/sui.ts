export const SUI_NETWORKS = {
  localnet: "http://127.0.0.1:9000",
  testnet: "https://fullnode.testnet.sui.io:443",
  mainnet: "https://fullnode.mainnet.sui.io:443",
};

export type NetworkType = keyof typeof SUI_NETWORKS;

export const getNetworkRpc = () => {
  return SUI_NETWORKS[import.meta.env.VITE_SUI_NETWORK as keyof typeof SUI_NETWORKS] ?? SUI_NETWORKS.testnet;
};

export const getCurrentNetwork = (): NetworkType => {
  const network = import.meta.env.VITE_SUI_NETWORK as NetworkType;
  return network && network in SUI_NETWORKS ? network : "testnet";
};

export const isMainnet = () => {
  return getCurrentNetwork() === "mainnet";
};

export const isTestnet = () => {
  return getCurrentNetwork() === "testnet";
};
