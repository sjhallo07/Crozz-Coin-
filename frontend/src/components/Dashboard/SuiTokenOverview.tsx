import { useState } from "react";
import Button from "../UI/Button";
import Card from "../UI/Card";
import PriceChart from "./PriceChart";

const SuiTokenOverview = () => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Mock SUI token data - in production, fetch from API like CoinGecko
  const suiMetadata = {
    name: "Sui",
    symbol: "SUI",
    logo: "https://via.placeholder.com/64/4da2ff/ffffff?text=SUI",
    currentPrice: 1.42,
    priceChange24h: -2.34,
    marketCap: 3680000000,
    volume24h: 245000000,
    circulatingSupply: 2590000000,
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-3">
          <img
            src={suiMetadata.logo}
            alt={suiMetadata.name}
            className="h-8 w-8 rounded-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%234da2ff' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='35' text-anchor='middle' dy='.3em' fill='white'%3ESUI%3C/text%3E%3C/svg%3E";
            }}
          />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {suiMetadata.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {suiMetadata.symbol}
            </p>
          </div>
        </div>
      }
      actions={
        <Button
          size="sm"
          variant="ghost"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Price Chart */}
        <PriceChart
          tokenSymbol={suiMetadata.symbol}
          currentPrice={suiMetadata.currentPrice}
          priceChange24h={suiMetadata.priceChange24h}
        />

        {/* SUI Stats */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-slate-900 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-white">
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Market Cap
            </dt>
            <dd className="mt-2 text-xl font-semibold">
              ${(suiMetadata.marketCap / 1e9).toFixed(2)}B
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-slate-900 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-white">
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Volume (24h)
            </dt>
            <dd className="mt-2 text-xl font-semibold">
              ${(suiMetadata.volume24h / 1e6).toFixed(1)}M
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-slate-900 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-white">
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Circulating Supply
            </dt>
            <dd className="mt-2 text-xl font-semibold">
              {(suiMetadata.circulatingSupply / 1e9).toFixed(2)}B
            </dd>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-slate-900 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-white">
            <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Rank
            </dt>
            <dd className="mt-2 text-xl font-semibold">#25</dd>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            ℹ️ SUI price data is mocked. Integrate with CoinGecko or similar API for live data.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SuiTokenOverview;
