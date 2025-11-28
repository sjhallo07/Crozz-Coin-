# Crozz Coin

**Official CROZZ Community Token - Created by Carlo Hung**

> ⚠️ **IMPORTANT**: This repository contains PUBLIC testnet credentials for educational purposes.
> See [`TESTNET_DEPLOYMENT_NOTICE.md`](TESTNET_DEPLOYMENT_NOTICE.md) for critical security information.
> **NEVER use these patterns for production/mainnet deployments.**

## Token Information

| Property | Value |
|----------|-------|
| **Name** | Crozz Coin |
| **Symbol** | CROZZ |
| **Decimals** | 9 |
| **Blockchain** | Sui |
| **Creator** | Carlo Hung |

## 🚀 Quick Deployment

For a complete, ready-to-execute deployment package, see the [`deployment/`](deployment/) directory which includes:

- ✅ Pre-generated testnet wallets (4 wallets)
- ✅ Complete deployment documentation
- ✅ Automation scripts
- ✅ Security best practices guide

**Quick Start**: `cd deployment && ./execute-deployment.sh`

---

## ⚡ Quick Start: Run Complete Ecosystem

Want to run the entire ecosystem (backend + frontend) for testing? Use our quick-start script:

```bash
# One command to rule them all
./scripts/quick-start.sh
```

This interactive script will:

- ✅ Check prerequisites (Node.js, npm)
- ✅ Install dependencies (backend + frontend)
- ✅ Set up environment files
- ✅ Start backend API (port 4000)
- ✅ Start frontend dashboard (port 5173)
- ✅ Optionally set up remote access tunnel for client testing

### Remote Testing / Client Demos

Need to share your local development with clients or team members remotely?

```bash
# Start services
./scripts/quick-start.sh
# Choose option 3 (Start Both)

# In another terminal, set up tunnel
./scripts/setup-tunnel.sh
# Choose option 1 (Cloudflare Tunnel - Recommended)

# Share the URLs with your team/clients!
```

**What you get:**

- 🌐 Public URLs for both backend and frontend
- 🔒 HTTPS by default (secure)
- 🚀 No complex network configuration
- 💰 Free (no account required with Cloudflare)

**See full documentation:**

- 📖 [Remote Testing Guide](docs/REMOTE_TESTING.md) - Complete tunnel setup guide
- 📖 [Testing Environments](docs/TESTING_ENVIRONMENTS.md) - Temporary vs. real use explained

---

## Quick Start: Generate Sui Client Address & Environment Setup

Before diving into development, you'll need to generate a Sui address and configure your environment:

### 1. Generate a New Sui Client Address

```bash
# Navigate to backend directory
cd backend

# Generate a new keypair and display credentials
node scripts/setup-sui-client.js

# Or generate and automatically update .env file
node scripts/setup-sui-client.js --update-env --network testnet --gas-budget 10000000
```

This script will:

- ✅ Generate a new Ed25519 keypair
- ✅ Display your Sui address, public key, and private key
- ✅ Optionally update your `.env` file with the credentials
- ✅ Provide instructions for funding your address from the testnet faucet
- ✅ Configure gas budget and network settings

**Output includes:**

- 📍 **Sui Address** - Use for receiving tokens and as CROZZ_DEFAULT_SIGNER
- 🔐 **Public Key** - Your public identity on Sui blockchain
- 🔒 **Private Key** - Keep this secret! Full control of the address
- 🌐 **Network Configuration** - RPC URL, gas budget, faucet URL

### 2. Fund Your Address

For **testnet**, use the faucet:

```bash
curl --location --request POST 'https://faucet.testnet.sui.io/gas' \
  --header 'Content-Type: application/json' \
  --data-raw '{ "FixedAmountRequest": { "recipient": "<YOUR_ADDRESS>" } }'
```

Or visit: https://docs.sui.io/guides/developer/getting-started/get-coins

### 3. Complete Environment Configuration

Update your `.env` files with the generated address:

**Root `.env`:**

