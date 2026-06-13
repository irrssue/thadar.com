// Deterministic subject color for a class. Real classes have no color in the
// DB, so we hash the class id onto the design's 6-hue palette — giving each
// class a stable color that's consistent across every student screen.

const PALETTE = [
  "var(--c-1)",
  "var(--c-2)",
  "var(--c-3)",
  "var(--c-4)",
  "var(--c-5)",
  "var(--c-6)",
];

export function subjectColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export function initials(name: string | null | undefined, fallback = "S"): string {
  const s = (name ?? "").trim();
  if (!s) return fallback;
  return s
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
