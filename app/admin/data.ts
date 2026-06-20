// data.ts — platform data for the Thadar admin control panel.
//
// Ported from the Claude Design handoff (admin-data.jsx). This is
// representative data: the admin surface is platform-wide (users across
// every role, system health, audit log, moderation) and there is no admin
// API or platform-admin role in the backend yet — building those, plus an
// auth gate, is deferred infra. Every export is typed and shaped so it can
// be swapped for a real `/api/admin/*` response without touching the views.
//
// Role / subject colours map onto the shared 6-hue palette (--c-1..6) used
// across the student + teacher surfaces, so the admin panel reads as the
// same product.

export type Role = "student" | "teacher" | "parent" | "admin";

// the signed-in admin (representative — no platform-admin role in the DB yet)
export const ADMIN = {
  name: "Ana Reyes",
  id: "AD-0001",
  role: "Super admin",
  email: "admin@thadar.edu",
} as const;

// role accent colours (mapped to the shared subject palette for variety)
export const ROLE_C: Record<Role, string> = {
  student: "var(--c-1)",
  teacher: "var(--c-3)",
  parent: "var(--c-4)",
  admin: "var(--accent)",
};

// subject → palette hue (admin classes carry a subject code)
const SUBJECT_C: Record<string, string> = {
  math: "var(--c-1)",
  span: "var(--c-2)",
  bio: "var(--c-3)",
  art: "var(--c-4)",
  hist: "var(--c-5)",
  eng: "var(--c-6)",
};

export function initials(name: string): string {
  return name
    .replace(/^Parent · /, "")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ---- top-line KPIs ---- */
export type Kpi = {
  id: string;
  label: string;
  value: number;
  fmt: "int" | "pct2";
  delta: string;
  up: boolean;
  icon: string;
  sub: string;
  href: string;
};

export const KPIS: Kpi[] = [
  { id: "users", label: "Total users", value: 1842, fmt: "int", delta: "+4.2%", up: true, icon: "users", sub: "1,284 students", href: "/admin/users" },
  { id: "active", label: "Active now", value: 327, fmt: "int", delta: "live", up: true, icon: "globe", sub: "across 4 roles", href: "/admin/system" },
  { id: "classes", label: "Active classes", value: 148, fmt: "int", delta: "+6", up: true, icon: "classes", sub: "spring term", href: "/admin/classes" },
  { id: "subs", label: "Submissions / 24h", value: 540, fmt: "int", delta: "+12%", up: true, icon: "content", sub: "92% on time", href: "/admin/content" },
  { id: "uptime", label: "Uptime · 30d", value: 99.98, fmt: "pct2", delta: "stable", up: true, icon: "server", sub: "no incidents", href: "/admin/system" },
];

/* ---- weekly signups + cumulative users trend, 12 weeks ---- */
export const SIGNUPS = [38, 52, 47, 61, 73, 68, 82, 91, 86, 104, 119, 132];
export const SIGNUP_WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "Now"];
export const USER_TREND = [980, 1032, 1079, 1140, 1213, 1281, 1363, 1454, 1540, 1644, 1763, 1842];

/* ---- role breakdown (donut) ---- */
export type RoleSlice = { label: string; value: number; color: string; key: Role };
export const ROLES: RoleSlice[] = [
  { label: "Students", value: 1284, color: ROLE_C.student, key: "student" },
  { label: "Teachers", value: 312, color: ROLE_C.teacher, key: "teacher" },
  { label: "Parents", value: 219, color: ROLE_C.parent, key: "parent" },
  { label: "Admins", value: 27, color: ROLE_C.admin, key: "admin" },
];

/* ---- active users by hour band (vbars) ---- */
export const ACTIVE_HOURS = [
  { label: "6a", value: 41, color: "var(--accent-line)" },
  { label: "9a", value: 188, color: "var(--accent-line)" },
  { label: "12p", value: 246, color: "var(--accent)" },
  { label: "3p", value: 327, color: "var(--accent)" },
  { label: "6p", value: 201, color: "var(--accent-line)" },
  { label: "9p", value: 96, color: "var(--accent-line)" },
];

