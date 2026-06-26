import Link from "next/link";
import CyclingWord from "@/components/CyclingWord";

export function Hero() {
  return (
    <section
      style={{
        maxWidth: 1080,
        margin: "0 auto",
        padding: "96px 24px 80px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "5px 14px",
          borderRadius: 99,
          border: "1px solid var(--accent-ring)",
          background: "var(--accent-tint)",
          color: "var(--accent)",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.6px",
          textTransform: "uppercase",
          marginBottom: 28,
        }}
      >
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" />
        </svg>
        Now in early access
      </div>

      <h1
        style={{
          fontSize: "clamp(38px, 6vw, 68px)",
          fontWeight: 700,
          letterSpacing: "-1.5px",
          lineHeight: 1.08,
          margin: "0 0 22px",
          color: "var(--ink)",
        }}
      >
        The classroom platform
        <br />
        <CyclingWord /> deserve
      </h1>

      <p
        style={{
          fontSize: "clamp(16px, 2vw, 19px)",
          color: "var(--ink-dim)",
          maxWidth: 560,
          margin: "0 auto 40px",
          lineHeight: 1.6,
        }}
      >
        Lessons, assignments, and progress tracking — all in one place, for teachers and students.
      </p>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link
          href="/signup/intent"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "13px 28px",
            borderRadius: 12,
            background: "var(--accent)",
            color: "#1a1814",
            fontSize: 15,
            fontWeight: 700,
            textDecoration: "none",
            letterSpacing: "-0.1px",
          }}
        >
          Start teaching free
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "13px 28px",
            borderRadius: 12,
            border: "1px solid var(--stroke)",
            background: "var(--surface)",
            color: "var(--ink)",
            fontSize: 15,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          I&apos;m a student
        </Link>
      </div>
    </section>
  );
}
