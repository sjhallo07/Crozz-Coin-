import { useWebSocket } from "../../hooks/useWebSocket";
import Card from "../UI/Card";

const EventsFeed = () => {
  const events = useWebSocket();

  return (
    <Card title="Live Events">
      <ul>
        {events.length === 0 && <li>No events yet</li>}
        {events.map((evt) => (
          <li key={evt.id}>
            <strong>{evt.type}</strong> • {evt.message}
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default EventsFeed;
