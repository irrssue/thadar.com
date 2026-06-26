"use client";

interface ActivityHeatmapProps {
  weeks?: number;
  data: number[];
}

function shade(v: number) {
  if (v <= 0) return "var(--heat-0)";
  if (v < 25) return "var(--heat-1)";
  if (v < 50) return "var(--heat-2)";
  if (v < 75) return "var(--heat-3)";
  return "var(--accent)";
}

export default function ActivityHeatmap({ weeks = 14, data }: ActivityHeatmapProps) {
  const cells = data.slice(0, weeks * 7);
  while (cells.length < weeks * 7) cells.push(0);

  return (
    <div
      style={{
        border: "1px solid var(--ink-faint)",
        borderRadius: 10,
        background: "var(--surface)",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.2px" }}>
            Activity
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-dim)",
              fontFamily: "var(--font-mono)",
              marginTop: 2,
            }}
          >
            study time per day · last {weeks} weeks
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--ink-dim)",
          }}
        >
          <span>less</span>
          {[0, 24, 49, 74, 100].map((v) => (
            <span
              key={v}
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: shade(v),
                border: "1px solid var(--hairline)",
              }}
            />
          ))}
          <span>more</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${weeks}, 1fr)`,
          gridAutoFlow: "column",
          gridTemplateRows: "repeat(7, 1fr)",
          gap: 3,
        }}
      >
        {cells.map((v, i) => (
          <div
            key={i}
            title={`${v} min`}
            style={{
              aspectRatio: "1 / 1",
              borderRadius: 2,
              background: shade(v),
              border: "1px solid var(--hairline)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
