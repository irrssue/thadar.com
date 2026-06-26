import "server-only";
import { prisma } from "@/server/db";
import { classifyRole, classifyStatus, displayCode, relTime, fetchUsers } from "./shared";
import { HUES } from "@/app/admin/types";
import type { DirUser, AdminClass } from "@/app/admin/types";

/* ----------------------------- users directory ----------------------------- */

export async function listUsers(): Promise<DirUser[]> {
  const users = await fetchUsers();
  return users.map((u) => {
    const role = classifyRole({ ...u, ownedClasses: u._count.ownedClasses });
    return {
      id: u.id,
      code: displayCode(role, u.id),
      name: u.name ?? u.email.split("@")[0],
      role,
      email: u.email,
      status: classifyStatus(u),
      last: relTime(u.lastSeenAt),
      classes: u._count.memberships,
      platformRole: u.platformRole,
      teacherStatus: u.teacherStatus,
    };
  });
}

/* ----------------------------- classes directory ----------------------------- */

export async function listClasses(): Promise<AdminClass[]> {
  const classes = await prisma.class.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      archivedAt: true,
      owner: { select: { name: true, email: true } },
      _count: { select: { memberships: { where: { role: "STUDENT", status: "ACTIVE" } } } },
    },
  });
  return classes.map((c, i) => ({
    id: c.id,
    name: c.name,
    teacher: c.owner.name ?? c.owner.email,
    students: c._count.memberships,
    status: c.archivedAt ? "archived" : "active",
    color: HUES[i % HUES.length],
    code: `${c.name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "CLS"}-${c.id.slice(-3).toUpperCase()}`,
  }));
}
