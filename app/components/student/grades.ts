// grades.ts — derive numeric views from real grades.
//
// Grades in the DB are free-text strings (`Submission.grade: String?`): a
// teacher might type "92", "88%", "A-", "B+", or "92/100". The charts need
// numbers, so these helpers parse a grade into a 0–100 percent, then onto a
// letter / GPA / distribution bucket. Where a teacher only gave a letter we map
// it to a representative percent — a derived view of real data, never invented
// scores.

const LETTER_PCT: Record<string, number> = {
  "A+": 98,
  A: 95,
  "A-": 91,
  "B+": 88,
  B: 85,
  "B-": 81,
  "C+": 78,
  C: 75,
  "C-": 71,
  "D+": 68,
  D: 65,
  "D-": 61,
  F: 50,
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Parse a free-text grade into a 0–100 percent, or null if it has no signal. */
export function gradePercent(grade: string | null | undefined): number | null {
  if (!grade) return null;
  const s = grade.trim();
  if (!s) return null;

  // Leading number wins: "92", "88%", "92/100", "92.5".
  if (/^\s*\d/.test(s)) {
    const m = s.match(/\d+(?:\.\d+)?/);
    if (m) return clamp(parseFloat(m[0]), 0, 100);
  }

  // Letter grade, optionally with +/-.
  const letter = s.toUpperCase().replace(/\s+/g, "").match(/^[A-F][+-]?/)?.[0];
  if (letter && letter in LETTER_PCT) return LETTER_PCT[letter];

  // Any embedded number as a last resort.
  const any = s.match(/\d+(?:\.\d+)?/);
  if (any) return clamp(parseFloat(any[0]), 0, 100);
  return null;
}

/** Letter for a percent, e.g. 91 → "A-". */
export function letterFromPercent(p: number): string {
  if (p >= 97) return "A+";
  if (p >= 93) return "A";
  if (p >= 90) return "A-";
  if (p >= 87) return "B+";
  if (p >= 83) return "B";
  if (p >= 80) return "B-";
  if (p >= 77) return "C+";
  if (p >= 73) return "C";
  if (p >= 70) return "C-";
  if (p >= 67) return "D+";
  if (p >= 63) return "D";
  if (p >= 60) return "D-";
  return "F";
}

/** 4.0-scale points for a percent. */
export function gpaPoints(p: number): number {
  if (p >= 93) return 4.0;
  if (p >= 90) return 3.7;
  if (p >= 87) return 3.3;
  if (p >= 83) return 3.0;
  if (p >= 80) return 2.7;
  if (p >= 77) return 2.3;
  if (p >= 73) return 2.0;
  if (p >= 70) return 1.7;
  if (p >= 67) return 1.3;
  if (p >= 63) return 1.0;
  if (p >= 60) return 0.7;
  return 0;
}

/** Mean GPA across a set of percents, rounded to 2dp, or null when empty. */
export function gpaFromPercents(ps: number[]): number | null {
  if (ps.length === 0) return null;
  const avg = ps.reduce((s, p) => s + gpaPoints(p), 0) / ps.length;
  return Math.round(avg * 100) / 100;
}

/** Coarse A/B/C/D/F bucket for the grade-mix donut. */
export function distBucket(p: number): "A" | "B" | "C" | "D" | "F" {
  if (p >= 90) return "A";
  if (p >= 80) return "B";
  if (p >= 70) return "C";
  if (p >= 60) return "D";
  return "F";
}

/** Status color for a percent: good / accent / danger, for letters + rings. */
export function gradeTone(p: number): string {
  if (p >= 90) return "var(--good)";
  if (p >= 80) return "var(--accent)";
  if (p >= 70) return "var(--c-5)";
  return "var(--danger)";
}

/** Mean of a number list rounded to nearest int, or null when empty. */
export function meanPct(ps: number[]): number | null {
  if (ps.length === 0) return null;
  return Math.round(ps.reduce((s, p) => s + p, 0) / ps.length);
}
