import { prisma } from "@/server/db";
import { ok, requireUser } from "@/server/api";

export const runtime = "nodejs";

/**
 * Classes the current user is enrolled in as a student (active + pending),
 * for the student Classes page. Owned/teaching classes come from /api/classes.
 */
export async function GET() {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const memberships = await prisma.classMembership.findMany({
    where: {
      userId: gate.userId,
      role: "STUDENT",
      status: { in: ["ACTIVE", "PENDING"] },
      // Archived-by-admin classes drop out of the student's roster.
      class: { archivedAt: null },
    },
    orderBy: { joinedAt: "desc" },
    select: {
      id: true,
      status: true,
      joinedAt: true,
      class: {
        select: {
          id: true,
          name: true,
          description: true,
          owner: { select: { name: true } },
          _count: {
            select: { lessons: { where: { published: true } } },
          },
        },
      },
    },
  });

  return ok(memberships);
}
