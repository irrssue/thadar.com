import { z } from "zod";
import { prisma } from "@/server/db";
import { ok, fail, requireUser, readJson } from "@/server/api";
import { isClassTeacher, isClassMember } from "@/server/access";

export const runtime = "nodejs";

/**
 * List assignments for a class. Teachers see every assignment (incl. drafts)
 * with submission counts; students see only PUBLISHED ones with their own
 * submission status.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  const teacher = await isClassTeacher(gate.userId, id);

  if (!teacher) {
    if (!(await isClassMember(gate.userId, id))) return fail("Not found", 404);
    const assignments = await prisma.assignment.findMany({
      where: { classId: id, status: "PUBLISHED" },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        instructions: true,
        dueAt: true,
        createdAt: true,
        submissions: {
          where: { studentId: gate.userId },
          select: { id: true, status: true, grade: true, submittedAt: true },
        },
      },
    });
    return ok(assignments);
  }

  const assignments = await prisma.assignment.findMany({
    where: { classId: id },
    orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      instructions: true,
      dueAt: true,
      status: true,
      createdAt: true,
      _count: { select: { submissions: true } },
      // submission timestamps only — used to derive how many came in after dueAt
      submissions: { select: { submittedAt: true } },
    },
  });

  // A submission is "late" when it landed after the assignment's due date.
  const withLate = assignments.map(({ submissions, ...a }) => ({
    ...a,
    lateCount: a.dueAt
      ? submissions.filter((s) => s.submittedAt > a.dueAt!).length
      : 0,
  }));
  return ok(withLate);
}

const createSchema = z.object({
  title: z.string().trim().min(1).max(160),
  instructions: z.string().trim().max(8000).optional(),
  lessonId: z.string().cuid().nullish(),
  dueAt: z.string().datetime().nullish(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

/** Create an assignment (draft or published). Teacher-owner only. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  if (!(await isClassTeacher(gate.userId, id))) return fail("Not found", 404);

  const body = await readJson(req);
  if (body === undefined) return fail("Invalid JSON body");
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid assignment data");

  // If a lesson is linked, ensure it belongs to this class.
  if (parsed.data.lessonId) {
    const lesson = await prisma.lesson.findFirst({
      where: { id: parsed.data.lessonId, classId: id },
      select: { id: true },
    });
    if (!lesson) return fail("Lesson does not belong to this class");
  }

  const created = await prisma.assignment.create({
    data: {
      classId: id,
      authorId: gate.userId,
      title: parsed.data.title,
      instructions: parsed.data.instructions ?? "",
      lessonId: parsed.data.lessonId ?? null,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
      status: parsed.data.status,
    },
    select: {
      id: true,
      title: true,
      instructions: true,
      dueAt: true,
      status: true,
      createdAt: true,
    },
  });

  // If created directly as published, fan out notifications.
  if (created.status === "PUBLISHED") {
    const klass = await prisma.class.findUnique({
      where: { id },
      select: { name: true, owner: { select: { email: true } } },
    });
    if (klass) {
      const { onAssignmentPosted } = await import("@/server/events");
      await onAssignmentPosted({
        classId: id,
        className: klass.name,
        assignmentId: created.id,
        title: created.title,
        teacherEmail: klass.owner.email,
      });
    }
  }

  return ok(created, 201);
}
