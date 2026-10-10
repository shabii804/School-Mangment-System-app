// ═══════════════════════════════════════════════════════════════
// File-based JSON Database — No native modules required
// Uses simple file I/O to persist all app state as a JSON file.
// This is 100% stable, no segfaults, no native module issues.
// ═══════════════════════════════════════════════════════════════

import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "school-data.json");

// Ensure the directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// In-memory cache (loaded once, updated on writes)
let cache: Record<string, any> | null = null;

function loadCache(): Record<string, any> {
  if (cache) return cache;
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      cache = JSON.parse(raw);
    } else {
      cache = {};
    }
  } catch (e) {
    console.error("[FileDB] Failed to load:", e);
    cache = {};
  }
  return cache!;
}

function saveCache(): boolean {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(cache, null, 2), "utf-8");
    return true;
  } catch (e) {
    console.error("[FileDB] Failed to save:", e);
    return false;
  }
}

// ─── Public API (same interface as SQLite version) ───

export function saveState(key: string, value: any): boolean {
  try {
    const data = loadCache();
    data[key] = value;
    return saveCache();
  } catch (e) {
    console.error("[FileDB] saveState error:", e);
    return false;
  }
}

export function loadState<T>(key: string, fallback: T): T {
  try {
    const data = loadCache();
    return key in data ? (data[key] as T) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function loadAllState(): Record<string, any> {
  return loadCache();
}

export function saveAllState(state: Record<string, any>): boolean {
  try {
    cache = { ...state };
    return saveCache();
  } catch (e) {
    console.error("[FileDB] saveAllState error:", e);
    return false;
  }
}

export function getDbStats(): { size: number; collections: number; lastSync: string | null } {
  try {
    const data = loadCache();
    let size = 0;
    try {
      size = fs.statSync(DB_PATH).size;
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
  try {
    cache = {};
    return saveCache();
  } catch (e) {
    console.error("[FileDB] clearAllState error:", e);
    return false;
  }
}

export { DB_PATH };
