import { useState } from 'react';
import { useDashboardData } from '../../providers/DashboardDataProvider';
import { formatNumber } from '../../utils/humanize';
import Button from '../UI/Button';
import Card from '../UI/Card';
import PriceChart from './PriceChart';

const EnhancedTokenOverview = () => {
  const { tokenSummary, summaryLoading, summaryError, refreshSummary } = useDashboardData();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSummary();
    setRefreshing(false);
  };

  // Mock token metadata - in production, fetch from blockchain or API
  const tokenMetadata = {
    name: 'Crozz Coin',
    symbol: 'CROZZ',
    logo: '/crozz-logo.png', // Use local logo instead of external service
    currentPrice: 0.0123,
    priceChange24h: 5.67,
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-3">
          <img
            src={tokenMetadata.logo}
            alt={tokenMetadata.name}
            className="h-8 w-8 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%236366f1' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='40' text-anchor='middle' dy='.3em' fill='white'%3EC%3C/text%3E%3C/svg%3E";
            }}
          />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {tokenMetadata.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{tokenMetadata.symbol}</p>
          </div>
        </div>
      }
      actions={
        <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </Button>
      }
    >
      {summaryError && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30">
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
            ⚠️ {summaryError}
          </p>
        </div>
      )}

      {summaryLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60" />
          <div className="h-48 rounded-2xl bg-slate-100/70 dark:bg-slate-800/60" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Price Chart */}
          <PriceChart
            tokenSymbol={tokenMetadata.symbol}
            currentPrice={tokenMetadata.currentPrice}
            priceChange24h={tokenMetadata.priceChange24h}
          />

          {/* Token Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-slate-900 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-white">
              <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Total Supply
              </dt>
              <dd className="mt-2 text-xl font-semibold">
                {formatNumber(tokenSummary.totalSupply)}
              </dd>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-slate-900 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-white">
              <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Circulating
              </dt>
              <dd className="mt-2 text-xl font-semibold">
                {formatNumber(tokenSummary.circulating)}
              </dd>
            </div>
            <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-slate-900 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-white">
              <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Holders
              </dt>
              <dd className="mt-2 text-xl font-semibold">
                {formatNumber(tokenSummary.holderCount)}
              </dd>
            </div>
          </div>

          {/* Market Cap Estimate */}
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-3 dark:border-brand-900 dark:bg-brand-950/30">
            <p className="text-sm text-brand-800 dark:text-brand-200">
              💰 Est. Market Cap: $
              {(parseFloat(tokenSummary.totalSupply) * tokenMetadata.currentPrice).toLocaleString(
                undefined,
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default EnhancedTokenOverview;
