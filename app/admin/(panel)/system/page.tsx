"use client";

// System — health + infrastructure.

import PageHead from "../../components/PageHead";
import { AreaTrend, Donut, BarRow } from "../../../components/student/charts";
import { HEALTH, LATENCY, LATENCY_DAYS, STORAGE } from "../../data";

function SysStat({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="stat">
      <div className="sl">{label}</div>
      <div className="sv" style={{ color }}>
        {value}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-dim)", marginTop: 6 }}>{sub}</div>
    </div>
  );
}

export default function SystemPage() {
  const totalGB = STORAGE.reduce((s, x) => s + x.value, 0);

  return (
    <div className="reveal">
      <PageHead title="System" accent="health" sub="all services operational · last incident 41 days ago" action="Status page" />

      <div className="sys-strip stagger">
        <SysStat label="Uptime · 30d" value="99.98%" sub="no incidents" color="var(--good)" />
        <SysStat label="API latency p95" value="124ms" sub="-14% vs last wk" color="var(--good)" />
        <SysStat label="Error rate" value="0.02%" sub="below threshold" color="var(--good)" />
        <SysStat label="DB storage" value={`${totalGB} GB`} sub="of 500 GB" color="var(--accent)" />
      </div>

      <div className="dgrid d-content">
        <div className="card reveal">
          <div className="card-hd">
            <div className="tile-title" style={{ fontSize: 17 }}>
              Latency · p95
            </div>
            <span className="card-hd-r">7 days · ms</span>
          </div>
          <div style={{ marginTop: 14 }}>
            <AreaTrend data={LATENCY} h={170} color="var(--good)" dur={1500} />
            <div className="axis">
              {LATENCY_DAYS.map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="card dist-card reveal">
          <div className="card-hd">
            <div className="tile-title" style={{ fontSize: 17 }}>
              Storage
            </div>
            <span className="card-hd-r">{totalGB} / 500 GB</span>
          </div>
          <div className="dist-wrap" style={{ marginTop: 10 }}>
            <Donut segments={STORAGE} size={130} stroke={18}>
              <div className="gauge-num" style={{ fontSize: 24 }}>
                {Math.round((totalGB / 500) * 100)}%
              </div>
              <div className="gauge-lab">used</div>
            </Donut>
            <div className="dist-legend">
              {STORAGE.map((s, i) => (
                <div key={i} className="leg-row">
                  <span className="sdot" style={{ background: s.color }} />
                  <span className="leg-l">{s.label}</span>
                  <span className="leg-v">{s.value} GB</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: "var(--gap)" }} />
      <div className="card reveal">
        <div className="card-hd">
          <div className="tile-title" style={{ fontSize: 17 }}>
            Services
          </div>
          <span className="card-hd-r">live</span>
        </div>
        <div className="health-list" style={{ marginTop: 14 }}>
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
      </div>
    </div>
  );
}
