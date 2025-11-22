import { useState } from "react";

export type TimeFrame = "1m" | "1h" | "24h" | "1w" | "1M" | "all";

interface PriceChartProps {
  tokenSymbol: string;
  currentPrice?: number;
  priceChange24h?: number;
}

// Mock data generator for demonstration
const generateMockData = (timeframe: TimeFrame, basePrice: number = 0.01) => {
  const dataPoints: { time: string; price: number }[] = [];
  const now = Date.now();
  let intervals = 20;
  let intervalMs = 3600000; // 1 hour

  switch (timeframe) {
    case "1m":
      intervals = 60;
      intervalMs = 1000; // 1 second
      break;
    case "1h":
      intervals = 60;
      intervalMs = 60000; // 1 minute
      break;
    case "24h":
      intervals = 24;
      intervalMs = 3600000; // 1 hour
      break;
    case "1w":
      intervals = 7;
      intervalMs = 86400000; // 1 day
      break;
    case "1M":
      intervals = 30;
      intervalMs = 86400000; // 1 day
      break;
    case "all":
      intervals = 12;
      intervalMs = 2592000000; // ~30 days
      break;
  }

  for (let i = intervals; i >= 0; i--) {
    const time = new Date(now - i * intervalMs);
    const volatility = 0.05;
    const trend = Math.sin(i / 5) * 0.02;
    const random = (Math.random() - 0.5) * volatility;
    const price = basePrice * (1 + trend + random);
    
    dataPoints.push({
      time: time.toISOString(),
      price: Math.max(0.001, price),
    });
  }

  return dataPoints;
};

const PriceChart = ({ tokenSymbol, currentPrice = 0.01, priceChange24h = 0 }: PriceChartProps) => {
  const [timeframe, setTimeframe] = useState<TimeFrame>("24h");
  const data = generateMockData(timeframe, currentPrice);

  // Calculate min/max for chart scaling
  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice;

  // Convert data to SVG path
  const width = 100;
  const height = 100;
  const padding = 5;

  const points = data.map((point, index) => {
    const x = padding + ((width - 2 * padding) * index) / (data.length - 1);
    const y =
      height -
      padding -
      ((height - 2 * padding) * (point.price - minPrice)) / (range || 1);
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(" L ")}`;

  const timeframeOptions: { value: TimeFrame; label: string }[] = [
    { value: "1m", label: "1m" },
    { value: "1h", label: "1h" },
    { value: "24h", label: "24h" },
    { value: "1w", label: "1w" },
    { value: "1M", label: "1M" },
    { value: "all", label: "All" },
  ];

  const isPositive = priceChange24h >= 0;

  return (
    <div className="space-y-4">
      {/* Price Display */}
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            ${currentPrice.toFixed(6)}
          </p>
          <p
            className={`text-sm font-medium ${
              isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {isPositive ? "+" : ""}
            {priceChange24h.toFixed(2)}% (24h)
          </p>
        </div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {tokenSymbol}
        </p>
      </div>

      {/* Chart */}
      <div className="relative rounded-2xl border border-slate-200/70 bg-white/60 p-4 dark:border-slate-800/70 dark:bg-slate-900/40">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-48 w-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            stroke="currentColor"
            strokeWidth="0.2"
            className="text-slate-300 dark:text-slate-700"
            strokeDasharray="2,2"
          />

          {/* Price line */}
          <path
            d={pathData}
            fill="none"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />

          {/* Gradient fill under line */}
          <defs>
            <linearGradient id={`gradient-${tokenSymbol}-${timeframe}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`${pathData} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
            fill={`url(#gradient-${tokenSymbol}-${timeframe})`}
          />
        </svg>
      </div>

      {/* Timeframe Selector */}
      <div className="flex gap-2 overflow-x-auto">
        {timeframeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setTimeframe(option.value)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
              timeframe === option.value
                ? "bg-brand-500 text-white shadow-sm"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PriceChart;
