import { createNetworkConfig } from "@mysten/dapp-kit";
import { getNetworkRpc } from "./utils/sui";

const crozzPackageId = import.meta.env.VITE_CROZZ_PACKAGE_ID ?? "";
const crozzModule = import.meta.env.VITE_CROZZ_MODULE ?? "crozz_token";
const crozzViewFn = import.meta.env.VITE_CROZZ_VIEW_FUNCTION ?? "get_icon_url";
const crozzMetadataId = import.meta.env.VITE_CROZZ_METADATA_ID ?? "";

export const defaultNetwork = import.meta.env.VITE_SUI_NETWORK ?? "testnet";

export const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    [defaultNetwork]: {
      url: import.meta.env.VITE_SUI_RPC_URL ?? getNetworkRpc(),
      variables: {
        crozzPackageId,
        crozzModule,
        crozzViewFn,
        crozzMetadataId,
      },
    },
  });
