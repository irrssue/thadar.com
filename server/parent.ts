import "server-only";
import { prisma } from "./db";
import { gradePercent, letterFromPercent, gpaFromPercents } from "@/components/student/grades";
import { subjectColor } from "@/components/student/subject";
import type {
  ParentChild,
  ParentChildSummary,
  ParentClass,
  ParentRecent,
} from "@/types/parent";

/**
 * Parent portal data layer. Parents are VIEW-ONLY guardians linked to a child
 * (student) account via ParentLink. None of this touches class membership — a
 * parent is never enrolled in the child's classes; access is gated purely on an
 * ACTIVE ParentLink. Everything returned is a derived view of real data: class
 * grades parsed from Submission.grade, GPA and trends computed with the same
 * helpers the student surface uses (components/student/grades.ts).
 */

/** Stable display code for a student, derived from their id (e.g. "ST-7A3F"). */
function studentCode(id: string): string {
  return "ST-" + id.slice(-4).toUpperCase();
}

const firstName = (name: string | null) => (name ?? "Student").trim().split(/\s+/)[0];

/** Compact "2d ago" / "3w ago" style relative time. */
function relTime(d: Date): string {
  const ms = Date.now() - d.getTime();
  const day = 86_400_000;
  if (ms < day) return "today";
  const days = Math.floor(ms / day);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** True if `parentId` has an ACTIVE guardian link to `childId`. The gate. */
export async function isParentOf(parentId: string, childId: string): Promise<boolean> {
  const link = await prisma.parentLink.findFirst({
    where: { parentId, childId, status: "ACTIVE" },
    select: { id: true },
  });
  return !!link;
}

/** The children a parent is actively linked to, as switcher/list summaries. */
export async function getLinkedChildren(parentId: string): Promise<ParentChildSummary[]> {
  const links = await prisma.parentLink.findMany({
    where: { parentId, status: "ACTIVE" },
    orderBy: { createdAt: "asc" },
    select: { child: { select: { id: true, name: true } } },
  });

  const out: ParentChildSummary[] = [];
  for (const { child } of links) {
    const gpa = await childGpa(child.id);
    out.push({
      id: child.id,
      name: child.name ?? "Student",
      first: firstName(child.name),
      grade: null, // TODO: wire when grade-level is tracked
      code: studentCode(child.id),
      gpa,
    });
  }
  return out;
}

/** Overall GPA across all of a child's graded work, or 0 when none. */
async function childGpa(childId: string): Promise<number> {
  const subs = await prisma.submission.findMany({
    where: { studentId: childId, grade: { not: null } },
    select: { grade: true },
  });
  const pcts = subs.map((s) => gradePercent(s.grade)).filter((p): p is number => p != null);
  return gpaFromPercents(pcts) ?? 0;
}

/**
 * Full dashboard payload for one child. Assumes the caller has already verified
 * the guardian link with isParentOf(). Returns null only if the child no longer
 * exists.
 */
export async function getChildPayload(childId: string): Promise<ParentChild | null> {
  const child = await prisma.user.findUnique({
    where: { id: childId },
    select: { id: true, name: true },
  });
  if (!child) return null;

  // Active enrolments → the class list, even for classes with no grades yet.
  const memberships = await prisma.classMembership.findMany({
    where: { userId: childId, role: "STUDENT", status: "ACTIVE" },
    select: {
      class: { select: { id: true, name: true, owner: { select: { name: true } } } },
    },
  });

  // All graded submissions, oldest → newest, with their class.
  const subs = await prisma.submission.findMany({
    where: { studentId: childId, grade: { not: null } },
    orderBy: { submittedAt: "asc" },
    select: {
      grade: true,
      submittedAt: true,
      gradedAt: true,
      assignment: {
        select: { title: true, class: { select: { id: true, name: true } } },
      },
    },
  });

  type Parsed = { pct: number; at: Date; classId: string; className: string; item: string };
  const graded: Parsed[] = [];
  for (const s of subs) {
    const pct = gradePercent(s.grade);
    if (pct == null) continue;
    graded.push({
      pct,
      at: s.gradedAt ?? s.submittedAt,
      classId: s.assignment.class.id,
      className: s.assignment.class.name,
      item: s.assignment.title,
    });
  }

  // ---- per-class grades + trends ----
  const byClass = new Map<string, { name: string; teacher: string | null; pcts: number[] }>();
  for (const m of memberships) {
    byClass.set(m.class.id, { name: m.class.name, teacher: m.class.owner.name, pcts: [] });
  }
  for (const g of graded) {
    const e = byClass.get(g.classId) ?? { name: g.className, teacher: null, pcts: [] };
    e.pcts.push(g.pct);
    byClass.set(g.classId, e);
  }

  const classes: ParentClass[] = [...byClass.entries()]
    .filter(([, e]) => e.pcts.length > 0) // only classes with graded work carry a grade
    .map(([id, e]) => {
      const grade = Math.round(e.pcts.reduce((s, p) => s + p, 0) / e.pcts.length);
      return {
        id,
        name: e.name,
        teacher: e.teacher,
        room: null, // TODO: wire when room/section is tracked
        grade,
        letter: letterFromPercent(grade),
        color: subjectColor(id),
        trend: e.pcts,
      };
    })
    .sort((a, b) => b.grade - a.grade);

  // ---- GPA + monthly GPA trend ----
  const allPcts = graded.map((g) => g.pct);
  const gpa = gpaFromPercents(allPcts) ?? 0;

  const monthBuckets = new Map<string, number[]>();
  for (const g of graded) {
    const key = `${g.at.getFullYear()}-${g.at.getMonth()}`;
    const bucket = monthBuckets.get(key) ?? [];
    bucket.push(g.pct);
    monthBuckets.set(key, bucket);
  }
  const orderedMonths = [...monthBuckets.entries()].sort(([a], [b]) => {
    const [ay, am] = a.split("-").map(Number);
    const [by, bm] = b.split("-").map(Number);
    return ay - by || am - bm;
  });
  let gpaTrend = orderedMonths.map(([, pcts]) => gpaFromPercents(pcts) ?? 0);
  let gpaLabels = orderedMonths.map(([key]) => MONTHS[Number(key.split("-")[1])]);
  if (gpaTrend.length === 1) {
    gpaTrend = [gpaTrend[0], gpaTrend[0]];
    gpaLabels = [gpaLabels[0], "Now"];
  } else if (gpaTrend.length > 1) {
    gpaLabels = [...gpaLabels.slice(0, -1), "Now"];
  }

  // ---- recent graded work (newest first) ----
  const recent: ParentRecent[] = [...graded]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 6)
    .map((g) => ({
      cls: g.className,
      color: subjectColor(g.classId),
      item: g.item,
      score: Math.round(g.pct),
      letter: letterFromPercent(g.pct),
      when: relTime(g.at),
    }));

  // ---- strengths (top classes) + focus (lowest / falling) ----
  const trendDelta = (t: number[]) => (t.length > 1 ? t[t.length - 1] - t[0] : 0);
  const strengths = classes
    .filter((c) => c.grade >= 85)
    .slice(0, 3)
    .map((c) => ({ label: c.name, cls: c.teacher ?? "Current grade", color: c.color, score: c.grade }));

  const focus = [...classes]
    .sort((a, b) => a.grade - b.grade || trendDelta(a.trend) - trendDelta(b.trend))
    .slice(0, 3)
    .map((c) => {
      const d = Math.round(trendDelta(c.trend));
      const note =
        d < -1
          ? `Down ${Math.abs(d)} points since the first graded work — worth a check-in.`
          : c.grade < 80
            ? "Lowest current grade across classes — a good place to focus next."
            : "Holding steady; small gains here would lift the overall GPA.";
      return { label: c.name, cls: c.teacher ?? "Needs attention", color: c.color, score: c.grade, note };
    });

  return {
    id: child.id,
    name: child.name ?? "Student",
    first: firstName(child.name),
    grade: null, // TODO: wire when grade-level is tracked
    code: studentCode(child.id),
    gpa,
    gpaTrend,
    gpaLabels,
    attendance: null, // TODO: wire when attendance tracking exists
    onTime: null, // TODO: wire when attendance tracking exists
    classes,
    strengths,
    focus,
    recent,
  };
}
