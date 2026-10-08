import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "edge";
export const revalidate = 0;

// Cloudflare Workers exposes deployment version metadata through a binding
// ({id, tag, timestamp}); fall back to "local" outside Workers (dev, tests).
function workerVersion(): string {
  const meta: unknown = process.env.CF_VERSION_METADATA;
  if (!meta) return "local";
  try {
    const id =
      typeof meta === "string"
        ? (JSON.parse(meta) as { id?: string }).id
        : (meta as { id?: string }).id;
    return id?.slice(0, 7) ?? "local";
  } catch {
    return "local";
  }
}

/**
 * GET /api/health
 * Uptime check endpoint for monitoring (Cloudflare, UptimeRobot, etc.)
 * Returns 200 if app + DB connection are healthy, 503 otherwise.
 */
export async function GET() {
  const start = Date.now();

  try {
    // Ping the Neon Data API with a lightweight query
    const supabase = await createClient();
    const { error } = await supabase
      .from("user_progress")
      .select("user_id", { count: "exact", head: true })
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: "degraded",
          db: "error",
          error: error.message,
          latency_ms: Date.now() - start,
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        status: "ok",
        db: "connected",
        latency_ms: Date.now() - start,
        timestamp: new Date().toISOString(),
        version: workerVersion(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache",
        },
      },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
        latency_ms: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
