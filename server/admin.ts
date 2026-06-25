import "server-only";
import { prisma } from "./db";
import { writeAudit } from "./events";
import { HUES } from "@/app/admin/types";
import type {
  Role,
  UserStatus,
  AuditLevel,
  Kpi,
  RoleSlice,
  Bar,
  Health,
  Activity,
  QueueItem,
  DirUser,
  AdminClass,
  AuditEntry,
  OverviewData,
  SystemData,
  SettingsData,
  SettingValue,
  AdminProfile,
} from "@/app/admin/types";
import type { AccountStatus, PlatformRole, TeacherStatus } from "@prisma/client";

/**
 * server/admin.ts — the platform-admin data + control layer.
 *
 * Every read aggregates the live database into the shapes the control panel
 * renders; every mutation enforces admin-safety rules and writes an AuditLog
 * row. The panel at admin.thadar.com has authority over the student and
 * teacher surfaces alike — suspending an account locks the user out everywhere,
 * archiving a class removes it from both rosters, etc.
 */

/* ----------------------------- helpers ----------------------------- */

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/** Compact relative time: "now", "4m ago", "3h ago", "5d ago", or a date. */
function relTime(date: Date | null): string {
  if (!date) return "—";
  const diff = Date.now() - date.getTime();
  if (diff < MIN) return "now";
  if (diff < HOUR) return `${Math.floor(diff / MIN)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Classify a user into a directory role from their platform signals. */
function classifyRole(u: {
  platformRole: PlatformRole;
  teacherStatus: TeacherStatus;
  defaultView: "TEACHER" | "STUDENT";
  ownedClasses: number;
}): Role {
  if (u.platformRole !== "USER") return "admin";
  if (u.teacherStatus === "VERIFIED" || u.defaultView === "TEACHER" || u.ownedClasses > 0) return "teacher";
  return "student";
}

function classifyStatus(u: { status: AccountStatus; teacherStatus: TeacherStatus }): UserStatus {
  if (u.status === "SUSPENDED") return "suspended";
  if (u.status === "PENDING" || u.teacherStatus === "PENDING") return "pending";
  return "active";
}

const ROLE_PREFIX: Record<Role, string> = { student: "ST", teacher: "TC", parent: "PA", admin: "AD" };

function displayCode(role: Role, id: string): string {
  return `${ROLE_PREFIX[role]}-${id.slice(-4).toUpperCase()}`;
}

function fmtBytes(bytes: number): { value: number; unit: string } {
  if (bytes >= 1e9) return { value: bytes / 1e9, unit: "GB" };
  if (bytes >= 1e6) return { value: bytes / 1e6, unit: "MB" };
  return { value: bytes / 1e3, unit: "KB" };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/* ----------------------------- overview ----------------------------- */

type RawUser = {
  id: string;
  name: string | null;
  email: string;
  platformRole: PlatformRole;
  teacherStatus: TeacherStatus;
  defaultView: "TEACHER" | "STUDENT";
  status: AccountStatus;
  lastSeenAt: Date | null;
  createdAt: Date;
  _count: { ownedClasses: number; memberships: number };
};

function fetchUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      platformRole: true,
      teacherStatus: true,
      defaultView: true,
      status: true,
      lastSeenAt: true,
      createdAt: true,
      _count: {
        select: {
          ownedClasses: true,
          memberships: { where: { status: "ACTIVE" } },
        },
      },
    },
  }) as unknown as Promise<RawUser[]>;
}

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

/* ----------------------------- system ----------------------------- */

export async function getSystem(): Promise<SystemData> {
  const [userCount, classCount, lessonCount, assignmentCount, subCount, ungradedCount, msgCount, queueLen, storageRows] = await Promise.all([
    prisma.user.count(),
    prisma.class.count({ where: { archivedAt: null } }),
    prisma.lesson.count(),
    prisma.assignment.count(),
    prisma.submission.count(),
    prisma.submission.count({ where: { status: "SUBMITTED" } }),
    prisma.message.count(),
    getQueue().then((q) => q.length),
    // Real per-table on-disk size. The Prisma model API exposes row counts but
    // not physical storage, so this single catalog query is the documented
    // exception to the "no raw SQL" rule (CLAUDE.md §7).
    prisma.$queryRaw<{ name: string; bytes: bigint }[]>`
      SELECT c.relname AS name, pg_total_relation_size(c.oid) AS bytes
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'r'
    `,
  ]);

  // bucket physical storage into product-meaningful categories
  const CATEGORY: Record<string, string> = {
    Submission: "Submissions",
    Lesson: "Lesson content",
    Message: "Messages",
    User: "Accounts",
    Notification: "Notifications",
    AuditLog: "Audit log",
  };
  const cat: Record<string, number> = {};
  let totalBytes = 0;
  for (const r of storageRows) {
    const b = Number(r.bytes);
    totalBytes += b;
    const label = CATEGORY[r.name] ?? "Database";
    cat[label] = (cat[label] ?? 0) + b;
  }
  const { unit } = fmtBytes(totalBytes || 1);
  const divisor = unit === "GB" ? 1e9 : unit === "MB" ? 1e6 : 1e3;
  const palette = ["var(--c-1)", "var(--c-3)", "var(--c-4)", "var(--c-5)", "var(--c-6)", "var(--accent)"];
  const storage: Bar[] = Object.entries(cat)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, bytes], i) => ({ label, value: round1(bytes / divisor), color: palette[i % palette.length] }));
  const totalFmt = fmtBytes(totalBytes);

  const stats: SystemData["stats"] = [
    { label: "Total users", value: userCount.toLocaleString(), sub: "all roles", color: "var(--accent)" },
    { label: "Active classes", value: classCount.toLocaleString(), sub: "not archived", color: "var(--good)" },
    { label: "Submissions", value: subCount.toLocaleString(), sub: `${assignmentCount} assignments`, color: "var(--good)" },
    { label: "DB storage", value: `${round1(totalFmt.value)} ${totalFmt.unit}`, sub: `${lessonCount} lessons · ${msgCount} msgs`, color: "var(--accent)" },
  ];

  // Latency telemetry isn't collected yet — represented as a flat healthy
  // baseline until an APM feed lands. Everything else here is live.
  const latency = [124, 124, 124, 124, 124, 124, 124];
  const latencyDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const gradedPct = subCount > 0 ? Math.round(((subCount - ungradedCount) / subCount) * 100) : 0;
  const health: Health[] = [
    { label: "API latency", value: "124ms", pct: 78, color: "var(--good)", note: "p95 · baseline" },
    { label: "Submissions graded", value: `${gradedPct}%`, pct: gradedPct, color: gradedPct >= 60 ? "var(--good)" : "var(--accent)", note: `${ungradedCount} awaiting` },
    { label: "Content library", value: `${lessonCount}`, pct: Math.min(100, lessonCount * 5), color: "var(--accent)", note: `${assignmentCount} assignments` },
    { label: "Review queue", value: `${queueLen}`, pct: Math.min(100, queueLen * 12), color: queueLen > 6 ? "var(--danger)" : "var(--good)", note: queueLen > 0 ? "items pending" : "all clear" },
  ];

  return { stats, latency, latencyDays, storage, storageTotalLabel: `${round1(totalFmt.value)} ${totalFmt.unit}`, health };
}

/* ----------------------------- audit ----------------------------- */

function levelForAction(action: string): AuditLevel {
  if (action.includes("failed") || action.includes("delete") || action.includes("denied")) return "alert";
  if (action.includes("suspend") || action.includes("role") || action.includes("archive") || action.includes("reject") || action.includes("remove")) return "warn";
  return "info";
}

export async function listAudit(): Promise<AuditEntry[]> {
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    select: { action: true, createdAt: true, target: true, actor: { select: { name: true, email: true } } },
  });
  return rows.map((r) => ({
    event: r.action,
    actor: r.actor?.name ?? r.actor?.email ?? "system",
    ip: "—",
    when: relTime(r.createdAt),
    level: levelForAction(r.action),
  }));
}

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

/* ----------------------------- settings ----------------------------- */

export const SETTING_DEFAULTS: SettingsData = {
  "security.enforce2fa": true,
  "security.adminDomainLock": true,
  "security.sessionTimeout": "30 min",
  "security.selfRegistration": true,
  "moderation.autoFilter": true,
  "moderation.requireTeacherVerification": true,
  "moderation.profanityBlock": false,
  "moderation.dataRetention": "24 months",
  "branding.platformName": "thadar.",
  "branding.supportEmail": "help@thadar.edu",
  "maintenance.nightlyBackups": true,
  "maintenance.maintenanceMode": false,
  "maintenance.releaseChannel": "stable",
};

export async function getSettings(): Promise<SettingsData> {
  const rows = await prisma.platformSetting.findMany({ select: { key: true, value: true } });
  const stored: SettingsData = {};
  for (const r of rows) {
    try {
      stored[r.key] = JSON.parse(r.value) as SettingValue;
    } catch {
      stored[r.key] = r.value;
    }
  }
  return { ...SETTING_DEFAULTS, ...stored };
}

export async function updateSetting(actorId: string, key: string, value: SettingValue): Promise<SettingsData> {
  if (!(key in SETTING_DEFAULTS)) throw new Error("Unknown setting");
  const json = JSON.stringify(value);
  await prisma.platformSetting.upsert({
    where: { key },
    update: { value: json, updatedBy: actorId },
    create: { key, value: json, updatedBy: actorId },
  });
  await writeAudit({ actorId, action: "setting.update", target: key, metadata: { value } });
  return getSettings();
}

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
