"use client";

// Users — platform directory with a role filter.

import { useState } from "react";
import PageHead from "../../components/PageHead";
import AdminIcon from "../../components/AdminIcon";
import { USERS, initials, roleTagStyle, type Role } from "../../data";

const ROLES: (Role | "all")[] = ["all", "student", "teacher", "parent", "admin"];

export default function UsersPage() {
  const [filter, setFilter] = useState<Role | "all">("all");
  const rows = filter === "all" ? USERS : USERS.filter((u) => u.role === filter);
  const count = (r: Role | "all") => (r === "all" ? USERS.length : USERS.filter((u) => u.role === r).length);
  const active = USERS.filter((u) => u.status === "active").length;
  const pending = USERS.filter((u) => u.status === "pending").length;

  return (
    <div className="reveal">
      <PageHead title="User" accent="directory" sub={`${USERS.length} accounts · ${active} active · ${pending} pending`} action="Invite user" />

      <div className="filterbar">
        {ROLES.map((r) => (
          <button key={r} className={"fpill " + (filter === r ? "on" : "")} onClick={() => setFilter(r)}>
            {r === "all" ? "All" : r[0].toUpperCase() + r.slice(1) + "s"} <span style={{ opacity: 0.6 }}>· {count(r)}</span>
          </button>
        ))}
        <div style={{ marginLeft: "auto" }} className="cmd">
          <span className="ico" style={{ color: "var(--ink-dim)", display: "inline-flex" }}>
            <AdminIcon name="search" size={16} />
          </span>
          <span className="ph">Search name, ID or email…</span>
          <span className="kbd">⌘K</span>
        </div>
      </div>

      <div className="card" style={{ padding: "8px 8px 12px" }}>
        <div className="dir-head">
          <span>Member</span>
          <span className="dc-role">Role</span>
          <span>Status</span>
          <span className="dc-email">Email</span>
          <span className="dc-last">Last active</span>
          <span className="dc-cls" style={{ textAlign: "center" }}>
            Classes
          </span>
        </div>
        <div className="stagger">
          {rows.map((u) => {
            const tag = roleTagStyle(u.role);
            return (
              <div key={u.id} className="dir-row">
                <div className="dir-user">
                  <span className="av-sm" style={{ background: `color-mix(in srgb, ${tag.color} 20%, transparent)`, color: tag.color }}>
                    {initials(u.name)}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div className="dir-name">{u.name}</div>
                    <div className="dir-id">{u.id}</div>
                  </div>
                </div>
                <span className="dc-role">
                  <span className="roletag" style={tag}>
                    {u.role}
                  </span>
                </span>
                <span>
                  <span className={"pill " + u.status}>
                    <span className="pd" />
                    {u.status}
                  </span>
                </span>
                <span className="dir-email dc-email">{u.email}</span>
                <span className="dir-last dc-last">{u.last}</span>
                <span className="dir-cls dc-cls">{u.classes || "—"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
