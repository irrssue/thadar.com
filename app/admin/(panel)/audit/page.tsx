"use client";

// Audit — the live security log with a level filter, sourced from the real
// AuditLog stream every admin action writes to.

import { useState } from "react";
import PageHead from "../../components/PageHead";
import { type AuditEntry, type AuditLevel } from "../../data";
import { useAdminData } from "../../useAdmin";

const LEVELS: (AuditLevel | "all")[] = ["all", "info", "warn", "alert"];

export default function AuditPage() {
  const { data, loading, error } = useAdminData<AuditEntry[]>("/api/admin/audit");
  const [lvl, setLvl] = useState<AuditLevel | "all">("all");

  const audit = data ?? [];
  const rows = lvl === "all" ? audit : audit.filter((a) => a.level === lvl);
  const alerts = audit.filter((a) => a.level === "alert").length;

  return (
    <div className="reveal">
      <PageHead title="Audit" accent="log" sub={loading ? "loading…" : `${audit.length} recent events · ${alerts} alerts`} />
      {error && <div className="card" style={{ padding: 16, color: "var(--danger)" }}>{error}</div>}
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
          {!loading && rows.length === 0 && <div className="hn" style={{ padding: 16 }}>No events.</div>}
        </div>
      </div>
    </div>
  );
}
