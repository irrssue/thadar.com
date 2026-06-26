import { z } from "zod";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { ok, fail, readJson } from "@/server/api";

export const runtime = "nodejs";

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("Unauthorized", 401);
  }

  const classes = await prisma.class.findMany({
    where: { ownerId: session.user.id, archivedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      inviteCode: true,
      inviteCodeEnabled: true,
      createdAt: true,
      _count: {
        select: {
          memberships: { where: { role: "STUDENT", status: "ACTIVE" } },
        },
      },
    },
  });

  return ok(classes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("Unauthorized", 401);
  }

  const body = await readJson(req);
  if (body === undefined) {
    return fail("Invalid JSON body", 400);
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Invalid class data", 400);
  }

  const created = await prisma.$transaction(async (tx) => {
    const klass = await tx.class.create({
      data: {
        ownerId: session.user.id,
        name: parsed.data.name,
        description: parsed.data.description,
        inviteCode: null,
        inviteCodeEnabled: false,
      },
      select: { id: true, name: true, description: true, createdAt: true },
    });

    await tx.classMembership.create({
      data: {
        userId: session.user.id,
        classId: klass.id,
        role: "TEACHER",
        status: "ACTIVE",
      },
    });

    return klass;
  });

  return ok(created, 201);
}
