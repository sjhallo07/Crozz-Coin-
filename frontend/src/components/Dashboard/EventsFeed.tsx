import { useWebSocket } from "../../hooks/useWebSocket";
import Card from "../UI/Card";

const EventsFeed = () => {
  const events = useWebSocket();

  return (
    <Card
      title="Live events"
      description="WebSocket stream emitted by the backend dispatcher."
    >
      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300/70 bg-white/40 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
          Listening for mint/burn/distribution activity…
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
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {evt.id}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                {evt.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default EventsFeed;
