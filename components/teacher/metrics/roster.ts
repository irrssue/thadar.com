import { gradePercent, meanPct } from "../../student/grades";
import { subjectColor } from "../../student/subject";
import type { OClass, Person } from "./types";
import { t } from "./internal";

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
