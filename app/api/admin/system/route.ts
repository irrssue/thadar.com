import { ok, requireAdmin } from "@/server/api";
import { getSystem } from "@/server/admin";

export const runtime = "nodejs";

/** Infrastructure + platform-scale metrics (real counts, storage, queue). */
export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  return ok(await getSystem());
}
