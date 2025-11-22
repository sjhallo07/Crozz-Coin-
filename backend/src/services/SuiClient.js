import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

const rpcUrl = process.env.SUI_RPC_URL ?? getFullnodeUrl("testnet");

export const suiClient = new SuiClient({ url: rpcUrl });
