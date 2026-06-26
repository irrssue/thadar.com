import "server-only";
import { prisma } from "@/server/db";
import { writeAudit } from "@/server/events";
import type { AccountStatus, PlatformRole, TeacherStatus } from "@prisma/client";

/* ----------------------------- mutations ----------------------------- */

async function guardTarget(userId: string): Promise<{ id: string; platformRole: PlatformRole; email: string }> {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, platformRole: true, email: true } });
  if (!u) throw new Error("User not found");
  return u;
}

/** Suspend (lock out everywhere), reactivate, or set pending. */
export async function setUserStatus(actorId: string, userId: string, status: AccountStatus): Promise<void> {
  const target = await guardTarget(userId);
  if (target.platformRole === "SUPER_ADMIN" && status === "SUSPENDED") {
    throw new Error("A super admin cannot be suspended");
  }
  await prisma.user.update({ where: { id: userId }, data: { status } });
  await writeAudit({
    actorId,
    action: status === "SUSPENDED" ? "user.suspend" : "user.activate",
    target: userId,
    metadata: { email: target.email, status },
  });
}

/** Approve / reject a teacher verification request. */
export async function setTeacherStatus(actorId: string, userId: string, teacherStatus: TeacherStatus): Promise<void> {
  const target = await guardTarget(userId);
  await prisma.user.update({ where: { id: userId }, data: { teacherStatus } });
  await writeAudit({
    actorId,
    action: teacherStatus === "VERIFIED" ? "teacher.verify" : "teacher.reject",
    target: userId,
    metadata: { email: target.email, teacherStatus },
  });
}

/** Grant or revoke a platform admin role (SUPER_ADMIN actor only — enforced in the route). */
export async function setPlatformRole(actorId: string, userId: string, platformRole: PlatformRole): Promise<void> {
  const target = await guardTarget(userId);
  if (target.platformRole === "SUPER_ADMIN" && platformRole !== "SUPER_ADMIN") {
    throw new Error("A super admin's role cannot be changed");
  }
  await prisma.user.update({ where: { id: userId }, data: { platformRole } });
  await writeAudit({
    actorId,
    action: platformRole === "USER" ? "role.revoke" : "role.grant",
    target: userId,
    metadata: { email: target.email, platformRole },
  });
}

export async function deleteUser(actorId: string, userId: string): Promise<void> {
  if (actorId === userId) throw new Error("You cannot delete your own account");
  const target = await guardTarget(userId);
  if (target.platformRole === "SUPER_ADMIN") throw new Error("A super admin cannot be deleted");
  await prisma.user.delete({ where: { id: userId } });
  await writeAudit({ actorId, action: "user.delete", target: userId, metadata: { email: target.email } });
}

/** Archive (hide from both rosters) or restore a class. */
export async function setClassArchived(actorId: string, classId: string, archived: boolean): Promise<void> {
  const klass = await prisma.class.findUnique({ where: { id: classId }, select: { id: true, name: true } });
  if (!klass) throw new Error("Class not found");
  await prisma.class.update({ where: { id: classId }, data: { archivedAt: archived ? new Date() : null } });
  await writeAudit({
    actorId,
    action: archived ? "class.archive" : "class.restore",
    target: classId,
    metadata: { name: klass.name },
  });
}

export async function deleteClass(actorId: string, classId: string): Promise<void> {
  const klass = await prisma.class.findUnique({ where: { id: classId }, select: { id: true, name: true } });
  if (!klass) throw new Error("Class not found");
  await prisma.class.delete({ where: { id: classId } });
  await writeAudit({ actorId, action: "class.delete", target: classId, metadata: { name: klass.name } });
}

/** Resolve a flagged message: "clear" keeps it, "remove" deletes it. */
export async function resolveMessage(actorId: string, messageId: string, action: "clear" | "remove"): Promise<void> {
  const msg = await prisma.message.findUnique({ where: { id: messageId }, select: { id: true, subject: true } });
  if (!msg) throw new Error("Message not found");
  if (action === "remove") {
    await prisma.message.delete({ where: { id: messageId } });
  } else {
    await prisma.message.update({ where: { id: messageId }, data: { resolvedAt: new Date(), flagged: false } });
  }
  await writeAudit({ actorId, action: action === "remove" ? "message.remove" : "message.clear", target: messageId, metadata: { subject: msg.subject } });
}

/** Approve / reject a class discovery (public listing) request. */
export async function setClassDiscovery(actorId: string, classId: string, approve: boolean): Promise<void> {
  const klass = await prisma.class.findUnique({ where: { id: classId }, select: { id: true, name: true } });
  if (!klass) throw new Error("Class not found");
  await prisma.class.update({
    where: { id: classId },
    data: { discoveryStatus: approve ? "PUBLISHED" : "PRIVATE" },
  });
  await writeAudit({ actorId, action: approve ? "class.publish" : "class.unpublish", target: classId, metadata: { name: klass.name } });
}

/** Approve / deny a pending student enrolment from the moderation queue. */
export async function resolveMembership(actorId: string, membershipId: string, approve: boolean): Promise<void> {
  const m = await prisma.classMembership.findUnique({ where: { id: membershipId }, select: { id: true, classId: true } });
  if (!m) throw new Error("Membership not found");
  await prisma.classMembership.update({
    where: { id: membershipId },
    data: { status: approve ? "ACTIVE" : "REMOVED" },
  });
  await writeAudit({ actorId, action: approve ? "membership.approved" : "membership.denied", target: m.classId, metadata: { membershipId } });
}

/**
 * Dispatch a moderation-queue action. itemId is the queue item's composite id
 * ("message:<id>", "teacher:<id>", "class:<id>", "membership:<id>"); `approve`
 * means the affirmative action (clear / verify / publish / admit), else reject.
 */
export async function resolveQueueItem(actorId: string, itemId: string, approve: boolean): Promise<void> {
  const [kind, id] = itemId.split(":");
  if (!id) throw new Error("Invalid queue item");
  switch (kind) {
    case "message":
      return resolveMessage(actorId, id, approve ? "clear" : "remove");
    case "teacher":
      return setTeacherStatus(actorId, id, approve ? "VERIFIED" : "UNVERIFIED");
    case "class":
      return setClassDiscovery(actorId, id, approve);
    case "membership":
      return resolveMembership(actorId, id, approve);
    default:
      throw new Error("Unknown queue item type");
  }
}
