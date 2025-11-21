import { randomUUID } from "node:crypto";

class TransactionService {
  constructor() {
    this.queue = [];
  }

  enqueue(txn) {
    const record = { id: randomUUID(), status: "queued", ...txn };
    this.queue.push(record);
    return record;
  }

  list() {
    return this.queue.slice(-50).reverse();
  }
}

export const transactionService = new TransactionService();
