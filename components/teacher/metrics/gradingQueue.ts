import { subjectColor } from "../../student/subject";
import type { OClass } from "./types";
import { t } from "./internal";

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
