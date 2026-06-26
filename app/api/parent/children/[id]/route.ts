import { ok, fail, requireUser } from "@/server/api";
import { isParentOf, getChildPayload } from "@/server/parent";

export const runtime = "nodejs";

/**
 * Full read-only dashboard payload for one linked child. Gated on an ACTIVE
 * ParentLink — a parent can never read a child they aren't linked to (403).
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  if (!(await isParentOf(gate.userId, id))) return fail("Not found", 404);

  const child = await getChildPayload(id);
  if (!child) return fail("Not found", 404);

  return ok(child);
}
