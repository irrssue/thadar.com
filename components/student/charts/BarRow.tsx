"use client";

import { useEnter } from "./useEnter";

/* ---------- BarRow — single animated horizontal bar ---------- */
export function BarRow({
  pct,
  color = "var(--accent)",
  dur = 1000,
  delay = 0,
  h = 8,
}: {
  pct: number;
  color?: string;
  dur?: number;
  delay?: number;
  h?: number;
}) {
  const on = useEnter();
  return (
    <div className="barrow" style={{ height: h }}>
      <div
        className="barrow-fill"
        style={{
          background: color,
          width: on ? `${Math.max(0, Math.min(100, pct))}%` : "0%",
          transition: `width ${dur}ms cubic-bezier(.34,.8,.3,1) ${delay}ms`,
        }}
      />
    </div>
  );
}
