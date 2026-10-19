-- ═══════════════════════════════════════════════════════════════
-- SQLite Schema for School Management System (SMS)
--
-- The Next.js backend (src/lib/sqlite-adapter.ts) auto-creates this
-- schema on first run, so running this file is OPTIONAL. It's
-- provided for:
--   - Manual inspection of the schema
--   - Pre-provisioning in CI/CD pipelines
--   - Documenting the expected table layout
--
-- Usage (optional — adapter auto-creates on first run):
--   sqlite3 school-data.db < schema.sql
--
-- Or via the sqlite3 CLI:
--   $ sqlite3 school-data.db
--   sqlite> .read schema.sql
--
-- The database file location is configurable via SQLITE_DB_PATH
-- env var (defaults to ./school-data.db in process.cwd()).
-- ═══════════════════════════════════════════════════════════════

-- 1. App state table — single-row key/value store (JSON values)
-- The Next.js backend stores every Zustand store collection
-- (students, teachers, staff, feeCollections, activities, etc.)
-- as one row per collection. The 'value' column holds the JSON
-- payload so we don't need a separate table per entity type.
CREATE TABLE IF NOT EXISTS app_state (
  key         TEXT PRIMARY KEY NOT NULL,
  value       TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index on updated_at (used by getDbStats for MAX(updated_at))
CREATE INDEX IF NOT EXISTS idx_app_state_updated_at ON app_state(updated_at);

-- 2. Metadata table — schema versioning and other key/value pairs
CREATE TABLE IF NOT EXISTS app_meta (
  key         TEXT PRIMARY KEY NOT NULL,
  value       TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed the schema version (INSERT OR IGNORE so re-running is safe)
INSERT OR IGNORE INTO app_meta (key, value) VALUES ('schema_version', '1');
INSERT OR IGNORE INTO app_meta (key, value) VALUES ('created_at', datetime('now'));

-- 3. Verify
SELECT 'schema created successfully' AS message;
SELECT key FROM app_meta ORDER BY key;
