// Small pure helpers shared by the parent pages, ported from the design's
// parent-data.jsx. All operate on a class's `trend` (graded percents over time).

export const trendDelta = (tr: number[]): number =>
  tr.length > 1 ? Math.round(tr[tr.length - 1] - tr[0]) : 0;

export const trendDir = (tr: number[]): "up" | "down" | "flat" => {
  const d = trendDelta(tr);
  return d > 1 ? "up" : d < -1 ? "down" : "flat";
};

// Marking-period report card derived from a class's real trend: sample up to
// four evenly-spaced points (earliest → now). Honest sampling of real grades,
// not invented term scores.
export const PERIODS = ["Q1", "Q2", "Q3", "Now"];

export function report(tr: number[]): number[] {
  if (tr.length === 0) return [];
  if (tr.length <= PERIODS.length) return tr.map((v) => Math.round(v));
  const idxs = [0, Math.floor(tr.length / 3), Math.floor((2 * tr.length) / 3), tr.length - 1];
  return idxs.map((i) => Math.round(tr[i]));
}

export const dirColor = (dir: "up" | "down" | "flat"): string =>
  dir === "up" ? "var(--good)" : dir === "down" ? "var(--danger)" : "var(--ink-dim)";
