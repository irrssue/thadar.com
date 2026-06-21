import { ok, requireAdmin } from "@/server/api";
import { listUsers } from "@/server/admin";

export const runtime = "nodejs";

/** Platform-wide user directory. */
export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  return ok(await listUsers());
}
