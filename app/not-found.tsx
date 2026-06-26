import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found — Thadar",
};

// Branded 404 so a mistyped or stale URL lands on something on-brand and
// actionable instead of Next's bare default. Renders inside the root layout,
// so it inherits the theme tokens and the active light/dark theme.
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 24px",
        gap: 18,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          color: "var(--ink)",
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "-0.3px",
        }}
      >
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" />
        </svg>
        Thadar
      </span>

      <div
        style={{
          fontSize: "clamp(56px, 12vw, 84px)",
          fontWeight: 700,
          letterSpacing: "-2px",
          lineHeight: 1,
          color: "var(--accent)",
        }}
      >
        404
      </div>

      <div>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.3px", color: "var(--ink)" }}>
          This page wandered off
        </h1>
        <p style={{ color: "var(--ink-dim)", fontSize: 15, margin: 0, maxWidth: 360 }}>
          The page you’re looking for doesn’t exist or may have moved.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
        <Link
          href="/"
          style={{
            padding: "11px 22px",
            borderRadius: 10,
            background: "var(--accent)",
            color: "#1a1814",
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Back home
        </Link>
        <Link
          href="/login"
          style={{
            padding: "11px 22px",
            borderRadius: 10,
            border: "1px solid var(--stroke)",
            background: "var(--surface)",
            color: "var(--ink)",
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
