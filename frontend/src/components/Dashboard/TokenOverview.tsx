import { useState } from "react";
import { useDashboardData } from "../../providers/DashboardDataProvider";
import Button from "../UI/Button";
import Card from "../UI/Card";

const metricConfig = [
  { key: "totalSupply", label: "Total supply", helper: "All minted CROZZ" },
  { key: "circulating", label: "Circulating", helper: "In active wallets" },
  { key: "holderCount", label: "Holders", helper: "Unique addresses" },
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
        <p className="text-sm font-semibold text-rose-500 dark:text-rose-400">
          {summaryError}
        </p>
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
        <dl className="grid gap-4 md:grid-cols-3">
          {metricConfig.map((metric) => (
            <div
              key={metric.key}
              className="rounded-2xl border border-slate-200/70 bg-white/60 p-4 text-slate-900 shadow-sm dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-white"
            >
              <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {metric.label}
              </dt>
              <dd className="mt-2 text-2xl font-semibold">
                {String(
                  tokenSummary[metric.key as keyof typeof tokenSummary] ?? "—"
                )}
              </dd>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {metric.helper}
              </p>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
};

export default TokenOverview;
