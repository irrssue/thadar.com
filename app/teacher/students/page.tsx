"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Donut, VBars, MiniSpark, BarRow, CountUp } from "../../components/student/charts";
import { initials } from "../../components/student/subject";
import {
  type Overview,
  roster,
  flagCounts,
  masteryBands,
} from "../../components/teacher/metrics";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };
type FilterId = "all" | "support" | "stretch" | "late";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All students" },
  { id: "support", label: "Needs support" },
  { id: "stretch", label: "Stretch" },
  { id: "late", label: "Has late work" },
];

export default function TeacherStudents() {
  const [data, setData] = useState<Overview | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/teacher/overview", { cache: "no-store" });
    const json: ApiResponse<Overview> = await res.json();
    if (json.success) setData(json.data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(classId: string, mid: string, action: "approve" | "deny") {
    setBusy(mid);
    try {
      await fetch(`/api/classes/${classId}/members/${mid}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await load();
    } finally {
      setBusy(null);
    }
  }

  const d = useMemo(() => {
    if (!data) return null;
    const rows = roster(data.classes);
    const flags = flagCounts(rows);
    const bands = masteryBands(rows);
    const pending = data.classes.flatMap((c) => c.pending.map((p) => ({ ...p, classId: c.id, className: c.name })));
    return { rows, flags, bands, pending };
  }, [data]);

  const list = (d?.rows ?? []).filter((r) =>
    filter === "all" ? true : filter === "late" ? r.late > 0 : r.flag === filter,
  );

  const donutSegments = d
    ? [
        { value: d.flags.onTrack, color: "var(--good)" },
        { value: d.flags.support, color: "var(--danger)" },
        { value: d.flags.stretch, color: "var(--accent)" },
      ].filter((s) => s.value > 0)
    : [];

  return (
    <>
      <div className="dh">
        <div>
          <h1>
            Your <span className="var">students</span>
          </h1>
          <p className="dsub" style={{ margin: "6px 0 0" }}>
            {data
              ? `${d?.rows.length ?? 0} across ${data.totals.classes} ${data.totals.classes === 1 ? "class" : "classes"} · ${data.totals.pending} pending`
              : "Loading…"}
          </p>
        </div>
      </div>
      <div style={{ height: 24 }} />

      {/* pending approvals */}
      {d && d.pending.length > 0 && (
        <div className="card reveal" style={{ marginBottom: "var(--gap)" }}>
          <div className="card-hd">
            <span className="tile-eyebrow">Pending approvals · {d.pending.length}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {d.pending.map((p) => (
              <div key={p.id} className="approw">
                <span className="av-sm" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                  {initials(p.user.name ?? p.user.email)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15 }}>{p.user.name ?? p.user.email}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>
                    {p.className} · {p.user.email}
                  </div>
                </div>
                <button className="mini-act approve" disabled={busy === p.id} onClick={() => decide(p.classId, p.id, "approve")}>
                  Approve
                </button>
                <button className="mini-act deny" disabled={busy === p.id} onClick={() => decide(p.classId, p.id, "deny")}>
                  Deny
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* analytics */}
      <div className="dgrid g-assign reveal" style={{ marginBottom: "var(--gap)" }}>
        <div className="card mini-stat">
          {donutSegments.length > 0 ? (
            <Donut segments={donutSegments} size={132} stroke={16}>
              <div className="gauge-num" style={{ fontSize: 26 }}>
                <CountUp to={d?.rows.length ?? 0} />
              </div>
              <div className="gauge-lab">students</div>
            </Donut>
          ) : (
            <div className="gauge" style={{ width: 132, height: 132 }}>
              <div className="gauge-c">
                <div className="gauge-num" style={{ fontSize: 26 }}>
                  {d?.rows.length ?? "—"}
                </div>
                <div className="gauge-lab">students</div>
              </div>
            </div>
          )}
          <div className="mini-stat-legend">
            <div className="leg-row">
              <span className="sdot" style={{ background: "var(--good)" }} />
              <span className="leg-l">On track</span>
              <span className="leg-v">{d?.flags.onTrack ?? 0}</span>
            </div>
            <div className="leg-row">
              <span className="sdot" style={{ background: "var(--danger)" }} />
              <span className="leg-l">Support</span>
              <span className="leg-v">{d?.flags.support ?? 0}</span>
            </div>
            <div className="leg-row">
              <span className="sdot" style={{ background: "var(--accent)" }} />
              <span className="leg-l">Stretch</span>
              <span className="leg-v">{d?.flags.stretch ?? 0}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-hd">
            <span className="tile-eyebrow">Mastery distribution</span>
            <span className="card-hd-r">{d?.flags.graded ?? 0} graded</span>
          </div>
          {d && d.bands.some((b) => b.value > 0) ? (
            <VBars h={150} showVal data={d.bands} />
          ) : (
            <div className="empty" style={{ marginTop: 20 }}>
              Grades will spread across mastery bands here once you&apos;ve marked work.
            </div>
          )}
        </div>
      </div>

      {/* filters */}
      <div className="filterbar reveal" style={{ animationDelay: "70ms" }}>
        {FILTERS.map((f) => (
          <button key={f.id} className={"fpill " + (filter === f.id ? "on" : "")} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* roster */}
      <div className="card reveal" style={{ animationDelay: "120ms" }}>
        {!data && <div className="empty">Loading…</div>}
        {data && list.length === 0 && <div className="empty">No students in this view yet.</div>}
        {list.length > 0 && (
          <>
            <div className="roster-head">
              <span>Student</span>
              <span className="rcol">Trend</span>
              <span className="rcol">Mastery</span>
              <span className="rcol">Late</span>
              <span>Flag</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {list.map((s, i) => (
                <div key={s.id} className="roster-row">
                  <div className="rstudent">
                    <span
                      className="av-sm"
                      style={{ background: `color-mix(in srgb, ${s.color} 18%, transparent)`, color: s.color }}
                    >
                      {initials(s.name)}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div className="rname">{s.name}</div>
                      <div className="rid">{s.className}</div>
                    </div>
                  </div>
                  <div className="rcol rtrend">
                    {s.trend.length > 1 ? (
                      <MiniSpark data={s.trend} w={70} h={26} color={s.flag === "support" ? "var(--danger)" : s.color} />
                    ) : (
                      <span style={{ color: "var(--ink-faint)" }}>—</span>
                    )}
                  </div>
                  <div className="rcol rmastery">
                    {s.mastery != null ? (
                      <>
                        <BarRow pct={s.mastery} color={s.mastery < 60 ? "var(--danger)" : s.color} delay={i * 40} />
                        <span className="rmastery-n">{s.mastery}%</span>
                      </>
                    ) : (
                      <span className="rmastery-n">—</span>
                    )}
                  </div>
                  <div className="rcol rlate" style={{ color: s.late > 0 ? "var(--danger)" : "var(--ink-faint)" }}>
                    {s.late > 0 ? `${s.late} late` : "—"}
                  </div>
                  <div className="rflag">
                    {s.flag === "support" && <span className="due-chip over">support</span>}
                    {s.flag === "stretch" && <span className="due-chip today">stretch</span>}
                    {!s.flag && (
                      <span style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                        {s.mastery == null ? "no grades" : "on track"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
