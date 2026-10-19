// ═══════════════════════════════════════════════════════════════
// Database Adapter — uses SQLite by default, file-based JSON as
// fallback if better-sqlite3 fails to load.
//
// Backend selection:
//   1. SQLite (default)  — via sqlite-adapter.ts (better-sqlite3)
//   2. File fallback     — if better-sqlite3 import throws (e.g.
//                          native binary missing on exotic platform)
//
// Both backends implement the SAME SYNCHRONOUS API:
//   saveState(key, value): boolean
//   loadState<T>(key, fallback): T
//   loadAllState(): Record<string, any>
//   saveAllState(state): boolean
//   getDbStats(): { size, collections, lastSync }
//   clearAllState(): boolean
//   testConnection(): { ok, backend, error? }
//
// Functions are SYNCHRONOUS because better-sqlite3 is sync. Callers
// (api/state/route.ts) don't need to be async.
// ═══════════════════════════════════════════════════════════════

import fs from "fs";
import path from "path";
import { createRequire } from "module";

// ─── Backend detection (run once on module load) ───
// Try to load better-sqlite3. If it fails (e.g., native binary
// missing on an unsupported platform), fall back to the file-based
// JSON store. The fallback is automatic and transparent — callers
// don't need to know which backend is active.
//
// We use createRequire() instead of a top-level ESM import because
// (a) we need the import to throw on failure (so we can catch it
// and fall back), and (b) the existing file is .ts compiled to CJS
// by Next.js for the server runtime.
type SqliteAdapter = typeof import("./sqlite-adapter");
let sqliteAdapter: SqliteAdapter | null = null;
let sqliteLoadError: string | null = null;
try {
  const require = createRequire(import.meta.url);
  sqliteAdapter = require("./sqlite-adapter");
} catch (e: any) {
  sqliteLoadError = e?.message || String(e);
  console.warn(
    "[db] better-sqlite3 failed to load — falling back to file-based JSON store.",
    "\n  Error:", sqliteLoadError,
    "\n  To enable SQLite: run `npm install` to install native binaries.",
  );
}

function isSqliteAvailable(): boolean {
  return sqliteAdapter !== null;
}

// ─── File backend (fallback) ───
const FILE_DB_PATH = path.join(process.cwd(), "school-data.json");
const fileDbDir = path.dirname(FILE_DB_PATH);
if (!fs.existsSync(fileDbDir)) {
  fs.mkdirSync(fileDbDir, { recursive: true });
}

// In-memory cache for the file backend (loaded once, updated on writes)
let fileCache: Record<string, any> | null = null;

function loadCacheFromFile(): Record<string, any> {
  if (fileCache) return fileCache;
  try {
    if (fs.existsSync(FILE_DB_PATH)) {
      const raw = fs.readFileSync(FILE_DB_PATH, "utf-8");
      fileCache = JSON.parse(raw);
    } else {
      fileCache = {};
    }
  } catch (e) {
    console.error("[FileDB] Failed to load:", e);
    fileCache = {};
  }
  return fileCache!;
}

function saveCacheToFile(): boolean {
  try {
    fs.writeFileSync(FILE_DB_PATH, JSON.stringify(fileCache, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("[FileDB] Failed to save:", e);
    return false;
  }
}

// ─── Public API ───
// Each function dispatches to SQLite or file backend.

export function saveState(key: string, value: any): boolean {
  if (isSqliteAvailable()) {
    return sqliteAdapter!.saveState(key, value);
  }
  // File backend
  try {
    const data = loadCacheFromFile();
    data[key] = value;
    return saveCacheToFile();
  } catch (e) {
    console.error("[FileDB] saveState error:", e);
    return false;
  }
}

export function loadState<T>(key: string, fallback: T): T {
  if (isSqliteAvailable()) {
    return sqliteAdapter!.loadState<T>(key, fallback);
  }
  // File backend
  try {
    const data = loadCacheFromFile();
    return key in data ? (data[key] as T) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function loadAllState(): Record<string, any> {
  if (isSqliteAvailable()) {
    return sqliteAdapter!.loadAllState();
  }
  // File backend
  return loadCacheFromFile();
}

export function saveAllState(state: Record<string, any>): boolean {
  if (isSqliteAvailable()) {
    return sqliteAdapter!.saveAllState(state);
  }
  // File backend
  try {
    fileCache = { ...state };
    return saveCacheToFile();
  } catch (e) {
    console.error("[FileDB] saveAllState error:", e);
    return false;
  }
}

export function getDbStats(): { size: number; collections: number; lastSync: string | null } {
  if (isSqliteAvailable()) {
    return sqliteAdapter!.getDbStats();
  }
  // File backend
  try {
    const data = loadCacheFromFile();
    let size = 0;
    try {
      size = fs.statSync(FILE_DB_PATH).size;
    } catch {}
    return {
      size,
      collections: Object.keys(data).length,
      lastSync: new Date().toISOString(),
    };
  } catch {
    return { size: 0, collections: 0, lastSync: null };
  }
}

export function clearAllState(): boolean {
  if (isSqliteAvailable()) {
    return sqliteAdapter!.clearAllState();
  }
  // File backend
  try {
    fileCache = {};
    return saveCacheToFile();
  } catch (e) {
    console.error("[FileDB] clearAllState error:", e);
    return false;
  }
}

// Test the DB connection — used by /api/state/health (next commit).
// Returns which backend is active so callers can show that in
// monitoring/dashboards.
export function testConnection(): { ok: boolean; backend: "sqlite" | "file"; error?: string } {
  if (isSqliteAvailable()) {
    const result = sqliteAdapter!.testConnection();
    return { ...result, backend: "sqlite" };
  }
  // File backend is always reachable (it's just fs)
  return { ok: true, backend: "file" };
}

// Path of the active backend's primary storage file — used for
// diagnostics in /api/state/health.
export function getDbPath(): string {
  if (isSqliteAvailable()) {
    return sqliteAdapter!.DB_PATH;
  }
  return FILE_DB_PATH;
}

// Re-export DB_PATH for backwards compatibility with existing
// imports (the seed script doesn't use it, but other code might).
export const DB_PATH = isSqliteAvailable() ? sqliteAdapter!.DB_PATH : FILE_DB_PATH;
