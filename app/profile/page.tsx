"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import FloatingNav from "../components/FloatingNav";
import CommandBar from "../components/CommandBar";

type Me = {
  id: string;
  name: string | null;
  email: string;
  defaultView: "TEACHER" | "STUDENT";
  emailVerified: boolean;
  counts: { teaching: number; enrolled: number; submissions: number };
};

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { data: session, update } = useSession();
  const [me, setMe] = useState<Me | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/me", { cache: "no-store" });
    const json: ApiResponse<Me> = await res.json();
    if (json.success) {
      setMe(json.data);
      setName(json.data.name ?? "");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const json: ApiResponse<{ name: string }> = await res.json();
      if (!json.success) {
        setErr(json.error);
        return;
      }
      await update({ name: json.data.name });
      setEditing(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  const displayName = me?.name ?? session?.user?.name ?? "Student";
  const email = me?.email ?? session?.user?.email ?? "";
  const initials = displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const stats = me
    ? [
        { label: "Classes enrolled", value: String(me.counts.enrolled) },
        { label: "Classes teaching", value: String(me.counts.teaching) },
        { label: "Submissions", value: String(me.counts.submissions) },
      ]
    : [];

  return (
    <>
      <div className="app-page" style={{ maxWidth: 860, margin: "0 auto", padding: "24px 34px 100px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--avatar-grad-from), var(--avatar-grad-to))",
            border: "1px solid var(--accent)", display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 600, color: "var(--accent)", letterSpacing: "-0.5px", flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontWeight: 600, fontSize: 28, margin: "0 0 2px", letterSpacing: "-0.5px" }}>
              <span style={{ color: "var(--accent)" }}>{displayName}</span>
            </h1>
            <p style={{ color: "var(--ink-dim)", fontSize: 13, margin: 0 }}>{email}</p>
          </div>
          <button onClick={() => setEditing(true)} style={editBtn}>Edit profile</button>
        </div>

        {me && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }} className="profile-stats">
            {stats.map((s) => (
              <div key={s.label} style={{ border: "1px solid var(--ink-faint)", borderRadius: 14, background: "var(--surface)", padding: "18px 20px" }}>
                <div style={{ fontSize: 28, fontWeight: 600 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--ink-dim)", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{
          border: "1px solid var(--ink-faint)", borderRadius: 14, background: "var(--surface)",
          padding: "20px 22px", color: "var(--ink-dim)", fontSize: 14,
        }}>
          {me?.emailVerified
            ? "Your email is verified."
            : "Your email isn't verified yet. Some features may be limited until you verify."}
        </div>

        <CommandBar />
      </div>

      {editing && (
        <div onClick={() => setEditing(false)} style={overlayStyle}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} style={modalStyle}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>Edit profile</div>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, color: "var(--ink-dim)" }}>Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required autoFocus style={inputStyle} />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, color: "var(--ink-dim)" }}>Email</span>
              <input value={email} disabled style={{ ...inputStyle, opacity: 0.6 }} />
            </label>
            {err && <div style={{ color: "var(--danger)", fontSize: 14 }}>{err}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={() => setEditing(false)} style={ghostBtn}>Cancel</button>
              <button type="submit" disabled={saving || !name.trim()} style={{ ...primaryBtn, opacity: saving || !name.trim() ? 0.5 : 1 }}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      <FloatingNav active={activeTab} onChange={setActiveTab} />

      <style>{`
        @media (max-width: 720px) { .profile-stats { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}

const editBtn: React.CSSProperties = { padding: "8px 14px", borderRadius: 999, border: "1.2px solid var(--ink-faint)", background: "transparent", color: "var(--ink)", fontSize: 13, cursor: "pointer" };
const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 };
const modalStyle: React.CSSProperties = { background: "var(--surface)", border: "1.5px solid var(--stroke)", borderRadius: 14, padding: 24, width: "min(440px, 92vw)", display: "flex", flexDirection: "column", gap: 14 };
const inputStyle: React.CSSProperties = { padding: "10px 12px", borderRadius: 10, border: "1.4px solid var(--stroke)", background: "var(--bg)", color: "var(--ink)", fontSize: 15, outline: "none" };
const ghostBtn: React.CSSProperties = { padding: "8px 14px", borderRadius: 999, border: "1.4px solid var(--stroke)", background: "transparent", color: "var(--ink)", fontSize: 14, cursor: "pointer" };
const primaryBtn: React.CSSProperties = { padding: "8px 16px", borderRadius: 999, border: "1.4px solid var(--accent)", background: "var(--accent-soft)", color: "var(--accent)", fontSize: 14, cursor: "pointer" };