```env
SUI_ADMIN_PRIVATE_KEY=ed25519:<generated_key>
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_DEFAULT_GAS_BUDGET=10000000
CROZZ_DEFAULT_SIGNER=<generated_address>
```

**Frontend `.env`:**

```env
VITE_CROZZ_API_BASE_URL=http://localhost:4000
VITE_SUI_NETWORK=testnet
VITE_CROZZ_GAS_BUDGET=10000000
```

### 4. Verify Your Setup

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start the backend
cd backend && npm run dev

# In another terminal, start the frontend
cd frontend && npm run dev
```

📚 **For more details on scripts and configuration, see [scripts/README.md](scripts/README.md)**

---

## Developer-focused editor setup

The repository now ships with a workspace-level VS Code configuration so you can unlock every
"premium" editing feature—GitHub Copilot, advanced inline suggestions, Move language tooling,
and purpose-built command runners—without hunting for settings manually.

### 1. Install the recommended extensions

Open the workspace in VS Code and accept the prompted installation from `.vscode/extensions.json`.
The curated list includes:

- **GitHub Copilot + Copilot Chat** for GPT-5.1-Codex powered completions, chat, and code actions.
- **Mysten Move** and **Move Analyzer** for syntax highlighting, diagnostics, and language server support.
- **GitLens, Prettier, ESLint, Markdown All in One, TOML formatter, PowerShell, Docker, Code Spell Checker**
  to cover Git insights, formatting, container workflows, shell integration, and documentation polish.

> 💡 You’ll need an active Copilot subscription to access the premium models and advanced chat features.

### 2. Benefit from opinionated workspace settings

`.vscode/settings.json` enables inline suggestions, format-on-save, smart Git workflows, and assigns
language-specific formatters (Move, Markdown, TOML). Copilot autocomplete + chat are switched on by
default, with tuned suggestion delays so completions feel instantaneous. File watcher/Explorer filters
hide common build artifacts.

### 3. Run Sui commands through the task palette

Launch the VS Code command palette and choose **Tasks: Run Task** to access:

| Task                      | What it does                                                                 |
| ------------------------- | ---------------------------------------------------------------------------- |
| `Sui: Move build`         | Runs `sui move build` against the package path you supply.                   |
| `Sui: Move test`          | Executes `sui move test` for the selected package.                           |
| `Sui: Publish package`    | Publishes a Move package via `sui client publish`, prompting for gas budget. |
| `Sui: Call Move function` | Invokes any module/function combo through `sui client call`.                 |

Each task prompts for paths, package IDs, and budgets so you can reuse them for every Move project inside the repo.

### 4. Suggested workflow

1. Sign in to GitHub within VS Code to unlock Copilot completions and chat with GPT-5.1-Codex (Preview).
2. Use Copilot Chat inline code actions (`⌘⇧I`/`Ctrl+Shift+I`) to refactor or explain Move modules.
3. Keep `sui move build`/`test` tasks handy while iterating on contracts.
4. When ready, publish/test via the provided tasks or the integrated terminal (`PowerShell` profile is set by default).

### Next steps

- Follow the [Sui getting-started guide](https://docs.sui.io/guides/developer/getting-started) that we fetched earlier to finish client configuration, faucet funding, and the "Hello, World!" example.
- Use the scaffolded frontend/backend/Move folders below to begin implementing Crozz-specific business logic.

## Crozz ecosystem layout

```
├─ frontend/ (React + Vite)
│  ├─ package.json
│  └─ src/
│     ├─ components/
│     │  ├─ Dashboard/{TokenOverview,TokenActions,EventsFeed}.tsx
│     │  ├─ UI/{Button,Card}.tsx
│     │  └─ Layout/Header.tsx
│     ├─ hooks/{useTokenData,useWebSocket}.ts
│     ├─ utils/sui.ts
│     └─ App.tsx
├─ backend/ (Express + WebSocket server)
│  ├─ package.json
│  └─ src/
│     ├─ server.js
│     ├─ middleware/auth.js
│     ├─ routes/{tokens,events,admin}.js
│     └─ services/{EventMonitor,TransactionService,WebSocketService}.js
├─ smart-contract/ (Move)
│  ├─ Move.toml
│  └─ sources/crozz_token.move
└─ configuration
	├─ .env
	└─ docker-compose.yml
