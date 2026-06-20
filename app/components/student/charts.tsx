"use client";

// charts.tsx — animated SVG chart primitives for the student surface.
// Ported from the Claude Design handoff (student-charts.jsx) and typed for
// strict mode. Every chart draws itself in on mount, so the animation replays
// each time a page (and its charts) is opened. All respect prefers-reduced-
// motion via the CSS in student.css (the `.reveal`/`.stagger` wrappers) and the
// guard in `useEnter` below.

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

// A style object that may also carry CSS custom properties (e.g. `--c`).
type Style = CSSProperties & Record<string, string | number | undefined>;

/**
 * Returns false on the first paint, then flips to true one frame later — so the
 * browser paints the "from" state before transitioning to the "to" state, which
 * is what makes each chart draw itself in. The `.reveal`/`.stagger` wrappers in
 * student.css disable their entrance under prefers-reduced-motion.
 */
export function useEnter(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setOn(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);
  return on;
}

/* ---------- CountUp — tween a number from 0 → `to` on mount ---------- */
export function CountUp({
  to,
  dur = 1000,
  dec = 0,
  suffix = "",
  prefix = "",
}: {
  to: number;
  dur?: number;
  dec?: number;
  suffix?: string;
  prefix?: string;
}) {
  const [v, setV] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const from = ref.current;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const val = from + (to - from) * e;
      ref.current = val;
      setV(val);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, dur]);
  return (
    <>
      {prefix}
      {v.toFixed(dec)}
      {suffix}
    </>
  );
}

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

/* ---------- VBars — vertical bar chart, bars grow from the baseline ---------- */
export type Bar = { label: string; value: number; color?: string };

export function VBars({
  data,
  h = 150,
  gap = 10,
  dur = 900,
  showVal = true,
}: {
  data: Bar[];
  h?: number;
  gap?: number;
  dur?: number;
  showVal?: boolean;
}) {
  const on = useEnter();
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="vbars" style={{ height: h, gap }}>
      {data.map((d, i) => (
        <div key={i} className="vbar-col">
          {showVal && (
            <div
              className="vbar-val"
              style={{ opacity: on ? 1 : 0, transition: `opacity 400ms ${300 + i * 70}ms` }}
            >
              {d.value}
            </div>
          )}
          <div className="vbar-track">
            <div
              className="vbar-fill"
              style={{
                background: d.color || "var(--accent)",
                height: on ? `${(d.value / max) * 100}%` : "0%",
                transition: `height ${dur}ms cubic-bezier(.34,.8,.3,1) ${i * 70}ms`,
              }}
            />
          </div>
          <div className="vbar-lab">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

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

/* ---------- Heatmap — grid of cells that fade in with a stagger ---------- */
export function Heatmap({
  weeks,
  cell = 15,
  gap = 5,
  colors,
}: {
  weeks: number[][];
  cell?: number;
  gap?: number;
  colors?: string[];
}) {
  const on = useEnter();
  const pal =
    colors || [
      "var(--gauge-track)",
      "var(--danger)",
      "var(--accent-deep)",
      "color-mix(in srgb, var(--good) 55%, transparent)",
      "var(--good)",
    ];
  const rows = ["M", "T", "W", "T", "F"];
  const titles = ["None", "Low", "Some", "Active"];
  return (
    <div className="heatmap" style={{ gap }}>
      <div className="heat-rows" style={{ gap }}>
        {rows.map((r, i) => (
          <div key={i} className="heat-rlab" style={{ height: cell }}>
            {r}
          </div>
        ))}
      </div>
      <div className="heat-grid" style={{ gap }}>
        {weeks.map((wk, wi) => (
          <div key={wi} className="heat-col" style={{ gap }}>
            {wk.map((val, di) => (
              <div
                key={di}
                className="heat-cell"
                title={titles[val] || ""}
                style={{
                  width: cell,
                  height: cell,
                  background: pal[val + 1] || pal[pal.length - 1],
                  opacity: on ? 1 : 0,
                  transform: on ? "scale(1)" : "scale(0.4)",
                  transition: `opacity 300ms ${(wi * 5 + di) * 12}ms, transform 320ms cubic-bezier(.34,1.2,.5,1) ${
                    (wi * 5 + di) * 12
                  }ms`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

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

/* ---------- Reveal — entrance wrapper (fadeUp) with optional stagger delay ---------- */
export function Reveal({
  children,
  delay = 0,
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: Style;
}) {
  return (
    <div className={"reveal " + className} style={{ animationDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}
