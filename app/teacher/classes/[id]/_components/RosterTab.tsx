"use client";

import { useCallback, useEffect, useState } from "react";
import type { ApiResponse, Member } from "./types";
import { Section, RowCard, PersonCell, Muted, approveBtn, denyBtn } from "./ui";

/* ---------------- Roster + approval queue ---------------- */

export function RosterTab({ classId, onChange }: { classId: string; onChange: () => void }) {
  const [data, setData] = useState<{ active: Member[]; pending: Member[] } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/classes/${classId}/members`, { cache: "no-store" });
    const json: ApiResponse<{ active: Member[]; pending: Member[] }> = await res.json();
    if (json.success) setData(json.data);
  }, [classId]);

  useEffect(() => { load(); }, [load]);

  async function decide(mid: string, action: "approve" | "deny") {
    setBusy(mid);
    try {
      await fetch(`/api/classes/${classId}/members/${mid}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await load();
      onChange();
    } finally {
      setBusy(null);
    }
  }

  async function remove(mid: string) {
    setBusy(mid);
    try {
      await fetch(`/api/classes/${classId}/members/${mid}`, { method: "DELETE" });
      await load();
      onChange();
    } finally {
      setBusy(null);
    }
  }

  if (!data) return <Muted>Loading roster…</Muted>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <Section title={`Pending requests (${data.pending.length})`}>
        {data.pending.length === 0 ? (
          <Muted>No pending requests.</Muted>
        ) : (
          data.pending.map((m) => (
            <RowCard key={m.id}>
              <PersonCell person={m.user} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => decide(m.id, "approve")} disabled={busy === m.id} style={approveBtn}>Approve</button>
                <button onClick={() => decide(m.id, "deny")} disabled={busy === m.id} style={denyBtn}>Deny</button>
              </div>
            </RowCard>
          ))
        )}
      </Section>

      <Section title={`Students (${data.active.length})`}>
        {data.active.length === 0 ? (
          <Muted>No students yet. Share your invite code from Settings.</Muted>
        ) : (
          data.active.map((m) => (
            <RowCard key={m.id}>
              <PersonCell person={m.user} />
              <button onClick={() => remove(m.id)} disabled={busy === m.id} style={denyBtn}>Remove</button>
            </RowCard>
          ))
        )}
      </Section>
    </div>
  );
}
