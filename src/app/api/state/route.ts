// ═══════════════════════════════════════════════════════════════
// /api/state — SQLite sync endpoint
// GET: returns all app state from SQLite
// POST: saves the entire app state to SQLite
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { loadAllState, saveAllState, saveState, getDbStats } from "@/lib/db";

// Disable static optimization — this is a dynamic API
export const dynamic = "force-dynamic";

// GET /api/state — load all state from SQLite
export async function GET() {
  try {
    const state = loadAllState();
    const stats = getDbStats();
    return NextResponse.json({
      success: true,
      state,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error("[API /state GET] Error:", e);
    return NextResponse.json(
      { success: false, error: e.message || "Failed to load state" },
      { status: 500 }
    );
  }
}

// POST /api/state — save all state to SQLite
// Body: { state: { students: [...], teachers: [...], ... } }
// OR: { key: "students", value: [...] } for single-collection save
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Single-collection save
    if (body.key && body.value !== undefined) {
      const ok = saveState(body.key, body.value);
      return NextResponse.json({ success: ok, key: body.key });
    }

    // Full state save
    if (body.state && typeof body.state === "object") {
      const ok = saveAllState(body.state);
      const stats = getDbStats();
      return NextResponse.json({
        success: ok,
        stats,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid request body. Expected { state } or { key, value }" },
      { status: 400 }
    );
  } catch (e: any) {
    console.error("[API /state POST] Error:", e);
    return NextResponse.json(
      { success: false, error: e.message || "Failed to save state" },
      { status: 500 }
    );
  }
}

// DELETE /api/state — clear all data
export async function DELETE() {
  try {
    const { clearAllState } = await import("@/lib/db");
    const ok = clearAllState();
    return NextResponse.json({ success: ok });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: e.message || "Failed to clear state" },
      { status: 500 }
    );
  }
}
