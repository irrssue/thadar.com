import { z } from "zod";
import { Prisma } from "@prisma/client";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { generateInviteCode } from "@/lib/inviteCode";
import { ok, fail, readJson } from "@/server/api";

export const runtime = "nodejs";

const MAX_COLLISION_RETRIES = 8;

async function requireTeacherOwnership(userId: string, classId: string) {
  return prisma.classMembership.findFirst({
    where: { userId, classId, role: "TEACHER", status: "ACTIVE" },
  });
}

// Generate or rotate the invite code for a class. Always enables joining.
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("Unauthorized", 401);
  }

  const { id } = await ctx.params;
  const membership = await requireTeacherOwnership(session.user.id, id);
  if (!membership) {
    return fail("Not found", 404);
  }

  for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt++) {
    const inviteCode = generateInviteCode();
    try {
      const updated = await prisma.class.update({
        where: { id },
        data: { inviteCode, inviteCodeEnabled: true },
        select: { inviteCode: true, inviteCodeEnabled: true },
      });
      return ok(updated);
    } catch (err) {
      // P2002 = unique constraint violation; retry with a fresh code.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        continue;
      }
      throw err;
    }
  }

  return fail("Could not allocate invite code", 500);
}

const patchSchema = z.object({
  enabled: z.boolean(),
});

// Toggle invite-code joining on or off without rotating the code itself.
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("Unauthorized", 401);
  }

  const { id } = await ctx.params;
  const membership = await requireTeacherOwnership(session.user.id, id);
  if (!membership) {
    return fail("Not found", 404);
  }

  const body = await readJson(req);
  if (body === undefined) {
    return fail("Invalid JSON body", 400);
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Invalid payload", 400);
  }

  const klass = await prisma.class.findUnique({
    where: { id },
    select: { inviteCode: true },
  });
  if (parsed.data.enabled && !klass?.inviteCode) {
    return fail("Generate a code before enabling joining", 400);
  }

  const updated = await prisma.class.update({
    where: { id },
    data: { inviteCodeEnabled: parsed.data.enabled },
    select: { inviteCode: true, inviteCodeEnabled: true },
  });

  return ok(updated);
}
