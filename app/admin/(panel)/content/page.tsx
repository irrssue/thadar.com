"use client";

// Content — the live moderation / review queue. Each item can be actioned
// (approve = clear flag / verify teacher / publish / admit; reject = the
// opposite) and the queue refreshes in place.

import { useState } from "react";
import PageHead from "../../components/PageHead";
import AdminIcon from "../../components/AdminIcon";
import { type QueueItem } from "../../data";
import { useAdminData, adminMutate } from "../../useAdmin";

// affirmative / negative verbs per queue item type, keyed by the id prefix
const VERBS: Record<string, { yes: string; no: string }> = {
  message: { yes: "Clear", no: "Remove" },
  teacher: { yes: "Verify", no: "Reject" },
  class: { yes: "Publish", no: "Reject" },
  membership: { yes: "Admit", no: "Deny" },
};

export default function ContentPage() {
  const { data, loading, error, refetch } = useAdminData<QueueItem[]>("/api/admin/queue");
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const queue = data ?? [];
  const urgent = queue.filter((q) => q.urgent).length;

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  }

  async function resolve(q: QueueItem, approve: boolean) {
    if (busy) return;
    setBusy(q.id);
    try {
      const next = await adminMutate<QueueItem[]>("/api/admin/queue", {
        method: "POST",
        body: JSON.stringify({ id: q.id, approve }),
      });
      flash(`${approve ? "Approved" : "Dismissed"} · ${q.kind}`);
      void next;
      await refetch();
    } catch (e) {
      flash(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="reveal">
      <PageHead title="Content" accent="review" sub={loading ? "loading…" : `${urgent} urgent · ${queue.length} in queue · auto-filter on`} />
      {error && <div className="card" style={{ padding: 16, color: "var(--danger)" }}>{error}</div>}
      <div className="dgrid d-content">
        <div className="card stagger" style={{ padding: 14 }}>
          {!loading && queue.length === 0 && <div className="hn" style={{ padding: 16 }}>Nothing to review — queue is clear.</div>}
          {queue.map((q) => {
            const kind = q.id.split(":")[0];
            const verbs = VERBS[kind] ?? { yes: "Approve", no: "Dismiss" };
            const canAct = !!q.action || kind === "membership";
            return (
              <div key={q.id} className="modrow" style={{ padding: "14px 12px", borderBottom: "1px solid var(--stroke)" }}>
                <span className="feed-ico" style={{ background: q.urgent ? "var(--danger-soft)" : "var(--panel-2)", color: q.urgent ? "var(--danger)" : "var(--ink-dim)" }}>
                  <AdminIcon name={q.icon} size={15} />
                </span>
                <div className="mbody">
                  <div className="mi">{q.item}</div>
                  <div className="mk">
                    {q.kind} · {q.who}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {canAct ? (
                    <>
                      <button className="btn primary" disabled={busy === q.id} onClick={() => resolve(q, true)} style={{ padding: "6px 12px", fontSize: 13 }}>
                        {verbs.yes}
                      </button>
                      <button className="btn" disabled={busy === q.id} onClick={() => resolve(q, false)} style={{ padding: "6px 12px", fontSize: 13, color: "var(--danger)" }}>
                        {verbs.no}
                      </button>
                    </>
                  ) : q.urgent ? (
                    <span className="pill urgent"><span className="pd" />now</span>
                  ) : (
                    <span className="pill">queued</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          <div className="card reveal">
            <div className="tile-title" style={{ fontSize: 17, marginBottom: 14 }}>
              Queue breakdown
            </div>
            <div className="role-legend" style={{ marginTop: 0 }}>
              <div className="role-row">
                <span className="sdot" style={{ background: "var(--danger)" }} />
                <span className="rl">Urgent</span>
                <span className="rv">{urgent}</span>
              </div>
              <div className="role-row">
                <span className="sdot" style={{ background: "var(--accent)" }} />
                <span className="rl">Queued</span>
                <span className="rv">{queue.length - urgent}</span>
              </div>
              <div className="role-row">
                <span className="sdot" style={{ background: "var(--good)" }} />
                <span className="rl">Total</span>
                <span className="rv">{queue.length}</span>
              </div>
            </div>
          </div>
          <div className="card reveal">
            <div className="tile-title" style={{ fontSize: 17, marginBottom: 8 }}>
              How review works
            </div>
            <div className="hn" style={{ lineHeight: 1.6 }}>
              Flagged messages, teacher verifications, class discovery requests and
              join requests all surface here. Approving or dismissing an item updates
              the student and teacher apps immediately and is written to the audit log.
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div role="status" style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 100, padding: "12px 18px", borderRadius: 12, background: "var(--panel)", border: "1px solid var(--accent-line)", boxShadow: "0 8px 32px rgba(0,0,0,0.32)", fontSize: 14 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