```

- **Frontend**: Provides a ready-to-wire React dashboard with components, hooks, and a lightweight utility for selecting Sui RPC endpoints. Run `npm install && npm run dev` inside `frontend/` to start iterating.
- **Frontend**: Provides a ready-to-wire React dashboard with components, hooks, and a lightweight utility for selecting Sui RPC endpoints. Run `npm install && npm run dev` inside `frontend/` to start iterating.
- **Dashboard data provider**: `frontend/src/providers/DashboardDataProvider.tsx` centralizes token summary polling, job queue polling, and the WebSocket event stream. Any component can call `useDashboardData()` to get the latest metrics plus refresh helpers, so the UI stays in sync without duplicating fetch logic.
- **Backend**: Express API plus WebSocket broadcaster for live event feeds. Use `npm install && npm run dev` inside `backend/` to spin it up.
- **Smart contract**: Minimal Move package that exposes a `crozz_token` module. Point the address in `Move.toml` to your published account before deployment.
- **Configuration**: `.env` centralizes shared secrets (admin tokens, RPC URLs, keys) and `docker-compose.yml` wires frontend + backend containers for local orchestration.

> Reminder: replace the placeholder secrets in `.env` before deploying anywhere outside of a local/devnet environment.

### Run everything with Docker (optional)

```
docker compose up --build
```

This will build both images and expose the backend on `localhost:4000` and the Vite dev server on `localhost:5173` with hot reload.

### Configure the realtime dashboard provider

The new `DashboardDataProvider` expects both the REST API and the WebSocket stream to be reachable from the browser. Create `frontend/.env` (or set env vars in your shell) with at least:

```
VITE_CROZZ_API_BASE_URL=http://localhost:4000
VITE_CROZZ_ADMIN_TOKEN=changeme        # must match backend ADMIN_TOKEN for /api/admin/jobs
VITE_CROZZ_WS_URL=ws://localhost:4000/events   # optional; auto-derived when omitted
```

- `TokenOverview`, `EventsFeed`, and `JobQueue` all read from the provider instead of fetching on their own. Use the refresh buttons on each card to trigger an immediate re-fetch without waiting for the background interval (15s for token summary, 5s for jobs).
- When `VITE_CROZZ_ADMIN_TOKEN` is missing, the provider will surface a friendly error instead of spamming unauthorized requests, so the rest of the dashboard keeps working.
- The Job Queue card now includes a drill-down modal to inspect payloads/results for each job; no extra wiring is needed as long as the admin token is set.

### Automate Sui deployment flows

Run the helper script to publish the Move package, update the icon URL, optionally freeze metadata, and perform mint/burn/transfer calls in a single session:

```
pwsh ./scripts/run-crozz-automation.ps1 \
	-MovePackagePath "../smart-contract" \
	-MintAmount 1000000000 \
	-MintRecipient 0xYOURADDRESS
