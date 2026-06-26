import type { OClass } from "./types";
import { DAY, t } from "./internal";

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
