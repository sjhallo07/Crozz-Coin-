import { FormEvent, useState } from "react";
import { toast } from "react-hot-toast";
import { useCrozzActions } from "../../hooks/useCrozzActions";
import Button from "../UI/Button";
import Card from "../UI/Card";

const UserActions = () => {
  const { account, verifyHuman, interact, guardedTransfer, transfer } =
    useCrozzActions();

  const [verifyForm, setVerifyForm] = useState({
    signature: "",
    publicKey: "",
    message: "",
  });
  const [guardedForm, setGuardedForm] = useState({
    coinId: "",
    recipient: "",
  });
  const [transferForm, setTransferForm] = useState({
    coinId: "",
    recipient: "",
  });
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    if (!account) {
      setError("Connect your wallet first");
      return;
    }
    setBusyAction(label);
    setResult(null);
    setError(null);
    try {
      const response = await action();
      setResult(JSON.stringify(response, null, 2));
      toast.success(`${label} submitted`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      toast.error(message);
    } finally {
      setBusyAction(null);
    }
  };

  const onVerify = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction("Verification", () => verifyHuman(verifyForm));
  };

  const onInteract = () => {
    void runAction("Interact", () => interact());
  };

  const onGuardedTransfer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction("Guarded transfer", () => guardedTransfer(guardedForm));
  };

  const onTransfer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runAction("Transfer", () => transfer(transferForm));
  };

  return (
    <Card
      title="User actions"
      description="Run anti-bot verification, interact with the registry, and perform CROZZ transfers directly from your wallet."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-3" onSubmit={onVerify}>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">
            Verify as human
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Paste the signature payload you received from the backend oracle.
          </p>
          <textarea
            className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
            placeholder="Signature (hex or base64)"
            required
            value={verifyForm.signature}
            onChange={(event) =>
              setVerifyForm((prev) => ({
                ...prev,
                signature: event.target.value,
              }))
            }
            rows={3}
          />
          <textarea
            className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
            placeholder="Public key"
            required
            value={verifyForm.publicKey}
            onChange={(event) =>
              setVerifyForm((prev) => ({
                ...prev,
                publicKey: event.target.value,
              }))
            }
            rows={2}
          />
          <textarea
            className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
            placeholder="Message"
            required
            value={verifyForm.message}
            onChange={(event) =>
              setVerifyForm((prev) => ({
                ...prev,
                message: event.target.value,
              }))
            }
            rows={2}
          />
          <Button type="submit" disabled={busyAction !== null}>
            {busyAction === "Verification" ? "Submitting…" : "Verify"}
          </Button>
        </form>

        <div className="space-y-4 rounded-2xl border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800/70 dark:bg-slate-900/40">
          <p className="text-sm font-semibold">Registry interaction</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            After completing verification you must interact within five minutes
            to unlock guarded transfers.
          </p>
          <Button onClick={onInteract} disabled={busyAction !== null}>
            {busyAction === "Interact" ? "Calling…" : "Interact"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-3" onSubmit={onGuardedTransfer}>
          <p className="text-sm font-semibold">Guarded transfer</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Requires a verified session and sends CROZZ with anti-bot
            protections.
          </p>
          <input
            className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
            placeholder="Coin object ID"
            required
            value={guardedForm.coinId}
            onChange={(event) =>
              setGuardedForm((prev) => ({
                ...prev,
                coinId: event.target.value,
              }))
            }
          />
          <input
            className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
            placeholder="Recipient address"
            required
            value={guardedForm.recipient}
            onChange={(event) =>
              setGuardedForm((prev) => ({
                ...prev,
                recipient: event.target.value,
              }))
            }
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={busyAction !== null}
          >
            {busyAction === "Guarded transfer"
              ? "Submitting…"
              : "Send guarded transfer"}
          </Button>
        </form>

        <form className="space-y-3" onSubmit={onTransfer}>
          <p className="text-sm font-semibold">Standard transfer</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Uses the open transfer helper (no anti-bot gating).
          </p>
          <input
            className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
            placeholder="Coin object ID"
            required
            value={transferForm.coinId}
            onChange={(event) =>
              setTransferForm((prev) => ({
                ...prev,
                coinId: event.target.value,
              }))
            }
          />
          <input
            className="w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
            placeholder="Recipient address"
            required
            value={transferForm.recipient}
            onChange={(event) =>
              setTransferForm((prev) => ({
                ...prev,
                recipient: event.target.value,
              }))
            }
          />
          <Button type="submit" variant="ghost" disabled={busyAction !== null}>
            {busyAction === "Transfer" ? "Submitting…" : "Send transfer"}
          </Button>
        </form>
      </div>

      {result && (
        <pre className="max-h-64 overflow-auto rounded-2xl border border-slate-200/70 bg-slate-950/80 p-4 text-xs text-emerald-200 dark:border-slate-800">
          {result}
        </pre>
      )}

      {error && (
        <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </Card>
  );
};

export default UserActions;
