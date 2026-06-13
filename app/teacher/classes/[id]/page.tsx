"use client";

import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import { Btn, CommandBar } from "../../components/primitives";

type ClassDetail = {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string | null;
  inviteCodeEnabled: boolean;
  createdAt: string;
  _count: { memberships: number };
};

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

type Tab = "roster" | "lessons" | "assignments" | "progress" | "settings";

export default function ClassDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [klass, setKlass] = useState<ClassDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("roster");

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(`/api/classes/${id}`, { cache: "no-store" });
    const json: ApiResponse<ClassDetail> = await res.json();
    if (!json.success) {
      setError(json.error);
      return;
    }
    setKlass(json.data);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error && !klass) {
    return (
      <div style={{ padding: "32px 0" }}>
        <div style={{ color: "var(--danger)", marginBottom: 16 }}>{error}</div>
        <Link href="/teacher/classes" style={{ color: "var(--accent)" }}>← Back to classes</Link>
      </div>
    );
  }
  if (!klass) return <div style={{ padding: "32px 0", color: "var(--ink-dim)" }}>Loading…</div>;

  const TABS: { id: Tab; label: string }[] = [
    { id: "roster", label: "Roster" },
    { id: "lessons", label: "Lessons" },
    { id: "assignments", label: "Assignments" },
    { id: "progress", label: "Progress" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <>
      <Link href="/teacher/classes" style={{ color: "var(--ink-dim)", fontSize: 14, textDecoration: "none" }}>← Classes</Link>

      <h1 style={{ fontWeight: 700, fontSize: 44, margin: "12px 0 4px", letterSpacing: "-0.5px" }}>{klass.name}</h1>
      {klass.description && (
        <p style={{ color: "var(--ink-dim)", fontSize: 17, margin: "0 0 16px", fontWeight: 300 }}>{klass.description}</p>
      )}
      <div style={{ display: "flex", gap: 14, color: "var(--ink-dim)", fontSize: 14, marginBottom: 24 }}>
        <span><strong style={{ color: "var(--ink)", fontWeight: 700 }}>{klass._count.memberships}</strong> students</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              border: `1.2px solid ${tab === t.id ? "var(--accent)" : "var(--ink-faint)"}`,
              borderRadius: 999, padding: "6px 14px", background: "transparent",
              color: tab === t.id ? "var(--accent)" : "var(--ink-dim)", fontSize: 14, cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "roster" && <RosterTab classId={id} onChange={load} />}
      {tab === "lessons" && <LessonsTab classId={id} />}
      {tab === "assignments" && <AssignmentsTab classId={id} />}
      {tab === "progress" && <ProgressTab classId={id} />}
      {tab === "settings" && <SettingsTab klass={klass} onChange={load} />}

      <CommandBar />
    </>
  );
}

/* ---------------- Roster + approval queue ---------------- */

type Member = { id: string; status: string; joinedAt: string; user: { id: string; name: string | null; email: string } };

