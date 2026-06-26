import "server-only";
import { prisma } from "@/server/db";
import { DAY, displayCode, relTime } from "./shared";
import type { AdminProfile } from "@/app/admin/types";

/* ----------------------------- profile ----------------------------- */

export async function getAdminProfile(userId: string): Promise<AdminProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, platformRole: true, lastSeenAt: true },
  });
  if (!user) return null;
  const since30d = new Date(Date.now() - 30 * DAY);
  const [managedUsers, actions30d] = await Promise.all([
    prisma.user.count(),
    prisma.auditLog.count({ where: { actorId: userId, createdAt: { gte: since30d } } }),
  ]);
  const isSuper = user.platformRole === "SUPER_ADMIN";
  return {
    name: user.name ?? user.email,
    id: displayCode("admin", user.id),
    email: user.email,
    role: isSuper ? "Super admin" : "Admin",
    managedUsers,
    actions30d,
    lastLogin: relTime(user.lastSeenAt),
    permissions: isSuper
      ? ["Manage users & roles", "Content moderation", "System & infrastructure", "Billing & exports"]
      : ["Manage users", "Content moderation", "System & infrastructure"],
  };
}
