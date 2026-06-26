import "server-only";
import { prisma } from "@/server/db";
import { relTime } from "./shared";
import type { AuditLevel, AuditEntry } from "@/app/admin/types";

/* ----------------------------- audit ----------------------------- */

function levelForAction(action: string): AuditLevel {
  if (action.includes("failed") || action.includes("delete") || action.includes("denied")) return "alert";
  if (action.includes("suspend") || action.includes("role") || action.includes("archive") || action.includes("reject") || action.includes("remove")) return "warn";
  return "info";
}

export async function listAudit(): Promise<AuditEntry[]> {
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    select: { action: true, createdAt: true, target: true, actor: { select: { name: true, email: true } } },
  });
  return rows.map((r) => ({
    event: r.action,
    actor: r.actor?.name ?? r.actor?.email ?? "system",
    ip: "—",
    when: relTime(r.createdAt),
    level: levelForAction(r.action),
  }));
}
