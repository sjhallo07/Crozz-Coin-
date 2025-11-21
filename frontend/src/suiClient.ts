import { SuiClient } from "@mysten/sui.js/client";
import { getNetworkRpc } from "./utils/sui";

export const suiClient = new SuiClient({ url: getNetworkRpc() });
