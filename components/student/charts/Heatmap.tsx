"use client";

import { useEnter } from "./useEnter";

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
