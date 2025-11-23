import { createNetworkConfig } from "@mysten/dapp-kit";
import { getNetworkRpc, SUI_NETWORKS } from "./utils/sui";

const crozzPackageId = import.meta.env.VITE_CROZZ_PACKAGE_ID ?? "";
const crozzModule = import.meta.env.VITE_CROZZ_MODULE ?? "crozz_token";
const crozzViewFn = import.meta.env.VITE_CROZZ_VIEW_FUNCTION ?? "get_icon_url";
const crozzMetadataId = import.meta.env.VITE_CROZZ_METADATA_ID ?? "";

export const defaultNetwork = import.meta.env.VITE_SUI_NETWORK ?? "testnet";

export const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    testnet: {
      url: import.meta.env.VITE_SUI_RPC_URL ?? SUI_NETWORKS.testnet,
      variables: {
        crozzPackageId,
        crozzModule,
        crozzViewFn,
        crozzMetadataId,
      },
    },
    mainnet: {
      url: import.meta.env.VITE_SUI_RPC_URL ?? SUI_NETWORKS.mainnet,
      variables: {
        crozzPackageId: import.meta.env.VITE_CROZZ_MAINNET_PACKAGE_ID ?? crozzPackageId,
        crozzModule,
        crozzViewFn,
        crozzMetadataId: import.meta.env.VITE_CROZZ_MAINNET_METADATA_ID ?? crozzMetadataId,
      },
    },
    localnet: {
      url: import.meta.env.VITE_SUI_RPC_URL ?? SUI_NETWORKS.localnet,
      variables: {
        crozzPackageId,
        crozzModule,
        crozzViewFn,
        crozzMetadataId,
      },
    },
  });
