import { prisma } from "@/server/db";
import { ok, fail, requireUser } from "@/server/api";
import { isClassTeacher } from "@/server/access";

export const runtime = "nodejs";

/**
 * Teacher gradebook for a class: every active student crossed with published
 * lessons (completion) and published assignments (submission status + grade).
 * Teacher-owner only.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  if (!(await isClassTeacher(gate.userId, id))) return fail("Not found", 404);

  const [students, lessons, assignments] = await Promise.all([
    prisma.classMembership.findMany({
      where: { classId: id, role: "STUDENT", status: "ACTIVE" },
      orderBy: { joinedAt: "asc" },
      select: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.lesson.findMany({
      where: { classId: id, published: true },
      orderBy: { order: "asc" },
      select: { id: true },
    }),
    prisma.assignment.findMany({
      where: { classId: id, status: "PUBLISHED" },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
      select: { id: true, title: true },
    }),
  ]);

  const lessonIds = lessons.map((l) => l.id);
  const assignmentIds = assignments.map((a) => a.id);
  const studentIds = students.map((s) => s.user.id);

  const [views, submissions] = await Promise.all([
    lessonIds.length && studentIds.length
      ? prisma.lessonView.findMany({
          where: { lessonId: { in: lessonIds }, userId: { in: studentIds } },
          select: { userId: true },
        })
      : Promise.resolve([]),
    assignmentIds.length && studentIds.length
      ? prisma.submission.findMany({
          where: { assignmentId: { in: assignmentIds }, studentId: { in: studentIds } },
          select: { assignmentId: true, studentId: true, status: true, grade: true },
        })
      : Promise.resolve([]),
  ]);

  const viewCount = new Map<string, number>();
  for (const v of views) viewCount.set(v.userId, (viewCount.get(v.userId) ?? 0) + 1);

  const subByStudent = new Map<string, Map<string, { status: string; grade: string | null }>>();
  for (const s of submissions) {
    if (!subByStudent.has(s.studentId)) subByStudent.set(s.studentId, new Map());
    subByStudent.get(s.studentId)!.set(s.assignmentId, { status: s.status, grade: s.grade });
  }

  const rows = students.map((s) => {
    const subs = subByStudent.get(s.user.id);
    return {
      id: s.user.id,
      name: s.user.name,
      email: s.user.email,
      lessonsViewed: viewCount.get(s.user.id) ?? 0,
      submissions: assignments.map((a) => ({
        assignmentId: a.id,
        ...(subs?.get(a.id) ?? { status: "NONE", grade: null }),
      })),
    };
  });

  return ok({
    totalLessons: lessons.length,
    assignments,
    students: rows,
  });
}
