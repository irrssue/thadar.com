// types.ts — wire types + presentation helpers shared by the admin control
// panel's server data layer (server/admin/*) and its client pages.
//
// The server returns objects shaped exactly like these types (colours included
// as ready-to-render CSS custom-property strings), so the pages render real
// /api/admin/* data with the same primitives the design prototype used.

export type Role = "student" | "teacher" | "parent" | "admin";
export type UserStatus = "active" | "pending" | "suspended";
export type AuditLevel = "info" | "warn" | "alert";

// role accent colours (mapped to the shared 6-hue subject palette for variety)
export const ROLE_C: Record<Role, string> = {
  student: "var(--c-1)",
  teacher: "var(--c-3)",
  parent: "var(--c-4)",
  admin: "var(--accent)",
};

// 6-hue palette used to colour classes deterministically by index
export const HUES = ["var(--c-1)", "var(--c-2)", "var(--c-3)", "var(--c-4)", "var(--c-5)", "var(--c-6)"];

export function initials(name: string): string {
  return name
    .replace(/^Parent · /, "")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// background + text colour for a role tag / avatar
export function roleTagStyle(role: Role): { background: string; color: string } {
  const c = ROLE_C[role];
  return { background: `color-mix(in srgb, ${c} 16%, transparent)`, color: c };
}

// tint for activity/feed rows by role (system rows read muted)
export function roleTint(role: Role | "system"): string {
  if (role === "system") return "var(--ink-dim)";
  return ROLE_C[role];
}

/* ---- wire shapes ---- */

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

export type RoleSlice = { label: string; value: number; color: string; key: Role };
export type Bar = { label: string; value: number; color: string };
export type Health = { label: string; value: string; pct: number; color: string; note: string };
export type Activity = { who: string; act: string; obj: string; role: Role | "system"; when: string; icon: string };
export type QueueItem = { id: string; item: string; kind: string; urgent: boolean; who: string; icon: string; action?: string };
export type DirUser = {
  id: string; // real user id (action target + React key)
  code: string; // short display code e.g. ST-AB12
  name: string;
  role: Role;
  email: string;
  status: UserStatus;
  last: string;
  classes: number;
  platformRole: "USER" | "ADMIN" | "SUPER_ADMIN";
  teacherStatus: "UNVERIFIED" | "PENDING" | "VERIFIED";
};
export type AdminClass = {
  id: string;
  name: string;
  teacher: string;
  students: number;
  status: "active" | "archived";
  color: string;
  code: string;
};
export type AuditEntry = { event: string; actor: string; ip: string; when: string; level: AuditLevel };

export type OverviewData = {
  kpis: Kpi[];
  signups: number[];
  signupWeeks: string[];
  userTrend: number[];
  roles: RoleSlice[];
  activeHours: Bar[];
  health: Health[];
  activity: Activity[];
  queue: QueueItem[];
};

export type SystemData = {
  stats: { label: string; value: string; sub: string; color: string }[];
  latency: number[];
  latencyDays: string[];
  storage: Bar[];
  storageTotalLabel: string;
  health: Health[];
};

export type SettingValue = boolean | string;
export type SettingsData = Record<string, SettingValue>;

export type AdminProfile = {
  name: string;
  id: string;
  email: string;
  role: string;
  managedUsers: number;
  actions30d: number;
  lastLogin: string;
  permissions: string[];
};
