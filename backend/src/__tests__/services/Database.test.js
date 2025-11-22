import { initDatabase, database } from "../../services/Database.js";
import fs from "node:fs";
import path from "node:path";

describe("Database Service", () => {
  describe("Database Initialization", () => {
    it("should initialize database successfully", () => {
      expect(() => initDatabase()).not.toThrow();
      expect(database).toBeDefined();
      expect(database).not.toBeNull();
    });

    it("should create database file", () => {
      const dbPath = process.env.CROZZ_DB_PATH || path.resolve(process.cwd(), "data", "crozz.sqlite");
      expect(fs.existsSync(dbPath)).toBe(true);
    });

    it("should create data directory if it does not exist", () => {
      const dataDir = process.env.CROZZ_DATA_DIR || path.resolve(process.cwd(), "data");
      expect(fs.existsSync(dataDir)).toBe(true);
    });
  });

  describe("Database Tables", () => {
    beforeAll(() => {
      initDatabase();
    });

    it("should create transactions table", () => {
      const result = database.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='transactions'
      `).get();

      expect(result).toBeDefined();
      expect(result.name).toBe("transactions");
    });

    it("should create users table", () => {
      const result = database.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='users'
      `).get();

      expect(result).toBeDefined();
      expect(result.name).toBe("users");
    });

    it("should create refresh_tokens table", () => {
      const result = database.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='refresh_tokens'
      `).get();

      expect(result).toBeDefined();
      expect(result.name).toBe("refresh_tokens");
    });

    it("should create password_resets table", () => {
      const result = database.prepare(`
        SELECT name FROM sqlite_master WHERE type='table' AND name='password_resets'
      `).get();

      expect(result).toBeDefined();
      expect(result.name).toBe("password_resets");
    });
  });

  describe("Transactions Table Schema", () => {
    beforeAll(() => {
      initDatabase();
    });

    it("should have correct columns", () => {
      const columns = database.prepare(`PRAGMA table_info(transactions)`).all();
      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("type");
      expect(columnNames).toContain("payload");
      expect(columnNames).toContain("status");
      expect(columnNames).toContain("attempts");
      expect(columnNames).toContain("error");
      expect(columnNames).toContain("result");
      expect(columnNames).toContain("next_run_at");
      expect(columnNames).toContain("created_at");
      expect(columnNames).toContain("updated_at");
    });

    it("should have id as primary key", () => {
      const columns = database.prepare(`PRAGMA table_info(transactions)`).all();
      const idColumn = columns.find((col) => col.name === "id");

      expect(idColumn.pk).toBe(1);
    });

    it("should have NOT NULL constraints on required fields", () => {
      const columns = database.prepare(`PRAGMA table_info(transactions)`).all();
      const typeColumn = columns.find((col) => col.name === "type");
      const statusColumn = columns.find((col) => col.name === "status");
      const attemptsColumn = columns.find((col) => col.name === "attempts");

      expect(typeColumn.notnull).toBe(1);
      expect(statusColumn.notnull).toBe(1);
      expect(attemptsColumn.notnull).toBe(1);
    });
  });

  describe("Users Table Schema", () => {
    beforeAll(() => {
      initDatabase();
    });

    it("should have correct columns", () => {
      const columns = database.prepare(`PRAGMA table_info(users)`).all();
      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("email");
      expect(columnNames).toContain("username");
      expect(columnNames).toContain("password_hash");
      expect(columnNames).toContain("is_admin");
      expect(columnNames).toContain("email_verified");
      expect(columnNames).toContain("last_login_at");
      expect(columnNames).toContain("created_at");
      expect(columnNames).toContain("updated_at");
    });

    it("should have id as primary key", () => {
      const columns = database.prepare(`PRAGMA table_info(users)`).all();
      const idColumn = columns.find((col) => col.name === "id");

      expect(idColumn.pk).toBe(1);
    });

    it("should have UNIQUE constraints on email and username", () => {
      const indexes = database.prepare(`PRAGMA index_list(users)`).all();
      
      // SQLite automatically creates unique indexes for UNIQUE constraints
      expect(indexes.length).toBeGreaterThan(0);
      
      // Test by trying to insert duplicate email
      const testInsert = database.prepare(`
        INSERT INTO users (id, email, username, password_hash, is_admin, email_verified, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      testInsert.run("test1", "test@example.com", "testuser1", "hash1", 0, 0, "2024-01-01", "2024-01-01");
      
      expect(() => {
        testInsert.run("test2", "test@example.com", "testuser2", "hash2", 0, 0, "2024-01-01", "2024-01-01");
      }).toThrow();
    });

    it("should have default values for is_admin and email_verified", () => {
      const columns = database.prepare(`PRAGMA table_info(users)`).all();
      const isAdminColumn = columns.find((col) => col.name === "is_admin");
      const emailVerifiedColumn = columns.find((col) => col.name === "email_verified");

      expect(isAdminColumn.dflt_value).toBe("0");
      expect(emailVerifiedColumn.dflt_value).toBe("0");
    });
  });

  describe("Refresh Tokens Table Schema", () => {
    beforeAll(() => {
      initDatabase();
    });

    it("should have correct columns", () => {
      const columns = database.prepare(`PRAGMA table_info(refresh_tokens)`).all();
      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("user_id");
      expect(columnNames).toContain("token");
      expect(columnNames).toContain("expires_at");
      expect(columnNames).toContain("revoked_at");
      expect(columnNames).toContain("created_at");
    });

    it("should have foreign key to users table", () => {
      const foreignKeys = database.prepare(`PRAGMA foreign_key_list(refresh_tokens)`).all();
      
      expect(foreignKeys.length).toBeGreaterThan(0);
      const userFk = foreignKeys.find((fk) => fk.table === "users");
      expect(userFk).toBeDefined();
    });
  });

  describe("Password Resets Table Schema", () => {
    beforeAll(() => {
      initDatabase();
    });

    it("should have correct columns", () => {
      const columns = database.prepare(`PRAGMA table_info(password_resets)`).all();
      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toContain("id");
      expect(columnNames).toContain("user_id");
      expect(columnNames).toContain("token");
      expect(columnNames).toContain("expires_at");
      expect(columnNames).toContain("used_at");
      expect(columnNames).toContain("created_at");
    });

    it("should have foreign key to users table", () => {
      const foreignKeys = database.prepare(`PRAGMA foreign_key_list(password_resets)`).all();
      
      expect(foreignKeys.length).toBeGreaterThan(0);
      const userFk = foreignKeys.find((fk) => fk.table === "users");
      expect(userFk).toBeDefined();
    });
  });

  describe("Database Indexes", () => {
    beforeAll(() => {
      initDatabase();
    });

    it("should create index on transactions status and next_run_at", () => {
      const indexes = database.prepare(`PRAGMA index_list(transactions)`).all();
      const statusIndex = indexes.find((idx) => idx.name === "idx_transactions_status_next_run");

      expect(statusIndex).toBeDefined();
    });

    it("should create index on refresh_tokens user_id", () => {
      const indexes = database.prepare(`PRAGMA index_list(refresh_tokens)`).all();
      const userIndex = indexes.find((idx) => idx.name === "idx_refresh_tokens_user");

      expect(userIndex).toBeDefined();
    });

    it("should create index on password_resets token", () => {
      const indexes = database.prepare(`PRAGMA index_list(password_resets)`).all();
      const tokenIndex = indexes.find((idx) => idx.name === "idx_password_resets_token");

      expect(tokenIndex).toBeDefined();
    });
  });

  describe("Database Pragmas", () => {
    beforeAll(() => {
      initDatabase();
    });

    it("should enable foreign keys", () => {
      const result = database.pragma("foreign_keys");
      expect(result).toBe(1);
    });

    it("should use WAL journal mode", () => {
      const result = database.pragma("journal_mode");
      expect(result).toBe("wal");
    });

    it("should have NORMAL synchronous mode", () => {
      const result = database.pragma("synchronous");
      expect(result).toBe(1); // NORMAL = 1
    });
  });

  describe("Database Operations", () => {
    beforeAll(() => {
      initDatabase();
    });

    it("should support INSERT operations", () => {
      const stmt = database.prepare(`
        INSERT INTO transactions (id, type, payload, status, attempts, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      expect(() => {
        stmt.run("test-id", "mint", "{}", "queued", 0, "2024-01-01", "2024-01-01");
      }).not.toThrow();
    });

    it("should support SELECT operations", () => {
      const stmt = database.prepare(`SELECT * FROM transactions WHERE id = ?`);
      const result = stmt.get("test-id");

      expect(result).toBeDefined();
      expect(result.id).toBe("test-id");
    });

    it("should support UPDATE operations", () => {
      const updateStmt = database.prepare(`
        UPDATE transactions SET status = ? WHERE id = ?
      `);
      
      expect(() => {
        updateStmt.run("completed", "test-id");
      }).not.toThrow();

      const selectStmt = database.prepare(`SELECT status FROM transactions WHERE id = ?`);
      const result = selectStmt.get("test-id");
      expect(result.status).toBe("completed");
    });

    it("should support DELETE operations", () => {
      const deleteStmt = database.prepare(`DELETE FROM transactions WHERE id = ?`);
      
      expect(() => {
        deleteStmt.run("test-id");
      }).not.toThrow();

      const selectStmt = database.prepare(`SELECT * FROM transactions WHERE id = ?`);
      const result = selectStmt.get("test-id");
      expect(result).toBeUndefined();
    });

    it("should support transactions", () => {
      const insertStmt = database.prepare(`
        INSERT INTO transactions (id, type, payload, status, attempts, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const transaction = database.transaction(() => {
        insertStmt.run("tx-1", "mint", "{}", "queued", 0, "2024-01-01", "2024-01-01");
        insertStmt.run("tx-2", "burn", "{}", "queued", 0, "2024-01-01", "2024-01-01");
      });

      expect(() => transaction()).not.toThrow();

      const selectStmt = database.prepare(`SELECT COUNT(*) as count FROM transactions WHERE id IN (?, ?)`);
      const result = selectStmt.get("tx-1", "tx-2");
      expect(result.count).toBe(2);
    });
  });

  describe("Error Handling", () => {
    beforeAll(() => {
      initDatabase();
    });

    it("should throw error on invalid SQL", () => {
      expect(() => {
        database.prepare(`INVALID SQL STATEMENT`);
      }).toThrow();
    });

    it("should throw error on constraint violation", () => {
      const stmt = database.prepare(`
        INSERT INTO transactions (id, type, payload, status, attempts, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run("dup-id", "mint", "{}", "queued", 0, "2024-01-01", "2024-01-01");

      expect(() => {
        stmt.run("dup-id", "mint", "{}", "queued", 0, "2024-01-01", "2024-01-01");
      }).toThrow();
    });
  });
});
