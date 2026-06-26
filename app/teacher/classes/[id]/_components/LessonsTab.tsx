"use client";

import { useCallback, useEffect, useState } from "react";
import { Btn } from "../../../components/primitives";
import type { ApiResponse, Lesson } from "./types";
import { RowCard, Muted, reorderBtn, ghostSmall, denyBtn, overlayStyle, modalStyle, inputStyle, ghostBtn, primaryBtn } from "./ui";

/* ---------------- Lessons ---------------- */

export function LessonsTab({ classId }: { classId: string }) {
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
