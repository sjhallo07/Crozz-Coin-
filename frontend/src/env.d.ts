/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CROZZ_PACKAGE_ID?: string;
  readonly VITE_CROZZ_MODULE?: string;
  readonly VITE_CROZZ_VIEW_FUNCTION?: string;
  readonly VITE_CROZZ_METADATA_ID?: string;
  readonly VITE_CROZZ_GAS_BUDGET?: string;
  readonly VITE_CROZZ_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
