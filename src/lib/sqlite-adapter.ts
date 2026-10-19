// ═══════════════════════════════════════════════════════════════
// SQLite Adapter — used by db.ts as the primary backend.
//
// Implements the SAME public API as the file-based fallback:
//   saveState(key, value): boolean         (sync)
//   loadState<T>(key, fallback): T         (sync)
//   loadAllState(): Record<string, any>    (sync)
//   saveAllState(state): boolean           (sync)
//   getDbStats(): { size, collections, lastSync }
//   clearAllState(): boolean               (sync)
//   testConnection(): { ok, error? }      (sync)
//
// All functions are SYNCHRONOUS because better-sqlite3 is sync.
// This matches the existing file-based db.ts contract — route.ts
// callers don't need to be changed to async.
//
// Schema: see schema.sql at the repo root. Two tables:
//   app_state (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)
//   app_meta  (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)
//
// The adapter auto-creates these tables via CREATE TABLE IF NOT
// EXISTS on first connection — no manual schema setup required.
// ═══════════════════════════════════════════════════════════════

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// ─── Database file location ───
// Configurable via SQLITE_DB_PATH env var; defaults to ./school-data.db
// in process.cwd(). Resolves to an absolute path so the file isn't
// affected by where the server is started from.
const DB_PATH = process.env.SQLITE_DB_PATH
  ? (path.isAbsolute(process.env.SQLITE_DB_PATH)
      ? process.env.SQLITE_DB_PATH
      : path.resolve(process.cwd(), process.env.SQLITE_DB_PATH))
  : path.join(process.cwd(), "school-data.db");

// Ensure the parent directory exists (so SQLite can create the file)
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// ─── Connection (single shared instance, sync API) ───
let db: Database.Database | null = null;
let connectionError: string | null = null;

function getDb(): Database.Database {
  if (db) return db;
  try {
    db = new Database(DB_PATH);
    // Performance pragmas — these apply to the connection (and any
    // future ones on the same file).
    db.pragma("journal_mode = WAL");        // Concurrent reads during writes
    db.pragma("foreign_keys = ON");          // Enforce FK constraints (future-proof)
    db.pragma("synchronous = NORMAL");       // Faster than FULL, safe with WAL
    // Auto-create schema (idempotent — IF NOT EXISTS)
    db.exec(`
      CREATE TABLE IF NOT EXISTS app_state (
        key         TEXT PRIMARY KEY NOT NULL,
        value       TEXT NOT NULL,
        updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_app_state_updated_at ON app_state(updated_at);
      CREATE TABLE IF NOT EXISTS app_meta (
        key         TEXT PRIMARY KEY NOT NULL,
        value       TEXT NOT NULL,
        updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT OR IGNORE INTO app_meta (key, value) VALUES ('schema_version', '1');
      INSERT OR IGNORE INTO app_meta (key, value) VALUES ('created_at', datetime('now'));
    `);
    connectionError = null;
    return db;
  } catch (e: any) {
    connectionError = e?.code || e?.message || "unknown";
    throw e;
  }
}

// ─── Prepared statements (cached for performance) ───
// better-sqlite3 caches prepared statements, so we just prepare
// them on first use via getters.

let stmtUpsert: Database.Statement | null = null;
let stmtSelectValue: Database.Statement | null = null;
let stmtSelectAll: Database.Statement | null = null;
let stmtDeleteAll: Database.Statement | null = null;
let stmtDeleteKey: Database.Statement | null = null;
let stmtStats: Database.Statement | null = null;

function upsertStmt(): Database.Statement {
  if (stmtUpsert) return stmtUpsert;
  stmtUpsert = getDb().prepare(
    `INSERT INTO app_state (key, value, updated_at)
     VALUES (?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET
       value = excluded.value,
       updated_at = datetime('now')`
  );
  return stmtUpsert;
}

function selectValueStmt(): Database.Statement {
  if (stmtSelectValue) return stmtSelectValue;
  stmtSelectValue = getDb().prepare(
    `SELECT value FROM app_state WHERE key = ? LIMIT 1`
  );
  return stmtSelectValue;
}

function selectAllStmt(): Database.Statement {
  if (stmtSelectAll) return stmtSelectAll;
  stmtSelectAll = getDb().prepare(`SELECT key, value FROM app_state`);
  return stmtSelectAll;
}

