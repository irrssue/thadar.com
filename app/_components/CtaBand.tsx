import Link from "next/link";

export function CtaBand() {
  return (
    <section
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "0 24px 96px",
      }}
    >
      <div
        style={{
          borderRadius: 20,
          border: "1px solid var(--accent-ring)",
          background: "var(--accent-tint)",
          padding: "56px 40px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            fontWeight: 700,
            letterSpacing: "-0.8px",
            margin: "0 0 12px",
            color: "var(--ink)",
          }}
        >
          Ready to run your classroom?
        </h2>
        <p style={{ fontSize: 16, color: "var(--ink-dim)", margin: "0 0 28px" }}>
          Free to start. No credit card needed.
        </p>
        <Link
          href="/signup/intent"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "13px 32px",
            borderRadius: 12,
            background: "var(--accent)",
            color: "#1a1814",
            fontSize: 15,
            fontWeight: 700,
            textDecoration: "none",
            letterSpacing: "-0.1px",
          }}
        >
          Create your class
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
