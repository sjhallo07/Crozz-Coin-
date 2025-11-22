import { Dialog, Transition } from "@headlessui/react";
import { FormEvent, Fragment, useState } from "react";
import { toast } from "react-hot-toast";
import { useCrozzActions } from "../../hooks/useCrozzActions";
import Button from "../UI/Button";
import Card from "../UI/Card";

type AdminActionType =
  | "mint"
  | "mintToSelf"
  | "burn"
  | "freezeWallet"
  | "unfreezeWallet"
  | "globalFreeze"
  | "globalUnfreeze"
  | "updateName"
  | "updateSymbol"
  | "updateDescription"
  | "updateIconUrl"
  | "freezeMetadata";

interface AdminActionConfig {
  label: string;
  description: string;
  cta: string;
  variant: "primary" | "secondary" | "ghost";
  fields: {
    name: string;
    label: string;
    placeholder?: string;
    helper?: string;
    type?: "text" | "number" | "textarea" | "checkbox";
    required?: boolean;
  }[];
}

const ADMIN_ACTION_CONFIG: Record<AdminActionType, AdminActionConfig> = {
  mint: {
    label: "Mint tokens",
    description: "Create new CROZZ tokens to a specific address",
    cta: "Mint",
    variant: "primary",
    fields: [
      {
        name: "amount",
        label: "Amount",
        placeholder: "1000",
        helper: "Amount in base units (with decimals)",
        required: true,
      },
      {
        name: "recipient",
        label: "Recipient address",
        placeholder: "0x... (optional, defaults to your wallet)",
        helper: "Leave empty to mint to your own wallet",
      },
    ],
  },
  mintToSelf: {
    label: "Mint to self",
    description: "Create new CROZZ tokens to your own wallet",
    cta: "Mint to self",
    variant: "primary",
    fields: [
      {
        name: "amount",
        label: "Amount",
        placeholder: "1000",
        helper: "Amount in base units (with decimals)",
        required: true,
      },
    ],
  },
  burn: {
    label: "Burn tokens",
    description: "Permanently destroy CROZZ tokens",
    cta: "Burn",
    variant: "secondary",
    fields: [
      {
        name: "coinId",
        label: "Coin object ID",
        placeholder: "0x...",
        helper: "The coin object to burn",
        required: true,
      },
    ],
  },
  freezeWallet: {
    label: "Freeze wallet",
    description: "Freeze a specific wallet from interacting",
    cta: "Freeze",
    variant: "secondary",
    fields: [
      {
        name: "target",
        label: "Target address",
        placeholder: "0x...",
        helper: "Address to freeze",
        required: true,
      },
    ],
  },
  unfreezeWallet: {
    label: "Unfreeze wallet",
    description: "Unfreeze a previously frozen wallet",
    cta: "Unfreeze",
    variant: "secondary",
    fields: [
      {
        name: "target",
        label: "Target address",
        placeholder: "0x...",
        helper: "Address to unfreeze",
        required: true,
      },
    ],
  },
  globalFreeze: {
    label: "Global freeze",
    description: "Emergency halt of all token operations",
    cta: "Activate global freeze",
    variant: "secondary",
    fields: [],
  },
  globalUnfreeze: {
    label: "Global unfreeze",
    description: "Resume all token operations",
    cta: "Deactivate global freeze",
    variant: "primary",
    fields: [],
  },
  updateName: {
    label: "Update name",
    description: "Change the token name in metadata",
    cta: "Update",
    variant: "ghost",
    fields: [
      {
        name: "name",
        label: "New name",
        placeholder: "Crozz Coin",
        required: true,
      },
    ],
  },
  updateSymbol: {
    label: "Update symbol",
    description: "Change the token symbol in metadata",
    cta: "Update",
    variant: "ghost",
    fields: [
      {
        name: "symbol",
        label: "New symbol",
        placeholder: "CROZZ",
        helper: "ASCII string only",
        required: true,
      },
    ],
  },
  updateDescription: {
    label: "Update description",
    description: "Change the token description in metadata",
    cta: "Update",
    variant: "ghost",
    fields: [
      {
        name: "description",
        label: "New description",
        placeholder: "Official CROZZ Community Token",
        type: "textarea",
        required: true,
      },
    ],
  },
  updateIconUrl: {
    label: "Update icon URL",
    description: "Change the token icon URL in metadata",
    cta: "Update",
    variant: "ghost",
    fields: [
      {
        name: "iconUrl",
        label: "New icon URL",
        placeholder: "https://example.com/icon.png",
        required: true,
      },
    ],
  },
  freezeMetadata: {
    label: "Freeze metadata",
    description:
      "Permanently freeze metadata (irreversible - use with caution!)",
    cta: "Freeze metadata",
    variant: "secondary",
    fields: [],
  },
};

