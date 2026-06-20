"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "../../components/Icon";
import { RadialGauge, MiniSpark, useEnter } from "../../components/student/charts";
import { type Overview, classMetrics } from "../../components/teacher/metrics";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

export default function TeacherClasses() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  async function load() {
    setError(null);
    const res = await fetch("/api/teacher/overview", { cache: "no-store" });
    const json: ApiResponse<Overview> = await res.json();
    if (!json.success) {
      setError(json.error);
      return;
    }
    setData(json.data);
  }

  useEffect(() => {
    load();
  }, []);

  const metrics = useMemo(() => (data ? data.classes.map(classMetrics) : null), [data]);

  return (
    <>
      <div className="dh">
        <div>
          <h1>
            Your <span className="var">classes</span>
          </h1>
          <p className="dsub" style={{ margin: "6px 0 0" }}>
            {data
              ? `${data.totals.classes} ${data.totals.classes === 1 ? "section" : "sections"} · ${data.totals.students} students`
              : "Loading…"}
          </p>
        </div>
        <button className="btn primary" onClick={() => setShowModal(true)}>
          <Icon name="plus" size={15} /> New class
        </button>
      </div>
      <div style={{ height: 24 }} />

      {error && <div style={{ color: "var(--danger)", marginBottom: 16 }}>{error}</div>}

      {metrics && metrics.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "44px 24px" }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No classes yet</div>
          <div className="empty" style={{ marginBottom: 18 }}>
            Create your first class to get started.
          </div>
          <button className="btn primary" style={{ margin: "0 auto" }} onClick={() => setShowModal(true)}>
            <Icon name="plus" size={15} /> New class
          </button>
        </div>
      )}

      <div className="dgrid d-2 stagger">
        {metrics?.map((c, i) => {
          const delta = c.trend.length > 1 ? c.trend[c.trend.length - 1] - c.trend[0] : 0;
          return (
            <Link
              key={c.id}
              href={`/teacher/classes/${c.id}`}
              className="classcard link reveal"
              style={{ ["--c" as string]: c.color, animationDelay: `${i * 60}ms` }}
            >
              <div className="cc-main">
                <RadialGauge pct={c.mastery ?? 0} size={84} stroke={8} color={c.color} delay={i * 60 + 150}>
                  <div className="ring-letter" style={{ color: c.color, fontSize: 22 }}>
                    {c.letter ?? "—"}
                  </div>
                  <div className="ring-pct">mastery</div>
                </RadialGauge>
                <div className="cc-body">
                  <div className="cc-name">{c.name}</div>
                  <div className="cc-teach">
                    {c.activeCount} students · {c.graded} graded
                  </div>
                  <div className="cc-spark">
                    {c.trend.length > 1 ? (
                      <>
                        <MiniSpark data={c.trend} w={108} h={28} color={c.color} />
                        <span className="cc-trend" style={{ color: delta >= 0 ? "var(--good)" : "var(--danger)" }}>
                          {delta >= 0 ? "+" : ""}
                          {delta}
                        </span>
                      </>
                    ) : (
                      <span className="empty" style={{ padding: 0 }}>
                        no grades yet
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="cc-classmeta">
                <div className="cm">
                  <span className="cm-n" style={{ color: c.toGrade ? "var(--accent)" : "var(--ink-dim)" }}>
                    {c.toGrade}
                  </span>
                  <span className="cm-l">to grade</span>
                </div>
                <div className="cm">
                  <span className="cm-n" style={{ color: c.missing ? "var(--danger)" : "var(--ink-dim)" }}>
                    {c.missing}
                  </span>
                  <span className="cm-l">missing</span>
                </div>
                <div className="cm">
                  <span className="cm-n">{c.activeCount}</span>
                  <span className="cm-l">students</span>
                </div>
              </div>

              {c.strip.length > 0 && <SubStrip cells={c.strip} color={c.color} />}

              <div className="cc-foot">
                {c.nextDue ? (
                  <span className="stag">
                    <span className="sdot" style={{ background: c.color }} /> next: {c.nextDue.title}
                  </span>
                ) : (
                  <span className="stag">
                    <span className="sdot" style={{ background: c.color }} /> no upcoming due
                  </span>
                )}
                <span className="cc-due" style={{ color: dueColor(c.nextDue?.dueAt) }}>
                  {c.nextDue ? dueLabel(c.nextDue.dueAt) : "—"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {showModal && (
        <NewClassModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            load();
          }}
        />
      )}
    </>
  );
}

function SubStrip({ cells, color }: { cells: number[]; color: string }) {
  const on = useEnter();
  const pal: Record<number, string> = {
    0: "var(--gauge-track)",
    1: "var(--danger)",
    2: color,
    3: "var(--good)",
  };
  return (
    <div className="substrip">
      {cells.map((v, i) => (
        <div
          key={i}
          className="subcell"
          style={{
            background: pal[v],
            opacity: on ? (v === 2 ? 0.7 : v === 0 ? 1 : 0.85) : 0,
            transitionDelay: `${i * 14}ms`,
          }}
        />
      ))}
    </div>
  );
}

function dueLabel(iso: string): string {
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return new Date(iso).toLocaleDateString(undefined, { weekday: "short" });
  return new Date(iso).toLocaleDateString();
}
function dueColor(iso: string | undefined): string {
  if (!iso) return "var(--ink-dim)";
  const days = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  return days <= 1 ? "var(--accent)" : "var(--ink-dim)";
}

function NewClassModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });
      const json: ApiResponse<unknown> = await res.json();
      if (!json.success) {
        setErr(json.error);
        return;
      }
      onCreated();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div onClick={onClose} style={overlayStyle}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ ...modalStyle, width: "min(480px, 92vw)" }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>New class</div>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, color: "var(--ink-dim)" }}>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoFocus required maxLength={120} placeholder="e.g. Math 10 — Algebra II" style={inputStyle} />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, color: "var(--ink-dim)" }}>Description (optional)</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={3} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-sans)" }} />
        </label>
        {err && <div style={{ color: "var(--danger)", fontSize: 14 }}>{err}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" onClick={onClose} className="btn">
            Cancel
          </button>
          <button type="submit" disabled={submitting || !name.trim()} className="btn primary">
            {submitting ? "Creating…" : "Create class"}
          </button>
        </div>
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