```

Key options:

- Omit `-PackageId`, `-AdminCapId`, `-TreasuryCapId`, or `-MetadataId` to be prompted after publish (or when reusing existing IDs).
- Supply `-SkipPublish` if you only want to run the post-deploy calls.
- Toggle `-FreezeMetadata` to lock metadata right after updating the icon.
- Provide `-BurnCoinId` or `-TransferCoinId`/`-TransferRecipient` to batch those actions.
- Adjust `-IconUrl`, `-PublishGasBudget`, and `-CallGasBudget` to fit your environment.

### Backend Sui proxy API

The Express server now exposes `/api/sui/token-address`, wrapping the Sui TypeScript SDK so browsers don’t need direct
chain access.

1. Install backend dependencies if you haven’t already:

   ```
   cd backend
   npm install
   ```

2. Ensure `.env` includes:

   ```
   SUI_RPC_URL=https://fullnode.testnet.sui.io:443
   SUI_DEFAULT_GAS_BUDGET=10000000
   ```

3. Start the server (`npm run dev` for hot reload or `npm run start` for production). The route accepts JSON payloads of
   the form:

   ```
   POST http://localhost:4000/api/sui/token-address
   {
     "packageId": "0xPACKAGE",
     "module": "crozz_token",
     "functionName": "create_token_address",
     "creator": "0xCREATOR",
     "collection": "Crozz",
     "name": "Genesis"
   }
   ```

   Internally the backend calls `suiClient.call({...})` with the supplied args and returns the raw SDK response under
   `tokenAddress`.

### Token orchestration endpoints

The backend now exposes first-class helpers for every CROZZ administrative flow. Configure the signer and on-chain
capabilities inside `.env`:

```
SUI_PRIVATE_KEY=ed25519:BASE64_KEY
CROZZ_PACKAGE_ID=0xPACKAGE
CROZZ_MODULE=crozz_token
CROZZ_TREASURY_CAP_ID=0xTREASURY_CAP
CROZZ_METADATA_ID=0xMETADATA
CROZZ_ADMIN_CAP_ID=0xADMIN_CAP
CROZZ_REGISTRY_ID=0xREGISTRY
CROZZ_REGISTRY_INITIAL_SHARED_VERSION=1
```

- `GET /api/tokens/summary` → Reads coin metadata, supply, and counts the verification registry entries to feed the
  dashboard overview card.
- `POST /api/tokens/mint { amount, recipient }` → Calls `mint` with the configured `TreasuryCap` and returns the
  transaction digest.
- `POST /api/tokens/burn { coinId }` → Burns any CROZZ coin object that the backend signer currently owns.
- `POST /api/tokens/transfer { coinId, recipient }` → Uses the plain `transfer` entry point to distribute CROZZ owned by
  the signer to another address.
- `GET /api/admin/jobs` → (Requires `Authorization: Bearer ADMIN_TOKEN`) Returns up to 100 recent jobs so you can monitor
  queued/completed/failed states in the dashboard.

Each endpoint records a short audit log via `TransactionService` so the WebSocket/event feed can stay in sync with admin
operations.

#### Background transaction executor

- A new worker (`backend/src/services/TransactionExecutor.js`) wakes up every few seconds, dequeues pending jobs from
  `TransactionService`, builds the appropriate `TransactionBlock`, signs with the admin key, and submits to Sui.
- Enable it by copying `.env.example` → `.env` (backend root) and supplying:

  ```
  SUI_RPC_URL=https://fullnode.testnet.sui.io
  SUI_DEFAULT_GAS_BUDGET=10000000
  SUI_ADMIN_PRIVATE_KEY=ed25519:BASE64_KEY
  CROZZ_PACKAGE_ID=0xPACKAGE
  CROZZ_TREASURY_CAP_ID=0xTREASURY_CAP
  CROZZ_MODULE=crozz_token
  CROZZ_DEFAULT_SIGNER=0xADMIN (optional fallback recipient)
  CROZZ_EXECUTOR_DRY_RUN=false
  ```

- Set `CROZZ_EXECUTOR_DRY_RUN=true` to simulate execution without hitting the chain (handy for CI/local smoke tests). In
  dry-run mode, jobs are marked `completed` with a `mock: true` payload after validating inputs.
- When `SUI_ADMIN_PRIVATE_KEY` or object IDs are missing, the worker does **not** start and the server logs a warning so
  your queue stays untouched until the configuration is present.
- Job metadata now includes `status`, `attempts`, `error`, and `result` fields; failed jobs are automatically retried up
  to three times with exponential back-off before being marked `failed` for manual intervention.

#### Enable real transaction execution (beyond dry run)

1. **Collect on-chain artifacts** – publish your Move package, then note the `CROZZ_PACKAGE_ID`, `CROZZ_TREASURY_CAP_ID`, `CROZZ_ADMIN_CAP_ID`, shared registry/object IDs, and confirm they all live on the same network as your backend RPC URL.
2. **Fund a signing account** – export an Ed25519 private key from `sui keytool` (prefix with `ed25519:`) and keep it in a secrets manager. Make sure the account holds enough SUI for repeated mint/burn/distribute calls.
3. **Update backend `.env`** – set `CROZZ_EXECUTOR_DRY_RUN=false` plus the IDs above, `SUI_ADMIN_PRIVATE_KEY`, and (optionally) `CROZZ_DEFAULT_SIGNER` for fallback recipients. Restart the backend so `[tx-executor] Worker started with interval ...` appears in the logs.
4. **Test the loop** – queue a mint/burn/distribute job from the dashboard or API; watch `/api/admin/jobs` and the WebSocket feed progress from `queued → completed`, then verify the digest on Sui Explorer.
5. **Harden for production** – move secrets out of `.env`, add log aggregation/alerts for failed jobs, tune `SUI_DEFAULT_GAS_BUDGET`, and adjust the executor’s `pollInterval`/`maxAttempts` once you know typical load.

### Bash smoke test (macOS/Linux)

Prefer a lightweight sanity check from a Unix shell? Use the scripted flow in `scripts/test_crozz.sh`:

```
chmod +x scripts/test_crozz.sh
./scripts/test_crozz.sh
```

Update the placeholder IDs (package/admin/treasury/metadata/recipient) before running. The script executes the following sequence with a configurable `GAS_BUDGET`:

1. Mint 1,000 CROZZ to the supplied recipient via `mint`.
2. Refresh the icon URL through `update_icon_url`.
3. Freeze metadata with `freeze_metadata`.
4. Read back the icon URL using the `get_icon_url` view.
5. Retrieve the total supply by calling `get_total_supply`.

If any command fails, the script exits immediately (because `set -euo pipefail` is enabled), making it safe to wire into CI smoke checks.

### Integrate from frontend or SDKs

**Sui TypeScript SDK**

Install the official client in either the frontend or backend Vite/Node workspace (already declared inside `frontend/package.json`):

```
npm install @mysten/sui.js
```

Shared client helper:

```
// frontend/src/suiClient.ts
import { SuiClient } from "@mysten/sui.js/client";
import { getNetworkRpc } from "./utils/sui";

