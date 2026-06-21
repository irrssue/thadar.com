import { z } from "zod";
import { ok, fail, requireAdmin, readJson } from "@/server/api";
import { getSettings, updateSetting } from "@/server/admin";

export const runtime = "nodejs";

/** Read merged platform settings (defaults + stored overrides). */
export async function GET() {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  return ok(await getSettings());
}

const patchSchema = z.object({
  key: z.string().min(1),
  value: z.union([z.boolean(), z.string().max(200)]),
});

/** Update a single platform setting. */
export async function PATCH(req: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;

  const body = await readJson(req);
  if (body === undefined) return fail("Invalid JSON body");
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid request");

  try {
    const settings = await updateSetting(gate.userId, parsed.data.key, parsed.data.value);
    return ok(settings);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Update failed");
  }
}
