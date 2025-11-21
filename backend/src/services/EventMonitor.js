import EventEmitter from "events";
import { randomUUID } from "node:crypto";

class EventMonitor extends EventEmitter {
  constructor() {
    super();
    this.interval = null;
  }

  start() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      const payload = {
        id: randomUUID(),
        type: "heartbeat",
        message: `Event generated @ ${new Date().toISOString()}`,
      };
      this.emit("event", payload);
    }, 5000);
  }

  stop() {
    if (!this.interval) return;
    clearInterval(this.interval);
    this.interval = null;
  }
}

export const eventMonitor = new EventMonitor();