export const suiClient = new SuiClient({ url: getNetworkRpc() });
```

Configure the IDs the UI needs in `.env` (Vite automatically exposes `VITE_*` vars):

```
VITE_CROZZ_PACKAGE_ID=0xPACKAGE
VITE_CROZZ_METADATA_ID=0xMETADATA
VITE_CROZZ_MODULE=crozz_token
VITE_CROZZ_VIEW_FUNCTION=get_icon_url
VITE_CROZZ_GAS_BUDGET=10000000
```

Example component (`frontend/src/components/Dashboard/TokenAddress.tsx`) that reuses those values and issues a read call:

```
import { useState } from "react";
import { suiClient } from "../../suiClient";

const PACKAGE_ID = import.meta.env.VITE_CROZZ_PACKAGE_ID ?? "";
const METADATA_ID = import.meta.env.VITE_CROZZ_METADATA_ID ?? "";

export default function TokenAddress() {
	const [tokenAddress, setTokenAddress] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const fetchTokenAddress = async () => {
		setLoading(true);
		try {
			const response = await suiClient.call({
				packageObjectId: PACKAGE_ID,
				module: import.meta.env.VITE_CROZZ_MODULE ?? "crozz_token",
				function: import.meta.env.VITE_CROZZ_VIEW_FUNCTION ?? "get_icon_url",
				typeArguments: [],
				arguments: [METADATA_ID],
				gasBudget: Number(import.meta.env.VITE_CROZZ_GAS_BUDGET ?? 10_000_000),
			});
			setTokenAddress(response.txDigest);
		} catch (error) {
			console.error(error);
			setTokenAddress(null);
		} finally {
			setLoading(false);
		}
	};

	return (
		<button onClick={fetchTokenAddress} disabled={loading}>
			{loading ? "Loading..." : "Get Token Address"}
		</button>
	);
}
```

### Crozz integration roadmap (next steps)

Use this lightweight checklist to continue wiring the dashboard, backend, and Move contracts together:

1. **Transaction executor service** – Extend the backend with a worker (e.g., `TransactionExecutor`) that reads from `TransactionService.queue`, builds `TransactionBlock`s via `@mysten/sui.js`, signs them with an admin key (or forwards to a wallet), submits to Sui, and updates job records with status/digests. Include retry/backoff and structured logging. This unlocks real mint/burn/distribute execution beyond queueing.
2. **Wallet-integrated admin UI** – Replace the prompt-based `TokenActions` inputs with proper forms and leverage `@mysten/dapp-kit` so privileged flows can be signed directly in-wallet when desired. Add success/error toasts, optimistic updates to `useTokenData`, and integrate the new backend responses.
3. **Anti-bot + freeze controls** – Expose Move functions such as `verify_human`, `guarded_transfer`, `freeze_wallet`, and `toggle_global_freeze` via REST endpoints (with admin auth) and corresponding dashboard cards. Surface registry state, freeze status, and audit events to the live feed.
4. **Data + oracle integrations** – Finish collecting docs and wiring services for LayerZero messaging, Sui indexer APIs, Goldsky and Dune data sinks, Terraform/Dubhe infra-as-code, plus oracle price feeds (Pyth, Switchboard). Capture any missing references in `/docs/` so future contributors have a single knowledge base.
5. **Security + QA** – Add automated Move Prover checks, SuiSecBlockList validation, end-to-end smoke suites (CI job that runs backend/frontend tests), and environment provisioning scripts that hydrate `.env` files from a secrets manager. Use the new `.env.example` as the template for required variables across backend + Vite frontend.

Tracking these milestones alongside the existing APIs will ensure the CROZZ dashboard exercises every contract capability—minting, distribution, registry verification, and cross-chain data ingestion—while staying production ready.

Sample mint helper (executed after a wallet signs the transaction block):

```
import { TransactionBlock } from "@mysten/sui.js/transactions";
import type { WalletAccount } from "@mysten/wallet-standard";

