// Shared private helpers for the metrics derivations. Not re-exported from the
// metrics barrel — internal to this directory.

export const DAY = 86_400_000;

export const t = (iso: string | null): number => (iso ? new Date(iso).getTime() : 0);
