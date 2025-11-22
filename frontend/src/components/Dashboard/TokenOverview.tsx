import { useState } from "react";
import { useDashboardData } from "../../providers/DashboardDataProvider";
import { formatNumber, formatSupplyMetric } from "../../utils/humanize";
import Button from "../UI/Button";
import Card from "../UI/Card";

const metricConfig = [
  { key: "totalSupply", label: "Total supply", helper: "All minted CROZZ tokens" },
  { key: "circulating", label: "Circulating", helper: "Tokens in active wallets" },
  { key: "holderCount", label: "Holders", helper: "Unique wallet addresses" },
] as const;

const TokenOverview = () => {
  const { tokenSummary, summaryLoading, summaryError, refreshSummary } =
    useDashboardData();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshSummary();
    setRefreshing(false);
  };

  return (
    <Card
      title="Token overview"
      description="Snapshot sourced from the backend supply aggregator."
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
      {summaryError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/30">
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
            ⚠️ {summaryError}
          </p>
          <p className="mt-1 text-xs text-rose-500 dark:text-rose-500">
            Please refresh to try again or contact support if the issue persists.
          </p>
        </div>
      )}

      {summaryLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {metricConfig.map((metric) => (
            <div
              key={metric.key}
              className="animate-pulse rounded-2xl bg-slate-100/70 p-4 dark:bg-slate-800/60"
            >
              <div className="h-4 w-24 rounded bg-white/40" />
              <div className="mt-4 h-6 w-32 rounded bg-white/60" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <dl className="grid gap-4 md:grid-cols-3">
            {metricConfig.map((metric) => {
              const value = tokenSummary[metric.key as keyof typeof tokenSummary];
              const formattedValue =
                metric.key === "holderCount"
                  ? formatNumber(value as number)
                  : formatNumber(value as string);

              return (
                <div
                  key={metric.key}
                  className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-slate-900 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-white"
                >
                  <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {metric.label}
                  </dt>
                  <dd className="mt-2 text-2xl font-semibold">
                    {formattedValue}
                  </dd>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {metric.helper}
                  </p>
                </div>
              );
            })}
          </dl>
          {tokenSummary.totalSupply !== "0" && (
            <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-3 dark:border-brand-900 dark:bg-brand-950/30">
              <p className="text-sm text-brand-800 dark:text-brand-200">
                📊 {formatSupplyMetric(tokenSummary.totalSupply, tokenSummary.circulating)}
              </p>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default TokenOverview;
