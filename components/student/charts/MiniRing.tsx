"use client";

import { type ReactNode } from "react";
import { useEnter } from "./useEnter";

/* ---------- MiniRing — tiny gauge for compact tiles ---------- */
export function MiniRing({
  pct,
  size = 46,
  stroke = 5,
  color = "var(--accent)",
  dur = 1100,
  children,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  dur?: number;
  children?: ReactNode;
}) {
  const on = useEnter();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = on ? c * (1 - Math.max(0, Math.min(100, pct)) / 100) : c;
  return (
    <div className="gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gauge-track-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: `stroke-dashoffset ${dur}ms cubic-bezier(.34,.8,.3,1)` }}
        />
      </svg>
      {children != null && <div className="gauge-c">{children}</div>}
    </div>
  );
}
