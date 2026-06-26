"use client";

import Icon from "./Icon";

export default function AskCard() {
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
        minHeight: 340,
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Icon name="spark" /> Ask your tutor
        </div>
        <span
          style={{
            color: "var(--ink-dim)",
            fontSize: 14,
          }}
        >
          AI · context: your classes
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "14px 0", flex: 1 }}>
        <div
          style={{
            maxWidth: "86%",
            padding: "10px 14px",
            borderRadius: 14,
            border: "1px solid var(--ink-faint)",
            fontSize: 15,
            lineHeight: 1.45,
            alignSelf: "flex-start",
          }}
        >
          Hi Thazin — want help with the Algebra worksheet due today?
        </div>
        <div
          style={{
            maxWidth: "86%",
            padding: "10px 14px",
            borderRadius: 14,
            border: "1px solid var(--accent-ring)",
            background: "var(--accent-tint)",
            fontSize: 15,
            lineHeight: 1.45,
            alignSelf: "flex-end",
          }}
        >
          explain factoring trinomials again, simpler
        </div>
        <div
          style={{
            maxWidth: "86%",
            padding: "10px 14px",
            borderRadius: 14,
            border: "1px solid var(--ink-faint)",
            fontSize: 15,
            lineHeight: 1.45,
            alignSelf: "flex-start",
          }}
        >
          Sure. Think of it as un-FOIL-ing — find two numbers that <em>multiply</em> to the last
          term and <em>add</em> to the middle one…
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {["＋ Summarise Ch. 7", "＋ Quiz me on vocab", "＋ Plan my week"].map((label) => (
          <span
            key={label}
            style={{
              border: "1px solid var(--ink-faint)",
              borderRadius: 999,
              padding: "4px 10px",
              color: "var(--ink-dim)",
              fontSize: 13,
              display: "inline-flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            {label}
          </span>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          alignSelf: "center",
          width: "100%",
          border: "1px solid var(--stroke)",
          borderRadius: 12,
          padding: "10px 12px",
          background: "var(--surface-2)",
        }}
      >
        <Icon name="spark" size={16} />
        <span
          style={{
            color: "var(--ink-faint)",
            flex: 1,
            fontSize: 15,
          }}
        >
          Ask anything — homework, schedule, study tips…
        </span>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            border: "1px solid var(--ink-faint)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--ink-dim)",
          }}
        >
          <Icon name="send" size={16} />
        </span>
      </div>
    </div>
  );
}
