"use client";

import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import FloatingNav from "../../../../components/FloatingNav";
import CommandBar from "../../../../components/CommandBar";
import Icon from "../../../../components/Icon";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

type Lesson = { id: string; title: string; content: string; videoUrl: string; order: number; published: boolean };
type ListLesson = { id: string; title: string; order: number; viewed: boolean };

export default function LessonReaderPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id, lessonId } = use(params);
  const [active, setActiveNav] = useState("classes");
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [siblings, setSiblings] = useState<ListLesson[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const [lr, sr] = await Promise.all([
      fetch(`/api/lessons/${lessonId}`, { cache: "no-store" }).then((r) => r.json() as Promise<ApiResponse<Lesson>>),
      fetch(`/api/classes/${id}/lessons`, { cache: "no-store" }).then((r) => r.json() as Promise<ApiResponse<ListLesson[]>>),
    ]);
    if (!lr.success) { setError(lr.error); return; }
    setLesson(lr.data);
    if (sr.success) setSiblings(sr.data);
    // Mark as viewed (idempotent) once the lesson loads successfully.
    fetch(`/api/lessons/${lessonId}/view`, { method: "POST" }).catch(() => {});
  }, [id, lessonId]);

  useEffect(() => { load(); }, [load]);

  const idx = siblings.findIndex((s) => s.id === lessonId);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  return (
    <>
      <div className="app-page" style={{ maxWidth: 760, margin: "0 auto", padding: "40px 56px 160px" }}>
        <Link href={`/classes/${id}`} style={{ color: "var(--ink-dim)", fontSize: 14, textDecoration: "none" }}>← Back to class</Link>

        {error && <div style={{ color: "var(--danger)", marginTop: 16 }}>{error}</div>}
        {!lesson && !error && <div style={{ color: "var(--ink-dim)", padding: "32px 0" }}>Loading…</div>}

        {lesson && (
          <>
            <h1 style={{ fontWeight: 600, fontSize: 40, margin: "14px 0 20px", letterSpacing: "-0.5px", lineHeight: 1.15 }}>{lesson.title}</h1>
            {lesson.videoUrl.trim() && (
              <a
                href={lesson.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "var(--accent)", color: "#fff", textDecoration: "none",
                  padding: "12px 20px", borderRadius: 10, fontSize: 16, fontWeight: 600,
                  marginBottom: 24,
                }}
              >
                ▶ Watch lesson video
              </a>
            )}
            {lesson.content.trim() ? (
              <div style={{ fontSize: 17, lineHeight: 1.7, color: "var(--ink)", whiteSpace: "pre-wrap" }}>{lesson.content}</div>
            ) : (
              <div style={{ color: "var(--ink-dim)", fontStyle: "italic" }}>This lesson has no written content yet.</div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--accent)", fontSize: 14, marginTop: 28 }}>
              <Icon name="check" size={16} /> Marked as viewed
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 36, borderTop: "1px solid var(--ink-faint)", paddingTop: 20 }}>
              {prev ? (
                <Link href={`/classes/${id}/lessons/${prev.id}`} style={navLink}>
                  ← {prev.title}
                </Link>
              ) : <span />}
              {next ? (
                <Link href={`/classes/${id}/lessons/${next.id}`} style={{ ...navLink, textAlign: "right" }}>
                  {next.title} →
                </Link>
              ) : <span />}
            </div>
          </>
        )}

        <CommandBar />
      </div>
      <FloatingNav active={active} onChange={setActiveNav} />
    </>
  );
}

const navLink: React.CSSProperties = {
  maxWidth: "48%", color: "var(--ink-dim)", fontSize: 14, textDecoration: "none",
  display: "inline-flex", alignItems: "center", gap: 6, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
};
