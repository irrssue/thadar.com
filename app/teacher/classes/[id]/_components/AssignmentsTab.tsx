"use client";

import { useCallback, useEffect, useState } from "react";
import { Btn } from "../../../components/primitives";
import type { ApiResponse, TAssignment, SubRow } from "./types";
import { RowCard, Muted, ghostSmall, approveBtn, denyBtn, overlayStyle, modalStyle, inputStyle, ghostBtn, primaryBtn } from "./ui";

/* ---------------- Assignments ---------------- */

export function AssignmentsTab({ classId }: { classId: string }) {
  const [items, setItems] = useState<TAssignment[] | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [grading, setGrading] = useState<TAssignment | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/classes/${classId}/assignments`, { cache: "no-store" });
    const json: ApiResponse<TAssignment[]> = await res.json();
    if (json.success) setItems(json.data);
  }, [classId]);

  useEffect(() => { load(); }, [load]);

  async function publish(a: TAssignment) {
    await fetch(`/api/assignments/${a.id}/publish`, { method: "POST" });
    load();
  }
  async function del(a: TAssignment) {
    await fetch(`/api/assignments/${a.id}`, { method: "DELETE" });
    load();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Btn variant="primary" onClick={() => setShowNew(true)}>＋ New assignment</Btn>
      </div>
      {!items && <Muted>Loading assignments…</Muted>}
      {items && items.length === 0 && <Muted>No assignments yet.</Muted>}
      {(items ?? []).map((a) => (
        <RowCard key={a.id}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17 }}>{a.title}</div>
            <div style={{ fontSize: 12, color: "var(--ink-dim)", fontFamily: "var(--font-mono)" }}>
              {a.status.toLowerCase()} · {a._count.submissions} submissions
              {a.dueAt ? ` · due ${new Date(a.dueAt).toLocaleDateString()}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setGrading(a)} style={ghostSmall}>Submissions</button>
            {a.status === "DRAFT" && <button onClick={() => publish(a)} style={approveBtn}>Publish</button>}
            <button onClick={() => del(a)} style={denyBtn}>Delete</button>
          </div>
        </RowCard>
      ))}

      {showNew && (
        <AssignmentModal classId={classId} onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); load(); }} />
      )}
      {grading && (
        <SubmissionsModal assignment={grading} onClose={() => setGrading(null)} onGraded={load} />
      )}
    </div>
  );
}

function AssignmentModal({ classId, onClose, onSaved }: { classId: string; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [due, setDue] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save(publish: boolean) {
    if (!title.trim() || saving) return;
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch(`/api/classes/${classId}/assignments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          instructions: instructions.trim() || undefined,
          dueAt: due ? new Date(due).toISOString() : undefined,
          status: publish ? "PUBLISHED" : "DRAFT",
        }),
      });
      const json: ApiResponse<unknown> = await res.json();
      if (!json.success) { setErr(json.error); return; }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalStyle, width: "min(640px, 94vw)" }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>New assignment</div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required maxLength={160} autoFocus style={inputStyle} />
        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Instructions for students…" rows={6} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, color: "var(--ink-dim)" }}>Due date (optional)</span>
          <input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} style={inputStyle} />
        </label>
        {err && <div style={{ color: "var(--danger)", fontSize: 14 }}>{err}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" onClick={onClose} style={ghostBtn}>Cancel</button>
          <button type="button" onClick={() => save(false)} disabled={saving || !title.trim()} style={{ ...ghostBtn, opacity: saving || !title.trim() ? 0.5 : 1 }}>Save draft</button>
          <button type="button" onClick={() => save(true)} disabled={saving || !title.trim()} style={{ ...primaryBtn, opacity: saving || !title.trim() ? 0.5 : 1 }}>Publish</button>
        </div>
      </div>
    </div>
  );
}

function SubmissionsModal({ assignment, onClose, onGraded }: { assignment: TAssignment; onClose: () => void; onGraded: () => void }) {
  const [subs, setSubs] = useState<SubRow[] | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/assignments/${assignment.id}`, { cache: "no-store" });
    const json: ApiResponse<{ submissions: SubRow[] }> = await res.json();
    if (json.success) setSubs(json.data.submissions);
  }, [assignment.id]);

  useEffect(() => { load(); }, [load]);

  async function grade(sub: SubRow, gradeVal: string, feedback: string) {
    await fetch(`/api/submissions/${sub.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ grade: gradeVal, feedback: feedback || undefined }),
    });
    await load();
    onGraded();
  }

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalStyle, width: "min(680px, 94vw)", maxHeight: "84vh", overflowY: "auto" }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{assignment.title} — submissions</div>
        {!subs && <Muted>Loading…</Muted>}
        {subs && subs.length === 0 && <Muted>No submissions yet.</Muted>}
        {(subs ?? []).map((s) => (
          <GradeCard key={s.id} sub={s} onGrade={grade} />
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={ghostBtn}>Close</button>
        </div>
      </div>
    </div>
  );
}

function GradeCard({ sub, onGrade }: { sub: SubRow; onGrade: (s: SubRow, g: string, f: string) => Promise<void> }) {
  const [grade, setGrade] = useState(sub.grade ?? "");
  const [feedback, setFeedback] = useState(sub.feedback ?? "");
  const [saving, setSaving] = useState(false);

  return (
    <div style={{ border: "1.2px dashed var(--ink-faint)", borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{sub.student.name ?? sub.student.email}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: sub.status === "GRADED" ? "var(--accent-2, var(--accent))" : "var(--ink-dim)" }}>
          {sub.status.toLowerCase()}
        </div>
      </div>
      <div style={{ fontSize: 14, color: "var(--ink-dim)", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{sub.content}</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Grade (e.g. A, 92)" maxLength={20} style={{ ...inputStyle, maxWidth: 160 }} />
        <input value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Feedback (optional)" style={{ ...inputStyle, flex: 1, minWidth: 160 }} />
        <button
          onClick={async () => { if (!grade.trim()) return; setSaving(true); try { await onGrade(sub, grade.trim(), feedback.trim()); } finally { setSaving(false); } }}
          disabled={saving || !grade.trim()}
          style={{ ...approveBtn, opacity: saving || !grade.trim() ? 0.5 : 1 }}
        >
          {saving ? "Saving…" : sub.status === "GRADED" ? "Update" : "Return grade"}
        </button>
      </div>
    </div>
  );
}
