"use client";

import ParentShell, { useParentData } from "@/components/parent/ParentShell";
import ParentIcon from "@/components/parent/ParentIcon";
import { ChildSwitcher, DirTag, TileHead, ParentNotice } from "@/components/parent/parts";
import { trendDir } from "@/components/parent/util";
import { AreaTrend, RadialGauge, MiniSpark, CountUp } from "@/components/student/charts";
import type { ParentChild } from "@/types/parent";

function KpiStrip({ child, go }: { child: ParentChild; go: (tab: string) => void }) {
  const up = child.classes.filter((c) => trendDir(c.trend) === "up").length;
  const down = child.classes.filter((c) => trendDir(c.trend) === "down").length;
  const kpis = [
    { id: "grades", label: "Current GPA", val: child.gpa, dec: 1, icon: "grades", delta: `${child.classes.length} classes`, up: true, sub: "on the 4.0 scale", to: "/parent/grades" },
    { id: "classes", label: "Classes", val: child.classes.length, dec: 0, icon: "classes", delta: "graded", up: false, sub: "with grades in", to: "/parent/classes" },
    { id: "trends", label: "Trending up", val: up, dec: 0, icon: "up", delta: down ? `${down} need focus` : "steady", up: true, sub: `of ${child.classes.length} classes`, to: "/parent/trends" },
  ];
  return (
    <div className="kpi-strip stagger">
      {kpis.map((m) => (
        <div key={m.id} className="kpi link" onClick={() => go(m.to)}>
          <div className="kpi-top">
            <span className="kpi-ico">
              <ParentIcon name={m.icon} size={17} />
            </span>
            <span className={"kpi-delta " + (m.up ? "up" : "")}>{m.delta}</span>
          </div>
          <div className="kpi-val">
            <CountUp to={m.val} dec={m.dec} dur={1100} />
          </div>
          <div className="kpi-lab">{m.label}</div>
          <div className="kpi-sub">{m.sub}</div>
        </div>
      ))}
      {/* Attendance has no data source yet — shown as a placeholder KPI. */}
      <div className="kpi" style={{ opacity: 0.85 }}>
        <div className="kpi-top">
          <span className="kpi-ico">
            <ParentIcon name="calendar" size={17} />
          </span>
          <span className="kpi-delta">soon</span>
        </div>
        <div className="kpi-val">—</div>
        <div className="kpi-lab">Attendance</div>
        <div className="kpi-sub">not tracked yet</div>
      </div>
    </div>
  );
}

