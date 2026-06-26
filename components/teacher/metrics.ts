// metrics.ts — derive the teacher dashboard's gauges, trends, distributions,
// roster flags, grading queue and heatmap from one /api/teacher/overview
// payload. Everything here is a *derived view of real data*: mastery is the
// mean of real graded percents, "late" counts real submissions past their due
// date, turnaround is real gradedAt − submittedAt. Nothing is invented.

import { gradePercent, meanPct, letterFromPercent } from "../student/grades";
import { subjectColor } from "../student/subject";

const DAY = 86_400_000;

/* ---------------- API shapes ---------------- */
export type SubStatus = "SUBMITTED" | "GRADED" | "RETURNED";
export type Sub = {
  studentId: string;
  status: SubStatus;
  grade: string | null;
  submittedAt: string;
  gradedAt: string | null;
};
export type Asg = {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  dueAt: string | null;
  createdAt: string;
  submissions: Sub[];
  _count: { submissions: number };
};
export type Person = { id: string; name: string | null; email: string };
export type Member = { id: string; status: string; user: Person };
export type OClass = {
  id: string;
  name: string;
  assignments: Asg[];
  students: Member[];
  pending: Member[];
  activeCount: number;
  pendingCount: number;
};
export type Totals = {
  classes: number;
  students: number;
  pending: number;
  assignments: number;
  needsGrading: number;
  toGrade: number;
  graded: number;
};
export type Overview = { totals: Totals; classes: OClass[] };

/* ---------------- small helpers ---------------- */
const t = (iso: string | null): number => (iso ? new Date(iso).getTime() : 0);

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

/* ---------------- grading queue (cross-class) ---------------- */
export type QueueItem = {
  id: string;
  title: string;
  className: string;
  classId: string;
  color: string;
  total: number; // submissions received
  done: number; // already graded
  remaining: number; // awaiting a grade
  mins: number; // rough effort estimate
  urgent: boolean; // past due with work waiting
};

export function gradingQueue(classes: OClass[]): QueueItem[] {
  const now = Date.now();
  const rows: QueueItem[] = [];
  for (const c of classes) {
    const color = subjectColor(c.id);
    for (const a of c.assignments) {
      if (a.status !== "PUBLISHED") continue;
      const total = a.submissions.length;
      if (total === 0) continue;
      const done = a.submissions.filter((s) => s.status !== "SUBMITTED").length;
      const remaining = total - done;
      if (remaining <= 0) continue;
      rows.push({
        id: a.id,
        title: a.title,
        className: c.name,
        classId: c.id,
        color,
        total,
        done,
        remaining,
        mins: Math.max(5, remaining * 3),
        urgent: !!a.dueAt && t(a.dueAt) < now,
      });
    }
  }
  return rows.sort((x, y) => Number(y.urgent) - Number(x.urgent) || y.remaining - x.remaining);
}

/* ---------------- roster (one row per student, across classes) ---------------- */
export type Flag = "support" | "stretch" | null;
export type RosterRow = {
  id: string;
  name: string;
  email: string;
  classId: string;
  className: string;
  color: string;
  mastery: number | null;
  trend: number[];
  late: number;
  flag: Flag;
};

export function roster(classes: OClass[]): RosterRow[] {
  type Acc = {
    person: Person;
    classId: string;
    className: string;
    pts: { pct: number; at: number }[];
    late: number;
  };
  const map = new Map<string, Acc>();

  // seed every active student so even ungraded students appear
  for (const c of classes) {
    for (const m of c.students) {
      if (!map.has(m.user.id)) {
        map.set(m.user.id, { person: m.user, classId: c.id, className: c.name, pts: [], late: 0 });
      }
    }
  }
  // fold in their submissions
  for (const c of classes) {
    for (const a of c.assignments) {
      const due = t(a.dueAt);
      for (const s of a.submissions) {
        const acc = map.get(s.studentId);
        if (!acc) continue;
        if (due && t(s.submittedAt) > due) acc.late++;
        if (s.status !== "SUBMITTED" && s.grade) {
          const p = gradePercent(s.grade);
          if (p != null) acc.pts.push({ pct: p, at: t(s.gradedAt) || t(s.submittedAt) });
        }
      }
    }
  }

  const rows = [...map.values()].map((acc): RosterRow => {
    const pts = acc.pts.sort((x, y) => x.at - y.at);
    const mastery = meanPct(pts.map((p) => p.pct));
    const flag: Flag = mastery == null ? null : mastery >= 90 ? "stretch" : mastery < 60 ? "support" : null;
    return {
      id: acc.person.id,
      name: acc.person.name ?? acc.person.email,
      email: acc.person.email,
      classId: acc.classId,
      className: acc.className,
      color: subjectColor(acc.classId),
      mastery,
      trend: pts.map((p) => p.pct),
      late: acc.late,
      flag,
    };
  });
  // worst first — surface who needs attention
  return rows.sort((a, b) => (a.mastery ?? 200) - (b.mastery ?? 200));
}

