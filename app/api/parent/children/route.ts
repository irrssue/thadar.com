import { ok, requireUser } from "@/server/api";
import { getLinkedChildren } from "@/server/parent";

export const runtime = "nodejs";

/** Children the signed-in parent is actively linked to (switcher + list). */
export async function GET() {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const children = await getLinkedChildren(gate.userId);
  return ok(children);
}
