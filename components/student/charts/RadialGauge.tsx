"use client";

import { type ReactNode } from "react";
import { useEnter } from "./useEnter";

/* ---------- RadialGauge — animated ring with content in the middle ---------- */
export function RadialGauge({
  pct,
  size = 150,
  stroke = 13,
  color = "var(--accent)",
  track = "var(--gauge-track)",
  dur = 1200,
  delay = 0,
  cap = "round",
  children,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  dur?: number;
  delay?: number;
  cap?: "round" | "butt";
  children?: ReactNode;
}) {
  const on = useEnter();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = on ? c * (1 - Math.max(0, Math.min(100, pct)) / 100) : c;
  return (
    <div className="gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap={cap}
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: `stroke-dashoffset ${dur}ms cubic-bezier(.34,.8,.3,1) ${delay}ms` }}
        />
      </svg>
      {children != null && <div className="gauge-c">{children}</div>}
    </div>
  );
}
