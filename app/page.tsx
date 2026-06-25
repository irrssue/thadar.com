import Link from "next/link";
import type { Metadata } from "next";
import CyclingWord from "@/components/CyclingWord";

export const metadata: Metadata = {
  title: "Thadar — The classroom platform teachers deserve",
  description:
    "Thadar is the classroom platform for teachers and students — lessons, assignments, and progress in one place.",
};

const features = [
  {
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
        <path d="M5 17a3 3 0 0 1 3-3h10" />
      </svg>
    ),
    title: "Lessons that stick",
    desc: "Write and publish rich lessons. Students read, teachers know who has.",
  },
  {
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h9l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
        <path d="M14 4v5h5M9 14l2 2 4-4" />
      </svg>
    ),
    title: "Assignments with feedback",
    desc: "Set work, receive submissions, return grades — tracked end to end.",
  },
  {
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 17l5-5 4 4 7-8" />
        <path d="M15 8h5v5" />
      </svg>
    ),
    title: "Progress at a glance",
    desc: "Roster grid shows who's done the reading. No chasing required.",
  },
  {
    icon: (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="9" r="3" />
        <circle cx="17" cy="11" r="2.4" />
        <path d="M3 19c.8-3 3.4-4.5 6-4.5s5.2 1.5 6 4.5M14.5 19c.6-2 2.2-3 4-3" />
      </svg>
    ),
    title: "Invite-only classes",
    desc: "Share a code. Approve students. Your classroom stays yours.",
  },
];

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Nav */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid var(--hairline)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          background: "rgba(14,14,16,0.82)",
        }}
      >
        <nav
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "-0.4px",
              color: "var(--ink)",
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" />
            </svg>
            Thadar
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link
              href="/login"
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                border: "1px solid var(--stroke)",
                background: "transparent",
                color: "var(--ink-dim)",
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
                transition: "color 140ms, border-color 140ms",
              }}
            >
              Sign in
            </Link>
            <Link
              href="/login?mode=register"
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                background: "var(--accent)",
                color: "#1a1814",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                letterSpacing: "0.1px",
              }}
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main style={{ flex: 1 }}>
        {/* Hero */}
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
              href="/login?mode=register"
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

        {/* Dashboard preview card */}
        <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
          <div
            style={{
              borderRadius: 20,
              border: "1px solid var(--hairline)",
              background: "var(--surface)",
              overflow: "hidden",
              boxShadow: "0 24px 80px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset",
            }}
          >
            {/* Fake browser chrome */}
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid var(--hairline)",
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "var(--bg-2)",
              }}
            >
              <div style={{ display: "flex", gap: 6 }}>
                {["#d97a7a", "#e0b97a", "#9ec3a8"].map((c, i) => (
                  <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7, display: "inline-block" }} />
                ))}
              </div>
              <div
                style={{
                  flex: 1,
                  background: "var(--surface-2)",
                  border: "1px solid var(--hairline)",
                  borderRadius: 6,
                  padding: "4px 12px",
                  fontSize: 12,
                  color: "var(--ink-faint)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                teacher.thadar.com
              </div>
            </div>

            {/* Dashboard mock content */}
            <div style={{ padding: "28px 24px", display: "flex", gap: 20 }}>
              {/* Sidebar mock */}
              <div style={{ width: 52, display: "flex", flexDirection: "column", gap: 8, alignItems: "center", paddingTop: 4 }}>
                {[
                  <svg key="home" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" /></svg>,
                  <svg key="book" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M5 17a3 3 0 0 1 3-3h10" /></svg>,
                  <svg key="users" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="3" /><circle cx="17" cy="11" r="2.4" /><path d="M3 19c.8-3 3.4-4.5 6-4.5s5.2 1.5 6 4.5M14.5 19c.6-2 2.2-3 4-3" /></svg>,
                ].map((icon, i) => (
                  <div key={i} style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: i === 0 ? "var(--accent-soft)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {icon}
                  </div>
                ))}
              </div>

              {/* Main content mock */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { label: "Students", val: "24" },
                    { label: "Lessons published", val: "8" },
                    { label: "Submissions", val: "61" },
                  ].map((s) => (
                    <div key={s.label} style={{
                      flex: 1, padding: "14px 16px", borderRadius: 12,
                      border: "1px solid var(--hairline)", background: "var(--surface-2)",
                    }}>
                      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.5px", color: "var(--ink)" }}>{s.val}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ borderRadius: 12, border: "1px solid var(--hairline)", overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--hairline)", fontSize: 12, fontWeight: 600, color: "var(--ink-dim)", letterSpacing: "0.3px", textTransform: "uppercase" }}>Recent activity</div>
                  {[
                    { name: "Ko Mya", action: "submitted Assignment 3", time: "2m ago" },
                    { name: "Ma Su", action: "viewed Lesson 5", time: "14m ago" },
                    { name: "Aung Zaw", action: "joined the class", time: "1h ago" },
                  ].map((row) => (
                    <div key={row.name} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 16px", borderBottom: "1px solid var(--hairline)",
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: "var(--avatar-grad-from)", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 600, color: "var(--accent)",
                        flexShrink: 0,
                      }}>
                        {row.name[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: 13, color: "var(--ink)", fontWeight: 500 }}>{row.name} </span>
                        <span style={{ fontSize: 13, color: "var(--ink-dim)" }}>{row.action}</span>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--ink-faint)", flexShrink: 0 }}>{row.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 96px" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: 48,
            }}
          >
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 700, letterSpacing: "-0.8px", margin: "0 0 12px", color: "var(--ink)" }}>
              Everything in one place
            </h2>
            <p style={{ fontSize: 16, color: "var(--ink-dim)", maxWidth: 480, margin: "0 auto" }}>
              No patchwork of tools. No juggling Google Classroom, Docs, and Sheets.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {features.map((f) => (
              <div
                key={f.title}
                style={{
                  padding: "24px 22px",
                  borderRadius: 16,
                  border: "1px solid var(--hairline)",
                  background: "var(--surface)",
                }}
              >
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: "var(--accent-soft)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--accent)",
                    marginBottom: 14,
                  }}
                >
                  {f.icon}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.2px", marginBottom: 6, color: "var(--ink)" }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "var(--ink-dim)", lineHeight: 1.55 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA band */}
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
              href="/login?mode=register"
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
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--hairline)",
          padding: "24px",
          textAlign: "center",
          color: "var(--ink-faint)",
          fontSize: 13,
        }}
      >
        <span style={{ color: "var(--ink-dim)", fontWeight: 600 }}>Thadar</span>
        {" — "}သဒ္ဒါ — generous, giving.{" "}
        <Link href="/login" style={{ color: "var(--ink-dim)", textDecoration: "none" }}>Sign in</Link>
      </footer>
    </div>
  );
}
