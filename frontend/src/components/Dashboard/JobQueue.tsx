import { useEffect, useMemo, useState } from "react";
import Card from "../UI/Card";

const API_BASE =
  import.meta.env.VITE_CROZZ_API_BASE_URL ?? "http://localhost:4000";
const ADMIN_TOKEN = import.meta.env.VITE_CROZZ_ADMIN_TOKEN;

interface JobRecord {
  id: string;
  status: string;
  type: string;
  attempts: number;
  error: string | null;
  updatedAt?: string;
  createdAt?: string;
}

const statusStyles: Record<string, string> = {
  queued: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  pending:
    "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  completed:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  failed: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
};

const JobQueue = () => {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: number | null = null;

    const fetchJobs = async () => {
      if (!ADMIN_TOKEN) {
        setError("Set VITE_CROZZ_ADMIN_TOKEN to view admin jobs.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/admin/jobs`, {
          headers: {
            Authorization: `Bearer ${ADMIN_TOKEN}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }
        const payload = (await response.json()) as { jobs: JobRecord[] };
        setJobs(payload.jobs ?? []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
    timer = window.setInterval(fetchJobs, 5000);

    return () => {
      if (timer) window.clearInterval(timer);
    };
  }, []);

  const emptyState = useMemo(() => {
    if (loading) {
      return (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading recent jobs…
        </p>
      );
    }

    if (error) {
      return (
        <p className="text-sm font-semibold text-rose-500 dark:text-rose-400">
          {error}
        </p>
      );
    }

    if (jobs.length === 0) {
      return (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Queue is empty. Submit a mint/burn/distribution to populate it.
        </p>
      );
    }

    return null;
  }, [loading, error, jobs.length]);

  return (
    <Card
      title="Job queue"
      description="Polled every 5s using the admin bearer token."
    >
      {emptyState ? (
        emptyState
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {job.type}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Attempts: {job.attempts}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[job.status] ??
                    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {job.status}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 text-xs text-slate-500 dark:text-slate-400 md:grid-cols-2">
                <div className="space-y-1 break-all">
                  <dt className="font-semibold text-slate-400 dark:text-slate-500">
                    Job ID
                  </dt>
                  <dd className="font-mono text-[11px]">{job.id}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="font-semibold text-slate-400 dark:text-slate-500">
                    Updated
                  </dt>
                  <dd>
                    {job.updatedAt
                      ? new Date(job.updatedAt).toLocaleTimeString()
                      : "—"}
                  </dd>
                </div>
                {job.error && (
                  <div className="space-y-1 md:col-span-2">
                    <dt className="font-semibold text-slate-400 dark:text-slate-500">
                      Error
                    </dt>
                    <dd className="text-rose-500 dark:text-rose-400">
                      {job.error}
                    </dd>
                  </div>
                )}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default JobQueue;
