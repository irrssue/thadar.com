"use client";

// System — live platform scale + infrastructure from /api/admin/system.

import PageHead from "../../components/PageHead";
import { AreaTrend, Donut, BarRow } from "../../../components/student/charts";
import { type SystemData } from "../../data";
import { useAdminData } from "../../useAdmin";

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
  const { data, loading, error } = useAdminData<SystemData>("/api/admin/system");

  if (loading) return <div className="reveal"><PageHead title="System" accent="health" sub="loading…" /></div>;
  if (error || !data) return <div className="reveal"><PageHead title="System" accent="health" sub={error ?? "Failed to load."} /></div>;

  const { stats, latency, latencyDays, storage, storageTotalLabel, health } = data;

  return (
    <div className="reveal">
      <PageHead title="System" accent="health" sub="live platform metrics · all services operational" />

      <div className="sys-strip stagger">
        {stats.map((s) => (
          <SysStat key={s.label} label={s.label} value={s.value} sub={s.sub} color={s.color} />
        ))}
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
            <AreaTrend data={latency} h={170} color="var(--good)" dur={1500} />
            <div className="axis">
              {latencyDays.map((d, i) => (
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
            <span className="card-hd-r">{storageTotalLabel}</span>
          </div>
          <div className="dist-wrap" style={{ marginTop: 10 }}>
            <Donut segments={storage} size={130} stroke={18}>
              <div className="gauge-num" style={{ fontSize: 18 }}>
                {storageTotalLabel}
              </div>
              <div className="gauge-lab">on disk</div>
            </Donut>
            <div className="dist-legend">
              {storage.map((s, i) => (
                <div key={i} className="leg-row">
                  <span className="sdot" style={{ background: s.color }} />
                  <span className="leg-l">{s.label}</span>
                  <span className="leg-v">{s.value}</span>
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
          {health.map((h, i) => (
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
