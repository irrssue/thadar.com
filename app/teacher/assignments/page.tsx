"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "../../components/Icon";
import { RadialGauge, AreaTrend, BarRow, CountUp } from "../../components/student/charts";
import {
  type Overview,
  gradingQueue,
  turnaroundTrend,
  avgTurnaround,
} from "../../components/teacher/metrics";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

export default function TeacherAssignments() {
  const [data, setData] = useState<Overview | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [picking, setPicking] = useState(false);
  const [composeClass, setComposeClass] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/teacher/overview", { cache: "no-store" });
    const json: ApiResponse<Overview> = await res.json();
    if (json.success) setData(json.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const d = useMemo(() => {
    if (!data) return null;
    const queue = gradingQueue(data.classes);
    const turnaround = turnaroundTrend(data.classes);
    const turn = avgTurnaround(data.classes);
    const totalSubs = data.totals.graded + data.totals.toGrade;
    const gradedPct = totalSubs > 0 ? Math.round((data.totals.graded / totalSubs) * 100) : 0;
    const urgentSets = queue.filter((q) => q.urgent).length;
    return { queue, turnaround, turn, gradedPct, urgentSets };
  }, [data]);

  const list = (d?.queue ?? []).filter((q) => filter === "all" || q.classId === filter);

  return (
    <>
      <div className="dh">
        <div>
          <h1>
            To <span className="var">grade</span>
          </h1>
          <p className="dsub" style={{ margin: "6px 0 0" }}>
            {data
              ? `${data.totals.toGrade} submissions waiting · ${data.totals.graded} graded · ${data.totals.assignments} sets`
              : "Loading…"}
          </p>
        </div>
        <button className="btn primary" onClick={() => setPicking(true)} disabled={!data || data.classes.length === 0}>
          <Icon name="plus" size={15} /> New assignment
        </button>
      </div>
      <div style={{ height: 24 }} />

      {/* analytics */}
      <div className="dgrid g-hero reveal" style={{ marginBottom: "var(--gap)" }}>
        <div className="card hero-gpa">
          <RadialGauge pct={d?.gradedPct ?? 0} size={172} stroke={15} color="var(--accent)">
            <div className="gauge-num">{d ? <CountUp to={d.gradedPct} suffix="%" /> : "—"}</div>
            <div className="gauge-lab">graded</div>
          </RadialGauge>
          <div className="hero-gpa-meta">
            <div className="delta up">{d?.turn != null ? <CountUp to={d.turn} dec={1} suffix="d" /> : "—"}</div>
            <div className="muted">avg turnaround</div>
            <div className="hero-tags">
              <span className="stag">
                <span className="sdot" style={{ background: "var(--danger)" }} /> {d?.urgentSets ?? 0} urgent sets
              </span>
              <span className="stag">
                <span className="sdot" style={{ background: "var(--good)" }} /> {data?.totals.graded ?? 0} graded total
              </span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-hd">
            <span className="tile-eyebrow">Turnaround · last 6 weeks</span>
            <span className="card-hd-r up">▼ faster is better</span>
          </div>
          {d && d.turnaround.values.some((v) => v > 0) ? (
            <>
              <AreaTrend data={d.turnaround.values} h={172} color="var(--good)" />
              <div className="axis">
                {d.turnaround.labels.map((l, i) => (
                  <span key={i}>{l}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="empty" style={{ marginTop: 20 }}>
              Grade some work and your turnaround trend will appear here.
            </div>
          )}
        </div>
      </div>

      {/* filters */}
      <div className="filterbar reveal" style={{ animationDelay: "70ms" }}>
        <button className={"fpill " + (filter === "all" ? "on" : "")} onClick={() => setFilter("all")}>
          All
        </button>
        {(data?.classes ?? []).map((c) => (
          <button key={c.id} className={"fpill " + (filter === c.id ? "on" : "")} onClick={() => setFilter(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      {/* queue */}
      <div className="card reveal" style={{ animationDelay: "120ms" }}>
        {!data && <div className="empty">Loading…</div>}
        {data && list.length === 0 && (
          <div className="empty">Nothing to grade in this view — you&apos;re caught up.</div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {list.map((q, i) => {
            const pct = Math.round((q.done / q.total) * 100);
            return (
              <Link
                key={q.id}
                href={`/teacher/classes/${q.classId}`}
                className="qrow"
                style={{ textDecoration: "none" }}
              >
                <span className="cbox" />
                <div className="qbody">
                  <div className="qtitle">{q.title}</div>
                  <div className="mt">
                    <span className="sdot" style={{ background: q.color, width: 7, height: 7 }} />
                    {q.className} · ~{q.mins}m
                  </div>
                </div>
                <div className="qprog">
                  <BarRow pct={pct} color={q.urgent ? "var(--danger)" : q.color} delay={i * 60} h={6} />
                  <span className="qprog-n">
                    {q.done}/{q.total}
                  </span>
                </div>
                <span className={"due-chip " + (q.urgent ? "over" : "")}>{q.urgent ? "urgent" : "queued"}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {picking && data && (
        <ClassPicker
          classes={data.classes.map((c) => ({ id: c.id, name: c.name, students: c.activeCount, count: c.assignments.length }))}
          onClose={() => setPicking(false)}
          onPick={(id) => {
            setPicking(false);
            setComposeClass(id);
          }}
        />
      )}
      {composeClass && (
        <ComposeAssignment
          classId={composeClass}
          onClose={() => setComposeClass(null)}
          onSaved={() => {
            setComposeClass(null);
            load();
          }}
        />
      )}
    </>
  );
}

function ClassPicker({
  classes,
  onClose,
  onPick,
}: {
  classes: { id: string; name: string; students: number; count: number }[];
  onClose: () => void;
  onPick: (id: string) => void;
}) {
  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalStyle, width: "min(520px, 94vw)" }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>New assignment</div>
        <p style={{ fontSize: 13, color: "var(--ink-dim)", margin: 0 }}>Pick a class to add it to.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
          {classes.map((c) => (
            <button key={c.id} className="task" style={{ gridTemplateColumns: "1fr auto" }} onClick={() => onPick(c.id)}>
              <div className="body">
                <div className="ti">{c.name}</div>
                <div className="mt">
                  {c.students} students · {c.count} assignments
                </div>
              </div>
              <span className="due-chip today">＋ Add</span>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} className="btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function ComposeAssignment({ classId, onClose, onSaved }: { classId: string; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [due, setDue] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(publish: boolean) {
    if (!title.trim() || saving) return;
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch(`/api/classes/${classId}/assignments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          instructions: instructions.trim() || undefined,
          dueAt: due ? new Date(due).toISOString() : undefined,
          status: publish ? "PUBLISHED" : "DRAFT",
        }),
      });
      const json: ApiResponse<unknown> = await res.json();
      if (!json.success) {
        setErr(json.error);
        return;
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalStyle, width: "min(640px, 94vw)" }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>New assignment</div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required maxLength={160} autoFocus style={inputStyle} />
        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions…" rows={6} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-sans)" }} />
        <input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} style={inputStyle} />
        {err && <div style={{ color: "var(--danger)", fontSize: 14 }}>{err}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" onClick={onClose} className="btn">
            Cancel
          </button>
          <button type="button" onClick={() => save(false)} disabled={saving || !title.trim()} className="btn">
            Save draft
          </button>
          <button type="button" onClick={() => save(true)} disabled={saving || !title.trim()} className="btn primary">
            Publish
          </button>
        </div>
      </div>
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
  gap: 12,
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
