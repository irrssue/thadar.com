"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { RadialGauge, Heatmap, CountUp } from "@/components/student/charts";
import { initials } from "@/components/student/subject";
import {
  type Overview,
  roster,
  avgMastery,
  submissionRate,
  avgTurnaround,
  submissionHeatmap,
} from "@/components/teacher/metrics";

type Me = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  counts: { teaching: number; enrolled: number; submissions: number };
};
type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

// neutral → green ramp for the submission-activity heatmap (value 0..3)
const ACTIVITY_COLORS = [
  "transparent",
  "var(--gauge-track)",
  "color-mix(in srgb, var(--good) 32%, transparent)",
  "color-mix(in srgb, var(--good) 62%, transparent)",
  "var(--good)",
];

export default function TeacherProfile() {
  const { data: session, update } = useSession();
  const [me, setMe] = useState<Me | null>(null);
  const [data, setData] = useState<Overview | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const [mRes, oRes] = await Promise.all([
      fetch("/api/me", { cache: "no-store" }),
      fetch("/api/teacher/overview", { cache: "no-store" }),
    ]);
    const mJson: ApiResponse<Me> = await mRes.json();
    const oJson: ApiResponse<Overview> = await oRes.json();
    if (mJson.success) {
      setMe(mJson.data);
      setName(mJson.data.name ?? "");
    }
    if (oJson.success) setData(oJson.data);
  }

  useEffect(() => {
    load();
  }, []);

  const metrics = useMemo(() => {
    if (!data) return null;
    const rows = roster(data.classes);
    const mastery = avgMastery(rows);
    const subRate = submissionRate(data.classes);
    const turn = avgTurnaround(data.classes);
    const { weeks, total } = submissionHeatmap(data.classes);
    const publishedSets = data.classes.reduce(
      (n, c) => n + c.assignments.filter((a) => a.status === "PUBLISHED").length,
      0,
    );
    return { mastery, subRate, turn, weeks, hasActivity: total > 0, publishedSets, graded: data.totals.graded, studentsUnique: rows.length };
  }, [data]);

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

  const displayName = me?.name ?? session?.user?.name ?? "Teacher";
  const email = me?.email ?? session?.user?.email ?? "";

  const prefs: [string, string][] = [
    ["Display name", displayName],
    ["Email", email],
    ["Email status", me?.emailVerified ? "verified ✓" : "unverified"],
    ["Theme", "Use the sidebar toggle"],
  ];

  return (
    <>
      <div className="prof-hd reveal">
        <span className="av" style={{ width: 72, height: 72, fontSize: 24 }}>
          {initials(displayName, "T")}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: 38, fontWeight: 700, margin: 0 }}>{displayName}</h1>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-dim)", marginTop: 6 }}>
            teacher · {email}
          </div>
        </div>
        <button className="btn" onClick={() => setEditing(true)}>
          Edit profile
        </button>
      </div>

      {/* rings + activity */}
      <div className="dgrid g-prof reveal" style={{ animationDelay: "60ms", marginBottom: "var(--gap)" }}>
        <div className="card prof-rings">
          <RadialGauge pct={metrics?.mastery ?? 0} size={120} stroke={11} color="var(--accent)">
            <div className="gauge-num" style={{ fontSize: 24 }}>
              {metrics?.mastery != null ? <CountUp to={metrics.mastery} suffix="%" /> : "—"}
            </div>
            <div className="gauge-lab">avg mastery</div>
          </RadialGauge>
          <RadialGauge pct={metrics?.subRate ?? 0} size={120} stroke={11} color="var(--good)">
            <div className="gauge-num" style={{ fontSize: 24 }}>
              {metrics?.subRate != null ? <CountUp to={metrics.subRate} suffix="%" /> : "—"}
            </div>
            <div className="gauge-lab">submission</div>
          </RadialGauge>
          <RadialGauge pct={metrics?.turn != null ? Math.max(0, 100 - metrics.turn * 20) : 0} size={120} stroke={11} color="var(--c-1)">
            <div className="gauge-num" style={{ fontSize: 24 }}>
              {metrics?.turn != null ? <CountUp to={metrics.turn} dec={1} suffix="d" /> : "—"}
            </div>
            <div className="gauge-lab">turnaround</div>
          </RadialGauge>
        </div>
        <div className="card">
          <div className="card-hd">
            <span className="tile-eyebrow">Submission activity · 12 weeks</span>
          </div>
          <div style={{ marginTop: 14 }}>
            <Heatmap weeks={metrics?.weeks ?? []} colors={ACTIVITY_COLORS} />
          </div>
          {metrics && !metrics.hasActivity && (
            <div className="empty" style={{ marginTop: 12 }}>
              Submissions from your classes will light up here.
            </div>
          )}
        </div>
      </div>

      {/* stat grid */}
      {me && data && (
        <div className="statgrid reveal" style={{ animationDelay: "120ms", marginBottom: "var(--gap)" }}>
          <div className="stat">
            <div className="sl">Students</div>
            <div className="sv">
              <CountUp to={metrics?.studentsUnique ?? 0} />
            </div>
          </div>
          <div className="stat">
            <div className="sl">Active sets</div>
            <div className="sv">
              <CountUp to={metrics?.publishedSets ?? 0} />
            </div>
          </div>
          <div className="stat">
            <div className="sl">Graded</div>
            <div className="sv">
              <CountUp to={metrics?.graded ?? 0} />
            </div>
          </div>
          <div className="stat">
            <div className="sl">Avg turnaround</div>
            <div className="sv">{metrics?.turn != null ? <CountUp to={metrics.turn} dec={1} suffix="d" /> : "—"}</div>
          </div>
        </div>
      )}

      <div className="card reveal" style={{ animationDelay: "160ms" }}>
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

      <div className="reveal" style={{ animationDelay: "200ms", marginTop: "var(--gap)", display: "flex", justifyContent: "center" }}>
        <button
          className="btn"
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
        >
          Sign out
        </button>
      </div>
    </>
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
  background: "var(--bg-2)",
  color: "var(--ink)",
  fontSize: 15,
  outline: "none",
  fontFamily: "var(--font-sans)",
};
