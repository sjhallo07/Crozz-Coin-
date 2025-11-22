import { Dialog, Transition } from "@headlessui/react";
import { ChangeEvent, FormEvent, Fragment, useState } from "react";
import { humanizeError, getSuccessMessage } from "../../utils/humanize";
import Button from "../UI/Button";
import Card from "../UI/Card";

const API_BASE =
  import.meta.env.VITE_CROZZ_API_BASE_URL ?? "http://localhost:4000";

type ActionType = "mint" | "burn" | "distribute";

interface FieldConfig {
  name: string;
  label: string;
  placeholder?: string;
  helper?: string;
  type?: "text" | "number" | "textarea";
  required?: boolean;
  defaultValue?: string;
}

const ACTION_CONFIG: Record<
  ActionType,
  {
    label: string;
    description: string;
    cta: string;
    variant: "primary" | "secondary" | "ghost";
    fields: FieldConfig[];
  }
> = {
  mint: {
    label: "Mint tokens",
    description: "Create CROZZ directly from the treasury cap.",
    cta: "Mint tokens",
    variant: "primary",
    fields: [
      {
        name: "amount",
        label: "Amount",
        placeholder: "1000",
        helper: "Whole-number CROZZ amount to mint",
        required: true,
      },
      {
        name: "recipient",
        label: "Recipient address",
        placeholder: "0xabc… (optional)",
        helper: "Defaults to the backend signer if left blank.",
      },
    ],
  },
  burn: {
    label: "Burn coins",
    description: "Destroy CROZZ coins currently owned by the backend signer.",
    cta: "Burn coin",
    variant: "secondary",
    fields: [
      {
        name: "coinId",
        label: "Coin object ID",
        placeholder: "0xcoin",
        helper: "Coin must belong to the backend signer",
        required: true,
      },
    ],
  },
  distribute: {
    label: "Distribute",
    description:
      "Upload bulk payouts as address:amount pairs. We'll call the multi-transfer helper for you.",
    cta: "Queue distribution",
    variant: "ghost",
    fields: [
      {
        name: "entries",
        label: "Distribution list",
        placeholder: "0xabc:100\n0xdef:250",
        helper:
          "One pair per line in the format address:amount. Commas also work.",
        required: true,
        type: "textarea",
      },
    ],
  },
};

const TokenActions = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const post = async (path: string, body: unknown) => {
    setLoading(true);
    setResult(null);
    setError(null);
    let success = false;

    try {
      const res = await fetch(`${API_BASE}/api/tokens/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Request failed");
      }

      // Show user-friendly success message
      const successMsg = data.message || getSuccessMessage(path);
      setResult(successMsg);
      success = true;
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setLoading(false);
    }

    return success;
  };

  const openAction = (action: ActionType) => {
    const defaults = ACTION_CONFIG[action].fields.reduce<
      Record<string, string>
    >((acc, field) => {
      acc[field.name] = field.defaultValue ?? "";
      return acc;
    }, {});
    setFormValues(defaults);
    setActiveAction(action);
  };

  const closeModal = () => {
    if (loading) return;
    setActiveAction(null);
    setFormValues({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeAction) return;

    let success = false;

    if (activeAction === "mint") {
      const amount = formValues.amount?.trim();
      if (!amount) {
        setError("Amount is required");
        return;
      }
      success = await post("mint", {
        amount,
        recipient: formValues.recipient?.trim() || undefined,
      });
    }

    if (activeAction === "burn") {
      const coinId = formValues.coinId?.trim();
      if (!coinId) {
        setError("Coin ID is required");
        return;
      }
      success = await post("burn", { coinId });
    }

    if (activeAction === "distribute") {
      const rawEntries = formValues.entries?.trim();
      if (!rawEntries) {
        setError("Provide at least one distribution entry");
        return;
      }

      try {
        const distributions = rawEntries
          .split(/\n|,/)
          .map((entry) => entry.trim())
          .filter(Boolean)
          .map((entry) => {
            const [to, amount] = entry.split(":").map((value) => value.trim());
            if (!to || !amount) {
              throw new Error("Invalid entry");
            }
            return { to, amount };
          });

        success = await post("distribute", { distributions });
      } catch {
        setError("Invalid distribution format. Use address:amount per line.");
        return;
      }
    }

    if (success) {
      closeModal();
    }
  };

  const renderField = (field: FieldConfig) => {
    const commonProps = {
      name: field.name,
      value: formValues[field.name] ?? "",
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setFormValues((prev) => ({
          ...prev,
          [field.name]: event.target.value,
        })),
      placeholder: field.placeholder,
      required: field.required,
      className:
        "w-full rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-2.5 text-sm text-slate-900 shadow-inner focus:border-brand-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-white",
    };

    if (field.type === "textarea") {
      return <textarea rows={5} {...commonProps} />;
    }

    return <input type={field.type ?? "text"} {...commonProps} />;
  };

  const selectedConfig = activeAction ? ACTION_CONFIG[activeAction] : null;

  return (
    <Card
      title="Admin token controls"
      description="Run mint, burn, or distribution flows via the secured backend."
    >
      <p className="text-sm text-slate-600 dark:text-slate-400">
        These actions call the authenticated Express API. Every request is
        logged to the job queue and broadcast to the live feed.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {Object.entries(ACTION_CONFIG).map(([action, config]) => (
          <Button
            key={action}
            variant={config.variant}
            onClick={() => openAction(action as ActionType)}
            disabled={loading}
          >
            {config.label}
          </Button>
        ))}
      </div>

      {result && (
        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-4 dark:border-emerald-500/40 dark:bg-emerald-500/10">
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            ✅ Success!
          </p>
          <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
            {result}
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30">
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
            ❌ Error
          </p>
          <p className="mt-2 text-sm text-rose-700 dark:text-rose-300">
            {error}
          </p>
        </div>
      )}

      <Transition appear show={Boolean(activeAction)} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 py-8">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 translate-y-4"
                enterTo="opacity-100 translate-y-0"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-4"
              >
                <Dialog.Panel className="w-full max-w-lg transform rounded-3xl border border-white/20 bg-white/95 p-6 text-left align-middle shadow-2xl transition-all dark:border-slate-800/80 dark:bg-slate-900/95">
                  {selectedConfig && (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div>
                        <Dialog.Title className="text-xl font-semibold text-slate-900 dark:text-white">
                          {selectedConfig.label}
                        </Dialog.Title>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          {selectedConfig.description}
                        </p>
                      </div>

                      <div className="space-y-4">
                        {selectedConfig.fields.map((field) => (
                          <label
                            key={field.name}
                            className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
                          >
                            {field.label}
                            {renderField(field)}
                            {field.helper && (
                              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                                {field.helper}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>

                      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          className="sm:w-auto"
                          onClick={closeModal}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant={selectedConfig.variant}
                          className="sm:w-auto"
                          disabled={loading}
                        >
                          {loading ? "Sending…" : selectedConfig.cta}
                        </Button>
                      </div>
                    </form>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Card>
  );
};

export default TokenActions;
