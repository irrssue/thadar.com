"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
}

export default function StatCard({ label, value, hint, accent }: StatCardProps) {
  return (
    <div
      style={{
        border: "1px solid var(--ink-faint)",
        borderRadius: 10,
        background: "var(--surface)",
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--ink-dim)",
          letterSpacing: "0.5px",
          textTransform: "lowercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "-0.5px",
          color: accent ? "var(--accent)" : "var(--ink)",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {hint && (
        <div style={{ fontSize: 12, color: "var(--ink-dim)" }}>{hint}</div>
      )}
    </div>
  );
}
