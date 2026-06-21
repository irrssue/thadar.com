import { ok, requireAdmin } from "@/server/api";
import { listClasses } from "@/server/admin";

export const runtime = "nodejs";

/** Org-wide directory of every class. */
export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  return ok(await listClasses());
}
