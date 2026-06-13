import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { isClassTeacher } from "@/server/access";
import { writeAudit } from "@/server/events";

export const runtime = "nodejs";

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await ctx.params;

  // Any active member may load class info; the invite code is teacher-only and
  // is stripped for students below.
  const membership = await prisma.classMembership.findFirst({
    where: {
      userId: session.user.id,
      classId: id,
      status: "ACTIVE",
    },
    select: { role: true },
  });
  if (!membership) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }
  const isTeacher = membership.role === "TEACHER";

  const klass = await prisma.class.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      inviteCode: true,
      inviteCodeEnabled: true,
      createdAt: true,
      owner: { select: { name: true } },
      _count: {
        select: {
          memberships: { where: { role: "STUDENT", status: "ACTIVE" } },
        },
      },
    },
  });
  if (!klass) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }

  // Students must never see the invite code or whether joining is enabled.
  const data = {
    ...klass,
    role: membership.role,
    inviteCode: isTeacher ? klass.inviteCode : null,
    inviteCodeEnabled: isTeacher ? klass.inviteCodeEnabled : false,
  };

  return NextResponse.json<ApiResponse<typeof data>>(
    { success: true, data },
    { status: 200 },
  );
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
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await ctx.params;
  if (!(await isClassTeacher(session.user.id, id))) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Not found" },
      { status: 404 },
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

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid class data" },
      { status: 400 },
    );
  }

  const updated = await prisma.class.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
      ...(parsed.data.description !== undefined
        ? { description: parsed.data.description }
        : {}),
    },
    select: { id: true, name: true, description: true },
  });

  return NextResponse.json<ApiResponse<typeof updated>>(
    { success: true, data: updated },
    { status: 200 },
  );
}

// Delete a class (cascades memberships, lessons, assignments). Owner only.
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { id } = await ctx.params;
  if (!(await isClassTeacher(session.user.id, id))) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }

  await prisma.class.delete({ where: { id } });
  await writeAudit({
    actorId: session.user.id,
    action: "class.deleted",
    target: id,
  });

  return NextResponse.json<ApiResponse<{ id: string }>>(
    { success: true, data: { id } },
    { status: 200 },
  );
}
