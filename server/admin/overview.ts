import "server-only";
import { prisma } from "@/server/db";
import { DAY, MIN, WEEK, classifyRole, relTime, fetchUsers, type RawUser } from "./shared";
import { getQueue } from "./queue";
import type { Role, Kpi, RoleSlice, Bar, Health, Activity, OverviewData } from "@/app/admin/types";

/* ----------------------------- overview ----------------------------- */

export async function getOverview(): Promise<OverviewData> {
  const since24h = new Date(Date.now() - DAY);
  const activeSince = new Date(Date.now() - 15 * MIN);

  const [users, activeClasses, subs24h, gradedCount, totalSubs, queue] = await Promise.all([
    fetchUsers(),
    prisma.class.count({ where: { archivedAt: null } }),
    prisma.submission.count({ where: { submittedAt: { gte: since24h } } }),
    prisma.submission.count({ where: { status: { not: "SUBMITTED" } } }),
    prisma.submission.count(),
    getQueue(),
  ]);

  const roleOf = (u: RawUser) =>
    classifyRole({ ...u, ownedClasses: u._count.ownedClasses });

  const counts: Record<Role, number> = { student: 0, teacher: 0, parent: 0, admin: 0 };
  for (const u of users) counts[roleOf(u)]++;
  const total = users.length;
  const activeNow = users.filter((u) => u.lastSeenAt && u.lastSeenAt >= activeSince).length;
  const rolesPresent = (Object.keys(counts) as Role[]).filter((r) => counts[r] > 0).length;

  // ---- 12-week signups + cumulative trend ----
  const WEEKS = 12;
  const now = Date.now();
  const buckets = new Array(WEEKS).fill(0);
  let before = 0;
  for (const u of users) {
    const w = Math.floor((now - u.createdAt.getTime()) / WEEK);
    if (w < WEEKS) buckets[WEEKS - 1 - w]++;
    else before++;
  }
  const userTrend: number[] = [];
  let run = before;
  for (const b of buckets) userTrend.push((run += b));
  const signupWeeks = Array.from({ length: WEEKS }, (_, i) => (i === WEEKS - 1 ? "Now" : `W${i + 1}`));

  // ---- active sessions by time-of-day band (from lastSeenAt) ----
  const BANDS = [
    { label: "6a", lo: 6, hi: 9 },
    { label: "9a", lo: 9, hi: 12 },
    { label: "12p", lo: 12, hi: 15 },
    { label: "3p", lo: 15, hi: 18 },
    { label: "6p", lo: 18, hi: 21 },
    { label: "9p", lo: 21, hi: 24 },
  ];
  const bandCounts = BANDS.map((b) => {
    const v = users.filter((u) => {
      if (!u.lastSeenAt) return false;
      const h = u.lastSeenAt.getHours();
      return h >= b.lo && h < b.hi;
    }).length;
    return { label: b.label, value: v };
  });
  const peak = Math.max(1, ...bandCounts.map((b) => b.value));
  const activeHours: Bar[] = bandCounts.map((b) => ({
    label: b.label,
    value: b.value,
    color: b.value >= peak * 0.75 ? "var(--accent)" : "var(--accent-line)",
  }));

  // ---- role donut ----
  const roleLabels: Record<Role, string> = {
    student: "Students",
    teacher: "Teachers",
    parent: "Parents",
    admin: "Admins",
  };
  const roleColors: Record<Role, string> = {
    student: "var(--c-1)",
    teacher: "var(--c-3)",
    parent: "var(--c-4)",
    admin: "var(--accent)",
  };
  const roles: RoleSlice[] = (["student", "teacher", "parent", "admin"] as Role[])
    .filter((r) => counts[r] > 0)
    .map((r) => ({ label: roleLabels[r], value: counts[r], color: roleColors[r], key: r }));

  // ---- KPI strip ----
  const studentCount = counts.student;
  const onTimePct = totalSubs > 0 ? Math.round((gradedCount / totalSubs) * 100) : 0;
  const kpis: Kpi[] = [
    { id: "users", label: "Total users", value: total, fmt: "int", delta: `+${buckets[WEEKS - 1]}`, up: true, icon: "users", sub: `${studentCount.toLocaleString()} students`, href: "/admin/users" },
    { id: "active", label: "Active now", value: activeNow, fmt: "int", delta: "live", up: true, icon: "globe", sub: `across ${rolesPresent} roles`, href: "/admin/system" },
    { id: "classes", label: "Active classes", value: activeClasses, fmt: "int", delta: "current", up: true, icon: "classes", sub: "not archived", href: "/admin/classes" },
    { id: "subs", label: "Submissions / 24h", value: subs24h, fmt: "int", delta: `${onTimePct}% graded`, up: true, icon: "content", sub: `${totalSubs.toLocaleString()} all-time`, href: "/admin/content" },
    { id: "uptime", label: "Uptime · 30d", value: 99.98, fmt: "pct2", delta: "stable", up: true, icon: "server", sub: "no incidents", href: "/admin/system" },
  ];

  // ---- system health bars (real platform ratios) ----
  const activeMembers = users.filter((u) => u._count.memberships > 0).length;
  const health = buildHealthBars({
    gradedPct: onTimePct,
    activeMemberPct: total > 0 ? Math.round((activeMembers / total) * 100) : 0,
    activeNowPct: total > 0 ? Math.round((activeNow / total) * 100) : 0,
    queueLoad: queue.length,
  });

  const activity = await getActivity();

  return {
    kpis,
    signups: buckets,
    signupWeeks,
    userTrend,
    roles,
    activeHours,
    health,
    activity,
    queue,
  };
}

