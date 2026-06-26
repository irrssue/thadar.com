"use client";

import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import FloatingNav from "@/components/FloatingNav";
import CommandBar from "@/components/CommandBar";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

type MySubmission = {
  id: string;
  content: string;
  status: string;
  grade: string | null;
  feedback: string | null;
  submittedAt: string;
};
type AssignmentDetail = {
  id: string;
  title: string;
  instructions: string;
  dueAt: string | null;
  status: string;
  submission: MySubmission | null;
};

export default function AssignmentPage({ params }: { params: Promise<{ id: string; assignmentId: string }> }) {
  const { id, assignmentId } = use(params);
  const [active, setActiveNav] = useState("classes");
  const [data, setData] = useState<AssignmentDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const res = await fetch(`/api/assignments/${assignmentId}`, { cache: "no-store" });
    const json: ApiResponse<AssignmentDetail> = await res.json();
    if (!json.success) { setError(json.error); return; }
    setData(json.data);
    setText(json.data.submission?.content ?? "");
  }, [assignmentId]);

  useEffect(() => { load(); }, [load]);

  async function submit() {
    if (!text.trim() || saving) return;
    setSaving(true);
    setSaveErr(null);
    try {
      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: text.trim() }),
      });
      const json: ApiResponse<unknown> = await res.json();
      if (!json.success) { setSaveErr(json.error); return; }
      await load();
    } finally {
      setSaving(false);
    }
  }

  const sub = data?.submission ?? null;
  const graded = sub && (sub.status === "GRADED" || sub.status === "RETURNED");
  const overdue = data?.dueAt && !sub && new Date(data.dueAt) < new Date();

  return (
    <>
      <div className="app-page" style={{ maxWidth: 760, margin: "0 auto", padding: "40px 56px 160px" }}>
        <Link href={`/classes/${id}`} style={{ color: "var(--ink-dim)", fontSize: 14, textDecoration: "none" }}>← Back to class</Link>

        {error && <div style={{ color: "var(--danger)", marginTop: 16 }}>{error}</div>}
        {!data && !error && <div style={{ color: "var(--ink-dim)", padding: "32px 0" }}>Loading…</div>}

        {data && (
          <>
            <h1 style={{ fontWeight: 600, fontSize: 38, margin: "14px 0 6px", letterSpacing: "-0.5px", lineHeight: 1.15 }}>{data.title}</h1>
            <div style={{ fontSize: 13, color: overdue ? "var(--danger)" : "var(--ink-dim)", fontFamily: "var(--font-mono)", marginBottom: 20 }}>
              {data.dueAt ? `due ${new Date(data.dueAt).toLocaleString()}` : "no due date"}{overdue ? " · overdue" : ""}
            </div>

            {data.instructions.trim() && (
              <div style={{ fontSize: 16, lineHeight: 1.7, whiteSpace: "pre-wrap", marginBottom: 28, color: "var(--ink)" }}>{data.instructions}</div>
            )}

            {graded && sub && (
              <div style={{ border: "1.5px solid var(--accent)", background: "var(--accent-soft)", borderRadius: 14, padding: "18px 20px", marginBottom: 24 }}>
                <div style={{ fontSize: 13, color: "var(--ink-dim)", marginBottom: 6 }}>Your grade</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "var(--accent)" }}>{sub.grade}</div>
                {sub.feedback && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 13, color: "var(--ink-dim)", marginBottom: 4 }}>Feedback</div>
                    <div style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{sub.feedback}</div>
                  </div>
                )}
              </div>
            )}

            <div style={{ fontSize: 13, color: "var(--ink-dim)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
              {sub ? "Your submission" : "Submit your work"}
            </div>
            {sub && (
              <div style={{ fontSize: 12, color: "var(--ink-dim)", marginBottom: 10 }}>
                {sub.status === "SUBMITTED" ? "Submitted" : sub.status.toLowerCase()} on {new Date(sub.submittedAt).toLocaleString()}
                {graded ? "" : " · you can resubmit until it's graded"}
              </div>
            )}

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your answer here…"
              rows={10}
              disabled={!!graded}
              style={{
                width: "100%", padding: "14px 16px", borderRadius: 12, border: "1.4px solid var(--stroke)",
                background: graded ? "var(--surface)" : "var(--bg)", color: "var(--ink)", fontSize: 15,
                fontFamily: "inherit", lineHeight: 1.6, resize: "vertical", outline: "none",
                opacity: graded ? 0.8 : 1,
              }}
            />
            {saveErr && <div style={{ color: "var(--danger)", fontSize: 14, marginTop: 8 }}>{saveErr}</div>}
            {!graded && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <button
                  onClick={submit}
                  disabled={saving || !text.trim()}
                  style={{
                    padding: "10px 20px", borderRadius: 999, border: "1.4px solid var(--accent)",
                    background: "var(--accent-soft)", color: "var(--accent)", fontSize: 15, cursor: "pointer",
                    opacity: saving || !text.trim() ? 0.5 : 1,
                  }}
                >
                  {saving ? "Submitting…" : sub ? "Resubmit" : "Submit"}
                </button>
              </div>
            )}
          </>
        )}

        <CommandBar />
      </div>
      <FloatingNav active={active} onChange={setActiveNav} />
    </>
  );
}
