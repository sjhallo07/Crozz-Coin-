import {
  useCurrentAccount,
  useSignAndExecuteTransactionBlock,
  useSuiClient,
} from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useCallback } from "react";
import { useNetworkVariable } from "../networkConfig";

const gasBudget = Number(import.meta.env.VITE_CROZZ_GAS_BUDGET ?? 10_000_000);
const moduleName = import.meta.env.VITE_CROZZ_MODULE ?? "crozz_token";
const registryId = import.meta.env.VITE_CROZZ_REGISTRY_ID ?? "";
const clockObjectId = import.meta.env.VITE_SUI_CLOCK_OBJECT ?? "0x6";

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
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransactionBlock();

  const ensureWallet = () => {
    if (!account) {
      throw new Error("Connect a wallet first");
    }
  };

  const runTx = useCallback(
    async (build: (tx: TransactionBlock) => void) => {
      ensureWallet();
      if (!packageId) throw new Error("Set VITE_CROZZ_PACKAGE_ID first");
      const tx = new TransactionBlock();
      tx.setGasBudget(gasBudget);
      build(tx);
      const response = await signAndExecute({
        transactionBlock: tx,
        options: { showEffects: true, showEvents: true },
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

  return {
    account,
    verifyHuman,
    interact,
    guardedTransfer,
    transfer,
    readMetadata,
    getBalance,
  };
};
