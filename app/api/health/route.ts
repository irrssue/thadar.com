import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import type { ApiResponse } from "@/server/api";

export const runtime = "nodejs";
// Liveness/readiness probe — must reflect the live process, never a cached result.
export const dynamic = "force-dynamic";

type Health = {
  status: "ok" | "degraded";
  db: "up" | "down";
  uptimeSeconds: number;
  timestamp: string;
};

/**
 * Public health check for Docker, Cloudflare Tunnel, and uptime monitoring.
 * No auth — it must answer before/independent of any session. Returns 200 when
 * the database is reachable and 503 when it is not, so orchestrators can gate
 * traffic on readiness.
 *
 * Uses a raw `SELECT 1` deliberately (documented exception to the no-raw-SQL
 * rule): the probe must verify the connection itself without depending on any
 * particular table or the migration state of the schema.
 */
export async function GET() {
  let dbUp = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbUp = true;
  } catch {
    dbUp = false;
  }

  if (!dbUp) {
    const body: ApiResponse<Health> = { success: false, error: "database unreachable" };
    return NextResponse.json(body, { status: 503 });
  }

  const body: ApiResponse<Health> = {
    success: true,
    data: {
      status: "ok",
      db: "up",
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  };
  return NextResponse.json(body, { status: 200 });
}
