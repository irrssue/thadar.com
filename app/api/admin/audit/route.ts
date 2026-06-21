import { ok, requireAdmin } from "@/server/api";
import { listAudit } from "@/server/admin";

export const runtime = "nodejs";

/** Security / audit log — the real AuditLog stream. */
export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  return ok(await listAudit());
}