export async function mintCrozz({
	wallet,
	treasuryCapId,
	amount,
	recipient,
	packageId,
}: {
	wallet: WalletAccount;
	treasuryCapId: string;
	amount: string | number;
	recipient: string;
	packageId: string;
}) {
	const tx = new TransactionBlock();
	const cap = tx.object(treasuryCapId);
	tx.moveCall({
		target: `${packageId}::crozz_token::mint`,
		arguments: [cap, tx.pure.u64(amount), tx.pure.address(recipient)],
	});
	return wallet.signAndExecuteTransactionBlock({ transactionBlock: tx });
}
```

The legacy docs link for the TypeScript SDK currently returns a 404, so start from [docs.sui.io](https://docs.sui.io/) → **Developers** to locate the latest SDK reference and API examples.

#### Built-in Sui dApp Kit wiring

- `frontend/src/main.tsx` now wraps the app with `SuiProviders`, which in turn layers `@tanstack/react-query`, `@mysten/dapp-kit`'s `SuiClientProvider`, and the wallet provider plus Radix UI themes + `react-hot-toast`.
- `frontend/src/networkConfig.ts` centralizes RPC + package IDs. Set `VITE_SUI_NETWORK` (defaults to `testnet`) or override the node URL with `VITE_SUI_RPC_URL` in `frontend/.env` to point at localnet or a gateway like Shinami.
- The `WalletConsole` dashboard card (under `frontend/src/components/Dashboard/WalletConsole.tsx`) shows the active wallet address and, once connected, lets you fetch the metadata object defined by `VITE_CROZZ_METADATA_ID` directly through the connected Sui client.

> Tip: The providers automatically pick up the same package/module/view env vars that `TokenAddress` and other helpers use, so you only define them once.

#### Job queue dashboard card

- `frontend/src/components/Dashboard/JobQueue.tsx` now consumes `useDashboardData`, so it shares the same polling cadence and cache as the rest of the dashboard. Manual refresh is available via the button on the card, and clicking a row opens a modal with payload/result JSON.
- Configure both backend `ADMIN_TOKEN` and frontend `VITE_CROZZ_ADMIN_TOKEN` with the same secret so the provider can send the required `Authorization: Bearer` header to `/api/admin/jobs`.
- When the admin token is missing, the provider returns a descriptive error which the card renders instead of repeatedly issuing unauthorized requests.

**Wallet integration**

- Support wallets such as Suiet, Ethos, or the Sui Wallet extension so end users can sign transactions you craft via the SDK.
- Within React, wire one of the wallet adapters (e.g., Sui Wallet Kit, Suiet Wallet Kit) so components can request signatures, read the active address, and pass the signer into helpers such as `mintCrozz`.

**Reading CROZZ data**

- Call the module's view functions (`get_icon_url`, `get_total_supply`) through `SuiClient` and render results in the dashboard (e.g., via `useTokenData`).
- For richer UX, subscribe to backend WebSocket events or poll `client.getObject` on the metadata/treasury IDs you care about.

**Backend-assisted reads**

- Use the `BackendTokenAddress` card inside the Vite app as a reference: it uses `axios` to POST to
  `http://localhost:4000/api/sui/token-address` and then renders the JSON response.