/* ---- system health metrics ---- */
export type Health = { label: string; value: string; pct: number; color: string; note: string };
export const HEALTH: Health[] = [
  { label: "API latency", value: "124ms", pct: 78, color: "var(--good)", note: "p95 · healthy" },
  { label: "Error rate", value: "0.02%", pct: 96, color: "var(--good)", note: "below threshold" },
  { label: "DB storage", value: "68%", pct: 68, color: "var(--accent)", note: "341 / 500 GB" },
  { label: "Job queue", value: "12", pct: 30, color: "var(--good)", note: "draining" },
];

/* ---- latency trend, 7 days + storage breakdown ---- */
export const LATENCY = [142, 138, 151, 129, 134, 121, 124];
export const LATENCY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const STORAGE = [
  { label: "Submissions", value: 168, color: SUBJECT_C.math },
  { label: "Lesson media", value: 102, color: SUBJECT_C.bio },
  { label: "Avatars", value: 41, color: SUBJECT_C.art },
  { label: "Database", value: 30, color: "var(--accent)" },
];

/* ---- live activity feed ---- */
export type Activity = { who: string; act: string; obj: string; role: Role | "system"; when: string; icon: string };
export const ACTIVITY: Activity[] = [
  { who: "Mr. Liam Carter", act: "created class", obj: "Math 10 · Period 6", role: "teacher", when: "2m ago", icon: "classes" },
  { who: "System", act: "nightly backup", obj: "completed · 341 GB", role: "system", when: "14m ago", icon: "server" },
  { who: "Aaliyah Banerjee", act: "registered as", obj: "student", role: "student", when: "22m ago", icon: "users" },
  { who: "Ms. Dara Okafor", act: "flagged a message", obj: "in Math 9 · P1", role: "teacher", when: "38m ago", icon: "flag" },
  { who: "You", act: "suspended account", obj: "ST-1190 · policy", role: "admin", when: "1h ago", icon: "lock" },
  { who: "Front Desk", act: "bulk-imported", obj: "28 parent accounts", role: "parent", when: "2h ago", icon: "download" },
];

/* ---- moderation / pending queue ---- */
export type QueueItem = { item: string; kind: string; urgent: boolean; who: string; icon: string };
export const QUEUE: QueueItem[] = [
  { item: "Message flagged · Math 9 · P1", kind: "Content review", urgent: true, who: "auto-filter", icon: "flag" },
  { item: "Teacher verification · D. Okafor", kind: "Account approval", urgent: true, who: "pending docs", icon: "shield" },
  { item: "Class deletion request · Art 7", kind: "Destructive", urgent: false, who: "Mr. Vance", icon: "alert" },
  { item: "Storage near limit warning", kind: "System", urgent: false, who: "ops", icon: "server" },
];

