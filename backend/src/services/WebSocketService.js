import { WebSocketServer } from "ws";
import { eventMonitor } from "./EventMonitor.js";

class WebSocketService {
  constructor() {
    this.wss = null;
  }

  attach(server) {
    this.wss = new WebSocketServer({ server, path: "/events" });

    this.wss.on("connection", (socket) => {
      const listener = (payload) => socket.send(JSON.stringify(payload));
      eventMonitor.on("event", listener);

      socket.on("close", () => eventMonitor.off("event", listener));
    });

    eventMonitor.start();
  }
}

export const webSocketService = new WebSocketService();
