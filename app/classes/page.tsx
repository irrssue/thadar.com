"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StudentShell from "../components/student/StudentShell";
import StudentIcon from "../components/student/StudentIcon";
import { subjectColor } from "../components/student/subject";
import { dueInfo } from "../components/student/dates";
import { RadialGauge, MiniSpark } from "../components/student/charts";
import { gradePercent, letterFromPercent } from "../components/student/grades";

type Membership = {
  id: string;
  status: "ACTIVE" | "PENDING";
  joinedAt: string;
  class: {
    id: string;
    name: string;
    description: string | null;
    owner: { name: string | null };
    _count: { lessons: number };
  };
};

type Submission = {
  id: string;
  status: "SUBMITTED" | "GRADED" | "RETURNED";
  grade: string | null;
  submittedAt: string;
};

type FeedItem = {
  id: string;
  title: string;
  dueAt: string | null;
  class: { id: string; name: string };
  submission: Submission | null;
};

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

const FILTERS = ["All", "Active", "Pending"] as const;

// per-class signal derived from the assignment feed
type ClassStat = {
  trend: number[]; // chronological graded percents
  avg: number | null;
  letter: string | null;
  next: { title: string; label: string; state: string } | null;
};

export default function ClassesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [memberships, setMemberships] = useState<Membership[] | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showJoin, setShowJoin] = useState(false);

  async function load() {
    setError(null);
    const [mRes, aRes] = await Promise.all([
      fetch("/api/memberships", { cache: "no-store" }),
      fetch("/api/assignments", { cache: "no-store" }),
    ]);
    const mJson: ApiResponse<Membership[]> = await mRes.json();
    const aJson: ApiResponse<FeedItem[]> = await aRes.json();
    if (!mJson.success) {
      setError(mJson.error);
      return;
    }
    setMemberships(mJson.data);
    if (aJson.success) setFeed(aJson.data);
  }

  useEffect(() => {
    load();
  }, []);

  // class id → derived stats from the assignment feed
  const stats = useMemo(() => {
    const map = new Map<string, ClassStat>();
    const graded = new Map<string, { when: number; pct: number }[]>();
    const upcoming = new Map<string, { title: string; due: string }[]>();
    for (const f of feed) {
      const cid = f.class.id;
      if (f.submission && f.submission.status !== "SUBMITTED" && f.submission.grade) {
        const pct = gradePercent(f.submission.grade);
        if (pct != null) {
          const arr = graded.get(cid) ?? [];
          arr.push({ when: new Date(f.submission.submittedAt).getTime(), pct });
          graded.set(cid, arr);
        }
      }
      if (!f.submission && f.dueAt) {
        const arr = upcoming.get(cid) ?? [];
        arr.push({ title: f.title, due: f.dueAt });
        upcoming.set(cid, arr);
      }
    }
    const ids = new Set<string>([...graded.keys(), ...upcoming.keys()]);
    for (const cid of ids) {
      const g = (graded.get(cid) ?? []).sort((a, b) => a.when - b.when);
      const trend = g.map((x) => x.pct);
      const avg = trend.length ? Math.round(trend.reduce((s, p) => s + p, 0) / trend.length) : null;
      const up = (upcoming.get(cid) ?? []).sort(
        (a, b) => new Date(a.due).getTime() - new Date(b.due).getTime(),
      )[0];
      map.set(cid, {
        trend,
        avg,
        letter: avg != null ? letterFromPercent(avg) : null,
        next: up ? { title: up.title, ...dueInfo(up.due) } : null,
      });
    }
    return map;
  }, [feed]);

  const filtered = (memberships ?? []).filter((m) => {
    if (filter === "Active") return m.status === "ACTIVE";
    if (filter === "Pending") return m.status === "PENDING";
    return true;
  });

  const activeCount = (memberships ?? []).filter((m) => m.status === "ACTIVE").length;

  return (
    <StudentShell active="classes">
      <div className="dh">
        <div>
          <h1>
            Your <span className="var">classes</span>
          </h1>
          <p className="dsub">
            {memberships === null
              ? "Loading…"
              : memberships.length === 0
                ? "No classes yet — join one with a code from your teacher."
                : `${activeCount} active · ${memberships.length} total`}
          </p>
        </div>
        <button className="btn" onClick={() => setShowJoin(true)}>
          <StudentIcon name="plus" size={15} /> Join a class
        </button>
      </div>

      <div className="filterbar">
        {FILTERS.map((f) => (
          <button key={f} className={"fpill " + (f === filter ? "on" : "")} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {error && <div style={{ color: "var(--danger)", marginBottom: 16 }}>{error}</div>}

      {memberships !== null && filtered.length === 0 && (
        <div className="card" style={{ textAlign: "center", color: "var(--ink-dim)", padding: "48px 24px" }}>
          {memberships.length === 0
            ? "You haven't joined any classes yet. Tap “Join a class” and enter the code your teacher gave you."
            : "Nothing in this filter."}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="dgrid d-2 stagger">
          {filtered.map((m, i) => {
            const color = subjectColor(m.class.id);
            const active = m.status === "ACTIVE";
            const s = stats.get(m.class.id);
            const trendUp = s && s.trend.length >= 2 ? s.trend[s.trend.length - 1] - s.trend[0] : null;
            return (
              <div
                key={m.id}
                className={"classcard reveal" + (active ? " link" : "")}
                style={{ ["--c" as string]: color, opacity: active ? 1 : 0.72 }}
                onClick={active ? () => router.push(`/classes/${m.class.id}`) : undefined}
              >
                <div className="cc-main">
                  <RadialGauge
                    pct={s?.avg ?? 0}
                    size={84}
                    stroke={8}
                    color={active ? color : "var(--ink-faint)"}
                    delay={i * 60 + 150}
                  >
                    <div className="ring-letter" style={{ color, fontSize: 20 }}>
                      {s?.letter ?? "—"}
                    </div>
                  </RadialGauge>
                  <div className="cc-body">
                    <div className="cc-name">{m.class.name}</div>
                    <div className="cc-teach">
                      {m.class.owner.name ?? "Teacher"} · {m.class._count.lessons} lessons
                    </div>
                    {s && s.trend.length >= 2 ? (
                      <div className="cc-spark">
                        <MiniSpark data={s.trend} w={108} h={28} color={color} />
                        {trendUp != null && (
                          <span
                            className="cc-trend"
                            style={{ color: trendUp >= 0 ? "var(--good)" : "var(--danger)" }}
                          >
                            {trendUp >= 0 ? "+" : ""}
                            {trendUp}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="cc-spark">
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-faint)" }}>
                          {active ? "no grades yet" : "pending approval"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="cc-foot">
                  <span className="stag">
                    <span className="sdot" style={{ background: active ? color : "var(--ink-faint)" }} />
                    {active ? (s?.next ? `next: ${s.next.title}` : "all caught up") : "awaiting teacher"}
                  </span>
                  <span
                    className="cc-due"
                    style={{
                      color: s?.next?.state === "today" || s?.next?.state === "over" ? "var(--accent)" : "var(--ink-dim)",
                    }}
                  >
                    {active ? s?.next?.label ?? "—" : "pending"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showJoin && (
        <JoinModal
          onClose={() => setShowJoin(false)}
          onJoined={() => {
            setShowJoin(false);
            load();
          }}
        />
      )}
    </StudentShell>
  );
}

function JoinModal({ onClose, onJoined }: { onClose: () => void; onJoined: () => void }) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim() || submitting) return;
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });
      const json: ApiResponse<{ className: string; status: string }> = await res.json();
      if (!json.success) {
        setErr(json.error);
        return;
      }
      setDone(json.data.className);
      setTimeout(onJoined, 1100);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div onClick={onClose} style={overlayStyle}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={modalStyle}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Join a class</div>
        {done ? (
          <div style={{ color: "var(--accent)", fontSize: 15 }}>
            Request sent to {done}. Your teacher will approve you shortly.
          </div>
        ) : (
          <>
            <p style={{ color: "var(--ink-dim)", fontSize: 14, margin: 0 }}>
              Enter the invite code your teacher gave you.
            </p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoFocus
              maxLength={16}
              placeholder="e.g. 7KQ9MZ2"
              style={{
                padding: "12px 14px",
                borderRadius: 11,
                border: "1px solid var(--stroke-2)",
                background: "var(--bg-2)",
                color: "var(--ink)",
                fontSize: 20,
                fontFamily: "var(--font-mono)",
                letterSpacing: 4,
                textAlign: "center",
                outline: "none",
                textTransform: "uppercase",
              }}
            />
            {err && <div style={{ color: "var(--danger)", fontSize: 14 }}>{err}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button type="button" onClick={onClose} className="btn">
                Cancel
              </button>
              <button type="submit" disabled={submitting || !code.trim()} className="btn primary">
                {submitting ? "Sending…" : "Request to join"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
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
