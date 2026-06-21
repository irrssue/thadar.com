import { ok, fail, requireAdmin } from "@/server/api";
import { getAdminProfile } from "@/server/admin";

export const runtime = "nodejs";

/** The signed-in admin's profile, session stats and permissions. */
export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const profile = await getAdminProfile(gate.userId);
  if (!profile) return fail("Not found", 404);
  return ok(profile);
}
