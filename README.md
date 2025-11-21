# Crozz-Coin

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

| Task | What it does |
| --- | --- |
| `Sui: Move build` | Runs `sui move build` against the package path you supply. |
| `Sui: Move test` | Executes `sui move test` for the selected package. |
| `Sui: Publish package` | Publishes a Move package via `sui client publish`, prompting for gas budget. |
| `Sui: Call Move function` | Invokes any module/function combo through `sui client call`. |

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
- **Backend**: Express API plus WebSocket broadcaster for live event feeds. Use `npm install && npm run dev` inside `backend/` to spin it up.
- **Smart contract**: Minimal Move package that exposes a `crozz_token` module. Point the address in `Move.toml` to your published account before deployment.
- **Configuration**: `.env` centralizes shared secrets (admin tokens, RPC URLs, keys) and `docker-compose.yml` wires frontend + backend containers for local orchestration.

> Reminder: replace the placeholder secrets in `.env` before deploying anywhere outside of a local/devnet environment.

### Run everything with Docker (optional)

```
docker compose up --build
```

This will build both images and expose the backend on `localhost:4000` and the Vite dev server on `localhost:5173` with hot reload.

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
