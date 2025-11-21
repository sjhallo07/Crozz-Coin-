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
    <Card title="Wallet Console">
      <div className="wallet-console">
        <div className="wallet-console__header">
          <ConnectButton />
          {account ? (
            <p className="wallet-console__status">
              Connected as <span>{account.address}</span>
            </p>
          ) : (
            <p className="wallet-console__status">
              Connect a wallet to run Sui calls.
            </p>
          )}
        </div>

        <Button
          onClick={handleInspectMetadata}
          disabled={!account || loading}
          variant="secondary"
        >
          {loading ? "Fetching on-chain data…" : "Read metadata object"}
        </Button>

        {error && <p className="wallet-console__error">{error}</p>}
        {payload && <pre className="wallet-console__payload">{payload}</pre>}
      </div>
    </Card>
  );
};

export default WalletConsole;
