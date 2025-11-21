import { useState } from "react";
import { suiClient } from "../../suiClient";
import Button from "../UI/Button";
import Card from "../UI/Card";

const PACKAGE_ID = import.meta.env.VITE_CROZZ_PACKAGE_ID ?? "";
const MODULE = import.meta.env.VITE_CROZZ_MODULE ?? "crozz_token";
const VIEW_FUNCTION =
  import.meta.env.VITE_CROZZ_VIEW_FUNCTION ?? "get_icon_url";
const METADATA_ID = import.meta.env.VITE_CROZZ_METADATA_ID ?? "";
const GAS_BUDGET = Number(import.meta.env.VITE_CROZZ_GAS_BUDGET ?? 10_000_000);

const TokenAddress = () => {
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenAddress = async () => {
    if (!PACKAGE_ID || !METADATA_ID) {
      setError(
        "Set VITE_CROZZ_PACKAGE_ID and VITE_CROZZ_METADATA_ID in your .env first."
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      type MoveCallResponse = {
        results?: unknown[];
        effects?: {
          events?: Array<{ parsedJson?: unknown }>;
        };
        txDigest?: string;
      };

      const response = await suiClient.call<MoveCallResponse>(
        "unsafe_moveCall",
        [
          {
            packageObjectId: PACKAGE_ID,
            module: MODULE,
            function: VIEW_FUNCTION,
            typeArguments: [],
            arguments: [METADATA_ID],
            gasBudget: GAS_BUDGET,
          },
        ]
      );

      const humanReadable = response.results?.length
        ? JSON.stringify(response.results, null, 2)
        : response.effects?.events?.[0]?.parsedJson
        ? JSON.stringify(response.effects.events[0].parsedJson, null, 2)
        : response.txDigest ?? "Call completed";
      setTokenAddress(
        typeof humanReadable === "string"
          ? humanReadable
          : JSON.stringify(humanReadable)
      );
    } catch (err) {
      console.error(err);
      setError("Unable to fetch token data. Check console for details.");
      setTokenAddress(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Token Address Lookup">
      <p className="text-sm text-muted">
        Calls `{VIEW_FUNCTION}` on your deployed Move module using the
        configured IDs and displays the response digest.
      </p>
      <Button onClick={fetchTokenAddress} disabled={isLoading}>
        {isLoading ? "Loading…" : "Get Token Address"}
      </Button>
      {tokenAddress && (
        <div className="token-address-result">
          <strong>Result:</strong> {tokenAddress}
        </div>
      )}
      {error && <p className="error">{error}</p>}
    </Card>
  );
};

export default TokenAddress;
