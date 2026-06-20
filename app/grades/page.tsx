"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StudentShell from "../components/student/StudentShell";
import { subjectColor } from "../components/student/subject";
import {
  RadialGauge,
  AreaTrend,
  VBars,
  Donut,
  CountUp,
  type Segment,
  type Bar,
} from "../components/student/charts";
import {
  gradePercent,
  letterFromPercent,
  gpaFromPercents,
  distBucket,
  gradeTone,
} from "../components/student/grades";

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

type Graded = FeedItem & { pct: number; when: number };

const DIST_COLOR: Record<string, string> = {
  A: "var(--good)",
  B: "var(--accent)",
  C: "var(--c-1)",
  D: "var(--c-4)",
  F: "var(--danger)",
};

// short bar label from a class name, e.g. "World History" → "Worl"
const shortLabel = (name: string) => name.split(/\s+/)[0].slice(0, 4);

export default function GradesPage() {
  const router = useRouter();
  const [feed, setFeed] = useState<FeedItem[] | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/assignments", { cache: "no-store" });
      const json: ApiResponse<FeedItem[]> = await res.json();
      if (json.success) setFeed(json.data);
    })();
  }, []);

  const view = useMemo(() => {
    const items = feed ?? [];
    const graded: Graded[] = [];
    for (const f of items) {
      if (!f.submission || f.submission.status === "SUBMITTED" || !f.submission.grade) continue;
      const pct = gradePercent(f.submission.grade);
      if (pct == null) continue;
      graded.push({ ...f, pct, when: new Date(f.submission.submittedAt).getTime() });
    }
    graded.sort((a, b) => a.when - b.when);

    const percents = graded.map((g) => g.pct);
    const gpa = gpaFromPercents(percents);
    const avgPct = percents.length ? Math.round(percents.reduce((s, p) => s + p, 0) / percents.length) : 0;

    // GPA momentum: recent half vs earlier half (needs a few data points).
    let delta: number | null = null;
    if (graded.length >= 4) {
      const mid = Math.floor(graded.length / 2);
      const a = gpaFromPercents(percents.slice(0, mid));
      const b = gpaFromPercents(percents.slice(mid));
      if (a != null && b != null) delta = Math.round((b - a) * 100) / 100;
    }

    const weekAgo = Date.now() - 7 * 86_400_000;
    const recentCount = graded.filter((g) => g.when >= weekAgo).length;

    // per-class averages
    const byClass = new Map<string, { name: string; pcts: number[] }>();
    for (const g of graded) {
      const e = byClass.get(g.class.id) ?? { name: g.class.name, pcts: [] };
      e.pcts.push(g.pct);
      byClass.set(g.class.id, e);
    }
    const classRows = [...byClass.entries()]
      .map(([id, { name, pcts }]) => {
        const avg = Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length);
        return { id, name, avg, letter: letterFromPercent(avg), color: subjectColor(id) };
      })
      .sort((a, b) => b.avg - a.avg);

    // grade-mix distribution
    const buckets = new Map<string, number>();
    for (const g of graded) buckets.set(distBucket(g.pct), (buckets.get(distBucket(g.pct)) ?? 0) + 1);
    const dist: (Segment & { label: string; value: number })[] = ["A", "B", "C", "D", "F"]
      .filter((l) => buckets.get(l))
      .map((l) => ({ label: l, value: buckets.get(l) ?? 0, color: DIST_COLOR[l] }));

    // recent scores as bars (latest first, capped)
    const recentBars: Bar[] = graded
      .slice(-6)
      .map((g) => ({ label: shortLabel(g.class.name), value: g.pct, color: subjectColor(g.class.id) }));

    return { graded, gpa, avgPct, delta, recentCount, classRows, dist, percents, recentBars };
  }, [feed]);

  const loading = feed === null;
  const { graded, gpa, avgPct, delta, recentCount, classRows, dist, percents, recentBars } = view;

  return (
    <StudentShell active="grades">
      <div className="dh">
        <div>
          <h1>
            Your <span className="var">grades</span>
          </h1>
          <p className="dsub">
            {loading
              ? "Loading…"
              : graded.length === 0
                ? "No grades yet — they'll appear here once your teachers grade your work."
                : `${graded.length} graded · ${classRows.length} ${classRows.length === 1 ? "class" : "classes"}`}
          </p>
        </div>
      </div>

      {!loading && graded.length === 0 && (
        <div className="card" style={{ textAlign: "center", color: "var(--ink-dim)", padding: "48px 24px" }}>
          When a teacher grades a submission, your scores, GPA and trends light up here.
        </div>
      )}

      {graded.length > 0 && (
        <>
          {/* hero: GPA gauge + score trend */}
          <div className="dgrid g-hero reveal" style={{ marginBottom: "var(--gap)" }}>
            <div className="card hero-gpa">
              <RadialGauge pct={gpa != null ? (gpa / 4) * 100 : 0} size={172} stroke={15}>
                <div className="gauge-num">
                  <CountUp to={gpa ?? 0} dec={2} />
                </div>
                <div className="gauge-lab">GPA · 4.0</div>
              </RadialGauge>
              <div className="hero-gpa-meta">
                {delta != null && delta !== 0 && (
                  <div className={"delta " + (delta > 0 ? "up" : "down")}>
                    {delta > 0 ? "▲" : "▼"} {delta > 0 ? "+" : ""}
                    {delta.toFixed(2)}
                  </div>
                )}
                <div className="muted">across {graded.length} grades</div>
                <div className="hero-tags">
                  <span className="stag">
                    <span className="sdot" style={{ background: "var(--good)" }} />
                    {recentCount > 0 ? `${recentCount} new this week` : `${graded.length} total`}
                  </span>
                  <span className="stag">
                    <span className="sdot" style={{ background: gradeTone(avgPct) }} /> avg {avgPct}%
                  </span>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-hd">
                <span className="tile-eyebrow">Score trend</span>
                <span className="card-hd-r">{graded.length} graded</span>
              </div>
              <AreaTrend data={percents} h={172} />
              <div className="axis">
                <span>{new Date(graded[0].when).toLocaleDateString(undefined, { month: "short" })}</span>
                <span>now</span>
              </div>
            </div>
          </div>

          {/* per-subject rings */}
          {classRows.length > 0 && (
            <div className="card reveal" style={{ animationDelay: "70ms", marginBottom: "var(--gap)" }}>
              <div className="card-hd">
                <span className="tile-eyebrow">By class</span>
                <span className="card-hd-r">average</span>
              </div>
              <div className="ring-grid">
                {classRows.map((c, i) => (
                  <button key={c.id} className="ring-cell" onClick={() => router.push("/classes")}>
                    <RadialGauge pct={c.avg} size={108} stroke={10} color={c.color} delay={i * 90}>
                      <div className="ring-letter" style={{ color: c.color }}>
                        {c.letter}
                      </div>
                      <div className="ring-pct">
                        <CountUp to={c.avg} />
                      </div>
                    </RadialGauge>
                    <div className="ring-name">{c.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* recent scores + grade mix */}
          <div className="dgrid d-content reveal" style={{ animationDelay: "140ms" }}>
            <div className="card">
              <div className="card-hd">
                <span className="tile-eyebrow">Recently graded</span>
                <span className="card-hd-r">scores</span>
              </div>
              <VBars h={150} data={recentBars} />
            </div>
            <div className="card dist-card">
              <div className="card-hd">
                <span className="tile-eyebrow">Grade mix</span>
              </div>
              <div className="dist-wrap">
                <Donut segments={dist} size={132} stroke={16}>
                  <div className="gauge-num" style={{ fontSize: 26 }}>
                    <CountUp to={graded.length} />
                  </div>
                  <div className="gauge-lab">graded</div>
                </Donut>
                <div className="dist-legend">
                  {dist.map((d) => (
                    <div key={d.label} className="leg-row">
                      <span className="sdot" style={{ background: d.color }} />
                      <span className="leg-l">{d.label}</span>
                      <span className="leg-v">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </StudentShell>
  );
}