const AdminActions = () => {
  const {
    account,
    mintTokens,
    mintToSelf,
    burnTokens,
    setWalletFreeze,
    setGlobalFreeze,
    updateName,
    updateSymbol,
    updateDescription,
    updateIconUrl,
    freezeMetadata,
  } = useCrozzActions();

  const [activeAction, setActiveAction] = useState<AdminActionType | null>(
    null
  );
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openAction = (action: AdminActionType) => {
    setActiveAction(action);
    setFormValues({});
    setError(null);
  };

  const closeModal = () => {
    if (loading) return;
    setActiveAction(null);
    setFormValues({});
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeAction || !account) {
      setError("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;

      switch (activeAction) {
        case "mint":
          response = await mintTokens({
            amount: formValues.amount,
            recipient: formValues.recipient || undefined,
          });
          break;
        case "mintToSelf":
          response = await mintToSelf({ amount: formValues.amount });
          break;
        case "burn":
          response = await burnTokens({ coinId: formValues.coinId });
          break;
        case "freezeWallet":
          response = await setWalletFreeze({
            target: formValues.target,
            freeze: true,
          });
          break;
        case "unfreezeWallet":
          response = await setWalletFreeze({
            target: formValues.target,
            freeze: false,
          });
          break;
        case "globalFreeze":
          response = await setGlobalFreeze({ freeze: true });
          break;
        case "globalUnfreeze":
          response = await setGlobalFreeze({ freeze: false });
          break;
        case "updateName":
          response = await updateName({ name: formValues.name });
          break;
        case "updateSymbol":
          response = await updateSymbol({ symbol: formValues.symbol });
          break;
        case "updateDescription":
          response = await updateDescription({
            description: formValues.description,
          });
          break;
        case "updateIconUrl":
          response = await updateIconUrl({ iconUrl: formValues.iconUrl });
          break;
        case "freezeMetadata":
          response = await freezeMetadata();
          break;
      }

      toast.success(`${ADMIN_ACTION_CONFIG[activeAction].label} completed!`);
      closeModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: (typeof ADMIN_ACTION_CONFIG)[AdminActionType]["fields"][0]) => {
    const commonProps = {
      name: field.name,
      value: formValues[field.name] ?? "",
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) =>
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
      return <textarea rows={4} {...commonProps} />;
    }

    return <input type={field.type ?? "text"} {...commonProps} />;
  };

  const selectedConfig = activeAction
    ? ADMIN_ACTION_CONFIG[activeAction]
    : null;

  if (!account) {
    return (
      <Card
        title="Admin actions"
        description="Wallet-based admin operations for CROZZ token"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Please connect your wallet to access admin functions. You must hold
          the AdminCap or TreasuryCap to perform these operations.
        </p>
      </Card>
    );
  }

  return (
    <Card
      title="Admin actions"
      description="Wallet-based admin operations for CROZZ token"
    >
      <p className="text-sm text-slate-600 dark:text-slate-400">
        These actions use your connected wallet to interact with the smart
        contract. Make sure your wallet holds the required AdminCap or
        TreasuryCap objects.
      </p>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Minting & Burning
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Button
              variant="primary"
              onClick={() => openAction("mint")}
              disabled={loading}
            >
              Mint
            </Button>
            <Button
              variant="primary"
              onClick={() => openAction("mintToSelf")}
              disabled={loading}
            >
              Mint to Self
            </Button>
            <Button
              variant="secondary"
              onClick={() => openAction("burn")}
              disabled={loading}
            >
              Burn
            </Button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Freeze Controls
          </p>
          
          {/* Prominent Freeze All Wallets Button */}
          <div className="mb-4 rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-rose-900 dark:text-rose-200">
                  🛑 Freeze All Wallets for Sell
                </p>
                <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                  Emergency halt - prevents all token operations globally
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => openAction("globalFreeze")}
                disabled={loading}
                className="!bg-rose-600 !text-white hover:!bg-rose-700 dark:!bg-rose-700 dark:hover:!bg-rose-800"
              >
                Freeze All
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="secondary"
              onClick={() => openAction("freezeWallet")}
              disabled={loading}
            >
              Freeze Wallet
            </Button>
            <Button
              variant="secondary"
              onClick={() => openAction("unfreezeWallet")}
              disabled={loading}
            >
              Unfreeze Wallet
            </Button>
            <Button
              variant="primary"
              onClick={() => openAction("globalUnfreeze")}
              disabled={loading}
            >
              Global Unfreeze
            </Button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Metadata Updates
          </p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <Button
              variant="ghost"
              onClick={() => openAction("updateName")}
              disabled={loading}
            >
              Update Name
            </Button>
            <Button
              variant="ghost"
              onClick={() => openAction("updateSymbol")}
              disabled={loading}
            >
              Update Symbol
            </Button>
            <Button
              variant="ghost"
              onClick={() => openAction("updateDescription")}
              disabled={loading}
            >
              Update Description
            </Button>
            <Button
              variant="ghost"
              onClick={() => openAction("updateIconUrl")}
              disabled={loading}
            >
              Update Icon URL
            </Button>
            <Button
              variant="secondary"
              onClick={() => openAction("freezeMetadata")}
              disabled={loading}
            >
              Freeze Metadata
            </Button>
          </div>
        </div>
      </div>

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

                      {selectedConfig.fields.length > 0 && (
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
                      )}

                      {selectedConfig.fields.length === 0 && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          This action doesn't require any additional input.
                        </p>
                      )}

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
                          {loading ? "Processing…" : selectedConfig.cta}
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

export default AdminActions;