function RosterTab({ classId, onChange }: { classId: string; onChange: () => void }) {
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

/* ---------------- Lessons ---------------- */

type Lesson = { id: string; title: string; content: string; videoUrl: string; order: number; published: boolean; _count: { views: number } };

function LessonsTab({ classId }: { classId: string }) {
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState<Lesson | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/classes/${classId}/lessons`, { cache: "no-store" });
    const json: ApiResponse<Lesson[]> = await res.json();
    if (json.success) setLessons(json.data);
  }, [classId]);

  useEffect(() => { load(); }, [load]);

  async function togglePublish(l: Lesson) {
    await fetch(`/api/lessons/${l.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ published: !l.published }),
    });
    load();
  }

  async function del(l: Lesson) {
    await fetch(`/api/lessons/${l.id}`, { method: "DELETE" });
    load();
  }

  // Swap a lesson's order value with its neighbour to move it up/down.
  async function move(l: Lesson, dir: -1 | 1) {
    if (!lessons) return;
    const sorted = [...lessons].sort((a, b) => a.order - b.order);
    const i = sorted.findIndex((x) => x.id === l.id);
    const j = i + dir;
    if (j < 0 || j >= sorted.length) return;
    const neighbour = sorted[j];
    await Promise.all([
      fetch(`/api/lessons/${l.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ order: neighbour.order }),
      }),
      fetch(`/api/lessons/${neighbour.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ order: l.order }),
      }),
    ]);
    load();
  }

  const sorted = [...(lessons ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Btn variant="primary" onClick={() => setShowNew(true)}>＋ New lesson</Btn>
      </div>
      {!lessons && <Muted>Loading lessons…</Muted>}
      {lessons && lessons.length === 0 && <Muted>No lessons yet. Create your first lesson.</Muted>}
      {sorted.map((l, i) => (
        <RowCard key={l.id}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <button onClick={() => move(l, -1)} disabled={i === 0} title="Move up" style={{ ...reorderBtn, opacity: i === 0 ? 0.3 : 1 }}>▲</button>
            <button onClick={() => move(l, 1)} disabled={i === sorted.length - 1} title="Move down" style={{ ...reorderBtn, opacity: i === sorted.length - 1 ? 0.3 : 1 }}>▼</button>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17 }}>{l.title}</div>
            <div style={{ fontSize: 12, color: "var(--ink-dim)", fontFamily: "var(--font-mono)" }}>
              {l.published ? `published · ${l._count.views} views` : "draft"}{l.videoUrl ? " · 🎬 video" : ""}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setEditing(l)} style={ghostSmall}>Edit</button>
            <button onClick={() => togglePublish(l)} style={ghostSmall}>{l.published ? "Unpublish" : "Publish"}</button>
            <button onClick={() => del(l)} style={denyBtn}>Delete</button>
          </div>
        </RowCard>
      ))}

      {showNew && (
        <LessonModal classId={classId} onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); load(); }} />
      )}
      {editing && (
        <LessonModal classId={classId} lesson={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      )}
    </div>
  );
}

