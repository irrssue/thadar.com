"use client";

import { useEnter } from "./useEnter";

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
