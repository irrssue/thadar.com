"use client";

// Audit — security log with a level filter.

import { useState } from "react";
import PageHead from "../../components/PageHead";
import { AUDIT, type AuditLevel } from "../../data";

const LEVELS: (AuditLevel | "all")[] = ["all", "info", "warn", "alert"];

export default function AuditPage() {
  const [lvl, setLvl] = useState<AuditLevel | "all">("all");
  const rows = lvl === "all" ? AUDIT : AUDIT.filter((a) => a.level === lvl);
  const alerts = AUDIT.filter((a) => a.level === "alert").length;

  return (
    <div className="reveal">
      <PageHead title="Audit" accent="log" sub={`${AUDIT.length} events today · ${alerts} alerts`} action="Export CSV" />
      <div className="filterbar">
        {LEVELS.map((l) => (
          <button key={l} className={"fpill " + (lvl === l ? "on" : "")} onClick={() => setLvl(l)}>
            {l === "all" ? "All events" : l[0].toUpperCase() + l.slice(1)}
          </button>
        ))}
      </div>
      <div className="card" style={{ padding: "8px 8px 12px" }}>
        <div className="audit-head">
          <span />
          <span>Event</span>
          <span>Actor</span>
          <span className="au-ip">IP address</span>
          <span style={{ textAlign: "right" }}>Time</span>
        </div>
        <div className="stagger">
          {rows.map((a, i) => (
            <div key={i} className="audit-row">
              <span className={"lvl " + a.level} />
              <span className="ev">{a.event}</span>
              <span className="ac">{a.actor}</span>
              <span className="ip au-ip">{a.ip}</span>
              <span className="tm">{a.when}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
