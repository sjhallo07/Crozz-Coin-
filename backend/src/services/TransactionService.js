import { randomUUID } from "node:crypto";

class TransactionService {
  constructor() {
    this.queue = [];
    this.maxRecords = 200;
    this.retryDelayMs = 5000;
  }

  enqueue(txn) {
    const now = new Date().toISOString();
    const record = {
      id: randomUUID(),
      status: "queued",
      attempts: 0,
      error: null,
      result: null,
      nextRunAt: Date.now(),
      createdAt: now,
      updatedAt: now,
      ...txn,
    };
    this.queue.push(record);
    this.prune();
    return record;
  }

  takeNext() {
    const now = Date.now();
    const record = this.queue.find(
      (item) => item.status === "queued" && (item.nextRunAt ?? 0) <= now
    );
    if (!record) return null;
    record.status = "processing";
    record.attempts += 1;
    record.updatedAt = new Date().toISOString();
    return record;
  }

  markCompleted(id, result) {
    return this.#update(id, {
      status: "completed",
      result,
      error: null,
    });
  }

  markFailed(id, error) {
    return this.#update(id, {
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }

  retryLater(id, error) {
    const message = error instanceof Error ? error.message : String(error);
    return this.#update(id, {
      status: "queued",
      error: message,
      nextRunAt: Date.now() + this.retryDelayMs,
    });
  }

  #update(id, patch) {
    const record = this.queue.find((item) => item.id === id);
    if (!record) return null;
    Object.assign(record, patch, { updatedAt: new Date().toISOString() });
    return record;
  }

  prune() {
    const excess = this.queue.length - this.maxRecords;
    if (excess > 0) {
      this.queue.splice(0, excess);
    }
  }

  list({ limit = 50 } = {}) {
    return this.queue.slice(-limit).reverse();
  }
}

export const transactionService = new TransactionService();
