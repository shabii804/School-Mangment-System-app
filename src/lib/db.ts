// ═══════════════════════════════════════════════════════════════
// SQLite Database — Source of truth for all school data
// All Zustand store collections are persisted here as JSON blobs.
// This ensures data survives refreshes, restarts, and is recoverable.
// ═══════════════════════════════════════════════════════════════

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Database file location — at project root so it persists
const DB_PATH = path.join(process.cwd(), "school.db");

// Ensure the directory exists (it should, but just in case)
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Singleton database connection
let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL"); // Better concurrent read/write performance
  db.pragma("foreign_keys = ON");
  initSchema(db);
  return db;
}

// ─── Schema ───
// We use a key-value store approach: each Zustand collection is stored as one JSON row.
// This is flexible, reliable, and easy to sync.
function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (CURRENT_TIMESTAMP)
    );

    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      action TEXT NOT NULL,
      key TEXT,
      timestamp TEXT DEFAULT (CURRENT_TIMESTAMP),
      success INTEGER DEFAULT 1
    );

    CREATE INDEX IF NOT EXISTS idx_app_state_key ON app_state(key);
    CREATE INDEX IF NOT EXISTS idx_sync_log_timestamp ON sync_log(timestamp);
  `);
}

// ─── Public API ───

// Save a single collection (key → JSON value)
export function saveState(key: string, value: any): boolean {
  try {
    const db = getDb();
    const json = JSON.stringify(value);
    db.prepare(`
      INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
    `).run(key, json);
    db.prepare(`INSERT INTO sync_log (action, key, success) VALUES (?, ?, 1)`).run("save", key);
    return true;
  } catch (e) {
    console.error(`[SQLite] Failed to save "${key}":`, e);
    try {
      const db = getDb();
      db.prepare(`INSERT INTO sync_log (action, key, success) VALUES (?, ?, 0)`).run("save", key);
    } catch {}
    return false;
  }
}

// Load a single collection
export function loadState<T>(key: string, fallback: T): T {
  try {
    const db = getDb();
    const row = db.prepare(`SELECT value FROM app_state WHERE key = ?`).get(key) as { value: string } | undefined;
    if (!row) return fallback;
    return JSON.parse(row.value) as T;
  } catch (e) {
    console.error(`[SQLite] Failed to load "${key}":`, e);
    return fallback;
  }
}

// Load ALL state (used on app startup)
export function loadAllState(): Record<string, any> {
  try {
    const db = getDb();
    const rows = db.prepare(`SELECT key, value FROM app_state`).all() as { key: string; value: string }[];
    const result: Record<string, any> = {};
    for (const row of rows) {
      try {
        result[row.key] = JSON.parse(row.value);
      } catch {
        result[row.key] = row.value;
      }
    }
    return result;
  } catch (e) {
    console.error("[SQLite] Failed to load all state:", e);
    return {};
  }
}

// Save all state at once (used for full sync)
export function saveAllState(state: Record<string, any>): boolean {
  try {
    const db = getDb();
    const saveMany = db.transaction((entries: [string, any][]) => {
      const stmt = db.prepare(`
        INSERT INTO app_state (key, value, updated_at) VALUES (?, ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')
      `);
      for (const [key, value] of entries) {
        stmt.run(key, JSON.stringify(value));
      }
    });
    saveMany(Object.entries(state));
    db.prepare(`INSERT INTO sync_log (action, key, success) VALUES (?, ?, 1)`).run("save_all", "*");
    return true;
  } catch (e) {
    console.error("[SQLite] Failed to save all state:", e);
    return false;
  }
}

// Get database stats (for the UI status indicator)
export function getDbStats(): { size: number; collections: number; lastSync: string | null } {
  try {
    const db = getDb();
    const countRow = db.prepare(`SELECT COUNT(*) as count FROM app_state`).get() as { count: number };
    const lastSyncRow = db.prepare(`SELECT timestamp FROM sync_log WHERE success = 1 ORDER BY id DESC LIMIT 1`).get() as { timestamp: string } | undefined;

    let size = 0;
    try {
      const stats = fs.statSync(DB_PATH);
      size = stats.size;
    } catch {}

    return {
      size,
      collections: countRow.count,
      lastSync: lastSyncRow?.timestamp || null,
    };
  } catch (e) {
    return { size: 0, collections: 0, lastSync: null };
  }
}

// Clear all data (for "reset" feature)
export function clearAllState(): boolean {
  try {
    const db = getDb();
    db.prepare(`DELETE FROM app_state`).run();
    db.prepare(`INSERT INTO sync_log (action, key, success) VALUES (?, ?, 1)`).run("clear", "*");
    return true;
  } catch (e) {
    console.error("[SQLite] Failed to clear state:", e);
    return false;
  }
}

export { DB_PATH };
