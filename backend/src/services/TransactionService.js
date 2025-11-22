import { randomUUID } from "node:crypto";
import { database } from "./Database.js";

class TransactionService {
  constructor() {
    this.maxRecords = 200;
    this.retryDelayMs = 5000;

    // Prepared statements will be initialized after database is ready
    this.insertStmt = null;
    this.updateStmt = null;
    this.selectByIdStmt = null;
    this.selectListStmt = null;
    this.countStmt = null;
    this.pruneStmt = null;
    this.selectNextStmt = null;
    this.markProcessingStmt = null;
    this.takeNextTx = null;
  }

  initStatements() {
    this.insertStmt = database.prepare(`
      INSERT INTO transactions (
        id,
        type,
        payload,
        status,
        attempts,
        error,
        result,
        next_run_at,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @type,
        @payload,
        @status,
        @attempts,
        @error,
        @result,
        @next_run_at,
        @created_at,
        @updated_at
      )
    `);

    this.updateStmt = database.prepare(`
      UPDATE transactions
      SET
        type = @type,
        payload = @payload,
        status = @status,
        attempts = @attempts,
        error = @error,
        result = @result,
        next_run_at = @next_run_at,
        updated_at = @updated_at
      WHERE id = @id
    `);

    this.selectByIdStmt = database.prepare(
      `SELECT * FROM transactions WHERE id = @id`
    );

    this.selectListStmt = database.prepare(`
      SELECT *
      FROM transactions
      ORDER BY created_at DESC
      LIMIT @limit
    `);

    this.countStmt = database.prepare(
      `SELECT COUNT(*) as count FROM transactions`
    );

    this.pruneStmt = database.prepare(`
      DELETE FROM transactions
      WHERE id IN (
        SELECT id
        FROM transactions
        ORDER BY created_at ASC
        LIMIT @limit
      )
    `);

    this.selectNextStmt = database.prepare(`
      SELECT *
      FROM transactions
      WHERE status = 'queued'
        AND (next_run_at IS NULL OR next_run_at <= @now)
      ORDER BY created_at ASC
      LIMIT 1
    `);

    this.markProcessingStmt = database.prepare(`
      UPDATE transactions
      SET status = 'processing', attempts = @attempts, updated_at = @updated_at
      WHERE id = @id
    `);

    this.takeNextTx = database.transaction((now) => {
      const row = this.selectNextStmt.get({ now });
      if (!row) return null;
      const attempts = row.attempts + 1;
      const updatedAt = new Date().toISOString();
      this.markProcessingStmt.run({
        id: row.id,
        attempts,
        updated_at: updatedAt,
      });
      return {
        ...this.#mapRow(row),
        status: "processing",
        attempts,
        updatedAt,
      };
    });
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
      payload: txn.payload ?? {},
    };

    if (!record.type) {
      throw new Error("Transaction type is required");
    }

    this.insertStmt.run(this.#toDbRow(record, true));
    this.prune();
    return record;
  }

  takeNext() {
    return this.takeNextTx(Date.now());
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
    const existing = this.getById(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.updateStmt.run(this.#toDbRow(updated));
    return updated;
  }

  getById(id) {
    const row = this.selectByIdStmt.get({ id });
    return this.#mapRow(row);
  }

  prune() {
    const { count } = this.countStmt.get();
    const excess = count - this.maxRecords;
    if (excess > 0) {
      this.pruneStmt.run({ limit: excess });
    }
  }

  list({ limit = 50 } = {}) {
    const rows = this.selectListStmt.all({ limit });
    return rows.map((row) => this.#mapRow(row));
  }

  #mapRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      type: row.type,
      payload: this.#parseJson(row.payload) ?? {},
      status: row.status,
      attempts: row.attempts,
      error: row.error ?? null,
      result: this.#parseJson(row.result),
      nextRunAt: row.next_run_at ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  #parseJson(value) {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  #toDbRow(record, includeCreated = false) {
    return {
      id: record.id,
      type: record.type,
      payload:
        record.payload === undefined ? null : JSON.stringify(record.payload),
      status: record.status,
      attempts: record.attempts,
      error: record.error ?? null,
      result:
        record.result === undefined || record.result === null
          ? null
          : JSON.stringify(record.result),
      next_run_at: record.nextRunAt ?? null,
      created_at: includeCreated ? record.createdAt : undefined,
      updated_at: record.updatedAt,
    };
  }
}

export const transactionService = new TransactionService();
