"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import StudentShell from "@/components/student/StudentShell";
import { initials } from "@/components/student/subject";
import { RadialGauge, Heatmap, CountUp } from "@/components/student/charts";
import { gradePercent, gpaFromPercents } from "@/components/student/grades";

type Me = {
  id: string;
  name: string | null;
  email: string;
  defaultView: "TEACHER" | "STUDENT";
  emailVerified: boolean;
  counts: { teaching: number; enrolled: number; submissions: number };
};

type Submission = {
  id: string;
  status: "SUBMITTED" | "GRADED" | "RETURNED";
  grade: string | null;
  submittedAt: string;
};

type FeedItem = {
  id: string;
  dueAt: string | null;
  submission: Submission | null;
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

function dayKey(t: number): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [me, setMe] = useState<Me | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const [mRes, aRes] = await Promise.all([
      fetch("/api/me", { cache: "no-store" }),
      fetch("/api/assignments", { cache: "no-store" }),
    ]);
    const mJson: ApiResponse<Me> = await mRes.json();
    const aJson: ApiResponse<FeedItem[]> = await aRes.json();
    if (mJson.success) {
      setMe(mJson.data);
      setName(mJson.data.name ?? "");
    }
    if (aJson.success) setFeed(aJson.data);
  }

  useEffect(() => {
    load();
  }, []);

  const metrics = useMemo(() => {
    const percents: number[] = [];
    let submittedWithDue = 0;
    let onTimeCount = 0;
    const done = feed.filter((f) => !!f.submission).length;
    const byDay = new Map<string, number>();
    for (const f of feed) {
      const s = f.submission;
      if (!s) continue;
      if (s.status !== "SUBMITTED" && s.grade) {
        const p = gradePercent(s.grade);
        if (p != null) percents.push(p);
      }
      byDay.set(dayKey(new Date(s.submittedAt).getTime()), (byDay.get(dayKey(new Date(s.submittedAt).getTime())) ?? 0) + 1);
      if (f.dueAt) {
        submittedWithDue++;
        if (new Date(s.submittedAt).getTime() <= new Date(f.dueAt).getTime()) onTimeCount++;
      }
    }
    const gpa = gpaFromPercents(percents);
    const onTime = submittedWithDue > 0 ? Math.round((onTimeCount / submittedWithDue) * 100) : null;
    const completion = feed.length > 0 ? Math.round((done / feed.length) * 100) : null;

    // 12-week × Mon–Fri submission-activity heatmap
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const dow = (now.getDay() + 6) % 7; // 0 = Monday
    const mondayThisWeek = todayStart - dow * 86_400_000;
    const startMonday = mondayThisWeek - 11 * 7 * 86_400_000;
    const level = (n: number) => (n <= 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : 3);
    const weeks: number[][] = [];
    for (let w = 0; w < 12; w++) {
      const col: number[] = [];
      for (let d = 0; d < 5; d++) {
        const t = startMonday + (w * 7 + d) * 86_400_000;
        col.push(level(byDay.get(dayKey(t)) ?? 0));
      }
      weeks.push(col);
    }

    return { gpa, onTime, completion, weeks, hasActivity: byDay.size > 0 };
  }, [feed]);

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
  const { gpa, onTime, completion, weeks, hasActivity } = metrics;

  const prefs: [string, string][] = [
    ["Display name", displayName],
    ["Email", email],
    ["Email status", me?.emailVerified ? "verified ✓" : "unverified"],
    ["Theme", "Use the sidebar toggle"],
  ];

  return (
    <StudentShell active="profile">
      <div className="prof-hd reveal">
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

      {/* rings + activity */}
      <div className="dgrid g-prof reveal" style={{ animationDelay: "60ms", marginBottom: "var(--gap)" }}>
        <div className="card prof-rings">
          <RadialGauge pct={gpa != null ? (gpa / 4) * 100 : 0} size={120} stroke={11} color="var(--c-1)">
            <div className="gauge-num" style={{ fontSize: 24 }}>
              {gpa != null ? <CountUp to={gpa} dec={1} /> : "—"}
            </div>
            <div className="gauge-lab">GPA</div>
          </RadialGauge>
          <RadialGauge pct={onTime ?? 0} size={120} stroke={11} color="var(--accent)">
            <div className="gauge-num" style={{ fontSize: 24 }}>
              {onTime != null ? <CountUp to={onTime} suffix="%" /> : "—"}
            </div>
            <div className="gauge-lab">on-time</div>
          </RadialGauge>
          <RadialGauge pct={completion ?? 0} size={120} stroke={11} color="var(--good)">
            <div className="gauge-num" style={{ fontSize: 24 }}>
              {completion != null ? <CountUp to={completion} suffix="%" /> : "—"}
            </div>
            <div className="gauge-lab">done</div>
          </RadialGauge>
        </div>
        <div className="card">
          <div className="card-hd">
            <span className="tile-eyebrow">Submission activity · 12 weeks</span>
          </div>
          <div style={{ marginTop: 14 }}>
            <Heatmap weeks={weeks} colors={ACTIVITY_COLORS} />
          </div>
          {!hasActivity && (
            <div className="empty" style={{ marginTop: 12 }}>
              Submit some work and your activity will light up here.
            </div>
          )}
        </div>
      </div>

      {/* stat grid */}
      {me && (
        <div className="statgrid reveal" style={{ animationDelay: "120ms", marginBottom: "var(--gap)" }}>
          <div className="stat">
            <div className="sl">GPA</div>
            <div className="sv">{gpa != null ? <CountUp to={gpa} dec={2} /> : "—"}</div>
          </div>
          <div className="stat">
            <div className="sl">Classes</div>
            <div className="sv">
              <CountUp to={me.counts.enrolled} />
            </div>
          </div>
          <div className="stat">
            <div className="sl">Submissions</div>
            <div className="sv">
              <CountUp to={me.counts.submissions} />
            </div>
          </div>
          <div className="stat">
            <div className="sl">On-time</div>
            <div className="sv">{onTime != null ? <CountUp to={onTime} suffix="%" /> : "—"}</div>
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
  background: "var(--bg-2)",
  color: "var(--ink)",
  fontSize: 15,
  outline: "none",
  fontFamily: "var(--font-sans)",
};
