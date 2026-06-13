"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FloatingNav from "../components/FloatingNav";
import CommandBar from "../components/CommandBar";
import Icon from "../components/Icon";

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

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const FILTERS = ["All", "Active", "Pending"] as const;

export default function ClassesPage() {
  const [activeTab, setActiveTab] = useState("classes");
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
    <>
      <div className="app-page" style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 56px 160px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <h1 style={{ fontWeight: 600, fontSize: 48, margin: "0 0 4px", letterSpacing: "-0.5px" }}>
            Your <span style={{ color: "var(--accent)" }}>classes</span>
          </h1>
          <button
            onClick={() => setShowJoin(true)}
            style={joinBtnStyle}
          >
            <Icon name="plus" size={16} /> Join a class
          </button>
        </div>

        <p style={{ color: "var(--ink-dim)", fontSize: 16, margin: "0 0 28px", fontWeight: 400 }}>
          {memberships === null
            ? "Loading…"
            : memberships.length === 0
              ? "No classes yet — join one with a code from your teacher."
              : `${memberships.length} ${memberships.length === 1 ? "class" : "classes"}`}
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
          {FILTERS.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  border: "1.2px solid var(--ink-faint)",
                  borderRadius: 999,
                  padding: "4px 10px",
                  color: active ? "var(--accent)" : "var(--ink-dim)",
                  fontSize: 13,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  cursor: "pointer",
                  borderColor: active ? "var(--accent)" : "var(--ink-faint)",
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {error && <div style={{ color: "var(--danger)", marginBottom: 16 }}>{error}</div>}

        {memberships !== null && filtered.length === 0 && (
          <div
            style={{
              border: "1px solid var(--ink-faint)",
              borderRadius: 14,
              background: "var(--surface)",
              padding: "48px 24px",
              textAlign: "center",
              color: "var(--ink-dim)",
              fontSize: 14,
            }}
          >
            {memberships.length === 0
              ? "You haven't joined any classes yet. Tap “Join a class” and enter the code your teacher gave you."
              : "Nothing in this filter."}
          </div>
        )}

        {filtered.length > 0 && (
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}
            className="classes-grid"
          >
            {filtered.map((m) => {
              const cardStyle: React.CSSProperties = {
                border: "1px solid var(--ink-faint)",
                borderRadius: 14,
                background: "var(--surface)",
                padding: "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                opacity: m.status === "PENDING" ? 0.7 : 1,
                textDecoration: "none",
                color: "inherit",
                cursor: m.status === "ACTIVE" ? "pointer" : "default",
              };
              const inner = (
                <>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 600 }}>{m.class.name}</div>
                  {m.status === "PENDING" && (
                    <span style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--accent-2, var(--accent))",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      border: "1px solid var(--ink-faint)",
                      borderRadius: 999,
                      padding: "2px 8px",
                    }}>
                      pending
                    </span>
                  )}
                </div>
                {m.class.description && (
                  <div style={{ color: "var(--ink-dim)", fontSize: 14 }}>{m.class.description}</div>
                )}
                <div style={{ display: "flex", gap: 14, color: "var(--ink-dim)", fontSize: 13 }}>
                  {m.class.owner.name && <span>Teacher: {m.class.owner.name}</span>}
                  <span>{m.class._count.lessons} lessons</span>
                </div>
                </>
              );
              return m.status === "ACTIVE" ? (
                <Link key={m.id} href={`/classes/${m.class.id}`} style={cardStyle}>
                  {inner}
                </Link>
              ) : (
                <div key={m.id} style={cardStyle}>
                  {inner}
                </div>
              );
            })}
          </div>
        )}

        <CommandBar />
      </div>

      {showJoin && (
        <JoinModal
          onClose={() => setShowJoin(false)}
          onJoined={() => {
            setShowJoin(false);
            load();
          }}
        />
      )}

      <FloatingNav active={activeTab} onChange={setActiveTab} />

      <style>{`
        @media (max-width: 1080px) { .classes-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}

const joinBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 14px",
  borderRadius: 999,
  border: "1.4px solid var(--accent)",
  background: "var(--accent-soft)",
  color: "var(--accent)",
  fontSize: 14,
  cursor: "pointer",
};

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
        <div style={{ fontSize: 22, fontWeight: 600 }}>Join a class</div>
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
                borderRadius: 10,
                border: "1.4px solid var(--stroke)",
                background: "var(--bg)",
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
              <button type="button" onClick={onClose} style={ghostBtn}>Cancel</button>
              <button type="submit" disabled={submitting || !code.trim()} style={{ ...joinBtnStyle, opacity: submitting || !code.trim() ? 0.5 : 1 }}>
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
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
};

const modalStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1.5px solid var(--stroke)",
  borderRadius: 14,
  padding: 24,
  width: "min(440px, 92vw)",
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const ghostBtn: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 999,
  border: "1.4px solid var(--stroke)",
  background: "transparent",
  color: "var(--ink)",
  fontSize: 14,
  cursor: "pointer",
};