function buildHealthBars(p: { gradedPct: number; activeMemberPct: number; activeNowPct: number; queueLoad: number }): Health[] {
  const good = "var(--good)";
  const accent = "var(--accent)";
  return [
    { label: "Submissions graded", value: `${p.gradedPct}%`, pct: p.gradedPct, color: p.gradedPct >= 60 ? good : accent, note: "of all submissions" },
    { label: "Enrolment rate", value: `${p.activeMemberPct}%`, pct: p.activeMemberPct, color: p.activeMemberPct >= 50 ? good : accent, note: "users in ≥1 class" },
    { label: "Online now", value: `${p.activeNowPct}%`, pct: Math.max(4, p.activeNowPct), color: accent, note: "seen in last 15m" },
    { label: "Review queue", value: `${p.queueLoad}`, pct: Math.min(100, p.queueLoad * 12), color: p.queueLoad > 6 ? "var(--danger)" : good, note: p.queueLoad > 0 ? "items pending" : "all clear" },
  ];
}

/* ----------------------------- activity feed ----------------------------- */

function iconForAction(action: string): { icon: string; role: Activity["role"] } {
  if (action.startsWith("class")) return { icon: "classes", role: "teacher" };
  if (action.startsWith("user.register") || action.startsWith("membership")) return { icon: "users", role: "student" };
  if (action.startsWith("user.suspend") || action.startsWith("role")) return { icon: "lock", role: "admin" };
  if (action.startsWith("user")) return { icon: "users", role: "admin" };
  if (action.startsWith("teacher")) return { icon: "shield", role: "teacher" };
  if (action.startsWith("assignment")) return { icon: "content", role: "teacher" };
  if (action.startsWith("message")) return { icon: "flag", role: "admin" };
  if (action.startsWith("setting") || action.startsWith("backup")) return { icon: "server", role: "system" };
  return { icon: "audit", role: "system" };
}

function humanizeAction(action: string): string {
  const map: Record<string, string> = {
    "membership.requested": "requested to join",
    "membership.approved": "was approved for",
    "membership.denied": "was declined from",
    "assignment.posted": "posted an assignment",
    "user.suspend": "suspended account",
    "user.activate": "reactivated account",
    "user.delete": "deleted account",
    "teacher.verify": "verified teacher",
    "teacher.reject": "rejected verification",
    "role.grant": "granted admin role",
    "role.revoke": "revoked admin role",
    "class.archive": "archived class",
    "class.restore": "restored class",
    "class.delete": "deleted class",
    "message.clear": "cleared a flag",
    "message.remove": "removed a message",
    "setting.update": "updated a setting",
  };
  return map[action] ?? action.replace(/\./g, " ");
}

async function getActivity(): Promise<Activity[]> {
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { action: true, target: true, createdAt: true, actor: { select: { name: true, email: true } } },
  });
  return rows.map((r) => {
    const meta = iconForAction(r.action);
    return {
      who: r.actor?.name ?? r.actor?.email ?? "System",
      act: humanizeAction(r.action),
      obj: r.target ? r.target.slice(-6) : "",
      role: meta.role,
      when: relTime(r.createdAt),
      icon: meta.icon,
    };
  });
}