/* ---- user directory ---- */
export type UserStatus = "active" | "pending" | "suspended";
export type DirUser = { name: string; id: string; role: Role; email: string; status: UserStatus; last: string; classes: number };
export const USERS: DirUser[] = [
  { name: "Aaliyah Banerjee", id: "ST-2210", role: "student", email: "aaliyah.b@thadar.edu", status: "active", last: "2m ago", classes: 6 },
  { name: "Mr. Liam Carter", id: "TC-0142", role: "teacher", email: "liam.c@thadar.edu", status: "active", last: "5m ago", classes: 4 },
  { name: "Diego Alvarez", id: "ST-2211", role: "student", email: "diego.a@thadar.edu", status: "active", last: "1h ago", classes: 5 },
  { name: "Ms. Dara Okafor", id: "TC-0188", role: "teacher", email: "dara.o@thadar.edu", status: "pending", last: "—", classes: 0 },
  { name: "Parent · R. Liu", id: "PA-0451", role: "parent", email: "r.liu@gmail.com", status: "active", last: "3h ago", classes: 2 },
  { name: "Hassan Karim", id: "ST-1190", role: "student", email: "hassan.k@thadar.edu", status: "suspended", last: "4d ago", classes: 5 },
  { name: "Emma Liu", id: "ST-2212", role: "student", email: "emma.l@thadar.edu", status: "active", last: "12m ago", classes: 6 },
  { name: "Ana Reyes", id: "AD-0003", role: "admin", email: "ana.r@thadar.edu", status: "active", last: "now", classes: 0 },
  { name: "Parent · D. Park", id: "PA-0452", role: "parent", email: "d.park@gmail.com", status: "active", last: "1d ago", classes: 1 },
  { name: "Jonah Park", id: "ST-2215", role: "student", email: "jonah.p@thadar.edu", status: "active", last: "40m ago", classes: 5 },
  { name: "Mr. Theo Vance", id: "TC-0156", role: "teacher", email: "theo.v@thadar.edu", status: "active", last: "2h ago", classes: 3 },
  { name: "Noor Abadi", id: "ST-2217", role: "student", email: "noor.a@thadar.edu", status: "active", last: "6h ago", classes: 4 },
];

/* ---- classes directory ---- */
export type AdminClass = { name: string; teacher: string; students: number; status: "active" | "archived"; color: string; code: string };
export const CLASSES: AdminClass[] = [
  { name: "Math 10 · Algebra II", teacher: "Mr. Liam Carter", students: 24, status: "active", color: SUBJECT_C.math, code: "ALG-214" },
  { name: "Biology · Honors", teacher: "Ms. Dara Okafor", students: 22, status: "active", color: SUBJECT_C.bio, code: "BIO-118" },
  { name: "World History", teacher: "Mr. Theo Vance", students: 28, status: "active", color: SUBJECT_C.hist, code: "HIS-220" },
  { name: "Spanish II", teacher: "Sra. Mora", students: 19, status: "active", color: SUBJECT_C.span, code: "SPA-104" },
  { name: "Studio Art 7", teacher: "Mr. Theo Vance", students: 16, status: "archived", color: SUBJECT_C.art, code: "ART-007" },
  { name: "English · Lit", teacher: "Ms. Bell", students: 26, status: "active", color: SUBJECT_C.eng, code: "ENG-301" },
];

/* ---- audit log ---- */
export type AuditLevel = "info" | "warn" | "alert";
export type AuditEntry = { event: string; actor: string; ip: string; when: string; level: AuditLevel };
export const AUDIT: AuditEntry[] = [
  { event: "admin.login", actor: "You · AD-0001", ip: "10.4.2.18", when: "09:41:02", level: "info" },
  { event: "user.suspend", actor: "You · AD-0001", ip: "10.4.2.18", when: "09:38:50", level: "warn" },
  { event: "auth.failed", actor: "unknown", ip: "188.42.9.7", when: "09:12:33", level: "alert" },
  { event: "class.create", actor: "TC-0142", ip: "10.4.6.91", when: "08:59:10", level: "info" },
  { event: "role.grant.admin", actor: "Ana Reyes · AD-0003", ip: "10.4.2.20", when: "08:40:21", level: "warn" },
  { event: "backup.complete", actor: "system", ip: "internal", when: "03:00:00", level: "info" },
  { event: "settings.update", actor: "You · AD-0001", ip: "10.4.2.18", when: "Yest.", level: "info" },
  { event: "auth.failed", actor: "unknown", ip: "203.0.113.4", when: "Yest.", level: "alert" },
];

// tint for activity/feed rows by role (system rows read muted)
export function roleTint(role: Role | "system"): string {
  if (role === "system") return "var(--ink-dim)";
  return ROLE_C[role];
}

// background + text colour for a role tag / avatar
export function roleTagStyle(role: Role): { background: string; color: string } {
  const c = ROLE_C[role];
  return { background: `color-mix(in srgb, ${c} 16%, transparent)`, color: c };
}
