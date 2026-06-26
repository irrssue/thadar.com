import { gradePercent, meanPct, letterFromPercent } from "../../student/grades";
import { subjectColor } from "../../student/subject";
import type { OClass } from "./types";
import { t } from "./internal";

/** Every graded submission in a class with a parseable percent, chronological. */
function gradedPercents(c: OClass): { pct: number; at: number }[] {
  const out: { pct: number; at: number }[] = [];
  for (const a of c.assignments) {
    for (const s of a.submissions) {
      if (s.status === "SUBMITTED" || !s.grade) continue;
      const p = gradePercent(s.grade);
      if (p != null) out.push({ pct: p, at: t(s.gradedAt) || t(s.submittedAt) });
    }
  }
  return out.sort((x, y) => x.at - y.at);
}

/* ---------------- per-class metrics ---------------- */
export type ClassMetrics = {
  id: string;
  name: string;
  color: string;
  mastery: number | null; // avg graded percent
  letter: string | null;
  trend: number[]; // chronological graded percents (sparkline)
  toGrade: number; // submissions awaiting a grade
  graded: number;
  missing: number; // expected-but-absent submissions on published work
  activeCount: number;
  pendingCount: number;
  nextDue: { title: string; dueAt: string } | null;
  strip: number[]; // submission strip cells (0 empty · 1 low/late · 2 in · 3 strong)
};

export function classMetrics(c: OClass): ClassMetrics {
  const color = subjectColor(c.id);
  const gp = gradedPercents(c);
  const mastery = meanPct(gp.map((g) => g.pct));
  const published = c.assignments.filter((a) => a.status === "PUBLISHED");

  let toGrade = 0;
  let missing = 0;
  for (const a of published) {
    toGrade += a.submissions.filter((s) => s.status === "SUBMITTED").length;
    missing += Math.max(0, c.activeCount - a.submissions.length);
  }

  // next upcoming due date among published assignments
  const now = Date.now();
  const upcoming = published
    .filter((a) => a.dueAt && t(a.dueAt) >= now)
    .sort((a, b) => t(a.dueAt) - t(b.dueAt))[0];

  // submission strip — most recent submissions mapped to a 0..3 intensity
  const recent = published
    .flatMap((a) => a.submissions.map((s) => ({ s, due: t(a.dueAt) })))
    .sort((x, y) => t(x.s.submittedAt) - t(y.s.submittedAt))
    .slice(-22);
  const strip = recent.map(({ s, due }) => {
    if (s.status !== "SUBMITTED" && s.grade) {
      const p = gradePercent(s.grade);
      if (p != null) return p >= 85 ? 3 : p >= 60 ? 2 : 1;
    }
    if (due && t(s.submittedAt) > due) return 1; // late
    return 2; // submitted, awaiting grade
  });

  return {
    id: c.id,
    name: c.name,
    color,
    mastery,
    letter: mastery != null ? letterFromPercent(mastery) : null,
    trend: gp.map((g) => g.pct),
    toGrade,
    graded: gp.length,
    missing,
    activeCount: c.activeCount,
    pendingCount: c.pendingCount,
    nextDue: upcoming?.dueAt ? { title: upcoming.title, dueAt: upcoming.dueAt } : null,
    strip,
  };
}
