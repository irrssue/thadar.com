import Link from "next/link";

export function MarketingNav() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--hairline)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        background: "var(--header-bg)",
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
            href="/signup/intent"
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
  );
}