function LessonModal({ classId, lesson, onClose, onSaved }: { classId: string; lesson?: Lesson; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [content, setContent] = useState(lesson?.content ?? "");
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || saving) return;
    setSaving(true);
    setErr(null);
    try {
      const url = lesson ? `/api/lessons/${lesson.id}` : `/api/classes/${classId}/lessons`;
      const res = await fetch(url, {
        method: lesson ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content, videoUrl: videoUrl.trim() }),
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
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ ...modalStyle, width: "min(640px, 94vw)" }}>
        <div style={{ fontSize: 20, fontWeight: 700 }}>{lesson ? "Edit lesson" : "New lesson"}</div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lesson title" required maxLength={200} autoFocus style={inputStyle} />
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Video link (e.g. unlisted YouTube URL)" type="url" maxLength={2000} style={inputStyle} />
          <span style={{ fontSize: 12, color: "var(--ink-dim)" }}>Paste an unlisted YouTube link. Students open it to watch the lesson video.</span>
        </div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Lesson content (markdown supported)…" rows={10} style={{ ...inputStyle, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 14 }} />
        {err && <div style={{ color: "var(--danger)", fontSize: 14 }}>{err}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button type="button" onClick={onClose} style={ghostBtn}>Cancel</button>
          <button type="submit" disabled={saving || !title.trim()} style={{ ...primaryBtn, opacity: saving || !title.trim() ? 0.5 : 1 }}>{saving ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- Assignments ---------------- */

type TAssignment = { id: string; title: string; instructions: string; dueAt: string | null; status: string; _count: { submissions: number } };

function AssignmentsTab({ classId }: { classId: string }) {
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

type SubRow = { id: string; content: string; status: string; grade: string | null; feedback: string | null; submittedAt: string; student: { id: string; name: string | null; email: string } };

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

/* ---------------- Progress / gradebook ---------------- */

type GradebookSub = { assignmentId: string; status: string; grade: string | null };
type GradebookRow = { id: string; name: string | null; email: string; lessonsViewed: number; submissions: GradebookSub[] };
type Gradebook = { totalLessons: number; assignments: { id: string; title: string }[]; students: GradebookRow[] };

function ProgressTab({ classId }: { classId: string }) {
  const [data, setData] = useState<Gradebook | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/classes/${classId}/progress`, { cache: "no-store" });
      const json: ApiResponse<Gradebook> = await res.json();
      if (json.success) setData(json.data);
    })();
  }, [classId]);

  if (!data) return <Muted>Loading progress…</Muted>;
  if (data.students.length === 0) return <Muted>No students yet.</Muted>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", color: "var(--ink-dim)" }}>
            <th style={thCell}>Student</th>
            <th style={thCell}>Lessons</th>
            {data.assignments.map((a) => (
              <th key={a.id} style={thCell} title={a.title}>
                <span style={{ display: "inline-block", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", verticalAlign: "bottom" }}>{a.title}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.students.map((s) => (
            <tr key={s.id} style={{ borderTop: "1px dashed var(--ink-faint)" }}>
              <td style={tdCell}>
                <div style={{ fontSize: 14 }}>{s.name ?? s.email}</div>
                <div style={{ fontSize: 11, color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>{s.email}</div>
              </td>
              <td style={tdCell}>
                <span style={{ fontFamily: "var(--font-mono)" }}>{s.lessonsViewed}/{data.totalLessons}</span>
              </td>
              {s.submissions.map((sub) => (
                <td key={sub.assignmentId} style={tdCell}>
                  <GradeCell sub={sub} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GradeCell({ sub }: { sub: GradebookSub }) {
  if (sub.status === "NONE") return <span style={{ color: "var(--ink-faint)" }}>—</span>;
  if (sub.status === "GRADED" || sub.status === "RETURNED") {
    return <span style={{ color: "var(--accent)", fontWeight: 600 }}>{sub.grade ?? "graded"}</span>;
  }
  return <span style={{ color: "var(--ink-dim)", fontFamily: "var(--font-mono)", fontSize: 12 }}>submitted</span>;
}

/* ---------------- Settings (invite code + edit/delete) ---------------- */

function SettingsTab({ klass, onChange }: { klass: ClassDetail; onChange: () => void }) {
  const [working, setWorking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState({ inviteCode: klass.inviteCode, inviteCodeEnabled: klass.inviteCodeEnabled });

  async function generateCode() {
    setWorking(true); setErr(null);
    try {
      const res = await fetch(`/api/classes/${klass.id}/invite-code`, { method: "POST" });
      const json: ApiResponse<{ inviteCode: string; inviteCodeEnabled: boolean }> = await res.json();
      if (!json.success) { setErr(json.error); return; }
      setCode(json.data);
    } finally { setWorking(false); }
  }
  async function toggleEnabled(enabled: boolean) {
    setWorking(true); setErr(null);
    try {
      const res = await fetch(`/api/classes/${klass.id}/invite-code`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const json: ApiResponse<{ inviteCode: string | null; inviteCodeEnabled: boolean }> = await res.json();
      if (!json.success) { setErr(json.error); return; }
      setCode(json.data);
    } finally { setWorking(false); }
  }
  async function copyCode() {
    if (!code.inviteCode) return;
    await navigator.clipboard.writeText(code.inviteCode);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }
  async function deleteClass() {
    if (!confirm(`Delete "${klass.name}"? This removes all lessons, assignments, and the roster. This cannot be undone.`)) return;
    const res = await fetch(`/api/classes/${klass.id}`, { method: "DELETE" });
    const json: ApiResponse<unknown> = await res.json();
    if (json.success) window.location.href = "/teacher/classes";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ border: "1.5px dashed var(--stroke)", borderRadius: 14, background: "var(--surface)", padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Invite code</div>
          {code.inviteCode && (
            <button
              onClick={copyCode}
              title="Copy invite code"
              aria-label="Copy invite code"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, border: "1.2px solid var(--stroke)", background: "var(--bg)", color: "var(--ink)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
        {code.inviteCode ? (
          <>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 36, fontWeight: 700, letterSpacing: 4, padding: "16px 20px", borderRadius: 10, background: "var(--bg)", border: "1.4px solid var(--stroke)", textAlign: "center" }}>
              {code.inviteCode}
            </div>
            <p style={{ color: "var(--ink-dim)", fontSize: 14, margin: 0 }}>
              {code.inviteCodeEnabled ? "Joining is enabled." : "Joining is disabled — students can't use this code right now."}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn onClick={copyCode}>{copied ? "Copied!" : "Copy code"}</Btn>
              <Btn onClick={generateCode} style={{ opacity: working ? 0.5 : 1 }}>{working ? "Working…" : "Regenerate"}</Btn>
              <Btn onClick={() => toggleEnabled(!code.inviteCodeEnabled)} style={{ marginLeft: "auto", opacity: working ? 0.5 : 1 }}>
                {code.inviteCodeEnabled ? "Disable joining" : "Enable joining"}
              </Btn>
            </div>
          </>
        ) : (
          <>
            <p style={{ color: "var(--ink-dim)", fontSize: 14, margin: 0 }}>Generate an invite code so students can request to join.</p>
            <div><Btn variant="primary" onClick={generateCode} style={{ opacity: working ? 0.5 : 1 }}>{working ? "Generating…" : "Generate invite code"}</Btn></div>
          </>
        )}
        {err && <div style={{ color: "var(--danger)", fontSize: 14 }}>{err}</div>}
      </div>

      <div style={{ border: "1.5px dashed var(--danger)", borderRadius: 14, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--danger)" }}>Danger zone</div>
        <p style={{ color: "var(--ink-dim)", fontSize: 14, margin: 0 }}>Deleting a class is permanent.</p>
        <div><button onClick={deleteClass} style={denyBtn}>Delete this class</button></div>
      </div>
    </div>
  );
}

/* ---------------- shared bits ---------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 13, color: "var(--ink-dim)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
      {children}
    </div>
  );
}
function RowCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", border: "1.2px dashed var(--ink-faint)", borderRadius: 10 }}>
      {children}
    </div>
  );
}
function PersonCell({ person }: { person: { name: string | null; email: string } }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 16 }}>{person.name ?? person.email}</div>
      <div style={{ fontSize: 12, color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>{person.email}</div>
    </div>
  );
}
function Muted({ children }: { children: React.ReactNode }) {
  return <div style={{ color: "var(--ink-dim)", fontSize: 14, padding: "8px 0" }}>{children}</div>;
}

const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 };
const modalStyle: React.CSSProperties = { background: "var(--surface)", border: "1.5px solid var(--stroke)", borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", gap: 12 };
const inputStyle: React.CSSProperties = { padding: "10px 12px", borderRadius: 10, border: "1.4px solid var(--stroke)", background: "var(--bg)", color: "var(--ink)", fontSize: 15, outline: "none" };
const ghostBtn: React.CSSProperties = { padding: "8px 14px", borderRadius: 999, border: "1.4px solid var(--stroke)", background: "transparent", color: "var(--ink)", fontSize: 14, cursor: "pointer" };
const ghostSmall: React.CSSProperties = { padding: "6px 12px", borderRadius: 999, border: "1.2px solid var(--ink-faint)", background: "transparent", color: "var(--ink)", fontSize: 13, cursor: "pointer" };
const primaryBtn: React.CSSProperties = { padding: "8px 16px", borderRadius: 999, border: "1.4px solid var(--accent)", background: "var(--accent-soft)", color: "var(--accent)", fontSize: 14, cursor: "pointer" };
const approveBtn: React.CSSProperties = { padding: "6px 14px", borderRadius: 999, border: "1.4px solid var(--accent)", background: "var(--accent-soft)", color: "var(--accent)", fontSize: 13, cursor: "pointer" };
const denyBtn: React.CSSProperties = { padding: "6px 14px", borderRadius: 999, border: "1.2px solid var(--danger)", background: "transparent", color: "var(--danger)", fontSize: 13, cursor: "pointer" };
const reorderBtn: React.CSSProperties = { width: 22, height: 18, lineHeight: "14px", fontSize: 10, borderRadius: 5, border: "1.1px solid var(--ink-faint)", background: "transparent", color: "var(--ink-dim)", cursor: "pointer", padding: 0 };
const thCell: React.CSSProperties = { padding: "8px 12px", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" };
const tdCell: React.CSSProperties = { padding: "10px 12px", verticalAlign: "top", whiteSpace: "nowrap" };