/* ---------------- distribution + flag donut ---------------- */
export type Band = { label: string; value: number; color: string };

export function masteryBands(rows: RosterRow[]): Band[] {
  const b = { a: 0, eighties: 0, seventies: 0, sixties: 0, low: 0 };
  for (const r of rows) {
    if (r.mastery == null) continue;
    if (r.mastery >= 90) b.a++;
    else if (r.mastery >= 80) b.eighties++;
    else if (r.mastery >= 70) b.seventies++;
    else if (r.mastery >= 60) b.sixties++;
    else b.low++;
  }
  return [
    { label: "90+", value: b.a, color: "var(--good)" },
    { label: "80s", value: b.eighties, color: "var(--c-1)" },
    { label: "70s", value: b.seventies, color: "var(--c-5)" },
    { label: "60s", value: b.sixties, color: "var(--c-4)" },
    { label: "<60", value: b.low, color: "var(--danger)" },
  ];
}

export type FlagCounts = { onTrack: number; support: number; stretch: number; graded: number };

export function flagCounts(rows: RosterRow[]): FlagCounts {
  let onTrack = 0;
  let support = 0;
  let stretch = 0;
  let graded = 0;
  for (const r of rows) {
    if (r.mastery == null) continue;
    graded++;
    if (r.flag === "support") support++;
    else if (r.flag === "stretch") stretch++;
    else onTrack++;
  }
  return { onTrack, support, stretch, graded };
}

/* ---------------- turnaround trend (weekly avg days) ---------------- */
export function turnaroundTrend(classes: OClass[], weeks = 6): { values: number[]; labels: string[] } {
  const now = Date.now();
  const buckets: number[][] = Array.from({ length: weeks }, () => []);
  for (const c of classes) {
    for (const a of c.assignments) {
      for (const s of a.submissions) {
        if (!s.gradedAt) continue;
        const days = (t(s.gradedAt) - t(s.submittedAt)) / DAY;
        if (days < 0) continue;
        const wAgo = Math.floor((now - t(s.gradedAt)) / (7 * DAY));
        if (wAgo < 0 || wAgo >= weeks) continue;
        buckets[weeks - 1 - wAgo].push(days);
      }
    }
  }
  const overall = (() => {
    const all = buckets.flat();
    return all.length ? all.reduce((s, d) => s + d, 0) / all.length : 0;
  })();
  let carry = overall;
  const values = buckets.map((arr) => {
    if (arr.length) carry = arr.reduce((s, d) => s + d, 0) / arr.length;
    return Math.round(carry * 10) / 10;
  });
  const labels = buckets.map((_, i) => (i === weeks - 1 ? "Now" : `W${i + 1}`));
  return { values, labels };
}

/* ---------------- submission activity heatmap (12 weeks × Mon–Fri) ---------------- */
export function submissionHeatmap(classes: OClass[]): { weeks: number[][]; total: number } {
  const byDay = new Map<string, number>();
  let total = 0;
  for (const c of classes) {
    for (const a of c.assignments) {
      for (const s of a.submissions) {
        const d = new Date(t(s.submittedAt));
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        byDay.set(key, (byDay.get(key) ?? 0) + 1);
        total++;
      }
    }
  }
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const dow = (now.getDay() + 6) % 7; // 0 = Monday
  const startMonday = todayStart - dow * DAY - 11 * 7 * DAY;
  const level = (n: number) => (n <= 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : 3);
  const weeks: number[][] = [];
  for (let w = 0; w < 12; w++) {
    const col: number[] = [];
    for (let d = 0; d < 5; d++) {
      const day = new Date(startMonday + (w * 7 + d) * DAY);
      const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
      col.push(level(byDay.get(key) ?? 0));
    }
    weeks.push(col);
  }
  return { weeks, total };
}

/* ---------------- cohort-wide aggregates (profile) ---------------- */
export function avgMastery(rows: RosterRow[]): number | null {
  return meanPct(rows.map((r) => r.mastery).filter((m): m is number => m != null));
}

/** Submission rate = received ÷ expected on published work, as a 0–100 percent. */
export function submissionRate(classes: OClass[]): number | null {
  let expected = 0;
  let received = 0;
  for (const c of classes) {
    for (const a of c.assignments) {
      if (a.status !== "PUBLISHED") continue;
      expected += c.activeCount;
      received += a.submissions.length;
    }
  }
  if (expected === 0) return null;
  return Math.min(100, Math.round((received / expected) * 100));
}

export function avgTurnaround(classes: OClass[]): number | null {
  const days: number[] = [];
  for (const c of classes) {
    for (const a of c.assignments) {
      for (const s of a.submissions) {
        if (!s.gradedAt) continue;
        const d = (t(s.gradedAt) - t(s.submittedAt)) / DAY;
        if (d >= 0) days.push(d);
      }
    }
  }
  if (days.length === 0) return null;
  return Math.round((days.reduce((s, d) => s + d, 0) / days.length) * 10) / 10;
}
