import Link from "next/link";

export function MarketingFooter() {
  return (
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
  );
}
