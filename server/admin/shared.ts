import "server-only";
import { prisma } from "@/server/db";
import type { Role, UserStatus } from "@/app/admin/types";
import type { AccountStatus, PlatformRole, TeacherStatus } from "@prisma/client";

/**
 * server/admin/shared.ts — primitives shared across the admin data layer:
 * time math, formatting, role/status classification, and the single user
 * projection (`fetchUsers`) that both the overview and the directory build on.
 *
 * The admin module (server/admin/*) is the platform-admin data + control
 * layer. Every read aggregates the live database into the shapes the control
 * panel renders; every mutation enforces admin-safety rules and writes an
 * AuditLog row. The panel at admin.thadar.com has authority over the student
 * and teacher surfaces alike — suspending an account locks the user out
 * everywhere, archiving a class removes it from both rosters, etc.
 */

export const MIN = 60_000;
export const HOUR = 60 * MIN;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;

/** Compact relative time: "now", "4m ago", "3h ago", "5d ago", or a date. */
export function relTime(date: Date | null): string {
  if (!date) return "—";
  const diff = Date.now() - date.getTime();
  if (diff < MIN) return "now";
  if (diff < HOUR) return `${Math.floor(diff / MIN)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Classify a user into a directory role from their platform signals. */
export function classifyRole(u: {
  platformRole: PlatformRole;
  teacherStatus: TeacherStatus;
  defaultView: "TEACHER" | "STUDENT";
  ownedClasses: number;
}): Role {
  if (u.platformRole !== "USER") return "admin";
  if (u.teacherStatus === "VERIFIED" || u.defaultView === "TEACHER" || u.ownedClasses > 0) return "teacher";
  return "student";
}

export function classifyStatus(u: { status: AccountStatus; teacherStatus: TeacherStatus }): UserStatus {
  if (u.status === "SUSPENDED") return "suspended";
  if (u.status === "PENDING" || u.teacherStatus === "PENDING") return "pending";
  return "active";
}

const ROLE_PREFIX: Record<Role, string> = { student: "ST", teacher: "TC", parent: "PA", admin: "AD" };

export function displayCode(role: Role, id: string): string {
  return `${ROLE_PREFIX[role]}-${id.slice(-4).toUpperCase()}`;
}

export function fmtBytes(bytes: number): { value: number; unit: string } {
  if (bytes >= 1e9) return { value: bytes / 1e9, unit: "GB" };
  if (bytes >= 1e6) return { value: bytes / 1e6, unit: "MB" };
  return { value: bytes / 1e3, unit: "KB" };
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export type RawUser = {
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

export function fetchUsers() {
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
