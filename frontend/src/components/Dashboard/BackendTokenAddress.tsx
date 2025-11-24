import axios from 'axios';
import { type ChangeEvent, FormEvent, useState } from 'react';
import Button from '../UI/Button';
import Card from '../UI/Card';

interface BackendFormState {
  packageId: string;
  module: string;
  functionName: string;
  creator: string;
  collection: string;
  name: string;
}

const initialForm: BackendFormState = {
  packageId: import.meta.env.VITE_CROZZ_PACKAGE_ID ?? '',
  module: import.meta.env.VITE_CROZZ_MODULE ?? 'crozz_token',
  functionName: import.meta.env.VITE_CROZZ_VIEW_FUNCTION ?? 'get_icon_url',
  creator: '',
  collection: '',
  name: '',
};

const API_BASE_URL = import.meta.env.VITE_CROZZ_API_BASE_URL ?? 'http://localhost:4000';

const inputClass =
  'mt-1 block w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2.5 text-sm text-slate-900 shadow-inner focus:border-brand-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-white';

const BackendTokenAddress = () => {
  const [form, setForm] = useState<BackendFormState>(initialForm);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.packageId || !form.module || !form.functionName) {
      setError('packageId, module, and functionName are required');
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/sui/token-address`, {
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
      setError('Backend request failed. Check server logs for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="Backend proxy lookup"
      description="Routes through Express → Sui SDK so browsers stay unprivileged."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Package ID
            <input
              name="packageId"
              value={form.packageId}
              onChange={handleChange}
              placeholder="0x..."
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Module
            <input
              name="module"
              value={form.module}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Function
            <input
              name="functionName"
              value={form.functionName}
              onChange={handleChange}
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Creator
            <input
              name="creator"
              value={form.creator}
              onChange={handleChange}
              placeholder="Optional"
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Collection
            <input
              name="collection"
              value={form.collection}
              onChange={handleChange}
              placeholder="Optional"
              className={inputClass}
            />
          </label>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Optional"
              className={inputClass}
            />
          </label>
        </div>

        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Calling backend…' : 'Request via backend'}
          </Button>

          {result && (
            <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-xs font-mono text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
              <p className="mb-2 font-semibold uppercase tracking-wider text-[11px] text-slate-500 dark:text-slate-400">
                Response
              </p>
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap">
                <code>{result}</code>
              </pre>
            </div>
          )}
          {error && (
            <p className="text-sm font-semibold text-rose-500 dark:text-rose-400">{error}</p>
          )}
        </div>
      </form>
    </Card>
  );
};

export default BackendTokenAddress;
