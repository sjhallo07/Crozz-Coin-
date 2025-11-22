import { SuiClient } from "@mysten/sui/client";
import { getNetworkRpc } from "./utils/sui";

export const suiClient = new SuiClient({ url: getNetworkRpc() });
