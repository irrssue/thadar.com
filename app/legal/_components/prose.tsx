export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "var(--ink)",
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.75,
          color: "var(--ink-dim)",
        }}
      >
        {children}
      </div>
    </section>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p style={{ marginBottom: 12 }}>{children}</p>;
}

export function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul
      style={{
        paddingLeft: 20,
        marginBottom: 12,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {children}
    </ul>
  );
}
