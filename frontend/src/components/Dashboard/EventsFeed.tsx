import { useDashboardData } from '../../providers/DashboardDataProvider';
import Card from '../UI/Card';

const EventsFeed = () => {
  const { events, eventsConnected } = useDashboardData();

  return (
    <Card
      title="Live events"
      description="WebSocket stream emitted by the backend dispatcher."
      actions={
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
            eventsConnected
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200'
          }`}
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              eventsConnected ? 'bg-emerald-500' : 'bg-amber-400'
            }`}
          />
          {eventsConnected ? 'Connected' : 'Reconnecting…'}
        </span>
      }
    >
      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300/70 bg-white/40 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
          {eventsConnected
            ? 'Listening for mint/burn/distribution activity…'
            : 'Waiting for socket to reconnect'}
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((evt) => (
            <li
              key={evt.id}
              className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <span>{evt.type}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{evt.id}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{evt.message}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default EventsFeed;
