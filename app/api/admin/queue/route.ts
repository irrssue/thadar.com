import { z } from "zod";
import { ok, fail, requireAdmin, readJson } from "@/server/api";
import { getQueue, resolveQueueItem } from "@/server/admin";

export const runtime = "nodejs";

/** The live moderation / review queue. */
export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  return ok(await getQueue());
}

const postSchema = z.object({
  id: z.string().min(1),
  approve: z.boolean(),
});

/** Resolve one queue item (approve = affirmative action, else reject). */
export async function POST(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const body = await readJson(req);
  if (body === undefined) return fail("Invalid JSON body");
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid request");

  try {
    await resolveQueueItem(gate.userId, parsed.data.id, parsed.data.approve);
    return ok(await getQueue());
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Action failed");
  }
}
