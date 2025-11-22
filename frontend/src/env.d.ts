/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CROZZ_PACKAGE_ID?: string;
  readonly VITE_CROZZ_MODULE?: string;
  readonly VITE_CROZZ_VIEW_FUNCTION?: string;
  readonly VITE_CROZZ_METADATA_ID?: string;
  readonly VITE_CROZZ_GAS_BUDGET?: string;
  readonly VITE_CROZZ_API_BASE_URL?: string;
  readonly VITE_SUI_NETWORK?: "localnet" | "testnet";
  readonly VITE_SUI_RPC_URL?: string;
  readonly VITE_CROZZ_TREASURY_CAP_ID?: string;
  readonly VITE_CROZZ_ADMIN_CAP_ID?: string;
  readonly VITE_CROZZ_REGISTRY_ID?: string;
  readonly VITE_SUI_CLOCK_OBJECT?: string;
  readonly VITE_CROZZ_ADMIN_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
