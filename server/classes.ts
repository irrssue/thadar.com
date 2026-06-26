import "server-only";
import { prisma } from "./db";
import { writeAudit } from "./events";

/**
 * server/classes — data access for the per-class detail route. Authorization
 * (membership / teacher ownership) stays in the route handler; these functions
 * own the Prisma reads and writes.
 */

/**
 * Load a class for an active member, with the invite code stripped for
 * students. Returns null when the user is not an active member or the class
 * does not exist — the route maps both to a 404.
 */
export async function getClassForMember(userId: string, classId: string) {
  // Any active member may load class info; the invite code is teacher-only and
  // is stripped for students below.
  const membership = await prisma.classMembership.findFirst({
    where: {
      userId,
      classId,
      status: "ACTIVE",
    },
    select: { role: true },
  });
  if (!membership) return null;
  const isTeacher = membership.role === "TEACHER";

  const klass = await prisma.class.findUnique({
    where: { id: classId },
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
  if (!klass) return null;

  // Students must never see the invite code or whether joining is enabled.
  return {
    ...klass,
    role: membership.role,
    inviteCode: isTeacher ? klass.inviteCode : null,
    inviteCodeEnabled: isTeacher ? klass.inviteCodeEnabled : false,
  };
}

/** Apply a name/description edit. Only the provided fields are updated. */
export async function updateClassDetails(
  classId: string,
  data: { name?: string; description?: string | null },
) {
  return prisma.class.update({
    where: { id: classId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
    },
    select: { id: true, name: true, description: true },
  });
}

/** Delete a class (cascades memberships, lessons, assignments) and audit it. */
export async function deleteClassWithAudit(actorId: string, classId: string) {
  await prisma.class.delete({ where: { id: classId } });
  await writeAudit({
    actorId,
    action: "class.deleted",
    target: classId,
  });
  return { id: classId };
}
