"use client";

// Content — moderation / review queue.

import PageHead from "../../components/PageHead";
import AdminIcon from "../../components/AdminIcon";
import { VBars } from "../../../components/student/charts";
import { QUEUE } from "../../data";

const THROUGHPUT = [
  { label: "Mon", value: 18, color: "var(--accent-line)" },
  { label: "Tue", value: 24, color: "var(--accent)" },
  { label: "Wed", value: 12, color: "var(--accent-line)" },
  { label: "Thu", value: 30, color: "var(--accent)" },
  { label: "Fri", value: 9, color: "var(--accent-line)" },
];

export default function ContentPage() {
  const urgent = QUEUE.filter((q) => q.urgent).length;
  const list = QUEUE.concat(QUEUE.slice(0, 2));

  return (
    <div className="reveal">
      <PageHead title="Content" accent="review" sub={`${urgent} urgent · ${QUEUE.length} in queue · auto-filter on`} />
      <div className="dgrid d-content">
        <div className="card stagger" style={{ padding: 14 }}>
          {list.map((q, i) => (
            <div key={i} className="modrow" style={{ padding: "14px 12px", borderBottom: "1px solid var(--stroke)" }}>
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
                  {q.kind} · flagged by {q.who}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {q.urgent ? (
                  <span className="pill urgent">
                    <span className="pd" />
                    now
                  </span>
                ) : (
                  <span className="pill">queued</span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          <div className="card reveal">
            <div className="card-hd">
              <div className="tile-title" style={{ fontSize: 17 }}>
                Review throughput
              </div>
              <span className="card-hd-r">7 days</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <VBars data={THROUGHPUT} h={120} />
            </div>
          </div>
          <div className="card reveal">
            <div className="tile-title" style={{ fontSize: 17, marginBottom: 14 }}>
              Auto-filter actions
            </div>
            <div className="role-legend" style={{ marginTop: 0 }}>
              <div className="role-row">
                <span className="sdot" style={{ background: "var(--good)" }} />
                <span className="rl">Auto-approved</span>
                <span className="rv">214</span>
              </div>
              <div className="role-row">
                <span className="sdot" style={{ background: "var(--accent)" }} />
                <span className="rl">Held for review</span>
                <span className="rv">38</span>
              </div>
              <div className="role-row">
                <span className="sdot" style={{ background: "var(--danger)" }} />
                <span className="rl">Blocked</span>
                <span className="rv">6</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
