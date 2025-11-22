import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useCallback } from "react";
import { useNetworkVariable } from "../networkConfig";

const gasBudget = Number(import.meta.env.VITE_CROZZ_GAS_BUDGET ?? 10_000_000);
const moduleName = import.meta.env.VITE_CROZZ_MODULE ?? "crozz_token";
const registryId = import.meta.env.VITE_CROZZ_REGISTRY_ID ?? "";
const clockObjectId = import.meta.env.VITE_SUI_CLOCK_OBJECT ?? "0x6";
const treasuryCapId = import.meta.env.VITE_CROZZ_TREASURY_CAP_ID ?? "";
const adminCapId = import.meta.env.VITE_CROZZ_ADMIN_CAP_ID ?? "";

const toBytes = (value: string) => {
  if (!value) return new Uint8Array();
  const normalized = value.trim();
  if (normalized.startsWith("0x")) {
    const hex = normalized.slice(2);
    const pairs = hex.match(/.{1,2}/g) ?? [];
    return Uint8Array.from(pairs.map((pair) => parseInt(pair, 16)));
  }
  try {
    return Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0));
  } catch {
    return new TextEncoder().encode(normalized);
  }
};

export const useCrozzActions = () => {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const packageId = useNetworkVariable("crozzPackageId");
  const metadataId = useNetworkVariable("crozzMetadataId");
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const ensureWallet = () => {
    if (!account) {
      throw new Error("Connect a wallet first");
    }
  };

  const runTx = useCallback(
    async (build: (tx: Transaction) => void) => {
      ensureWallet();
      if (!packageId) throw new Error("Set VITE_CROZZ_PACKAGE_ID first");
      const tx = new Transaction();
      tx.setGasBudget(gasBudget);
      build(tx);
      const response = await signAndExecute({
        transaction: tx,
      });
      await suiClient.waitForTransaction({ digest: response.digest });
      return response;
    },
    [account, packageId, signAndExecute, suiClient]
  );

  const verifyHuman = useCallback(
    async ({
      signature,
      publicKey,
      message,
    }: {
      signature: string;
      publicKey: string;
      message: string;
    }) => {
      if (!registryId) {
        throw new Error("Set VITE_CROZZ_REGISTRY_ID to run verification");
      }
      return runTx((tx) => {
        tx.moveCall({
          target: `${packageId}::${moduleName}::verify_human`,
          arguments: [
            tx.object(registryId),
            tx.pure(toBytes(signature)),
            tx.pure(toBytes(publicKey)),
            tx.pure(toBytes(message)),
          ],
        });
      });
    },
    [packageId, runTx]
  );

  const interact = useCallback(async () => {
    if (!registryId) {
      throw new Error("Set VITE_CROZZ_REGISTRY_ID");
    }
    return runTx((tx) => {
      tx.moveCall({
        target: `${packageId}::${moduleName}::interact`,
        arguments: [tx.object(registryId), tx.object(clockObjectId)],
      });
    });
  }, [packageId, runTx]);

  const guardedTransfer = useCallback(
    async ({ coinId, recipient }: { coinId: string; recipient: string }) => {
      if (!registryId) {
        throw new Error("Set VITE_CROZZ_REGISTRY_ID");
      }
      return runTx((tx) => {
        tx.moveCall({
          target: `${packageId}::${moduleName}::guarded_transfer`,
          arguments: [
            tx.object(coinId),
            tx.pure.address(recipient),
            tx.object(registryId),
            tx.object(clockObjectId),
          ],
        });
      });
    },
    [packageId, runTx]
  );

  const transfer = useCallback(
    async ({ coinId, recipient }: { coinId: string; recipient: string }) => {
      return runTx((tx) => {
        tx.moveCall({
          target: `${packageId}::${moduleName}::transfer`,
          arguments: [tx.object(coinId), tx.pure.address(recipient)],
        });
      });
    },
    [packageId, runTx]
  );

  const readMetadata = useCallback(async () => {
    if (!metadataId) {
      throw new Error("Set VITE_CROZZ_METADATA_ID");
    }
    const object = await suiClient.getObject({
      id: metadataId,
      options: { showContent: true },
    });
    const fields =
      object.data?.content?.dataType === "moveObject"
        ? (object.data.content.fields as Record<string, unknown>)
        : {};
    return fields;
  }, [metadataId, suiClient]);

  const getBalance = useCallback(
    async (coinId: string) => {
      const object = await suiClient.getObject({
        id: coinId,
        options: { showContent: true },
      });
      const fields =
        object.data?.content?.dataType === "moveObject"
          ? (object.data.content.fields as Record<string, unknown>)
          : {};
      return fields.balance ?? null;
    },
    [suiClient]
  );

  // Admin actions
  const mintTokens = useCallback(
    async ({ amount, recipient }: { amount: string; recipient?: string }) => {
      if (!treasuryCapId) {
        throw new Error("Set VITE_CROZZ_TREASURY_CAP_ID");
      }
      return runTx((tx) => {
        const targetRecipient = recipient || account?.address;
        if (!targetRecipient) {
          throw new Error("No recipient specified");
        }
        tx.moveCall({
          target: `${packageId}::${moduleName}::mint`,
          arguments: [
            tx.object(treasuryCapId),
            tx.pure.u64(amount),
            tx.pure.address(targetRecipient),
          ],
        });
      });
    },
    [packageId, runTx, account]
  );

  const mintToSelf = useCallback(
    async ({ amount }: { amount: string }) => {
      if (!treasuryCapId) {
        throw new Error("Set VITE_CROZZ_TREASURY_CAP_ID");
      }
      return runTx((tx) => {
        tx.moveCall({
          target: `${packageId}::${moduleName}::mint_to_self`,
          arguments: [tx.object(treasuryCapId), tx.pure.u64(amount)],
        });
      });
    },
    [packageId, runTx]
  );

  const burnTokens = useCallback(
    async ({ coinId }: { coinId: string }) => {
      if (!treasuryCapId) {
        throw new Error("Set VITE_CROZZ_TREASURY_CAP_ID");
      }
      return runTx((tx) => {
        tx.moveCall({
          target: `${packageId}::${moduleName}::burn`,
          arguments: [tx.object(treasuryCapId), tx.object(coinId)],
        });
      });
    },
    [packageId, runTx]
  );

  const setWalletFreeze = useCallback(
    async ({
      target,
      freeze,
    }: {
      target: string;
      freeze: boolean;
    }) => {
      if (!adminCapId) {
        throw new Error("Set VITE_CROZZ_ADMIN_CAP_ID");
      }
      if (!registryId) {
        throw new Error("Set VITE_CROZZ_REGISTRY_ID");
      }
      return runTx((tx) => {
        tx.moveCall({
          target: `${packageId}::${moduleName}::set_wallet_freeze`,
          arguments: [
            tx.object(adminCapId),
            tx.object(registryId),
            tx.pure.address(target),
            tx.pure.bool(freeze),
          ],
        });
      });
    },
    [packageId, runTx]
  );

  const setGlobalFreeze = useCallback(
    async ({ freeze }: { freeze: boolean }) => {
      if (!adminCapId) {
        throw new Error("Set VITE_CROZZ_ADMIN_CAP_ID");
      }
      if (!registryId) {
        throw new Error("Set VITE_CROZZ_REGISTRY_ID");
      }
      return runTx((tx) => {
        tx.moveCall({
          target: `${packageId}::${moduleName}::set_global_freeze`,
          arguments: [
            tx.object(adminCapId),
            tx.object(registryId),
            tx.pure.bool(freeze),
          ],
        });
      });
    },
    [packageId, runTx]
  );

  const updateName = useCallback(
    async ({ name }: { name: string }) => {
      if (!adminCapId) {
        throw new Error("Set VITE_CROZZ_ADMIN_CAP_ID");
      }
      if (!treasuryCapId) {
        throw new Error("Set VITE_CROZZ_TREASURY_CAP_ID");
      }
      if (!metadataId) {
        throw new Error("Set VITE_CROZZ_METADATA_ID");
      }
      return runTx((tx) => {
        tx.moveCall({
          target: `${packageId}::${moduleName}::update_name`,
          arguments: [
            tx.object(adminCapId),
            tx.object(treasuryCapId),
            tx.object(metadataId),
            tx.pure.string(name),
          ],
        });
      });
    },
    [packageId, runTx]
  );

  const updateSymbol = useCallback(
    async ({ symbol }: { symbol: string }) => {
      if (!adminCapId) {
        throw new Error("Set VITE_CROZZ_ADMIN_CAP_ID");
      }
      if (!treasuryCapId) {
        throw new Error("Set VITE_CROZZ_TREASURY_CAP_ID");
      }
      if (!metadataId) {
        throw new Error("Set VITE_CROZZ_METADATA_ID");
      }
      return runTx((tx) => {
        tx.moveCall({
          target: `${packageId}::${moduleName}::update_symbol`,
          arguments: [
            tx.object(adminCapId),
            tx.object(treasuryCapId),
            tx.object(metadataId),
            tx.pure.string(symbol),
          ],
        });
      });
    },
    [packageId, runTx]
  );

  const updateDescription = useCallback(
    async ({ description }: { description: string }) => {
      if (!adminCapId) {
        throw new Error("Set VITE_CROZZ_ADMIN_CAP_ID");
      }
      if (!treasuryCapId) {
        throw new Error("Set VITE_CROZZ_TREASURY_CAP_ID");
      }
      if (!metadataId) {
        throw new Error("Set VITE_CROZZ_METADATA_ID");
      }
      return runTx((tx) => {
        tx.moveCall({
          target: `${packageId}::${moduleName}::update_description`,
          arguments: [
            tx.object(adminCapId),
            tx.object(treasuryCapId),
            tx.object(metadataId),
            tx.pure.string(description),
          ],
        });
      });
    },
    [packageId, runTx]
  );

  const updateIconUrl = useCallback(
    async ({ iconUrl }: { iconUrl: string }) => {
      if (!adminCapId) {
        throw new Error("Set VITE_CROZZ_ADMIN_CAP_ID");
      }
      if (!treasuryCapId) {
        throw new Error("Set VITE_CROZZ_TREASURY_CAP_ID");
      }
      if (!metadataId) {
        throw new Error("Set VITE_CROZZ_METADATA_ID");
      }
      return runTx((tx) => {
        tx.moveCall({
          target: `${packageId}::${moduleName}::update_icon_url`,
          arguments: [
            tx.object(adminCapId),
            tx.object(treasuryCapId),
            tx.object(metadataId),
            tx.pure.string(iconUrl),
          ],
        });
      });
    },
    [packageId, runTx]
  );

  const freezeMetadata = useCallback(async () => {
    if (!adminCapId) {
      throw new Error("Set VITE_CROZZ_ADMIN_CAP_ID");
    }
    if (!metadataId) {
      throw new Error("Set VITE_CROZZ_METADATA_ID");
    }
    return runTx((tx) => {
      tx.moveCall({
        target: `${packageId}::${moduleName}::freeze_metadata`,
        arguments: [tx.object(adminCapId), tx.object(metadataId)],
      });
    });
  }, [packageId, runTx]);

  return {
    account,
    verifyHuman,
    interact,
    guardedTransfer,
    transfer,
    readMetadata,
    getBalance,
    // Admin actions
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
  };
};
