import { transactionService } from "../../services/TransactionService.js";
import { initDatabase } from "../../services/Database.js";

describe("TransactionService", () => {
  let service;

  beforeAll(() => {
    initDatabase();
  });

  beforeEach(() => {
    // Use the singleton service instance
    service = transactionService;
    if (!service.insertStmt) {
      service.initStatements();
    }
  });

  describe("Initialization", () => {
    it("should initialize with default values", () => {
      expect(service.maxRecords).toBe(200);
      expect(service.retryDelayMs).toBe(5000);
    });

    it("should initialize prepared statements", () => {
      expect(service.insertStmt).not.toBeNull();
      expect(service.updateStmt).not.toBeNull();
      expect(service.selectByIdStmt).not.toBeNull();
      expect(service.selectListStmt).not.toBeNull();
      expect(service.countStmt).not.toBeNull();
      expect(service.pruneStmt).not.toBeNull();
      expect(service.selectNextStmt).not.toBeNull();
      expect(service.markProcessingStmt).not.toBeNull();
      expect(service.takeNextTx).not.toBeNull();
    });
  });

  describe("Job Enqueueing", () => {
    it("should enqueue a mint transaction", () => {
      const job = service.enqueue({
        type: "mint",
        payload: { amount: "1000", recipient: "0xtest" },
      });

      expect(job).toMatchObject({
        type: "mint",
        status: "queued",
        attempts: 0,
        payload: { amount: "1000", recipient: "0xtest" },
      });
      expect(job.id).toBeDefined();
      expect(job.createdAt).toBeDefined();
      expect(job.updatedAt).toBeDefined();
    });

    it("should enqueue a burn transaction", () => {
      const job = service.enqueue({
        type: "burn",
        payload: { coinId: "0xcoin123" },
      });

      expect(job).toMatchObject({
        type: "burn",
        status: "queued",
        attempts: 0,
        payload: { coinId: "0xcoin123" },
      });
    });

    it("should enqueue a distribute transaction", () => {
      const job = service.enqueue({
        type: "distribute",
        payload: {
          distributions: [
            { to: "0xaddr1", amount: "100" },
            { to: "0xaddr2", amount: "200" },
          ],
        },
      });

      expect(job).toMatchObject({
        type: "distribute",
        status: "queued",
        attempts: 0,
      });
      expect(job.payload.distributions).toHaveLength(2);
    });

    it("should throw error when type is missing", () => {
      expect(() => service.enqueue({ payload: {} })).toThrow(
        "Transaction type is required"
      );
    });

    it("should set default empty payload if not provided", () => {
      const job = service.enqueue({ type: "test" });
      expect(job.payload).toEqual({});
    });

    it("should set nextRunAt to current time", () => {
      const before = Date.now();
      const job = service.enqueue({ type: "mint", payload: {} });
      const after = Date.now();

      expect(job.nextRunAt).toBeGreaterThanOrEqual(before);
      expect(job.nextRunAt).toBeLessThanOrEqual(after);
    });
  });

  describe("Job Retrieval", () => {
    it("should retrieve job by ID", () => {
      const enqueuedJob = service.enqueue({
        type: "mint",
        payload: { amount: "1000" },
      });

      const retrievedJob = service.getById(enqueuedJob.id);
      expect(retrievedJob).toMatchObject({
        id: enqueuedJob.id,
        type: "mint",
        status: "queued",
      });
    });

    it("should return null for non-existent job ID", () => {
      const job = service.getById("non-existent-id");
      expect(job).toBeNull();
    });

    it("should list jobs with default limit", () => {
      // Enqueue multiple jobs
      for (let i = 0; i < 5; i++) {
        service.enqueue({ type: "mint", payload: { amount: `${i * 100}` } });
      }

      const jobs = service.list();
      expect(jobs.length).toBeGreaterThanOrEqual(5);
    });

    it("should respect limit parameter in list", () => {
      // Enqueue multiple jobs
      for (let i = 0; i < 10; i++) {
        service.enqueue({ type: "mint", payload: { amount: `${i * 100}` } });
      }

      const jobs = service.list({ limit: 5 });
      expect(jobs.length).toBeLessThanOrEqual(5);
    });

    it("should return jobs in descending order by creation time", () => {
      const job1 = service.enqueue({ type: "mint", payload: { amount: "100" } });
      const job2 = service.enqueue({ type: "mint", payload: { amount: "200" } });
      const job3 = service.enqueue({ type: "mint", payload: { amount: "300" } });

      const jobs = service.list({ limit: 3 });
      expect(jobs[0].id).toBe(job3.id);
      expect(jobs[1].id).toBe(job2.id);
      expect(jobs[2].id).toBe(job1.id);
    });
  });

  describe("Job Status Transitions", () => {
    it("should mark job as completed", () => {
      const job = service.enqueue({ type: "mint", payload: { amount: "1000" } });
      const result = { digest: "0xabc123", success: true };

      service.markCompleted(job.id, result);

      const updatedJob = service.getById(job.id);
      expect(updatedJob.status).toBe("completed");
      expect(updatedJob.result).toEqual(result);
      expect(updatedJob.error).toBeNull();
    });

    it("should mark job as failed", () => {
      const job = service.enqueue({ type: "mint", payload: { amount: "1000" } });
      const error = new Error("Transaction failed");

      service.markFailed(job.id, error);

      const updatedJob = service.getById(job.id);
      expect(updatedJob.status).toBe("failed");
      expect(updatedJob.error).toBe("Transaction failed");
    });

    it("should handle string error in markFailed", () => {
      const job = service.enqueue({ type: "mint", payload: { amount: "1000" } });

      service.markFailed(job.id, "Simple error message");

      const updatedJob = service.getById(job.id);
      expect(updatedJob.status).toBe("failed");
      expect(updatedJob.error).toBe("Simple error message");
    });

    it("should retry job later", () => {
      const job = service.enqueue({ type: "mint", payload: { amount: "1000" } });
      const error = new Error("Temporary error");

      const beforeRetry = Date.now();
      service.retryLater(job.id, error);
      const afterRetry = Date.now();

      const updatedJob = service.getById(job.id);
      expect(updatedJob.status).toBe("queued");
      expect(updatedJob.error).toBe("Temporary error");
      expect(updatedJob.nextRunAt).toBeGreaterThanOrEqual(
        beforeRetry + service.retryDelayMs
      );
      expect(updatedJob.nextRunAt).toBeLessThanOrEqual(
        afterRetry + service.retryDelayMs + 100
      );
    });

    it("should update timestamp when status changes", () => {
      const job = service.enqueue({ type: "mint", payload: { amount: "1000" } });
      const originalUpdatedAt = job.updatedAt;

      // Wait a bit to ensure timestamp changes
      const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      return delay(10).then(() => {
        service.markCompleted(job.id, { success: true });

        const updatedJob = service.getById(job.id);
        expect(updatedJob.updatedAt).not.toBe(originalUpdatedAt);
      });
    });
  });

  describe("Job Queue Processing", () => {
    it("should take next queued job", () => {
      const job1 = service.enqueue({ type: "mint", payload: { amount: "100" } });
      const job2 = service.enqueue({ type: "mint", payload: { amount: "200" } });

      const nextJob = service.takeNext();
      expect(nextJob).toBeDefined();
      expect(nextJob.id).toBe(job1.id);
      expect(nextJob.status).toBe("processing");
      expect(nextJob.attempts).toBe(1);
    });

    it("should return null when no jobs are queued", () => {
      const nextJob = service.takeNext();
      expect(nextJob).toBeNull();
    });

    it("should skip jobs with future nextRunAt", () => {
      const job1 = service.enqueue({ type: "mint", payload: { amount: "100" } });
      
      // Set job to run in the future
      service.retryLater(job1.id, new Error("Retry"));
      
      const nextJob = service.takeNext();
      expect(nextJob).toBeNull();
    });

    it("should process jobs in FIFO order", () => {
      const job1 = service.enqueue({ type: "mint", payload: { amount: "100" } });
      const job2 = service.enqueue({ type: "mint", payload: { amount: "200" } });
      const job3 = service.enqueue({ type: "mint", payload: { amount: "300" } });

      const next1 = service.takeNext();
      expect(next1.id).toBe(job1.id);

      const next2 = service.takeNext();
      expect(next2.id).toBe(job2.id);

      const next3 = service.takeNext();
      expect(next3.id).toBe(job3.id);
    });

    it("should increment attempts when taking a job", () => {
      const job = service.enqueue({ type: "mint", payload: { amount: "100" } });
      expect(job.attempts).toBe(0);

      const nextJob = service.takeNext();
      expect(nextJob.attempts).toBe(1);
    });

    it("should not take jobs that are already processing", () => {
      const job1 = service.enqueue({ type: "mint", payload: { amount: "100" } });
      const job2 = service.enqueue({ type: "mint", payload: { amount: "200" } });

      const first = service.takeNext();
      expect(first.id).toBe(job1.id);

      const second = service.takeNext();
      expect(second.id).toBe(job2.id);
    });
  });

  describe("Job Pruning", () => {
    it("should not prune when below max records", () => {
      // Enqueue jobs below max
      for (let i = 0; i < 50; i++) {
        service.enqueue({ type: "mint", payload: { amount: `${i * 100}` } });
      }

      const beforePrune = service.list({ limit: 200 }).length;
      service.prune();
      const afterPrune = service.list({ limit: 200 }).length;

      expect(afterPrune).toBe(beforePrune);
    });

    it("should prune oldest jobs when exceeding max records", () => {
      // Set a lower max for testing
      service.maxRecords = 10;

      // Enqueue more jobs than max
      const jobs = [];
      for (let i = 0; i < 15; i++) {
        jobs.push(
          service.enqueue({ type: "mint", payload: { amount: `${i * 100}` } })
        );
      }

      // Check that oldest jobs were pruned
      const remaining = service.list({ limit: 20 });
      expect(remaining.length).toBeLessThanOrEqual(10);

      // Verify oldest jobs are gone
      const oldestJob = service.getById(jobs[0].id);
      expect(oldestJob).toBeNull();

      // Verify newest jobs remain
      const newestJob = service.getById(jobs[14].id);
      expect(newestJob).not.toBeNull();
    });
  });

  describe("JSON Serialization", () => {
    it("should serialize and deserialize payload correctly", () => {
      const complexPayload = {
        distributions: [
          { to: "0xaddr1", amount: "100" },
          { to: "0xaddr2", amount: "200" },
        ],
        metadata: { sender: "admin", timestamp: Date.now() },
      };

      const job = service.enqueue({
        type: "distribute",
        payload: complexPayload,
      });

      const retrieved = service.getById(job.id);
      expect(retrieved.payload).toEqual(complexPayload);
    });

    it("should handle null payload", () => {
      const job = service.enqueue({ type: "test", payload: null });
      const retrieved = service.getById(job.id);
      expect(retrieved.payload).toEqual({});
    });

    it("should handle undefined payload", () => {
      const job = service.enqueue({ type: "test" });
      const retrieved = service.getById(job.id);
      expect(retrieved.payload).toEqual({});
    });

    it("should serialize and deserialize result correctly", () => {
      const job = service.enqueue({ type: "mint", payload: { amount: "1000" } });
      const result = {
        digest: "0xabc123",
        effects: { status: "success" },
        timestamp: Date.now(),
      };

      service.markCompleted(job.id, result);

      const retrieved = service.getById(job.id);
      expect(retrieved.result).toEqual(result);
    });

    it("should handle null result", () => {
      const job = service.enqueue({ type: "mint", payload: { amount: "1000" } });
      service.markCompleted(job.id, null);

      const retrieved = service.getById(job.id);
      expect(retrieved.result).toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("should return null when updating non-existent job", () => {
      const result = service.markCompleted("non-existent-id", { success: true });
      expect(result).toBeNull();
    });

    it("should handle database errors gracefully in getById", () => {
      const job = service.getById("invalid-id");
      expect(job).toBeNull();
    });
  });

  describe("Concurrent Access", () => {
    it("should handle multiple enqueues correctly", () => {
      const jobs = [];
      for (let i = 0; i < 100; i++) {
        jobs.push(service.enqueue({ type: "mint", payload: { amount: `${i}` } }));
      }

      const allJobs = service.list({ limit: 150 });
      expect(allJobs.length).toBeGreaterThanOrEqual(100);

      // Verify all job IDs are unique
      const ids = new Set(jobs.map((j) => j.id));
      expect(ids.size).toBe(100);
    });

    it("should process jobs in correct order under load", () => {
      const jobIds = [];
      for (let i = 0; i < 10; i++) {
        const job = service.enqueue({ type: "mint", payload: { amount: `${i}` } });
        jobIds.push(job.id);
      }

      const processedIds = [];
      for (let i = 0; i < 10; i++) {
        const job = service.takeNext();
        if (job) {
          processedIds.push(job.id);
        }
      }

      expect(processedIds).toEqual(jobIds);
    });
  });
});
