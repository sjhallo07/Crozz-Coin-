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
    <Card
      title="On-chain token lookup"
      description={`Calls ${VIEW_FUNCTION} inside ${MODULE} using your configured IDs.`}
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Useful for smoke-testing a freshly published package. Requires
          `VITE_CROZZ_PACKAGE_ID`, `VITE_CROZZ_METADATA_ID`, and
          `VITE_CROZZ_GAS_BUDGET`.
        </p>
        <Button onClick={fetchTokenAddress} disabled={isLoading}>
          {isLoading ? "Running Move call…" : "Fetch token data"}
        </Button>

        {tokenAddress && (
          <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 text-xs font-mono text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
            <p className="mb-2 font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
              Response
            </p>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap">
              <code>{tokenAddress}</code>
            </pre>
          </div>
        )}
        {error && (
          <p className="text-sm font-semibold text-rose-500 dark:text-rose-400">
            {error}
          </p>
        )}
      </div>
    </Card>
  );
};

export default TokenAddress;
