import { useState, useEffect } from 'react';
import axios from 'axios';
import Card from '../UI/Card';
import Button from '../UI/Button';

const API_BASE_URL = import.meta.env.VITE_CROZZ_API_BASE_URL || 'http://localhost:4000';
// ⚠️ SECURITY WARNING: Admin tokens in frontend env vars are exposed in the client build
// For production, implement proper OAuth/JWT authentication flow with backend session management
const ADMIN_TOKEN = import.meta.env.VITE_CROZZ_ADMIN_TOKEN;

interface Wallet {
  id: string;
  name: string;
  address: string;
  publicKey: string;
  createdAt: string;
  frozen: boolean;
  balance: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    wallets?: Wallet[];
    total?: number;
  };
}

export default function WalletManager() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [walletCount, setWalletCount] = useState(3);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse>(`${API_BASE_URL}/api/admin/wallets`, {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
      });

      if (response.data.success && response.data.data?.wallets) {
        setWallets(response.data.data.wallets);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch wallets');
      console.error('Error fetching wallets:', err);
    } finally {
      setLoading(false);
    }
  };

  const createWallets = async () => {
    setCreating(true);
    setError(null);
    try {
      const response = await axios.post<ApiResponse>(
        `${API_BASE_URL}/api/admin/wallets/create`,
        {
          count: walletCount,
          prefix: 'Demo Wallet',
        },
        {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
          },
        }
      );

      if (response.data.success) {
        await fetchWallets(); // Refresh the list
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create wallets');
      console.error('Error creating wallets:', err);
    } finally {
      setCreating(false);
    }
  };

  const freezeWallet = async (address: string, freeze: boolean) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/admin/wallets/freeze`,
        {
          address,
          freeze,
        },
        {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
          },
        }
      );

      // Update local state
      setWallets((prev) =>
        prev.map((w) => (w.address === address ? { ...w, frozen: freeze } : w))
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to freeze/unfreeze wallet');
      console.error('Error freezing wallet:', err);
    }
  };

  const mintToWallet = async (walletId: string) => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/admin/wallets/mint`,
        {
          walletId,
          amount: '1000000000', // 1 CROZZ
        },
        {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
          },
        }
      );

      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mint tokens');
      console.error('Error minting tokens:', err);
    }
  };

  const deleteWallet = async (walletId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/wallets/${walletId}`, {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
      });

      setWallets((prev) => prev.filter((w) => w.id !== walletId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete wallet');
      console.error('Error deleting wallet:', err);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!ADMIN_TOKEN) {
    return (
      <Card title="🔐 Wallet Manager">
        <div className="text-red-500">
          Admin token not configured. Please set VITE_CROZZ_ADMIN_TOKEN in your environment.
        </div>
      </Card>
    );
  }

  return (
    <Card title="🔐 Wallet Manager">
      <div className="space-y-4">
        {/* Create Wallets Section */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Create New Wallets
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={walletCount}
              onChange={(e) => setWalletCount(parseInt(e.target.value) || 1)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <Button onClick={createWallets} disabled={creating}>
            {creating ? 'Creating...' : `Create ${walletCount} Wallet${walletCount > 1 ? 's' : ''}`}
          </Button>
          <Button onClick={fetchWallets} disabled={loading}>
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Wallets List */}
        <div className="space-y-3">
          {loading && wallets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Loading wallets...</div>
          ) : wallets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No wallets created yet. Create some wallets to get started.
            </div>
          ) : (
            wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{wallet.name}</h3>
                      {wallet.frozen && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          🔒 Frozen
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Address:</span>{' '}
                        <code className="bg-gray-100 px-2 py-1 rounded">
                          {shortenAddress(wallet.address)}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium">Balance:</span> {wallet.balance} CROZZ
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(wallet.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      onClick={() => mintToWallet(wallet.id)}
                      className="text-sm"
                      disabled={wallet.frozen}
                    >
                      💰 Mint
                    </Button>
                    <Button
                      onClick={() => freezeWallet(wallet.address, !wallet.frozen)}
                      className="text-sm"
                    >
                      {wallet.frozen ? '🔓 Unfreeze' : '🔒 Freeze'}
                    </Button>
                    <Button
                      onClick={() => deleteWallet(wallet.id)}
                      className="text-sm bg-red-500 hover:bg-red-600"
                    >
                      🗑️ Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Statistics */}
        {wallets.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-700">
              <div>
                <strong>Total Wallets:</strong> {wallets.length}
              </div>
              <div>
                <strong>Frozen Wallets:</strong> {wallets.filter((w) => w.frozen).length}
              </div>
              <div>
                <strong>Active Wallets:</strong> {wallets.filter((w) => !w.frozen).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