function deleteAllStmt(): Database.Statement {
  if (stmtDeleteAll) return stmtDeleteAll;
  stmtDeleteAll = getDb().prepare(`DELETE FROM app_state`);
  return stmtDeleteAll;
}

function deleteKeyStmt(): Database.Statement {
  if (stmtDeleteKey) return stmtDeleteKey;
  stmtDeleteKey = getDb().prepare(`DELETE FROM app_state WHERE key = ?`);
  return stmtDeleteKey;
}

function statsStmt(): Database.Statement {
  if (stmtStats) return stmtStats;
  stmtStats = getDb().prepare(
    `SELECT
       COUNT(*)                                AS collections,
       COALESCE(SUM(LENGTH(value)), 0)         AS size,
       MAX(updated_at)                          AS last_sync
     FROM app_state`
  );
  return stmtStats;
}

// ─── Public API ───

export function saveState(key: string, value: any): boolean {
  try {
    const json = JSON.stringify(value);
    upsertStmt().run(key, json);
    return true;
  } catch (e) {
    console.error(`[SQLite] saveState('${key}') failed:`, e);
    return false;
  }
}

export function loadState<T>(key: string, fallback: T): T {
  try {
    const row = selectValueStmt().get(key) as { value: string } | undefined;
    if (!row) return fallback;
    try { return JSON.parse(row.value) as T; }
    catch { return fallback; }
  } catch (e) {
    console.error(`[SQLite] loadState('${key}') failed:`, e);
    return fallback;
  }
}

export function loadAllState(): Record<string, any> {
  try {
    const rows = selectAllStmt().all() as { key: string; value: string }[];
    const out: Record<string, any> = {};
    for (const r of rows) {
      try { out[r.key] = JSON.parse(r.value); } catch { /* skip */ }
    }
    return out;
  } catch (e) {
    console.error("[SQLite] loadAllState() failed:", e);
    return {};
  }
}

export function saveAllState(state: Record<string, any>): boolean {
  try {
    const db = getDb();
    // Wrap in a transaction so the delete + inserts are atomic.
    // better-sqlite3's .transaction() returns a function that runs
    // the body in BEGIN ... COMMIT (or ROLLBACK on throw).
    const tx = db.transaction((entries: [string, any][]) => {
      deleteAllStmt().run();
      for (const [k, v] of entries) {
        upsertStmt().run(k, JSON.stringify(v));
      }
    });
    tx(Object.entries(state));
    return true;
  } catch (e) {
    console.error("[SQLite] saveAllState() failed:", e);
    return false;
  }
}

export function getDbStats(): { size: number; collections: number; lastSync: string | null } {
  try {
    const row = statsStmt().get() as
      | { collections: number; size: number; last_sync: string | null }
      | undefined;
    if (!row) return { size: 0, collections: 0, lastSync: null };
    return {
      size: Number(row.size) || 0,
      collections: Number(row.collections) || 0,
      lastSync: row.last_sync
        ? new Date(row.last_sync + "Z").toISOString()  // SQLite stores UTC as text
        : null,
    };
  } catch (e) {
    console.error("[SQLite] getDbStats() failed:", e);
    return { size: 0, collections: 0, lastSync: null };
  }
}

export function clearAllState(): boolean {
  try {
    deleteAllStmt().run();
    return true;
  } catch (e) {
    console.error("[SQLite] clearAllState() failed:", e);
    return false;
  }
}

export function deleteState(key: string): boolean {
  try {
    deleteKeyStmt().run(key);
    return true;
  } catch (e) {
    console.error(`[SQLite] deleteState('${key}') failed:`, e);
    return false;
  }
}

// Test the connection — used by /api/state/health (next commit)
export function testConnection(): { ok: boolean; error?: string } {
  try {
    const db = getDb();
    // SELECT 1 is the standard "ping" — throws if the DB is broken
    db.prepare("SELECT 1").get();
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.code || e?.message || "unknown" };
  }
}

// Close the connection (used for graceful shutdown / tests)
export function close(): void {
  if (db) {
    try { db.close(); } catch {}
    db = null;
    // Reset prepared statement cache too
    stmtUpsert = null;
    stmtSelectValue = null;
    stmtSelectAll = null;
    stmtDeleteAll = null;
    stmtDeleteKey = null;
    stmtStats = null;
  }
}

// Expose DB_PATH for diagnostics / health endpoint
export { DB_PATH };
