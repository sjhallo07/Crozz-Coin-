import { getCurrentNetwork, isMainnet, isTestnet } from "../../utils/sui";
import { Card } from "../UI/Card";

export default function NetworkIndicator() {
  const network = getCurrentNetwork();
  const isMain = isMainnet();
  const isTest = isTestnet();

  const networkColors = {
    mainnet: "bg-green-100 text-green-800 border-green-300",
    testnet: "bg-yellow-100 text-yellow-800 border-yellow-300",
    localnet: "bg-gray-100 text-gray-800 border-gray-300",
  };

  const networkIcons = {
    mainnet: "🟢",
    testnet: "🟡",
    localnet: "⚪",
  };

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{networkIcons[network]}</span>
          <div>
            <h3 className="text-lg font-semibold capitalize">
              {network} Network
            </h3>
            <p className="text-sm text-gray-600">
              {isMain && "Production environment - real assets"}
              {isTest && "Test environment - test tokens only"}
              {!isMain && !isTest && "Local development environment"}
            </p>
          </div>
        </div>
        <div
          className={`px-4 py-2 rounded-lg border-2 font-semibold uppercase text-sm ${networkColors[network]}`}
        >
          {network}
        </div>
      </div>
      
      {isMain && (
        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm text-red-800 font-medium">
            ⚠️ WARNING: You are connected to MAINNET. All transactions use real assets and are irreversible.
          </p>
        </div>
      )}
      
      {isTest && (
        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm text-blue-800">
            ℹ️ INFO: You are connected to TESTNET. Tokens have no real value and are for testing purposes only.
          </p>
        </div>
      )}
    </Card>
  );
}
