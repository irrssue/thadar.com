import { z } from "zod";
import { ok, fail, requireAdmin, readJson } from "@/server/api";
import { setClassArchived, deleteClass } from "@/server/admin";

export const runtime = "nodejs";

const patchSchema = z.object({ archived: z.boolean() });

/** Archive or restore a class (archived classes vanish from both rosters). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const { id } = await params;

  const body = await readJson(req);
  if (body === undefined) return fail("Invalid JSON body");
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid request");

  try {
    await setClassArchived(gate.userId, id, parsed.data.archived);
    return ok({ id });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Action failed");
  }
}

/** Permanently delete a class and all its content (super admin only). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  if (gate.role !== "SUPER_ADMIN") return fail("Forbidden", 403);
  const { id } = await params;
  try {
    await deleteClass(gate.userId, id);
    return ok({ id });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Delete failed");
  }
}
