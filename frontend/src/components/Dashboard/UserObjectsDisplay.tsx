import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useEffect, useState } from 'react';
import Card from '../UI/Card';
import Button from '../UI/Button';

interface OwnedObject {
  objectId: string;
  type: string;
  version: string;
  digest: string;
}

const UserObjectsDisplay = () => {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [objects, setObjects] = useState<OwnedObject[]>([]);
  const [coinBalance, setCoinBalance] = useState<string | null>(null);

  const crozzPackageId = import.meta.env.VITE_CROZZ_PACKAGE_ID ?? '';

  const fetchUserObjects = async () => {
    if (!account?.address) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch owned objects
      const ownedObjects = await suiClient.getOwnedObjects({
        owner: account.address,
        options: {
          showType: true,
          showOwner: true,
          showContent: true,
        },
        limit: 50,
      });

      const formattedObjects: OwnedObject[] = ownedObjects.data
        .filter((obj) => obj.data)
        .map((obj) => ({
          objectId: obj.data!.objectId,
          type: obj.data!.type || 'Unknown',
          version: obj.data!.version || '0',
          digest: obj.data!.digest || '',
        }));

      setObjects(formattedObjects);

      // Try to get CROZZ token balance if package ID is set
      if (crozzPackageId && crozzPackageId !== '0xPACKAGE') {
        try {
          const coinType = `${crozzPackageId}::crozz_token::CROZZ`;
          const balance = await suiClient.getBalance({
            owner: account.address,
            coinType,
          });
          setCoinBalance(balance.totalBalance);
        } catch {
          // Token might not exist yet or user has no balance
          setCoinBalance('0');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch objects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account?.address) {
      fetchUserObjects();
    }
  }, [account?.address]);

  const shortenId = (id: string) => {
    if (id.length <= 16) return id;
    return `${id.slice(0, 8)}...${id.slice(-6)}`;
  };

  const getTypeDisplay = (type: string) => {
    const parts = type.split('::');
    if (parts.length >= 2) {
      return parts.slice(-2).join('::');
    }
    return type;
  };

  const isCrozzToken = (type: string) => {
    return type.includes('crozz_token') || type.includes('CROZZ');
  };

  return (
    <Card
      title="📋 User Object IDs"
      description="View your wallet address and owned objects on Sui blockchain"
    >
      <div className="space-y-4">
        {/* Wallet Address Display */}
        <div className="rounded-xl border border-slate-200/70 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Connected Wallet Address
          </div>
          {account?.address ? (
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-white/80 px-3 py-2 font-mono text-sm text-slate-900 dark:bg-slate-800 dark:text-white">
                {account.address}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(account.address)}
                className="rounded-lg bg-blue-500 px-3 py-2 text-xs font-medium text-white hover:bg-blue-600"
              >
                Copy
              </button>
            </div>
          ) : (
            <p className="mt-1 text-sm text-slate-500">Connect wallet to view</p>
          )}
        </div>

        {/* CROZZ Balance */}
        {coinBalance && (
          <div className="rounded-xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 dark:border-emerald-800 dark:from-emerald-900/30 dark:to-teal-900/30">
            <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              CROZZ Token Balance
            </div>
            <div className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-200">
              {(Number(coinBalance) / 1_000_000_000).toLocaleString()} CROZZ
            </div>
            <div className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-500">
              {Number(coinBalance).toLocaleString()} MIST
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <Button
          onClick={fetchUserObjects}
          disabled={!account || loading}
          variant="secondary"
        >
          {loading ? '🔄 Loading...' : '🔄 Refresh Objects'}
        </Button>

        {/* Error Display */}
        {error && (
          <p className="rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
            ⚠️ {error}
          </p>
        )}

        {/* Objects List */}
        {objects.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Owned Objects ({objects.length})
              </h4>
            </div>
            <div className="max-h-80 space-y-2 overflow-auto rounded-xl border border-slate-200/70 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
              {objects.map((obj) => (
                <div
                  key={obj.objectId}
                  className={`rounded-lg border p-3 ${
                    isCrozzToken(obj.type)
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30'
                      : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Object ID:
                        </span>
                        {isCrozzToken(obj.type) && (
                          <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                            CROZZ
                          </span>
                        )}
                      </div>
                      <code className="block truncate font-mono text-xs text-slate-900 dark:text-white">
                        {obj.objectId}
                      </code>
                      <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Type: {getTypeDisplay(obj.type)}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500">
                        Version: {obj.version} | Digest: {shortenId(obj.digest)}
                      </div>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(obj.objectId)}
                      className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Objects Message */}
        {!loading && objects.length === 0 && account && (
          <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            No objects found for this wallet address
          </div>
        )}
      </div>
    </Card>
  );
};

export default UserObjectsDisplay;
