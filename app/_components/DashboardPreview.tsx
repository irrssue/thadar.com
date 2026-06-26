export function DashboardPreview() {
  return (
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
  );
}
