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

export function Features() {
  return (
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
  );
}
