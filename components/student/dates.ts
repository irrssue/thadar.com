// Due-date helpers for the student surface. Turn a raw dueAt into the short
// label + state the design's due-chip expects.

export type DueState = "today" | "over" | "soon" | "none";

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function dueInfo(dueAt: string | null): { label: string; state: DueState } {
  if (!dueAt) return { label: "No due date", state: "none" };
  const due = new Date(dueAt);
  const now = new Date();
  const dayMs = 86_400_000;
  const days = Math.round((startOfDay(due) - startOfDay(now)) / dayMs);

  if (days < 0) return { label: "Overdue", state: "over" };
  if (days === 0) return { label: "Today", state: "today" };
  if (days === 1) return { label: "Tomorrow", state: "soon" };
  if (days < 7)
    return { label: due.toLocaleDateString(undefined, { weekday: "short" }), state: "soon" };
  return { label: due.toLocaleDateString(undefined, { month: "short", day: "numeric" }), state: "soon" };
}

export function todayLine(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
