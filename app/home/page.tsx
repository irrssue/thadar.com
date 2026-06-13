"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import FloatingNav from "../components/FloatingNav";
import AskCard from "../components/AskCard";
import CommandBar from "../components/CommandBar";

type Submission = {
  id: string;
  status: "SUBMITTED" | "GRADED" | "RETURNED";
  grade: string | null;
  submittedAt: string;
};

type FeedItem = {
  id: string;
  title: string;
  instructions: string;
  dueAt: string | null;
  class: { id: string; name: string };
  submission: Submission | null;
};

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const { data: session } = useSession();
  const [feed, setFeed] = useState<FeedItem[] | null>(null);
  const [active, setActive] = useState<FeedItem | null>(null);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  async function load() {
    const res = await fetch("/api/assignments", { cache: "no-store" });
    const json: ApiResponse<FeedItem[]> = await res.json();
    if (json.success) setFeed(json.data);
  }

  useEffect(() => {
    load();
  }, []);

  const due = (feed ?? []).filter((f) => !f.submission);
  const subtitle =
    feed === null
      ? "Loading your work…"
      : due.length === 0
        ? "Nothing due right now — you're all caught up."
        : `${due.length} ${due.length === 1 ? "assignment" : "assignments"} waiting for you.`;

  return (
    <>
      <div className="app-page" style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 56px 160px" }}>
        <h1 style={{ fontWeight: 600, fontSize: 48, margin: "0 0 4px", letterSpacing: "-0.5px" }}>
          Welcome, <span style={{ color: "var(--accent)" }}>{firstName}</span>
        </h1>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 28px" }}>
          <p style={{ color: "var(--ink-dim)", fontSize: 16, margin: 0 }}>{subtitle}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 28 }} className="main-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {feed === null && (
              <Panel muted>Loading…</Panel>
            )}
            {feed !== null && feed.length === 0 && (
              <Panel muted>No assignments yet. Join a class to get started.</Panel>
            )}
            {(feed ?? []).map((f) => (
              <button
                key={f.id}
                onClick={() => setActive(f)}
                style={{
                  textAlign: "left",
                  border: "1px solid var(--ink-faint)",
                  borderRadius: 14,
                  background: "var(--surface)",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  cursor: "pointer",
                  color: "inherit",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 500 }}>{f.title}</span>
                  <StatusPill submission={f.submission} />
                </div>
                <span style={{ fontSize: 12, color: "var(--ink-dim)", fontFamily: "var(--font-mono)" }}>
                  {f.class.name}
                  {f.dueAt ? ` · due ${new Date(f.dueAt).toLocaleDateString()}` : ""}
                </span>
              </button>
            ))}
          </div>
          <AskCard />
        </div>

        <CommandBar />
      </div>

      {active && (
        <AssignmentModal
          item={active}
          onClose={() => setActive(null)}
          onSubmitted={() => {
            setActive(null);
            load();
          }}
        />
      )}

      <FloatingNav active={activeTab} onChange={setActiveTab} />

      <style>{`
        @media (max-width: 880px) { .main-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}

function Panel({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <div
      style={{
        border: "1px solid var(--ink-faint)",
        borderRadius: 14,
        background: "var(--surface)",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: muted ? "var(--ink-dim)" : "var(--ink)",
        fontSize: 14,
      }}
    >
      {children}
    </div>
  );
}

function StatusPill({ submission }: { submission: Submission | null }) {
  let label = "to do";
  let color = "var(--ink-dim)";
  if (submission?.status === "GRADED") {
    label = submission.grade ? `graded · ${submission.grade}` : "graded";
    color = "var(--accent-2, var(--accent))";
  } else if (submission) {
    label = "submitted";
    color = "var(--accent)";
  }
  return (
    <span style={{
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      color,
      border: "1px solid var(--ink-faint)",
      borderRadius: 999,
      padding: "2px 8px",
      textTransform: "uppercase",
      letterSpacing: 1,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

function AssignmentModal({
  item,
  onClose,
  onSubmitted,
}: {
  item: FeedItem;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const alreadyGraded = item.submission?.status === "GRADED";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    setSubmitting(true);
    setErr(null);
    try {
      const res = await fetch(`/api/assignments/${item.id}/submit`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      const json: ApiResponse<unknown> = await res.json();
      if (!json.success) {
        setErr(json.error);
        return;
      }
      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalStyle, width: "min(560px, 94vw)" }}>
        <div style={{ fontSize: 22, fontWeight: 600 }}>{item.title}</div>
        <div style={{ fontSize: 12, color: "var(--ink-dim)", fontFamily: "var(--font-mono)" }}>
          {item.class.name}
          {item.dueAt ? ` · due ${new Date(item.dueAt).toLocaleString()}` : ""}
        </div>
        {item.instructions && (
          <div style={{ fontSize: 14, color: "var(--ink-dim)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
            {item.instructions}
          </div>
        )}

        {item.submission && (
          <div style={{
            border: "1px solid var(--ink-faint)",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 13,
            color: "var(--ink-dim)",
          }}>
            {alreadyGraded
              ? `Graded${item.submission.grade ? `: ${item.submission.grade}` : ""}. You can resubmit to try again.`
              : "Submitted. You can resubmit to replace your answer."}
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Type your answer…"
            autoFocus
            style={{
              padding: "12px 14px",
              borderRadius: 10,
              border: "1.4px solid var(--stroke)",
              background: "var(--bg)",
              color: "var(--ink)",
              fontSize: 15,
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
            }}
          />
          {err && <div style={{ color: "var(--danger)", fontSize: 14 }}>{err}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={onClose} style={ghostBtn}>Close</button>
            <button type="submit" disabled={submitting || !content.trim()} style={{ ...primaryBtn, opacity: submitting || !content.trim() ? 0.5 : 1 }}>
              {submitting ? "Submitting…" : item.submission ? "Resubmit" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
};

const modalStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1.5px solid var(--stroke)",
  borderRadius: 14,
  padding: 24,
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const ghostBtn: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 999,
  border: "1.4px solid var(--stroke)",
  background: "transparent",
  color: "var(--ink)",
  fontSize: 14,
  cursor: "pointer",
};

const primaryBtn: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 999,
  border: "1.4px solid var(--accent)",
  background: "var(--accent-soft)",
  color: "var(--accent)",
  fontSize: 14,
  cursor: "pointer",
};
