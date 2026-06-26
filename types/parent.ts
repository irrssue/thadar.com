// Shared types for the parent portal. Imported by both the server data layer
// (server/parent.ts) and the client pages, so the payload shape stays in sync.
// Everything here is a *derived* view of real data (classes, grades, trends);
// fields the platform can't yet measure (attendance, marking periods) are
// nullable placeholders — never invented numbers.

export type ParentClass = {
  id: string;
  name: string;
  teacher: string | null;
  room: string | null;
  /** Current grade 0–100, rounded mean of this class's graded work. */
  grade: number;
  letter: string;
  color: string;
  /** Graded percents over time (oldest → newest); drives sparklines/trends. */
  trend: number[];
};

export type ParentStrength = {
  label: string;
  cls: string;
  color: string;
  score: number;
};

export type ParentFocus = ParentStrength & {
  note: string;
};

export type ParentRecent = {
  cls: string;
  color: string;
  item: string;
  score: number;
  letter: string;
  /** Relative time, e.g. "2d ago". */
  when: string;
};

// A single child as seen from the parent portal. `first`/`grade`/`code` are
// display helpers. `attendance`/`onTime` are null until attendance tracking
// exists (TODO) — the UI renders them as "—".
export type ParentChild = {
  id: string;
  name: string;
  first: string;
  grade: string | null;
  code: string;
  gpa: number;
  gpaTrend: number[];
  gpaLabels: string[];
  attendance: number | null;
  onTime: number | null;
  classes: ParentClass[];
  strengths: ParentStrength[];
  focus: ParentFocus[];
  recent: ParentRecent[];
};

// Compact child summary for the switcher / linked-students list.
export type ParentChildSummary = {
  id: string;
  name: string;
  first: string;
  grade: string | null;
  code: string;
  gpa: number;
};
