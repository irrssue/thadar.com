"use client";

import Icon from "./Icon";

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  detail: string;
  earned: boolean;
}

interface AchievementBadgeProps {
  data: Achievement;
}

export default function AchievementBadge({ data }: AchievementBadgeProps) {
  const earned = data.earned;
  return (
    <div
      style={{
        border: "1px solid var(--ink-faint)",
        borderRadius: 8,
        background: "var(--surface)",
        padding: "9px 11px",
        display: "flex",
        gap: 8,
        alignItems: "center",
        opacity: earned ? 1 : 0.45,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: earned ? "var(--accent-soft)" : "var(--surface-2)",
          color: earned ? "var(--accent)" : "var(--ink-dim)",
          border: `1px solid ${earned ? "var(--accent)" : "var(--ink-faint)"}`,
          flexShrink: 0,
        }}
      >
        <Icon name={data.icon} size={12} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--ink)" }}>
          {data.title}
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-dim)" }}>{data.detail}</div>
      </div>
    </div>
  );
}
