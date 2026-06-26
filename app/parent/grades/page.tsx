"use client";

import { useRouter } from "next/navigation";
import ParentShell, { useParentData } from "@/components/parent/ParentShell";
import ParentIcon from "@/components/parent/ParentIcon";
import { PageHead, ParentNotice } from "@/components/parent/parts";
import { PERIODS, report, trendDir, trendDelta, dirColor } from "@/components/parent/util";
import { RadialGauge, AreaTrend, VBars, Donut, MiniSpark, CountUp, type Segment, type Bar } from "@/components/student/charts";

function Grades() {
  const router = useRouter();
  const { child, loading } = useParentData();

  if (loading && !child) return <ParentNotice>Loading…</ParentNotice>;
  if (!child) return <ParentNotice>No student to show.</ParentNotice>;

  if (child.classes.length === 0) {
    return (
      <div className="reveal">
        <PageHead title={`${child.first}'s`} accent="grades" sub="Live gradebook · read-only" />
        <ParentNotice>No grades yet — they appear here as teachers grade work.</ParentNotice>
      </div>
    );
  }

  const recentBars: Bar[] = child.recent.map((r) => ({
    label: r.cls.split(" ")[0].slice(0, 4),
    value: r.score,
    color: r.color,
  }));

  // grade mix from current letters
  const buckets = { A: 0, B: 0, C: 0 } as Record<string, number>;
  child.classes.forEach((c) => {
    const L = c.letter[0];
    if (buckets[L] != null) buckets[L]++;
  });
  const mix: (Segment & { label: string })[] = [
    { label: "A range", value: buckets.A, color: "var(--c-3)" },
    { label: "B range", value: buckets.B, color: "var(--c-1)" },
    { label: "C range", value: buckets.C, color: "var(--c-5)" },
  ].filter((x) => x.value > 0);

  const graded = child.classes.length;
  const gpaDelta =
    child.gpaTrend.length > 1
      ? Math.round((child.gpaTrend[child.gpaTrend.length - 1] - child.gpaTrend[0]) * 10) / 10
      : 0;
  const improving = child.classes.filter((c) => trendDir(c.trend) === "up").length;

  return (
    <div className="reveal">
      <PageHead
        title={`${child.first}'s`}
        accent="grades"
        sub="Live gradebook · read-only"
      />

      {/* hero: GPA gauge + trend */}
      <div className="dgrid g-hero reveal" style={{ marginBottom: "var(--gap)" }}>
        <div className="card hero-gpa">
          <RadialGauge pct={(child.gpa / 4) * 100} size={172} stroke={15} color="var(--accent)">
            <div className="gauge-num">
              <CountUp to={child.gpa} dec={1} />
            </div>
            <div className="gauge-lab">GPA · 4.0</div>
          </RadialGauge>
          <div className="hero-gpa-meta">
            {gpaDelta !== 0 && (
              <div className={"delta " + (gpaDelta > 0 ? "up" : "down")}>
                {gpaDelta > 0 ? "▲ +" : "▼ "}
                {gpaDelta.toFixed(1)}
              </div>
            )}
            <div className="muted">over the year</div>
            <div className="hero-tags">
              <span className="stag">
                <span className="sdot" style={{ background: "var(--good)" }} />
                {improving} classes improving
              </span>
              <span className="stag">
                <span className="sdot" style={{ background: "var(--accent)" }} />
                {graded} graded {graded === 1 ? "class" : "classes"}
              </span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-hd">
            <span className="tile-eyebrow">GPA trend · this year</span>
            <span className="card-hd-r">{child.gpaTrend.length} marks</span>
          </div>
          <AreaTrend data={child.gpaTrend} h={172} />
          <div className="axis">
            {child.gpaLabels.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      {/* per-subject rings */}
      <div className="card reveal" style={{ animationDelay: "70ms", marginBottom: "var(--gap)" }}>
        <div className="card-hd">
          <span className="tile-eyebrow">Current grade · by class</span>
          <span className="card-hd-r">tap a ring</span>
        </div>
        <div className="ring-grid">
          {child.classes.map((c, i) => (
            <button key={c.id} className="ring-cell" onClick={() => router.push("/parent/classes")}>
              <RadialGauge pct={c.grade} size={108} stroke={10} color={c.color} delay={i * 90}>
                <div className="ring-letter" style={{ color: c.color }}>
                  {c.letter}
                </div>
                <div className="ring-pct">
                  <CountUp to={c.grade} />
                </div>
              </RadialGauge>
              <div className="ring-name">{c.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* past grades — marking-period samples of each class's real trend */}
      <div className="card reveal" style={{ animationDelay: "110ms", marginBottom: "var(--gap)" }}>
        <div className="card-hd">
          <span className="tile-eyebrow">Past grades · marking periods</span>
          <span className="card-hd-r">Q1 → now</span>
        </div>
        <table className="gtable past-table">
          <thead>
            <tr>
              <th>Class</th>
              {PERIODS.map((p) => (
                <th key={p} className="num pcell">
                  {p}
                </th>
              ))}
              <th className="num">Trend</th>
            </tr>
          </thead>
          <tbody>
            {child.classes.map((c) => {
              const rep = report(c.trend);
              const dir = trendDir(c.trend);
              const d = trendDelta(c.trend);
              return (
                <tr key={c.id}>
                  <td>
                    <span
                      className="sdot"
                      style={{ background: c.color, display: "inline-block", marginRight: 9, verticalAlign: "middle" }}
                    />
                    {c.name}
                  </td>
                  {PERIODS.map((_, j) => (
                    <td
                      key={j}
                      className="num pcell"
                      style={
                        j === rep.length - 1
                          ? { color: c.color, fontWeight: 700 }
                          : { color: "var(--ink-2)" }
                      }
                    >
                      {rep[j] ?? "—"}
                    </td>
                  ))}
                  <td className="num">
                    <span className="trendcell" style={{ color: dirColor(dir) }}>
                      <MiniSpark data={c.trend} w={64} h={22} color={dirColor(dir)} />
                      <ParentIcon name={dir} size={13} />
                      {d > 0 ? "+" : ""}
                      {d}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* recently graded + grade mix */}
      <div className="dgrid d-content reveal" style={{ animationDelay: "150ms" }}>
        <div className="card">
          <div className="card-hd">
            <span className="tile-eyebrow">Recently graded · scores</span>
            <span className="card-hd-r">latest</span>
          </div>
          {recentBars.length > 0 ? (
            <VBars h={150} data={recentBars} />
          ) : (
            <div className="empty-note">No recent scores.</div>
          )}
        </div>
        <div className="card dist-card">
          <div className="card-hd">
            <span className="tile-eyebrow">Grade mix · classes</span>
          </div>
          <div className="dist-wrap">
            <Donut segments={mix} size={132} stroke={16}>
              <div className="gauge-num" style={{ fontSize: 26 }}>
                <CountUp to={graded} />
              </div>
              <div className="gauge-lab">classes</div>
            </Donut>
            <div className="dist-legend">
              {mix.map((d, i) => (
                <div key={i} className="leg-row">
                  <span className="sdot" style={{ background: d.color }} />
                  <span className="leg-l">{d.label}</span>
                  <span className="leg-v">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ParentGradesPage() {
  return (
    <ParentShell active="grades">
      <Grades />
    </ParentShell>
  );
}
