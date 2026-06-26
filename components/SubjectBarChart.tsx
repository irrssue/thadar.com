"use client";

export interface SubjectScore {
  code: string;
  title: string;
  score: number;
  delta: number;
}

interface SubjectBarChartProps {
  data: SubjectScore[];
}

function colorFor(score: number) {
  if (score >= 80) return "var(--accent)";
  if (score >= 60) return "var(--mid-tone)";
  if (score >= 40) return "var(--ink-dim)";
  return "var(--danger)";
}

export default function SubjectBarChart({ data }: SubjectBarChartProps) {
  const sorted = [...data].sort((a, b) => b.score - a.score);

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
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.2px" }}>
            Mastery by subject
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-dim)",
              fontFamily: "var(--font-mono)",
              marginTop: 2,
            }}
          >
            last 30 days
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 14,
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--ink-dim)",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: "var(--accent)",
              }}
            />
            acing
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: "var(--danger)",
              }}
            />
            needs work
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {sorted.map((s) => {
          const c = colorFor(s.score);
          const deltaPositive = s.delta >= 0;
          return (
            <div key={s.code} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--ink-dim)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {s.code}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--ink)" }}>{s.title}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      color: deltaPositive ? "var(--accent)" : "var(--danger)",
                      fontSize: 11,
                    }}
                  >
                    {deltaPositive ? "+" : ""}
                    {s.delta}
                  </span>
                  <span style={{ color: "var(--ink)", minWidth: 32, textAlign: "right" }}>
                    {s.score}
                  </span>
                </div>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 999,
                  background: "var(--ink-faint)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${s.score}%`,
                    height: "100%",
                    background: c,
                    borderRadius: 999,
                    transition: "width 200ms",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
