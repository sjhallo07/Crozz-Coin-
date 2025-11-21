export const SUI_NETWORKS = {
  localnet: "http://127.0.0.1:9000",
  testnet: "https://fullnode.testnet.sui.io:443",
};

export const getNetworkRpc = () => {
  return SUI_NETWORKS[import.meta.env.VITE_SUI_NETWORK as keyof typeof SUI_NETWORKS] ?? SUI_NETWORKS.testnet;
};
