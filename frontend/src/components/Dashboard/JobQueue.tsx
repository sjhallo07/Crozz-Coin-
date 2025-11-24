import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useMemo, useState } from 'react';
import type { DashboardJob } from '../../providers/DashboardDataProvider';
import { useDashboardData } from '../../providers/DashboardDataProvider';
import {
  getStatusBadgeText,
  getStatusMessage,
  getTransactionDescription,
  timeAgo,
  formatDate,
} from '../../utils/humanize';
import Button from '../UI/Button';
import Card from '../UI/Card';

const statusStyles: Record<string, string> = {
  queued: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  processing: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  failed: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
};

const JobQueue = () => {
  const { jobs, jobsLoading, jobsError, refreshJobs } = useDashboardData();
  const [selectedJob, setSelectedJob] = useState<DashboardJob | null>(null);
  const [manualRefresh, setManualRefresh] = useState(false);

  const emptyState = useMemo(() => {
    if (jobsLoading) {
      return <p className="text-sm text-slate-500 dark:text-slate-400">Loading recent jobs…</p>;
    }

    if (jobsError) {
      return <p className="text-sm font-semibold text-rose-500 dark:text-rose-400">{jobsError}</p>;
    }

    if (jobs.length === 0) {
      return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/30">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            📭 No jobs in the queue
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
            Submit a mint, burn, or distribution request to see jobs appear here.
          </p>
        </div>
      );
    }

    return null;
  }, [jobs.length, jobsError, jobsLoading]);

  const handleManualRefresh = async () => {
    setManualRefresh(true);
    await refreshJobs();
    setManualRefresh(false);
  };

  return (
    <Card
      title="Job queue"
      description="Realtime snapshot fetched by the shared dashboard provider."
      actions={
        <Button
          size="sm"
          variant="ghost"
          onClick={handleManualRefresh}
          disabled={manualRefresh || jobsLoading}
        >
          {manualRefresh ? 'Refreshing…' : 'Refresh'}
        </Button>
      }
    >
      {emptyState ? (
        emptyState
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50"
            >
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 text-left"
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {getTransactionDescription(job.type, job.payload as Record<string, unknown>)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {job.updatedAt ? timeAgo(job.updatedAt) : 'Just created'}
                    {job.attempts > 1 && ` • ${job.attempts} attempts`}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    statusStyles[job.status] ??
                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {getStatusBadgeText(job.status)}
                </span>
              </button>

              <dl className="mt-4 grid gap-3 text-xs text-slate-500 dark:text-slate-400 md:grid-cols-2">
                <div className="space-y-1 break-all">
                  <dt className="font-semibold text-slate-400 dark:text-slate-500">Job ID</dt>
                  <dd className="font-mono text-[11px]">{job.id}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="font-semibold text-slate-400 dark:text-slate-500">Updated</dt>
                  <dd>{job.updatedAt ? new Date(job.updatedAt).toLocaleTimeString() : '—'}</dd>
                </div>
                {job.error && (
                  <div className="space-y-1 md:col-span-2">
                    <dt className="font-semibold text-slate-400 dark:text-slate-500">Error</dt>
                    <dd className="text-rose-500 dark:text-rose-400">{job.error}</dd>
                  </div>
                )}
              </dl>

              <p className="mt-3 text-xs font-semibold text-brand-600 dark:text-brand-300">
                View details ↗
              </p>
            </li>
          ))}
        </ul>
      )}

      <Transition appear show={Boolean(selectedJob)} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedJob(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 py-8">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 translate-y-4"
                enterTo="opacity-100 translate-y-0"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-4"
              >
                <Dialog.Panel className="w-full max-w-2xl transform rounded-3xl border border-white/20 bg-white/95 p-6 text-left align-middle shadow-2xl transition-all dark:border-slate-800/80 dark:bg-slate-900/95">
                  {selectedJob && (
                    <div className="space-y-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <Dialog.Title className="text-xl font-semibold text-slate-900 dark:text-white">
                            {getTransactionDescription(
                              selectedJob.type,
                              selectedJob.payload as Record<string, unknown>
                            )}
                          </Dialog.Title>
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {getStatusMessage(selectedJob.status)}
                          </p>
                          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            Job ID: {selectedJob.id}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            statusStyles[selectedJob.status] ??
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {getStatusBadgeText(selectedJob.status)}
                        </span>
                      </div>

                      <div className="grid gap-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            Attempts
                          </p>
                          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                            {selectedJob.attempts}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            Updated
                          </p>
                          <p className="mt-1">
                            {selectedJob.updatedAt ? formatDate(selectedJob.updatedAt) : '—'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            Created
                          </p>
                          <p className="mt-1">
                            {selectedJob.createdAt ? formatDate(selectedJob.createdAt) : '—'}
                          </p>
                        </div>
                        {selectedJob.error && (
                          <div className="md:col-span-2">
                            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                              Error
                            </p>
                            <p className="mt-1 text-rose-500 dark:text-rose-400">
                              {selectedJob.error}
                            </p>
                          </div>
                        )}
                      </div>

                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          Payload
                        </h3>
                        <pre className="max-h-64 overflow-auto rounded-2xl border border-slate-200/70 bg-slate-950/90 p-4 text-xs text-emerald-200 dark:border-slate-700">
                          {selectedJob.payload
                            ? JSON.stringify(selectedJob.payload, null, 2)
                            : 'No payload recorded'}
                        </pre>
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          Result
                        </h3>
                        <pre className="max-h-64 overflow-auto rounded-2xl border border-slate-200/70 bg-slate-950/90 p-4 text-xs text-sky-200 dark:border-slate-700">
                          {selectedJob.result
                            ? JSON.stringify(selectedJob.result, null, 2)
                            : 'No result yet'}
                        </pre>
                      </section>

                      <div className="flex justify-end">
                        <Button variant="ghost" onClick={() => setSelectedJob(null)}>
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Card>
  );
};

export default JobQueue;
