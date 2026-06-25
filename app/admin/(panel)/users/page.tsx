"use client";

// Users — platform directory with a role filter and per-account admin controls
// (suspend / reactivate, verify teacher, grant / revoke admin, delete).

import { useMemo, useState } from "react";
import PageHead from "../../components/PageHead";
import AdminIcon from "../../components/AdminIcon";
import { initials, roleTagStyle, type Role, type DirUser } from "../../data";
import { useAdminData, adminMutate } from "../../useAdmin";
import { useAdminCtx } from "../../AdminProvider";

const ROLES: (Role | "all")[] = ["all", "student", "teacher", "parent", "admin"];

type Action = { label: string; danger?: boolean; run: () => Promise<unknown> };

export default function UsersPage() {
  const { isSuper } = useAdminCtx();
  const { data, loading, error, refetch } = useAdminData<DirUser[]>("/api/admin/users");
  const [filter, setFilter] = useState<Role | "all">("all");
  const [active, setActive] = useState<DirUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const users = useMemo(() => data ?? [], [data]);
  const rows = filter === "all" ? users : users.filter((u) => u.role === filter);
  const count = (r: Role | "all") => (r === "all" ? users.length : users.filter((u) => u.role === r).length);
  const activeCount = users.filter((u) => u.status === "active").length;
  const pending = users.filter((u) => u.status === "pending").length;

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  function actionsFor(u: DirUser): Action[] {
    const list: Action[] = [];
    if (u.status === "pending") {
      list.push({ label: "Approve account", run: () => patch(u, { op: "status", value: "ACTIVE" }) });
      list.push({ label: "Reject (suspend)", danger: true, run: () => patch(u, { op: "status", value: "SUSPENDED" }) });
    } else if (u.status === "suspended") {
      list.push({ label: "Reactivate account", run: () => patch(u, { op: "status", value: "ACTIVE" }) });
    } else {
      list.push({ label: "Suspend account", danger: true, run: () => patch(u, { op: "status", value: "SUSPENDED" }) });
    }
    if (u.role === "teacher" || u.teacherStatus !== "UNVERIFIED") {
      if (u.teacherStatus === "VERIFIED") {
        list.push({ label: "Revoke teacher verification", run: () => patch(u, { op: "teacher", value: "UNVERIFIED" }) });
      } else {
        list.push({ label: "Verify teacher", run: () => patch(u, { op: "teacher", value: "VERIFIED" }) });
      }
    }
    if (isSuper && u.platformRole !== "SUPER_ADMIN") {
      if (u.platformRole === "USER") {
        list.push({ label: "Grant admin role", run: () => patch(u, { op: "role", value: "ADMIN" }) });
      } else {
        list.push({ label: "Revoke admin role", run: () => patch(u, { op: "role", value: "USER" }) });
      }
      list.push({ label: "Delete account", danger: true, run: () => del(u) });
    }
    return list;
  }

  async function patch(u: DirUser, body: Record<string, string>) {
    return adminMutate(`/api/admin/users/${u.id}`, { method: "PATCH", body: JSON.stringify(body) });
  }
  async function del(u: DirUser) {
    return adminMutate(`/api/admin/users/${u.id}`, { method: "DELETE" });
  }

  async function run(a: Action, u: DirUser) {
    if (busy) return;
    setBusy(true);
    try {
      await a.run();
      flash(`${a.label} · ${u.name}`);
      setActive(null);
      await refetch();
    } catch (e) {
      flash(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="reveal">
      <PageHead
        title="User"
        accent="directory"
        sub={loading ? "loading…" : `${users.length} accounts · ${activeCount} active · ${pending} pending`}
      />

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
          <span className="ph">Tap a row to manage</span>
        </div>
      </div>

      {error && <div className="card" style={{ padding: 16, color: "var(--danger)" }}>{error}</div>}

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
              <button
                key={u.id}
                className="dir-row"
                onClick={() => setActive(u)}
                style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid var(--stroke)", cursor: "pointer", textAlign: "left", font: "inherit", color: "inherit" }}
              >
                <div className="dir-user">
                  <span className="av-sm" style={{ background: `color-mix(in srgb, ${tag.color} 20%, transparent)`, color: tag.color }}>
                    {initials(u.name)}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div className="dir-name">{u.name}</div>
                    <div className="dir-id">{u.code}</div>
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
              </button>
            );
          })}
          {!loading && rows.length === 0 && <div className="hn" style={{ padding: 16 }}>No accounts in this view.</div>}
        </div>
      </div>

      {active && (
        <>
          <div className="scrim open" onClick={() => !busy && setActive(null)} style={{ zIndex: 80 }} />
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 90,
              width: "min(420px, calc(100vw - 32px))",
            }}
            className="card"
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span className="av-sm" style={{ ...roleTagStyle(active.role), width: 40, height: 40 }}>
                {initials(active.name)}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 700 }}>{active.name}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-dim)" }}>
                  {active.code} · {active.role} · {active.email}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {actionsFor(active).map((a) => (
                <button
                  key={a.label}
                  className="btn"
                  disabled={busy}
                  onClick={() => run(a, active)}
                  style={{ justifyContent: "flex-start", ...(a.danger ? { color: "var(--danger)", borderColor: "color-mix(in srgb, var(--danger) 40%, transparent)" } : {}) }}
                >
                  {a.label}
                </button>
              ))}
              {!isSuper && (
                <div className="hn" style={{ marginTop: 2 }}>Role + deletion controls require super admin.</div>
              )}
              <button className="btn" disabled={busy} onClick={() => setActive(null)} style={{ justifyContent: "center" }}>
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            padding: "12px 18px",
            borderRadius: 12,
            background: "var(--panel)",
            border: "1px solid var(--accent-line)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.32)",
            fontSize: 14,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
