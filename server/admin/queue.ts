import "server-only";
import { prisma } from "@/server/db";
import type { QueueItem } from "@/app/admin/types";

/* ----------------------------- moderation queue ----------------------------- */

export async function getQueue(): Promise<QueueItem[]> {
  const [flagged, pendingAccounts, pendingTeachers, pendingMembers, reviewClasses] = await Promise.all([
    prisma.message.findMany({
      where: { flagged: true, resolvedAt: null },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, subject: true, flagReason: true },
    }),
    prisma.user.findMany({
      where: { status: "PENDING" },
      take: 10,
      select: { id: true, name: true, email: true },
    }),
    prisma.user.findMany({
      where: { teacherStatus: "PENDING" },
      take: 10,
      select: { id: true, name: true, email: true },
    }),
    prisma.classMembership.findMany({
      where: { status: "PENDING", role: "STUDENT" },
      take: 10,
      select: { id: true, user: { select: { name: true, email: true } }, class: { select: { name: true } } },
    }),
    prisma.class.findMany({
      where: { discoveryStatus: "PENDING_REVIEW", archivedAt: null },
      take: 10,
      select: { id: true, name: true, owner: { select: { name: true, email: true } } },
    }),
  ]);

  const items: QueueItem[] = [];
  for (const m of flagged) {
    items.push({
      id: `message:${m.id}`,
      item: `Message flagged · ${m.subject}`,
      kind: "Content review",
      urgent: true,
      who: m.flagReason ?? "auto-filter",
      icon: "flag",
      action: "message",
    });
  }
  for (const u of pendingAccounts) {
    items.push({
      id: `account:${u.id}`,
      item: `New sign-up · ${u.name ?? u.email}`,
      kind: "Account approval",
      urgent: true,
      who: u.email,
      icon: "users",
      action: "account",
    });
  }
  for (const t of pendingTeachers) {
    items.push({
      id: `teacher:${t.id}`,
      item: `Teacher verification · ${t.name ?? t.email}`,
      kind: "Account approval",
      urgent: true,
      who: "pending docs",
      icon: "shield",
      action: "teacher",
    });
  }
  for (const c of reviewClasses) {
    items.push({
      id: `class:${c.id}`,
      item: `Class discovery review · ${c.name}`,
      kind: "Discovery",
      urgent: false,
      who: c.owner.name ?? c.owner.email,
      icon: "classes",
      action: "class",
    });
  }
  for (const m of pendingMembers) {
    items.push({
      id: `membership:${m.id}`,
      item: `Join request · ${m.class.name}`,
      kind: "Enrolment",
      urgent: false,
      who: m.user.name ?? m.user.email,
      icon: "users",
    });
  }
  return items;
}
