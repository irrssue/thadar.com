import { ok, requireAdmin } from "@/server/api";
import { getOverview } from "@/server/admin";

export const runtime = "nodejs";

/** Platform overview: KPIs, growth, role mix, live traffic, health, feed, queue. */
export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  return ok(await getOverview());
}
