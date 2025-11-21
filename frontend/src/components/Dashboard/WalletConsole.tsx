import {
  ConnectButton,
  useCurrentAccount,
  useSuiClient,
} from "@mysten/dapp-kit";
import { useState } from "react";
import Button from "../UI/Button";
import Card from "../UI/Card";

const metadataId = import.meta.env.VITE_CROZZ_METADATA_ID ?? "";

const WalletConsole = () => {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<string | null>(null);

  const handleInspectMetadata = async () => {
    if (!metadataId) {
      setError("Set VITE_CROZZ_METADATA_ID in your frontend .env first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await suiClient.getObject({
        id: metadataId,
        options: { showContent: true, showDisplay: true },
      });

      setPayload(
        JSON.stringify(
          {
            id: result.data?.objectId,
            digest: result.data?.digest,
            display: result.data?.display?.data,
            fields:
              result.data?.content?.dataType === "moveObject"
                ? result.data.content.fields
                : undefined,
          },
          null,
          2
        )
      );
    } catch (err) {
      setPayload(null);
      setError(err instanceof Error ? err.message : "Failed to read metadata");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Wallet console"
      description="Connect an admin wallet to inspect CROZZ metadata objects directly."
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
            <ConnectButton />
            {account ? (
              <p>
                Connected as
                <span className="ml-2 font-mono text-xs text-slate-900 dark:text-white">
                  {account.address}
                </span>
              </p>
            ) : (
              <p>Connect a wallet to run Sui calls.</p>
            )}
          </div>
        </div>

        <Button
          onClick={handleInspectMetadata}
          disabled={!account || loading}
          variant="secondary"
        >
          {loading ? "Fetching on-chain data…" : "Read metadata object"}
        </Button>

        {error && (
          <p className="text-sm font-semibold text-rose-500 dark:text-rose-400">
            {error}
          </p>
        )}
        {payload && (
          <pre className="max-h-72 overflow-auto rounded-2xl border border-slate-200/70 bg-slate-950/90 p-4 text-xs text-emerald-200 dark:border-slate-800">
            {payload}
          </pre>
        )}
      </div>
    </Card>
  );
};

export default WalletConsole;
