"use client";

import Icon from "./Icon";

export interface ClassInfo {
  code: string;
  title: string;
  teacher: string;
  schedule: string;
  room: string;
  progress: number;
  nextItem: string;
  nextDue: string;
  unread: number;
  accent?: string;
}

interface ClassCardProps {
  data: ClassInfo;
}

export default function ClassCard({ data }: ClassCardProps) {
  const accent = data.accent ?? "var(--accent)";

  return (
    <div
      style={{
        position: "relative",
        border: "1px solid var(--ink-faint)",
        borderRadius: 14,
        background: "var(--surface)",
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        cursor: "pointer",
        transition: "border-color 120ms, transform 120ms",
      }}
      className="class-card"
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--ink-dim)",
              letterSpacing: "0.5px",
              marginBottom: 4,
            }}
          >
            {data.code}
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.2px" }}>
            {data.title}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-dim)", marginTop: 4 }}>
            {data.teacher}
          </div>
        </div>

        {data.unread > 0 && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: accent,
              border: `1px solid ${accent}`,
              padding: "2px 7px",
              borderRadius: 999,
              flexShrink: 0,
            }}
          >
            {data.unread} new
          </span>
        )}
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--ink-dim)",
            marginBottom: 6,
          }}
        >
          <span>progress</span>
          <span>{data.progress}%</span>
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 999,
            background: "var(--ink-faint)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${data.progress}%`,
              height: "100%",
              background: accent,
              borderRadius: 999,
            }}
          />
        </div>
      </div>

      <div
        style={{
          border: "1px solid var(--ink-faint)",
          borderRadius: 10,
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Icon name="spark" size={14} />
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {data.nextItem}
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-dim)", fontFamily: "var(--font-mono)" }}>
            due {data.nextDue}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "var(--ink-dim)",
          fontFamily: "var(--font-mono)",
          paddingTop: 2,
        }}
      >
        <span>{data.schedule}</span>
        <span>{data.room}</span>
      </div>

      <style>{`
        .class-card:hover {
          border-color: var(--stroke) !important;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
