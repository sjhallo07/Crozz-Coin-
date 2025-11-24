import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = process.env.CROZZ_DATA_DIR ?? path.resolve(process.cwd(), 'data');
const DB_PATH = process.env.CROZZ_DB_PATH ?? path.join(DATA_DIR, 'crozz.sqlite');

// Directory and database initialization is now deferred to initDatabase().

/**
 * Initializes the database and creates required tables if they do not exist.
 *
 * IMPORTANT: This function must be called once at application startup,
 * before any services are instantiated or any code attempts to access the database.
 * Failing to do so may result in runtime errors due to an uninitialized database.
 */
let database = null;

function initDatabase() {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  } catch (err) {
    console.error('Failed to create database directory:', err);
    throw err;
  }
  try {
    database = new Database(DB_PATH);
    database.pragma('journal_mode = WAL');
    database.pragma('synchronous = NORMAL');
    database.pragma('foreign_keys = ON');

    database.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        payload TEXT,
        status TEXT NOT NULL,
        attempts INTEGER NOT NULL,
        error TEXT,
        result TEXT,
        next_run_at INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_status_next_run
        ON transactions (status, next_run_at);

      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        is_admin INTEGER NOT NULL DEFAULT 0,
        email_verified INTEGER NOT NULL DEFAULT 0,
        last_login_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        revoked_at INTEGER,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user
        ON refresh_tokens (user_id);

      CREATE TABLE IF NOT EXISTS password_resets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        used_at INTEGER,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_password_resets_token
        ON password_resets (token);
    `);
  } catch (err) {
    console.error('Failed to initialize database:', err);
    throw err;
  }
}

export { DB_PATH, database, initDatabase };
