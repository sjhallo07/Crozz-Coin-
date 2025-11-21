import { useEffect, useState } from "react";
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

  return (
    <Card title="Job Queue">
      {loading && <p>Loading recent jobs…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && jobs.length === 0 && <p>No jobs yet.</p>}
      {!loading && !error && jobs.length > 0 && (
        <ul className="job-list">
          {jobs.map((job) => (
            <li key={job.id}>
              <div className="job-list__header">
                <strong>{job.type}</strong>
                <span className={`badge badge-${job.status}`}>
                  {job.status}
                </span>
              </div>
              <dl>
                <div>
                  <dt>ID</dt>
                  <dd>{job.id}</dd>
                </div>
                <div>
                  <dt>Attempts</dt>
                  <dd>{job.attempts}</dd>
                </div>
                {job.error && (
                  <div>
                    <dt>Error</dt>
                    <dd>{job.error}</dd>
                  </div>
                )}
                {job.updatedAt && (
                  <div>
                    <dt>Updated</dt>
                    <dd>{new Date(job.updatedAt).toLocaleTimeString()}</dd>
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
