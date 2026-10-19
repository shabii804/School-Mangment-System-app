// ═══════════════════════════════════════════════════════════════
// /api/state/health — Database connection health check
// GET: returns the active backend (sqlite or file) and connection
//      status. Useful for:
//        - Docker/Kubernetes readiness probes
//        - Monitoring dashboards (Datadog, Grafana, etc.)
//        - Debugging 'why isn't SQLite being used?' questions
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { testConnection, getDbPath } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  try {
    const result = testConnection();
    const responseTimeMs = Date.now() - startedAt;
    return NextResponse.json({
      success: result.ok,
      backend: result.backend,
      dbPath: getDbPath(),
      responseTimeMs,
      timestamp: new Date().toISOString(),
      ...(result.error ? { error: result.error } : {}),
    }, { status: result.ok ? 200 : 503 });
  } catch (e: any) {
    return NextResponse.json({
      success: false,
      backend: "unknown",
      responseTimeMs: Date.now() - startedAt,
      error: e?.message || "Health check failed",
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}
