"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudentShell from "../components/student/StudentShell";
import StudentIcon from "../components/student/StudentIcon";
import { subjectColor } from "../components/student/subject";

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

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

const FILTERS = ["All", "Active", "Pending"] as const;

export default function ClassesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [memberships, setMemberships] = useState<Membership[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showJoin, setShowJoin] = useState(false);

  async function load() {
    setError(null);
    const res = await fetch("/api/memberships", { cache: "no-store" });
    const json: ApiResponse<Membership[]> = await res.json();
    if (!json.success) {
      setError(json.error);
      return;
    }
    setMemberships(json.data);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = (memberships ?? []).filter((m) => {
    if (filter === "Active") return m.status === "ACTIVE";
    if (filter === "Pending") return m.status === "PENDING";
    return true;
  });

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
                : `${memberships.length} ${memberships.length === 1 ? "class" : "classes"} · spring term`}
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
        <div className="dgrid d-2">
          {filtered.map((m) => {
            const color = subjectColor(m.class.id);
            const active = m.status === "ACTIVE";
            return (
              <div
                key={m.id}
                className={"classcard" + (active ? " link" : "")}
                style={{ ["--c" as string]: color, opacity: active ? 1 : 0.72 }}
                onClick={active ? () => router.push(`/classes/${m.class.id}`) : undefined}
              >
                <div className="ch">
                  <div>
                    <div className="cname">{m.class.name}</div>
                    <div className="cteach">
                      {m.class.owner.name ?? "Teacher"} · {m.class._count.lessons} lessons
                    </div>
                  </div>
                  {active ? (
                    <span className="stag">
                      <span className="sdot" style={{ background: color }} /> enrolled
                    </span>
                  ) : (
                    <span className="stag" style={{ color: "var(--accent)", borderColor: "var(--accent-line)" }}>
                      pending
                    </span>
                  )}
                </div>
                {m.class.description && (
                  <div className="crow" style={{ color: "var(--ink-2)" }}>
                    {m.class.description}
                  </div>
                )}
                {active && (
                  <div className="crow" style={{ marginTop: 12, justifyContent: "space-between" }}>
                    <span className="stag" style={{ borderColor: "var(--stroke)" }}>
                      open class
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" }}>
                      <StudentIcon name="arrow" size={13} />
                    </span>
                  </div>
                )}
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
