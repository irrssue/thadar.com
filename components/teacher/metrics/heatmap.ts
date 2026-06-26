import type { OClass } from "./types";
import { DAY, t } from "./internal";

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
