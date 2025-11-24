# Crozz-Coin – Copilot Instructions

## Repo map at a glance

- `smart-contract/` holds the `crozz_token.move` package (Sui) plus `Move.toml` with the `crozz` address placeholder.
- `backend/` is an Express + WebSocket service (`src/server.js`) exposing `/api/tokens`, `/api/sui`, `/api/admin`, `/api/events` and booting the transaction executor + WS relay.
- `frontend/` is a Vite/React dashboard wired through `SuiProviders` (React Query + dApp Kit + wallet + dashboard data context) with UI components under `src/components/Dashboard`.
- `scripts/` contains PowerShell (`run-crozz-automation.ps1`) and bash (`test_crozz.sh`) helpers that chain Sui CLI calls for publish/mint/burn/freeze smoke tests.

## Local workflows

- Install per package: `cd backend && npm install`, `cd frontend && npm install`. Run the servers with `npm run dev` in each folder (frontend expects the backend at port 4000).
- Use the workspace Tasks palette for `sui move build/test/publish/call`; each task prompts for the package path or IDs so you can target `smart-contract/` without editing JSON.
- Docker users can run `docker compose up --build` to expose backend `:4000` and Vite `:5173` with hot reload.
- `run-crozz-automation.ps1` can publish the Move package, update metadata, freeze, and execute mint/burn/transfer flows in sequence; pass `-SkipPublish` when reusing an existing package.

## Config & secrets

- Copy `.env.example` to `.env` (repo root) and `frontend/.env`; backend reads `SUI_RPC_URL`, `SUI_DEFAULT_GAS_BUDGET`, `ADMIN_TOKEN`, `SUI_ADMIN_PRIVATE_KEY`, `CROZZ_*` IDs, and `CROZZ_EXECUTOR_DRY_RUN`.
- Frontend requires matching `VITE_CROZZ_API_BASE_URL`, `VITE_CROZZ_PACKAGE_ID`, `VITE_CROZZ_METADATA_ID`, `VITE_CROZZ_VIEW_FUNCTION`, `VITE_CROZZ_GAS_BUDGET`, plus `VITE_CROZZ_ADMIN_TOKEN` to pull admin jobs.
- WebSocket URLs default to `${API_BASE}/events`; override with `VITE_CROZZ_WS_URL` when the dashboard is hosted separately from the backend.

## Backend conventions

- `src/services/TransactionService.js` is the in-memory job queue (max 200 records) tracking `status`, `attempts`, `result`, and `nextRunAt`; always enqueue via `transactionService.enqueue({ type, payload })` so jobs land in both the REST responses and WebSocket feed.
- `TransactionExecutor` polls every 3s, supports `mint`, `burn`, `distribute`, and respects `CROZZ_EXECUTOR_DRY_RUN`. Real execution requires `SUI_ADMIN_PRIVATE_KEY`, `CROZZ_PACKAGE_ID`, and `CROZZ_TREASURY_CAP_ID`; dry-run mode still expects those IDs but skips signing.
- Build `TransactionBlock`s with the helpers already in `TransactionExecutor` (`createTx`, `parseAmount`). New transaction types should follow the same pattern: validate payload, short-circuit in dry-run, compose Move call(s), then call `submit`.
- `/api/admin/*` is behind `authMiddleware` which compares the `Authorization: Bearer` header to `process.env.ADMIN_TOKEN`; reuse this middleware for any privileged routes.
- `/api/sui/token-address` proxies Move view calls through `suiClient.call(...)` and accepts either explicit `arguments` or the `{creator,collection,name}` trio; reuse the `DEFAULT_GAS_BUDGET` constant when adding more proxy endpoints.
- The websocket server lives at `/events`; `WebSocketService` simply replays `eventMonitor` payloads, so push structured notifications by emitting events from services (e.g., after `transactionService.markCompleted`).

## Frontend conventions

- `SuiProviders` stacks Theme → DashboardDataProvider → React Query → `SuiClientProvider` → `WalletProvider`; insert any global context **inside** `SuiProviders` so hooks like `useDashboardData()` keep working.
- `DashboardDataProvider` owns polling (15s summary, 5s jobs) and the WebSocket subscription; components should read from the context instead of calling `fetch` directly.
- When fetching admin data, always fail gracefully when `VITE_CROZZ_ADMIN_TOKEN` is missing (see `DashboardDataProvider.refreshJobs`). Use the same pattern for any additional privileged cards.
- UI cards follow the `Card` + `Button` primitives in `src/components/UI/`; new dashboard widgets should live under `src/components/Dashboard/` and depend on `useDashboardData` or the shared `suiClient` from `src/suiClient.ts`.
- On-chain reads (e.g., `TokenAddress`) use `suiClient.call("unsafe_moveCall", [...])` with env-driven IDs, while backend-assisted reads (`BackendTokenAddress`) hit `VITE_CROZZ_API_BASE_URL`. Mirror these two paths whenever you need both privileged and unprivileged flows.

## Move contract cues

- `smart-contract/sources/crozz_token.move` defines the CROZZ coin, admin cap, anti-bot registry, guarded transfers, wallet/global freeze toggles, and metadata update entrypoints. Keep the module name (`crozz_token`) in sync with env vars and backend constants (`DEFAULT_MODULE`).
- Anti-bot flows rely on dynamic fields in `AntiBotRegistry`; if you add view or admin endpoints, pass the registry/shared object ID from `CROZZ_REGISTRY_ID` and respect the verification window + freeze flags before interacting with user accounts.

## Automation & ops

- The backend spikes a heartbeat event every 5s via `EventMonitor`; replace this with real transaction/job events to keep the dashboard feed meaningful.
- `scripts/test_crozz.sh` (bash) and the PowerShell automation script both assume `sui` is on `$PATH` and exit on error; keep them updated when Move entrypoints or required object IDs change.
- When containerizing, both Dockerfile copy only `package*.json` + `src/`; remember to rebuild after touching configuration outside those folders, or mount the repo during local iteration.
