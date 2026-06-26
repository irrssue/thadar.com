"use client";

import { useId } from "react";
import { useEnter } from "./useEnter";

/* ---------- AreaTrend — line + soft area, revealed left→right ---------- */
export function AreaTrend({
  data,
  w = 560,
  h = 170,
  color = "var(--accent)",
  pad = 14,
  dur = 1400,
  baseline = true,
}: {
  data: number[];
  w?: number;
  h?: number;
  color?: string;
  pad?: number;
  dur?: number;
  baseline?: boolean;
}) {
  const on = useEnter();
  const uid = useId().replace(/:/g, "");
  if (data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const iw = w - pad * 2;
  const ih = h - pad * 2;
  const pts = data.map((d, i) => {
    const x = pad + (data.length === 1 ? iw / 2 : (i / (data.length - 1)) * iw);
    const y = pad + ih - ((d - min) / span) * ih * 0.82 - ih * 0.09;
    return [x, y] as const;
  });
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = line + ` L ${(pad + iw).toFixed(1)} ${(pad + ih).toFixed(1)} L ${pad} ${(pad + ih).toFixed(1)} Z`;
  return (
    <svg
      className="area-trend"
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ display: "block", height: h }}
    >
      <defs>
        <linearGradient id={"ag" + uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.34" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <clipPath id={"ac" + uid}>
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
      {baseline && (
        <line
          x1={pad}
          y1={pad + ih}
          x2={w - pad}
          y2={pad + ih}
          stroke="var(--gauge-track)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      )}
      <g clipPath={`url(#ac${uid})`}>
        <path d={area} fill={`url(#ag${uid})`} />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  );
}
