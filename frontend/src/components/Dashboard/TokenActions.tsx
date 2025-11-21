import { useState } from "react";
import Button from "../UI/Button";

const API_BASE =
  import.meta.env.VITE_CROZZ_API_BASE_URL ?? "http://localhost:4000";

const TokenActions = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const post = async (path: string, body: unknown) => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/tokens/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? JSON.stringify(data));
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    const amount = window.prompt("Enter amount to mint (e.g. 1000)");
    const recipient = window.prompt("Recipient address (optional)");
    if (!amount) return;
    await post("mint", { amount, recipient });
  };

  const handleBurn = async () => {
    const coinId = window.prompt("Enter the CROZZ coin object ID to burn");
    if (!coinId) return;
    await post("burn", { coinId });
  };

  const handleDistribute = async () => {
    const csv = window.prompt(
      "Enter distributions as CSV: address1:amount1,address2:amount2"
    );
    if (!csv) return;
    try {
      const distributions = csv.split(",").map((entry) => {
        const [to, amt] = entry.split(":").map((s) => s.trim());
        return { to, amount: amt };
      });
      await post("distribute", { distributions });
    } catch (err) {
      setError("Invalid distribution format");
    }
  };

  return (
    <div className="token-actions">
      <Button onClick={handleMint} disabled={loading}>
        {loading ? "Processing…" : "Mint"}
      </Button>
      <Button variant="secondary" onClick={handleBurn} disabled={loading}>
        Burn
      </Button>
      <Button variant="ghost" onClick={handleDistribute} disabled={loading}>
        Distribute
      </Button>

      {result && (
        <pre className="result-block">
          <code>{result}</code>
        </pre>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default TokenActions;
