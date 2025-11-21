import { useEffect, useState } from "react";

interface EventPayload {
  id: string;
  type: string;
  message: string;
}

export const useWebSocket = () => {
  const [events, setEvents] = useState<EventPayload[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:4000/events");

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as EventPayload;
        setEvents((prev) => [payload, ...prev].slice(0, 20));
      } catch (error) {
        console.error("Failed to parse event", error);
      }
    };

    return () => socket.close();
  }, []);

  return events;
};
