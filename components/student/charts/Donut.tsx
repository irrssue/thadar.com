"use client";

import { type ReactNode } from "react";
import { useEnter } from "./useEnter";

/* ---------- Donut — multi-segment ring ---------- */
export type Segment = { value: number; color: string };

export function Donut({
  segments,
  size = 150,
  stroke = 18,
  dur = 1100,
  gap = 2,
  children,
}: {
  segments: Segment[];
  size?: number;
  stroke?: number;
  dur?: number;
  gap?: number;
  children?: ReactNode;
}) {
  const on = useEnter();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  // Cumulative start fraction per segment — computed without render-time mutation.
  const fracs = segments.map((s) => s.value / total);
  const starts = fracs.map((_, i) => fracs.slice(0, i).reduce((sum, f) => sum + f, 0));
  return (
    <div className="gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gauge-track-2)" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const len = on ? Math.max(0, fracs[i] * c - gap) : 0;
          const dash = `${len} ${c - len}`;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={dash}
              strokeDashoffset={-starts[i] * c}
              style={{ transition: `stroke-dasharray ${dur}ms cubic-bezier(.4,0,.2,1) ${i * 120}ms` }}
            />
          );
        })}
      </svg>
      {children != null && <div className="gauge-c">{children}</div>}
    </div>
  );
}
