import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface TokenSummary {
  totalSupply: string;
  circulating: string;
  holderCount: number;
}

export interface DashboardEvent {
  id: string;
  type: string;
  message: string;
  [key: string]: unknown;
}

export interface DashboardJob {
  id: string;
  status: string;
  type: string;
  attempts: number;
  error: string | null;
  payload?: unknown;
  result?: unknown;
  updatedAt?: string;
  createdAt?: string;
}

interface DashboardDataContextValue {
  tokenSummary: TokenSummary;
  summaryLoading: boolean;
  summaryError: string | null;
  refreshSummary: () => Promise<void>;
  events: DashboardEvent[];
  eventsConnected: boolean;
  jobs: DashboardJob[];
  jobsLoading: boolean;
  jobsError: string | null;
  refreshJobs: () => Promise<void>;
}

const DEFAULT_SUMMARY: TokenSummary = {
  totalSupply: "0",
  circulating: "0",
  holderCount: 0,
};

const DashboardDataContext = createContext<DashboardDataContextValue | null>(
  null
);

const API_BASE = (import.meta.env.VITE_CROZZ_API_BASE_URL ?? "").replace(
  /\/$/,
  ""
);
const ADMIN_TOKEN = import.meta.env.VITE_CROZZ_ADMIN_TOKEN;

const buildApiUrl = (path: string) => `${API_BASE}${path}`;

const resolveWebSocketUrl = () => {
  const explicit = import.meta.env.VITE_CROZZ_WS_URL as string | undefined;
  if (explicit) return explicit;

  if (API_BASE) {
    const protocol = API_BASE.startsWith("https") ? "wss" : "ws";
    const base = API_BASE.replace(/^https?/, protocol);
    return `${base}/events`;
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    return `${protocol}://${window.location.host}/events`;
  }

  return null;
};

export const DashboardDataProvider = ({ children }: PropsWithChildren) => {
  const [tokenSummary, setTokenSummary] =
    useState<TokenSummary>(DEFAULT_SUMMARY);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [eventsConnected, setEventsConnected] = useState(false);

  const [jobs, setJobs] = useState<DashboardJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(Boolean(ADMIN_TOKEN));
  const [jobsError, setJobsError] = useState<string | null>(null);

  const refreshSummary = useCallback(async () => {
    try {
      const response = await fetch(buildApiUrl("/api/tokens/summary"));
      if (!response.ok) {
        throw new Error(`Summary request failed (${response.status})`);
      }
      const payload = (await response.json()) as Partial<TokenSummary>;
      setTokenSummary({
        totalSupply: payload.totalSupply ?? "0",
        circulating: payload.circulating ?? "0",
        holderCount: payload.holderCount ?? 0,
      });
      setSummaryError(null);
    } catch (error) {
      console.error("Failed to refresh token summary", error);
      setTokenSummary(DEFAULT_SUMMARY);
      setSummaryError(
        error instanceof Error ? error.message : "Unable to fetch summary"
      );
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const refreshJobs = useCallback(async () => {
    if (!ADMIN_TOKEN) {
      setJobsLoading(false);
      setJobsError("Set VITE_CROZZ_ADMIN_TOKEN to view admin jobs.");
      return;
    }
    try {
      const response = await fetch(buildApiUrl("/api/admin/jobs"), {
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      });
      if (!response.ok) {
        throw new Error(`Jobs request failed (${response.status})`);
      }
      const payload = (await response.json()) as { jobs?: DashboardJob[] };
      setJobs(payload.jobs ?? []);
      setJobsError(null);
    } catch (error) {
      console.error("Failed to refresh jobs", error);
      setJobsError(
        error instanceof Error ? error.message : "Unable to fetch jobs"
      );
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSummary();
    if (typeof window === "undefined") return;
    const interval = window.setInterval(refreshSummary, 15000);
    return () => window.clearInterval(interval);
  }, [refreshSummary]);

  useEffect(() => {
    refreshJobs();
    if (!ADMIN_TOKEN || typeof window === "undefined") return;
    const interval = window.setInterval(refreshJobs, 5000);
    return () => window.clearInterval(interval);
  }, [refreshJobs]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = resolveWebSocketUrl();
    if (!url) return;

    const socket = new WebSocket(url);

    socket.addEventListener("open", () => setEventsConnected(true));
    socket.addEventListener("close", () => setEventsConnected(false));
    socket.addEventListener("error", () => setEventsConnected(false));
    socket.addEventListener("message", (event) => {
      try {
        const payload = JSON.parse(event.data) as DashboardEvent;
        setEvents((prev) => [payload, ...prev].slice(0, 40));
      } catch (error) {
        console.error("Failed to parse event", error);
      }
    });

    return () => socket.close();
  }, []);

  const value = useMemo<DashboardDataContextValue>(
    () => ({
      tokenSummary,
      summaryLoading,
      summaryError,
      refreshSummary,
      events,
      eventsConnected,
      jobs,
      jobsLoading,
      jobsError,
      refreshJobs,
    }),
    [
      events,
      eventsConnected,
      jobs,
      jobsError,
      jobsLoading,
      refreshJobs,
      refreshSummary,
      summaryError,
      summaryLoading,
      tokenSummary,
    ]
  );

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
};

export const useDashboardData = () => {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error(
      "useDashboardData must be used within DashboardDataProvider"
    );
  }
  return context;
};
