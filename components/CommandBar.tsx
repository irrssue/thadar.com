"use client";

import Icon from "./Icon";

export default function CommandBar() {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 24,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 40,
      }}
    >
      <div
        className="command-bar"
        style={{
          width: "min(50%, 720px)",
          minWidth: 280,
          border: "1.4px solid var(--stroke)",
          borderRadius: 14,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "var(--surface-2)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.32)",
          pointerEvents: "auto",
        }}
      >
        <Icon name="search" />
        <span
          style={{
            color: "var(--ink-faint)",
            fontSize: 15,
            flex: 1,
          }}
        >
          Jump to a class, assignment, or person…
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ink-dim)",
            border: "1px solid var(--ink-faint)",
            padding: "3px 6px",
            borderRadius: 5,
          }}
        >
          ⌘ K
        </span>
      </div>
    </div>
  );
}
