"use client";

import ParentShell, { useParentData } from "@/components/parent/ParentShell";
import ParentIcon from "@/components/parent/ParentIcon";
import { PageHead, ParentNotice } from "@/components/parent/parts";
import { trendDir, trendDelta, dirColor } from "@/components/parent/util";
import { MiniSpark, BarRow } from "@/components/student/charts";
import type { ParentClass } from "@/types/parent";

function Mover({ c }: { c: ParentClass }) {
  const dir = trendDir(c.trend);
  const d = trendDelta(c.trend);
  const color = dirColor(dir);
  return (
    <div className="mover">
      <span className="sdot" style={{ background: c.color }} />
      <div className="mover-body">
        <div className="mover-name">{c.name}</div>
        <div className="mover-teach">{c.teacher ?? "—"}</div>
      </div>
      <MiniSpark data={c.trend} w={84} h={26} color={color} />
      <span className="mover-grade">
        {c.grade}
        <span className="mover-letter" style={{ color: c.color }}>
          {c.letter}
        </span>
      </span>
      <span className="mover-delta" style={{ color }}>
        <ParentIcon name={dir} size={14} />
        {d > 0 ? "+" : ""}
        {d}
      </span>
    </div>
  );
}

function Trends() {
  const { child, loading } = useParentData();

  if (loading && !child) return <ParentNotice>Loading…</ParentNotice>;
  if (!child) return <ParentNotice>No student to show.</ParentNotice>;

  const sorted = [...child.classes].sort((a, b) => trendDelta(b.trend) - trendDelta(a.trend));
  const rising = sorted.filter((c) => trendDir(c.trend) === "up");
  const falling = sorted.filter((c) => trendDir(c.trend) === "down");
  const steady = sorted.filter((c) => trendDir(c.trend) === "flat");

  return (
    <div className="reveal">
      <PageHead
        title={`${child.first}'s`}
        accent="trends"
        sub={`${rising.length} improving · ${falling.length} need focus`}
      />

      {/* movers: up vs down */}
      <div className="dgrid d-2 reveal" style={{ marginBottom: "var(--gap)" }}>
        <div className="card">
          <div className="card-hd">
            <span className="tile-eyebrow" style={{ color: "var(--good)" }}>
              ▲ Trending up
            </span>
            <span className="card-hd-r">{rising.length} classes</span>
          </div>
          <div className="mover-list">
            {rising.map((c) => (
              <Mover key={c.id} c={c} />
            ))}
            {rising.length === 0 && <div className="empty-note">No classes trending up right now.</div>}
          </div>
        </div>
        <div className="card">
          <div className="card-hd">
            <span className="tile-eyebrow" style={{ color: "var(--danger)" }}>
              ▼ Needs focus
            </span>
            <span className="card-hd-r">{falling.length} classes</span>
          </div>
          <div className="mover-list">
            {falling.map((c) => (
              <Mover key={c.id} c={c} />
            ))}
            {steady.map((c) => (
              <Mover key={c.id} c={c} />
            ))}
            {falling.length === 0 && steady.length === 0 && (
              <div className="empty-note">Everything&apos;s heading the right way 🎉</div>
            )}
          </div>
        </div>
      </div>

      {/* strengths */}
      <div className="card reveal" style={{ animationDelay: "60ms", marginBottom: "var(--gap)" }}>
        <div className="card-hd">
          <div className="tile-title" style={{ fontSize: 18, display: "inline-flex", alignItems: "center", gap: 9 }}>
            <span className="sf-ico good">
              <ParentIcon name="star" size={16} />
            </span>
            Where {child.first} is acing it
          </div>
        </div>
        <div className="sf-grid">
          {child.strengths.map((s, i) => (
            <div key={i} className="sf-card good" style={{ ["--c" as string]: s.color }}>
              <div className="sf-card-top">
                <span className="sf-card-label">{s.label}</span>
                <span className="sf-card-score good">{s.score}</span>
              </div>
              <div className="sf-card-cls">
                <span className="sdot" style={{ background: s.color }} />
                {s.cls}
              </div>
              <div className="barrow" style={{ height: 6, marginTop: 12 }}>
                <BarRow pct={s.score} color={s.color} delay={i * 100} />
              </div>
            </div>
          ))}
          {child.strengths.length === 0 && <div className="empty-note">No standout classes yet.</div>}
        </div>
      </div>

      {/* focus */}
      <div className="card reveal" style={{ animationDelay: "110ms" }}>
        <div className="card-hd">
          <div className="tile-title" style={{ fontSize: 18, display: "inline-flex", alignItems: "center", gap: 9 }}>
            <span className="sf-ico warn">
              <ParentIcon name="target" size={16} />
            </span>
            Where to focus next
          </div>
        </div>
        <div className="sf-grid">
          {child.focus.map((f, i) => (
            <div key={i} className="sf-card warn" style={{ ["--c" as string]: f.color }}>
              <div className="sf-card-top">
                <span className="sf-card-label">{f.label}</span>
                <span className="sf-card-score warn">{f.score}</span>
              </div>
              <div className="sf-card-cls">
                <span className="sdot" style={{ background: f.color }} />
                {f.cls}
              </div>
              <div className="sf-card-note">{f.note}</div>
            </div>
          ))}
          {child.focus.length === 0 && <div className="empty-note">Nothing flagged right now.</div>}
        </div>
      </div>
    </div>
  );
}

export default function ParentTrendsPage() {
  return (
    <ParentShell active="trends">
      <Trends />
    </ParentShell>
  );
}
