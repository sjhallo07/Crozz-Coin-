import axios from "axios";
import type { ChangeEvent } from "react";
import { useState } from "react";
import Button from "../UI/Button";
import Card from "../UI/Card";

const initialForm = {
  packageId: import.meta.env.VITE_CROZZ_PACKAGE_ID ?? "",
  module: import.meta.env.VITE_CROZZ_MODULE ?? "crozz_token",
  functionName: import.meta.env.VITE_CROZZ_VIEW_FUNCTION ?? "get_icon_url",
  creator: "",
  collection: "",
  name: "",
};

const BackendTokenAddress = () => {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const fetchFromBackend = async () => {
    if (!form.packageId || !form.module || !form.functionName) {
      setError("packageId, module, and functionName are required");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post("http://localhost:4000/api/sui/token-address", {
        packageId: form.packageId,
        module: form.module,
        functionName: form.functionName,
        creator: form.creator,
        collection: form.collection,
        name: form.name,
      });
      setResult(JSON.stringify(response.data.tokenAddress, null, 2));
    } catch (err) {
      console.error(err);
      setError("Backend request failed. Check server logs for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Backend token lookup">
      <p className="text-sm text-muted">
        Sends a POST request to the Express backend (`/api/sui/token-address`), which in turn calls your Move module via
        the Sui TypeScript SDK.
      </p>
      <div className="form-grid">
        <label>
          Package ID
          <input name="packageId" value={form.packageId} onChange={handleChange} placeholder="0x..." />
        </label>
        <label>
          Module
          <input name="module" value={form.module} onChange={handleChange} />
        </label>
        <label>
          Function
          <input name="functionName" value={form.functionName} onChange={handleChange} />
        </label>
        <label>
          Creator
          <input name="creator" value={form.creator} onChange={handleChange} placeholder="Optional" />
        </label>
        <label>
          Collection
          <input name="collection" value={form.collection} onChange={handleChange} placeholder="Optional" />
        </label>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} placeholder="Optional" />
        </label>
      </div>
      <Button onClick={fetchFromBackend} disabled={loading}>
        {loading ? "Calling backend…" : "Request token address via backend"}
      </Button>
      {result && (
        <pre className="result-block">
          <code>{result}</code>
        </pre>
      )}
      {error && <p className="error">{error}</p>}
    </Card>
  );
};

export default BackendTokenAddress;
