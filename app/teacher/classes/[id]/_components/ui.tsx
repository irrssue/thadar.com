/* ---------------- shared bits ---------------- */

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 13, color: "var(--ink-dim)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
      {children}
    </div>
  );
}
export function RowCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1.2px dashed var(--ink-faint)", borderRadius: 10 }}>
      {children}
    </div>
  );
}
export function PersonCell({ person }: { person: { name: string | null; email: string } }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 16 }}>{person.name ?? person.email}</div>
      <div style={{ fontSize: 12, color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>{person.email}</div>
    </div>
  );
}
export function Muted({ children }: { children: React.ReactNode }) {
  return <div style={{ color: "var(--ink-dim)", fontSize: 14, padding: "8px 0" }}>{children}</div>;
}

export const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 };
export const modalStyle: React.CSSProperties = { background: "var(--surface)", border: "1.5px solid var(--stroke)", borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", gap: 12 };
export const inputStyle: React.CSSProperties = { padding: "10px 12px", borderRadius: 10, border: "1.4px solid var(--stroke)", background: "var(--bg)", color: "var(--ink)", fontSize: 15, outline: "none" };
export const ghostBtn: React.CSSProperties = { padding: "8px 14px", borderRadius: 999, border: "1.4px solid var(--stroke)", background: "transparent", color: "var(--ink)", fontSize: 14, cursor: "pointer" };
export const ghostSmall: React.CSSProperties = { padding: "6px 12px", borderRadius: 999, border: "1.2px solid var(--ink-faint)", background: "transparent", color: "var(--ink)", fontSize: 13, cursor: "pointer" };
export const primaryBtn: React.CSSProperties = { padding: "8px 16px", borderRadius: 999, border: "1.4px solid var(--accent)", background: "var(--accent-soft)", color: "var(--accent)", fontSize: 14, cursor: "pointer" };
export const approveBtn: React.CSSProperties = { padding: "6px 14px", borderRadius: 999, border: "1.4px solid var(--accent)", background: "var(--accent-soft)", color: "var(--accent)", fontSize: 13, cursor: "pointer" };
export const denyBtn: React.CSSProperties = { padding: "6px 14px", borderRadius: 999, border: "1.2px solid var(--danger)", background: "transparent", color: "var(--danger)", fontSize: 13, cursor: "pointer" };
export const reorderBtn: React.CSSProperties = { width: 22, height: 18, lineHeight: "14px", fontSize: 10, borderRadius: 5, border: "1.1px solid var(--ink-faint)", background: "transparent", color: "var(--ink-dim)", cursor: "pointer", padding: 0 };
export const thCell: React.CSSProperties = { padding: "8px 12px", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" };
export const tdCell: React.CSSProperties = { padding: "10px 12px", verticalAlign: "top", whiteSpace: "nowrap" };
