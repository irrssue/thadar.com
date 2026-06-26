import { z } from "zod";
import { auth } from "@/server/auth";
import { isClassTeacher } from "@/server/access";
import { ok, fail, readJson } from "@/server/api";
import {
  getClassForMember,
  updateClassDetails,
  deleteClassWithAudit,
} from "@/server/classes";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("Unauthorized", 401);
  }

  const { id } = await ctx.params;
  const data = await getClassForMember(session.user.id, id);
  if (!data) {
    return fail("Not found", 404);
  }

  return ok(data);
}

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(2000).nullish(),
});

// Edit class name / description. Teacher-owner only.
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("Unauthorized", 401);
  }

  const { id } = await ctx.params;
  if (!(await isClassTeacher(session.user.id, id))) {
    return fail("Not found", 404);
  }

  const body = await readJson(req);
  if (body === undefined) {
    return fail("Invalid JSON body", 400);
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Invalid class data", 400);
  }

  const updated = await updateClassDetails(id, parsed.data);

  return ok(updated);
}

// Delete a class (cascades memberships, lessons, assignments). Owner only.
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("Unauthorized", 401);
  }

  const { id } = await ctx.params;
  if (!(await isClassTeacher(session.user.id, id))) {
    return fail("Not found", 404);
  }

  const data = await deleteClassWithAudit(session.user.id, id);

  return ok(data);
}
