import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
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

  return NextResponse.json<ApiResponse<typeof classes>>(
    { success: true, data: classes },
    { status: 200 },
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid class data" },
      { status: 400 },
    );
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

  return NextResponse.json<ApiResponse<typeof created>>(
    { success: true, data: created },
    { status: 201 },
  );
}
