"use client";

// Overview — the admin control panel home. Each tile is a compact, animated
// view of platform state, reusing the shared chart primitives.

import Link from "next/link";
import AdminIcon from "../components/AdminIcon";
import { AreaTrend, Donut, VBars, BarRow, CountUp } from "../../components/student/charts";
import {
  KPIS,
  SIGNUP_WEEKS,
  USER_TREND,
  ROLES,
  ACTIVE_HOURS,
  HEALTH,
  ACTIVITY,
  QUEUE,
  SIGNUPS,
  roleTint,
} from "../data";

function TileHead({
  eyebrow,
  title,
  count,
  open,
}: {
  eyebrow?: string;
  title: string;
  count?: string;
  open?: boolean;
}) {
  return (
    <div className="tile-hd">
      <div>
        {eyebrow && <div className="tile-eyebrow">{eyebrow}</div>}
        <div className="tile-title">{title}</div>
      </div>
      {count != null && <span className="tile-count">{count}</span>}
      {open && (
        <span className="tile-open">
          open <AdminIcon name="arrow" size={13} />
        </span>
      )}
    </div>
  );
}

export default function AdminOverview() {
  const activeNow = KPIS.find((m) => m.id === "active")?.value ?? 0;
  const needReview = QUEUE.filter((q) => q.urgent).length;
  const total = ROLES.reduce((s, r) => s + r.value, 0);
  const newest = SIGNUPS[SIGNUPS.length - 1];
  const peak = Math.max(...ACTIVE_HOURS.map((h) => h.value));

  return (
    <>
      <div className="hero reveal">
        <h1 className="greet">
          Platform <span className="var">overview</span>
        </h1>
        <p className="subline">
          <span>{today()}</span>
          <span className="sep">·</span>
          <b>{activeNow}</b> active now
          <span className="sep">·</span>
          <span className={needReview > 0 ? "hot" : undefined}>{needReview} items need review</span>
          <span className="sep">·</span>
          <span>all systems green</span>
        </p>
      </div>

      {/* KPI strip */}
      <div className="kpi-strip stagger">
        {KPIS.map((m) => (
          <Link key={m.id} href={m.href} className="kpi link">
            <div className="kpi-top">
              <span className="kpi-ico">
                <AdminIcon name={m.icon} size={17} />
              </span>
              <span className={"kpi-delta " + (m.up ? "up" : "")}>
                {m.up && m.delta !== "live" && m.delta !== "stable" ? <AdminIcon name="up" size={11} /> : null}
                {m.delta}
              </span>
            </div>
            <div className="kpi-val">
              {m.fmt === "pct2" ? (
                <CountUp to={m.value} dec={2} dur={1300} suffix="%" />
              ) : (
                <CountUp to={m.value} dur={1100} />
              )}
            </div>
            <div className="kpi-lab">{m.label}</div>
            <div className="kpi-sub">{m.sub}</div>
          </Link>
        ))}
      </div>

      <div className="bento-admin stagger">
        {/* Growth (cumulative users area) */}
        <Link href="/admin/users" className="tile link feature area-growth" style={{ textDecoration: "none" }}>
          <div className="growth-hd">
            <div>
              <div className="tile-eyebrow">Platform growth · 12 weeks</div>
              <div className="growth-big">
                <CountUp to={USER_TREND[USER_TREND.length - 1]} dur={1300} />
              </div>
              <div className="growth-cap">
                total users · <span className="up">+{newest} this week</span> · 88% retention
              </div>
            </div>
            <span className="tile-open">
              User directory <AdminIcon name="arrow" size={13} />
            </span>
          </div>
          <div style={{ marginTop: 14 }}>
            <AreaTrend data={USER_TREND} h={150} color="var(--accent)" dur={1500} baseline />
            <div className="axis">
              {SIGNUP_WEEKS.map((w, i) =>
                i % 2 === 0 || i === SIGNUP_WEEKS.length - 1 ? (
                  <span key={i}>{w}</span>
                ) : (
                  <span key={i} style={{ opacity: 0 }}>
                    ·
                  </span>
                ),
              )}
            </div>
          </div>
        </Link>

        {/* Roles (donut) */}
        <Link href="/admin/users" className="tile link area-roles" style={{ textDecoration: "none" }}>
          <TileHead eyebrow="By role" title="Members" open />
          <div className="dist-wrap" style={{ marginTop: 6 }}>
            <Donut segments={ROLES} size={118} stroke={16}>
              <div className="gauge-num" style={{ fontSize: 26 }}>
                <CountUp to={total} dur={1100} />
              </div>
              <div className="gauge-lab">total</div>
            </Donut>
            <div className="role-legend">
              {ROLES.map((r) => (
                <div key={r.key} className="role-row">
                  <span className="sdot" style={{ background: r.color }} />
                  <span className="rl">{r.label}</span>
                  <span className="rv">{r.value.toLocaleString()}</span>
                  <span className="rp">{Math.round((r.value / total) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </Link>

        {/* Active users by time-of-day (vbars) */}
        <Link href="/admin/system" className="tile link area-active" style={{ textDecoration: "none" }}>
          <TileHead eyebrow="Active sessions · today" title="Live traffic" count={`peak ${peak}`} open />
          <div style={{ marginTop: 10, flex: 1, display: "flex", alignItems: "flex-end" }}>
            <VBars data={ACTIVE_HOURS} h={132} />
          </div>
        </Link>

        {/* System health (bars) */}
        <Link href="/admin/system" className="tile link area-health" style={{ textDecoration: "none" }}>
          <TileHead eyebrow="Infrastructure" title="System health" count="all green" open />
          <div className="health-list">
            {HEALTH.map((h, i) => (
              <div key={i} className="health-item">
                <div className="hh">
                  <span className="hl">{h.label}</span>
                  <span className="hv">{h.value}</span>
                </div>
                <BarRow pct={h.pct} color={h.color} delay={i * 120} />
                <div className="hn">{h.note}</div>
              </div>
            ))}
          </div>
          <div className="tile-foot">
            <span>last incident · 41 days ago</span>
            <span className="go">
              Status page <AdminIcon name="arrow" size={12} />
            </span>
          </div>
        </Link>

        {/* Activity feed */}
        <Link href="/admin/audit" className="tile link area-feed" style={{ textDecoration: "none" }}>
          <TileHead eyebrow="Live" title="Activity" open />
          <div className="feed">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="feed-row">
                <span
                  className="feed-ico"
                  style={{ background: `color-mix(in srgb, ${roleTint(a.role)} 16%, transparent)`, color: roleTint(a.role) }}
                >
                  <AdminIcon name={a.icon} size={15} />
                </span>
                <div className="feed-body">
                  <div className="feed-txt">
                    <b>{a.who}</b> {a.act} <span className="obj">{a.obj}</span>
                  </div>
                </div>
                <span className="feed-when">{a.when}</span>
              </div>
            ))}
          </div>
          <div className="tile-foot">
            <span>streaming · {ACTIVITY.length} recent</span>
            <span className="go">
              Audit log <AdminIcon name="arrow" size={12} />
            </span>
          </div>
        </Link>

        {/* Moderation / pending queue */}
        <Link href="/admin/content" className="tile link area-queue" style={{ textDecoration: "none" }}>
          <TileHead eyebrow={`${needReview} need action`} title="Needs review" open />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {QUEUE.map((q, i) => (
              <div key={i} className="modrow">
                <span
                  className="feed-ico"
                  style={{
                    background: q.urgent ? "var(--danger-soft)" : "var(--panel-2)",
                    color: q.urgent ? "var(--danger)" : "var(--ink-dim)",
                  }}
                >
                  <AdminIcon name={q.icon} size={15} />
                </span>
                <div className="mbody">
                  <div className="mi">{q.item}</div>
                  <div className="mk">
                    {q.kind} · {q.who}
                  </div>
                </div>
                {q.urgent ? (
                  <span className="pill urgent">
                    <span className="pd" />
                    now
                  </span>
                ) : (
                  <span className="pill">queued</span>
                )}
              </div>
            ))}
          </div>
        </Link>
      </div>
    </>
  );
}

function today(): string {
  return new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}
