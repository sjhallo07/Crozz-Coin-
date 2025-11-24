# Crozz Coin Frontend

Placeholder for the dApp implementation (React/Vue/etc.).

Suggested next steps:

1. Pick a framework (Next.js, Nuxt, SvelteKit) and scaffold under this folder.
2. Wire up wallet adapters compatible with Sui (e.g., Sui Wallet Kit, Ethos Connect).
3. Provide UI flows for token minting, marketplace interactions, compliance checkpoints, and governance voting.

### Sui SDK wiring

1. Install dependencies:
   ```
   npm install
   npm install @mysten/sui.js axios
   ```
2. Configure the following Vite environment variables in the repo-level `.env` (or a dedicated `frontend/.env`):
   ```
   VITE_CROZZ_PACKAGE_ID=0xPACKAGE
   VITE_CROZZ_METADATA_ID=0xMETADATA
   VITE_CROZZ_MODULE=crozz_token
   VITE_CROZZ_VIEW_FUNCTION=get_icon_url
   VITE_CROZZ_GAS_BUDGET=10000000
   ```
3. Use `frontend/src/suiClient.ts` as the shared RPC client and drop `TokenAddress` into `App.tsx` to read Move view data.
4. Integrate a wallet adapter so that users can sign transactions (see `mintCrozz` helper in the root README for a starting point).

### Call the backend proxy

- `src/components/Dashboard/BackendTokenAddress.tsx` demonstrates how to POST to `http://localhost:4000/api/sui/token-address`
  via `axios` and render the returned payload.
- Update the form inputs with your package/module/function each time you need to call a different Move view entry.