- This pattern is handy when you want the server to hold the signer or to gate access with middleware before calling
  Sui.

### Step-by-step React frontend integration (Sui dApp Kit)

If you prefer to scaffold a wallet-connected dApp (instead of the simple demo cards in `frontend/`), reuse the
official flow from the Sui docs ("Connect a frontend to a Move package"):

1. **Prereqs**
   - Move package already deployed (see the smart-contract folder or your own package).
   - Node.js + `pnpm` (or `npm`) installed.
   - A supported wallet (Slush, Sui Wallet, Ethos, etc.).

2. **Project layout** (example)

   ```
   sui-stack-app/
     move/
       hello-world/
     ui/
       src/
         App.tsx
         CreateGreeting.tsx
         Greeting.tsx
         constants.ts
         networkConfig.ts
         main.tsx
       package.json
       vite.config.mts
   ```

3. **Wire your package + network**

   ```ts
   // src/constants.ts
   export const TESTNET_HELLO_WORLD_PACKAGE_ID = '0xYOUR_PACKAGE_ID';

   // src/networkConfig.ts
   import { TESTNET_HELLO_WORLD_PACKAGE_ID } from './constants';

   export const networkConfig = {
     testnet: {
       url: 'https://fullnode.testnet.sui.io:443',
       packageId: TESTNET_HELLO_WORLD_PACKAGE_ID,
     },
   };
   ```

4. **Install dependencies**

   ```
   cd ui
   pnpm install
   ```

5. **Run the app**

   ```
   pnpm dev
   ```

6. **Connect wallet + interact**
   - Click "Connect Wallet" (the Sui dApp Kit ships Slush/Sui wallet connectors).
   - Fire entry functions (e.g., `create`, `update`) from the UI and approve in the wallet popup.

7. **Bootstrap entry point**

   ```tsx
   // src/main.tsx
   import '@mysten/dapp-kit/dist/index.css';
   import '@radix-ui/themes/styles.css';
   import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
   import { Theme } from '@radix-ui/themes';
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
   import { Toaster } from 'react-hot-toast';
   import App from './App';
   import { networkConfig } from './networkConfig';

   const queryClient = new QueryClient();

   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <Theme appearance="light">
         <QueryClientProvider client={queryClient}>
           <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
             <WalletProvider autoConnect>
               <>
                 <Toaster position="top-center" />
                 <App />
               </>
             </WalletProvider>
           </SuiClientProvider>
         </QueryClientProvider>
       </Theme>
     </React.StrictMode>
   );
   ```

8. **Call Move functions**

   Inside components such as `CreateGreeting.tsx`, use the dApp Kit hooks (e.g., `useSignAndExecuteTransactionBlock`) to
   build a transaction targeting your module and submit it through the connected wallet.

> References: [Sui Docs – App Frontends](https://docs.sui.io/guides/developer/app-frontends), Sui dApp Kit, Slush
> wallet.

### Branding assets

- The header now renders `/crozz-logo.png`, copied into `frontend/public`. Swap the file with any other PNG/SVG to rebrand the dashboard instantly (Vite serves anything under `public/` at the site root).
