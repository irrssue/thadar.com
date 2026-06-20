import { prisma } from "@/server/db";
import { ok, requireUser } from "@/server/api";

export const runtime = "nodejs";

/**
 * Aggregate for the teacher's cross-class pages (home, assignments, students,
 * classes, profile). Returns every class the user owns with its assignments —
 * each carrying the submissions (status, grade, timestamps) the redesigned
 * dashboard derives its gauges, trends, distributions and grading queue from —
 * plus the active/pending roster. One round trip instead of N client fetches.
 */
export async function GET() {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const classes = await prisma.class.findMany({
    where: { ownerId: gate.userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      assignments: {
        orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          status: true,
          dueAt: true,
          createdAt: true,
          submissions: {
            select: {
              studentId: true,
              status: true,
              grade: true,
              submittedAt: true,
              gradedAt: true,
            },
          },
          _count: { select: { submissions: true } },
        },
      },
      memberships: {
        where: { role: "STUDENT", status: { in: ["ACTIVE", "PENDING"] } },
        orderBy: { joinedAt: "asc" },
        select: {
          id: true,
          status: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  const shaped = classes.map((c) => {
    const active = c.memberships.filter((m) => m.status === "ACTIVE");
    const pending = c.memberships.filter((m) => m.status === "PENDING");
    return {
      id: c.id,
      name: c.name,
      assignments: c.assignments,
      students: active,
      pending,
      activeCount: active.length,
      pendingCount: pending.length,
    };
  });

  // Submissions still awaiting a grade (status SUBMITTED) across every class.
  const toGrade = shaped.reduce(
    (n, c) =>
      n +
      c.assignments.reduce(
        (m, a) => m + a.submissions.filter((s) => s.status === "SUBMITTED").length,
        0,
      ),
    0,
  );
  const graded = shaped.reduce(
    (n, c) =>
      n +
      c.assignments.reduce(
        (m, a) => m + a.submissions.filter((s) => s.status !== "SUBMITTED").length,
        0,
      ),
    0,
  );

  const totals = {
    classes: shaped.length,
    students: shaped.reduce((n, c) => n + c.activeCount, 0),
    pending: shaped.reduce((n, c) => n + c.pendingCount, 0),
    assignments: shaped.reduce((n, c) => n + c.assignments.length, 0),
    needsGrading: shaped.reduce(
      (n, c) => n + c.assignments.filter((a) => a.status === "PUBLISHED" && a._count.submissions > 0).length,
      0,
    ),
    toGrade,
    graded,
  };

  return ok({ totals, classes: shaped });
}
