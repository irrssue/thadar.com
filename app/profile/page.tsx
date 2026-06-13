"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import StudentShell from "../components/student/StudentShell";
import { initials } from "../components/student/subject";

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

  const stats: [string, string][] = me
    ? [
        ["Classes", String(me.counts.enrolled)],
        ["Submissions", String(me.counts.submissions)],
        ["Teaching", String(me.counts.teaching)],
        ["Email", me.emailVerified ? "✓" : "—"],
      ]
    : [];

  const prefs: [string, string][] = [
    ["Display name", displayName],
    ["Email", email],
    ["Email status", me?.emailVerified ? "verified ✓" : "unverified"],
    ["Theme", "Dark · warm"],
  ];

  return (
    <StudentShell active="profile">
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 30, flexWrap: "wrap" }}>
        <span className="av" style={{ width: 72, height: 72, fontSize: 24 }}>
          {initials(displayName)}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 38, fontWeight: 700, margin: 0 }}>{displayName}</h1>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-dim)", marginTop: 6 }}>
            student · {email}
          </div>
        </div>
        <button className="btn" onClick={() => setEditing(true)}>
          Edit profile
        </button>
      </div>

      {me && (
        <div className="statgrid" style={{ marginBottom: "var(--gap)" }}>
          {stats.map(([l, v]) => (
            <div key={l} className="stat">
              <div className="sl">{l}</div>
              <div className="sv">{v}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="tile-eyebrow" style={{ marginBottom: 6 }}>
          Preferences
        </div>
        {prefs.map(([l, v], i) => (
          <div key={l} className="prefrow">
            <span className="pl">{l}</span>
            <span className="pv">{v}</span>
            {i === 0 && (
              <button className="btn" style={{ padding: "4px 12px", fontSize: 13 }} onClick={() => setEditing(true)}>
                Edit
              </button>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div onClick={() => setEditing(false)} style={overlayStyle}>
          <form onClick={(e) => e.stopPropagation()} onSubmit={save} style={modalStyle}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Edit profile</div>
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
              <button type="button" onClick={() => setEditing(false)} className="btn">
                Cancel
              </button>
              <button type="submit" disabled={saving || !name.trim()} className="btn primary">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </StudentShell>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
  padding: 16,
};
const modalStyle: React.CSSProperties = {
  background: "var(--bg-2)",
  border: "1px solid var(--stroke-2)",
  borderRadius: 17,
  padding: 24,
  width: "min(440px, 92vw)",
  display: "flex",
  flexDirection: "column",
  gap: 14,
  boxShadow: "0 30px 60px -20px rgba(0,0,0,0.8)",
};
const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 11,
  border: "1px solid var(--stroke-2)",
  background: "rgba(0,0,0,0.25)",
  color: "var(--ink)",
  fontSize: 15,
  outline: "none",
  fontFamily: "var(--font-kalam), cursive",
};