function GpaTile({ child, go }: { child: ParentChild; go: (tab: string) => void }) {
  const up = child.classes.filter((c) => trendDir(c.trend) === "up").length;
  return (
    <div className="tile link feature area-gpa" onClick={() => go("/parent/grades")}>
      <div className="growth-hd">
        <div>
          <div className="tile-eyebrow">{child.first}&apos;s GPA · this year</div>
          <div className="growth-big">
            <CountUp to={child.gpa} dec={1} dur={1300} />
            <span className="gpa-of"> / 4.0</span>
          </div>
          <div className="growth-cap">
            {up} of {child.classes.length} classes improving
          </div>
        </div>
        <span className="tile-open">
          Full gradebook <ParentIcon name="arrow" size={13} />
        </span>
      </div>
      <div style={{ marginTop: 14 }}>
        <AreaTrend data={child.gpaTrend} h={150} color="var(--accent)" dur={1500} baseline />
        <div className="axis">
          {child.gpaLabels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubjectsTile({ child, go }: { child: ParentChild; go: (tab: string) => void }) {
  return (
    <div className="tile link area-subjects" onClick={() => go("/parent/classes")}>
      <TileHead eyebrow="Every class" title="Grades now" open />
      <div className="subj-list">
        {child.classes.map((c) => (
          <div key={c.id} className="subj-row">
            <span className="sdot" style={{ background: c.color }} />
            <span className="subj-name">{c.name}</span>
            <MiniSpark data={c.trend} w={56} h={22} color={c.color} />
            <span className="subj-grade">{c.grade}</span>
            <span className="subj-letter" style={{ color: c.color }}>
              {c.letter}
            </span>
            <DirTag tr={c.trend} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StrengthTile({ child, go }: { child: ParentChild; go: (tab: string) => void }) {
  return (
    <div className="tile link area-strength" onClick={() => go("/parent/trends")}>
      <TileHead
        eyebrow="Acing it"
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ParentIcon name="star" size={17} /> Strengths
          </span>
        }
        open
      />
      <div className="sf-list">
        {child.strengths.map((s, i) => (
          <div key={i} className="sf-row">
            <span className="sdot" style={{ background: s.color }} />
            <div className="sf-body">
              <div className="sf-label">{s.label}</div>
              <div className="sf-cls">{s.cls}</div>
            </div>
            <span className="sf-score good">{s.score}</span>
          </div>
        ))}
        {child.strengths.length === 0 && <div className="empty-note">No standout classes yet.</div>}
      </div>
    </div>
  );
}

function FocusTile({ child, go }: { child: ParentChild; go: (tab: string) => void }) {
  return (
    <div className="tile link area-focus" onClick={() => go("/parent/trends")}>
      <TileHead
        eyebrow="Needs attention"
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <ParentIcon name="target" size={17} /> Focus on
          </span>
        }
        open
      />
      <div className="sf-list">
        {child.focus.map((f, i) => (
          <div key={i} className="sf-row">
            <span className="sdot" style={{ background: f.color }} />
            <div className="sf-body">
              <div className="sf-label">{f.label}</div>
              <div className="sf-cls">{f.cls}</div>
            </div>
            <span className="sf-score warn">{f.score}</span>
          </div>
        ))}
        {child.focus.length === 0 && <div className="empty-note">Nothing flagged right now.</div>}
      </div>
    </div>
  );
}

function RecentTile({ child, go }: { child: ParentChild; go: (tab: string) => void }) {
  return (
    <div className="tile link area-recent" onClick={() => go("/parent/grades")}>
      <TileHead eyebrow="Latest graded work" title="Recent grades" open />
      <div className="feed">
        {child.recent.map((r, i) => (
          <div key={i} className="rec-row">
            <span className="sdot" style={{ background: r.color }} />
            <div className="rec-body">
              <div className="rec-item">{r.item}</div>
              <div className="rec-cls">{r.cls}</div>
            </div>
            <span
              className="rec-score"
              style={{ color: r.score >= 90 ? "var(--good)" : r.score >= 80 ? "var(--ink)" : "var(--danger)" }}
            >
              {r.score}
              <span className="rec-letter">{r.letter}</span>
            </span>
            <span className="rec-when">{r.when}</span>
          </div>
        ))}
        {child.recent.length === 0 && <div className="empty-note">No graded work yet.</div>}
      </div>
    </div>
  );
}

// Attendance has no data source yet — kept visually but shown as placeholders.
function AttendTile() {
  return (
    <div className="tile area-attend">
      <TileHead eyebrow="This term" title="Attendance" />
      <div className="attend-wrap">
        <RadialGauge pct={0} size={120} stroke={12} color="var(--good)">
          <div className="gauge-num" style={{ fontSize: 26 }}>
            —
          </div>
          <div className="gauge-lab">soon</div>
        </RadialGauge>
        <div className="attend-meta">
          <div className="am-row">
            <span className="am-l">On time</span>
            <span className="am-v">—</span>
          </div>
          <div className="am-row">
            <span className="am-l">Days missed</span>
            <span className="am-v">—</span>
          </div>
          <div className="am-row">
            <span className="am-l">Tardies</span>
            <span className="am-v">—</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Overview() {
  const { child, loading, children } = useParentData();

  // The tiles route on click; a plain push keeps the bento grid markup simple
  // (wrapping every tile in a Link would fight the CSS grid areas).
  const go = (href: string) => {
    window.location.assign(href);
  };

  if (loading && !child) return <ParentNotice>Loading…</ParentNotice>;
  if (!children || children.length === 0)
    return <ParentNotice>No linked students yet. Once a child is linked, their classes and grades appear here.</ParentNotice>;
  if (!child) return <ParentNotice>Couldn&apos;t load this student.</ParentNotice>;

  const up = child.classes.filter((c) => trendDir(c.trend) === "up").length;
  const down = child.classes.filter((c) => trendDir(c.trend) === "down").length;

  return (
    <>
      <div className="hero reveal">
        <h1 className="greet">
          How is <span className="var">{child.first}</span> doing?
        </h1>
        <p className="subline">
          {child.classes.length > 0 ? (
            <>
              <b>{up}</b> classes trending up
              {down ? (
                <>
                  <span className="sep">·</span>
                  <span className="hot">{down} to keep an eye on</span>
                </>
              ) : null}
              <span className="sep">·</span>
              <span>GPA {child.gpa.toFixed(1)}</span>
            </>
          ) : (
            <span>No graded work yet — grades will appear here as teachers post them.</span>
          )}
        </p>
      </div>

      <ChildSwitcher />

      {child.classes.length > 0 && (
        <>
          <KpiStrip child={child} go={go} />
          <div className="bento-parent stagger">
            <GpaTile child={child} go={go} />
            <SubjectsTile child={child} go={go} />
            <StrengthTile child={child} go={go} />
            <FocusTile child={child} go={go} />
            <RecentTile child={child} go={go} />
            <AttendTile />
          </div>
        </>
      )}
    </>
  );
}

export default function ParentOverviewPage() {
  return (
    <ParentShell active="overview">
      <Overview />
    </ParentShell>
  );
}
