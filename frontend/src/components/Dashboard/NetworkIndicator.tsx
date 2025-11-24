import { getCurrentNetwork, isMainnet, isTestnet } from '../../utils/sui';
import Card from '../UI/Card';

type NetworkConfig = {
  icon: string;
  badgeClass: string;
  description: string;
  banner?: {
    type: 'warning' | 'info';
    message: string;
  };
};

const NETWORK_CONFIG: Record<string, NetworkConfig> = {
  mainnet: {
    icon: '🟢',
    badgeClass: 'bg-green-100 text-green-800 border-green-300',
    description: 'Production environment - real assets',
    banner: {
      type: 'warning',
      message:
        '⚠️ WARNING: You are connected to MAINNET. All transactions use real assets and are irreversible.',
    },
  },
  testnet: {
    icon: '🟡',
    badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    description: 'Test environment - test tokens only',
    banner: {
      type: 'info',
      message:
        'ℹ️ INFO: You are connected to TESTNET. Tokens have no real value and are for testing purposes only.',
    },
  },
  localnet: {
    icon: '⚪',
    badgeClass: 'bg-gray-100 text-gray-800 border-gray-300',
    description: 'Local development environment',
  },
};

export default function NetworkIndicator() {
  const network = getCurrentNetwork();
  const config = NETWORK_CONFIG[network] || NETWORK_CONFIG.testnet;

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className="text-lg font-semibold capitalize">{network} Network</h3>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </div>
        <div
          className={`px-4 py-2 rounded-lg border-2 font-semibold uppercase text-sm ${config.badgeClass}`}
        >
          {network}
        </div>
      </div>

      {config.banner && (
        <div
          className={`mt-4 p-3 rounded ${
            config.banner.type === 'warning'
              ? 'bg-red-50 border-l-4 border-red-500'
              : 'bg-blue-50 border-l-4 border-blue-500'
          }`}
        >
          <p
            className={`text-sm ${
              config.banner.type === 'warning' ? 'text-red-800 font-medium' : 'text-blue-800'
            }`}
          >
            {config.banner.message}
          </p>
        </div>
      )}
    </Card>
  );
}
