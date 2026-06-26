"use client";

import { useId } from "react";
import { useEnter } from "./useEnter";

/* ---------- MiniSpark — tiny inline sparkline ---------- */
export function MiniSpark({
  data,
  w = 72,
  h = 26,
  color = "var(--accent)",
  dur = 1100,
}: {
  data: number[];
  w?: number;
  h?: number;
  color?: string;
  dur?: number;
}) {
  const on = useEnter();
  const uid = useId().replace(/:/g, "");
  if (data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((d, i) => {
    const x = data.length === 1 ? w / 2 : (i / (data.length - 1)) * w;
    const y = h - 3 - ((d - min) / span) * (h - 6);
    return [x, y] as const;
  });
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <clipPath id={"sp" + uid}>
          <rect
            x="0"
            y="0"
            width={w}
            height={h}
            style={{
              transform: on ? "scaleX(1)" : "scaleX(0)",
              transformOrigin: "left",
              transition: `transform ${dur}ms cubic-bezier(.4,0,.2,1)`,
            }}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#sp${uid})`}>
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      </g>
      <circle
        cx={last[0]}
        cy={last[1]}
        r="2.6"
        fill={color}
        style={{ opacity: on ? 1 : 0, transition: `opacity 300ms ${dur * 0.7}ms` }}
      />
    </svg>
  );
}
