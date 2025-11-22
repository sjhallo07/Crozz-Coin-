import { type SVGProps, useEffect, useState } from "react";
import { defaultNetwork } from "../../networkConfig";
import { useThemeMode } from "../../providers/ThemeProvider";
import Button from "../UI/Button";

const Header = () => {
  const { theme, toggleTheme } = useThemeMode();
  const isDark = theme === "dark";
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatUTCTime = (date: Date) => {
    return date.toUTCString().replace("GMT", "UTC");
  };

  return (
    <header className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/80 p-8 shadow-card backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 dark:shadow-card-dark">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/70 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-slate-600 dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
            Live on {defaultNetwork}
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-1 text-xs font-mono text-slate-600 dark:border-slate-800/70 dark:bg-slate-900/40 dark:text-slate-300 md:inline-flex">
            <ClockIcon className="h-3.5 w-3.5" />
            {formatUTCTime(currentTime)}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          className="border border-slate-200/60 text-slate-600 dark:border-slate-800 dark:text-slate-100"
        >
          {isDark ? (
            <SunIcon className="h-4 w-4" />
          ) : (
            <MoonIcon className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {isDark ? "Light" : "Dark"} mode
          </span>
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/60 bg-brand-500/10 p-2 dark:border-slate-800/80">
            <img
              src="/crozz-logo.png"
              alt="Crozz logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-300">
              Crozz command center
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Crozz Ecosystem Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-300">
              Monitor CROZZ token supply, queued admin jobs, and on-chain
              metadata from one responsive control plane.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span>Need instructions? Check the README for setup tips.</span>
          <span>
            Backend API:{" "}
            <code className="rounded bg-slate-100 px-2 py-1 text-xs font-mono text-slate-700 dark:bg-slate-900/50 dark:text-slate-200">
              /api
            </code>
          </span>
        </div>
      </div>
    </header>
  );
};

const SunIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.5-7.5L16 6m-8 12-1.5 1.5m0-13L8 6m8 12 1.5 1.5" />
  </svg>
);

const MoonIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 8.5 8.5 0 1 0 21 14.5Z" />
  </svg>
);

const ClockIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

export default Header;
