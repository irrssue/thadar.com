import type { RosterRow } from "./roster";

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
