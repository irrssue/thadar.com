"use client";

// Classes — org-wide directory of every class, with admin archive / restore /
// delete controls. Archiving a class removes it from both the teacher's and
// the students' rosters in the main app.

import { useState } from "react";
import PageHead from "../../components/PageHead";
import { type AdminClass } from "../../data";
import { useAdminData, adminMutate } from "../../useAdmin";
import { useAdminCtx } from "../../AdminProvider";

export default function ClassesPage() {
  const { isSuper } = useAdminCtx();
  const { data, loading, error, refetch } = useAdminData<AdminClass[]>("/api/admin/classes");
  const [active, setActive] = useState<AdminClass | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const classes = data ?? [];
  const activeCount = classes.filter((c) => c.status === "active").length;
  const totalStudents = classes.reduce((s, c) => s + c.students, 0);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  async function act(c: AdminClass, fn: () => Promise<unknown>, label: string) {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      flash(`${label} · ${c.name}`);
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
        title="All"
        accent="classes"
        sub={loading ? "loading…" : `${classes.length} classes · ${activeCount} active · ${totalStudents} enrolments`}
      />
      {error && <div className="card" style={{ padding: 16, color: "var(--danger)" }}>{error}</div>}
      <div className="acgrid stagger">
        {classes.map((c) => (
          <button
            key={c.id}
            className="accard"
            onClick={() => setActive(c)}
            style={{ ["--c" as string]: c.color, cursor: "pointer", textAlign: "left", font: "inherit", color: "inherit" }}
          >
            <div className="ach">
              <div style={{ minWidth: 0 }}>
                <div className="acname">{c.name}</div>
                <div className="accode">{c.code}</div>
              </div>
              <span className={"pill " + c.status}>
                <span className="pd" />
                {c.status}
              </span>
            </div>
            <div className="acmeta">
              <div className="acm">
                <span className="acm-n">{c.students}</span>
                <span className="acm-l">students</span>
              </div>
              <div className="acm">
                <span className="acm-n" style={{ color: c.color }}>
                  {c.code.split("-")[0]}
                </span>
                <span className="acm-l">subject</span>
              </div>
              <span className="acteacher">{c.teacher}</span>
            </div>
          </button>
        ))}
        {!loading && classes.length === 0 && <div className="hn" style={{ padding: 16 }}>No classes yet.</div>}
      </div>

      {active && (
        <>
          <div className="scrim open" onClick={() => !busy && setActive(null)} style={{ zIndex: 80 }} />
          <div role="dialog" aria-modal="true" className="card" style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 90, width: "min(420px, calc(100vw - 32px))" }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700 }}>{active.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-dim)" }}>
                {active.code} · {active.teacher} · {active.students} students
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {active.status === "archived" ? (
                <button className="btn" disabled={busy} style={{ justifyContent: "flex-start" }}
                  onClick={() => act(active, () => adminMutate(`/api/admin/classes/${active.id}`, { method: "PATCH", body: JSON.stringify({ archived: false }) }), "Restored")}>
                  Restore class
                </button>
              ) : (
                <button className="btn" disabled={busy} style={{ justifyContent: "flex-start" }}
                  onClick={() => act(active, () => adminMutate(`/api/admin/classes/${active.id}`, { method: "PATCH", body: JSON.stringify({ archived: true }) }), "Archived")}>
                  Archive class
                </button>
              )}
              {isSuper && (
                <button className="btn" disabled={busy} style={{ justifyContent: "flex-start", color: "var(--danger)", borderColor: "color-mix(in srgb, var(--danger) 40%, transparent)" }}
                  onClick={() => act(active, () => adminMutate(`/api/admin/classes/${active.id}`, { method: "DELETE" }), "Deleted")}>
                  Delete class permanently
                </button>
              )}
              {!isSuper && <div className="hn" style={{ marginTop: 2 }}>Deletion requires super admin.</div>}
              <button className="btn" disabled={busy} onClick={() => setActive(null)} style={{ justifyContent: "center" }}>
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {toast && (
        <div role="status" style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 100, padding: "12px 18px", borderRadius: 12, background: "var(--panel)", border: "1px solid var(--accent-line)", boxShadow: "0 8px 32px rgba(0,0,0,0.32)", fontSize: 14 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
