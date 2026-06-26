import { meanPct } from "../../student/grades";
import type { OClass } from "./types";
import type { RosterRow } from "./roster";
import { DAY, t } from "./internal";

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
