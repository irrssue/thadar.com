"use client";

import { useEffect, useMemo, useState } from "react";
import StudentShell from "@/components/student/StudentShell";
import { subjectColor } from "@/components/student/subject";
import { dueInfo } from "@/components/student/dates";
import { Donut, VBars, CountUp, type Bar } from "@/components/student/charts";

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

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

const FILTERS = [
  ["all", "All"],
  ["today", "Due today"],
  ["week", "This week"],
  ["over", "Overdue"],
  ["done", "Done"],
] as const;

type FilterKey = (typeof FILTERS)[number][0];

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export default function AssignmentsPage() {
  const [feed, setFeed] = useState<FeedItem[] | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [active, setActive] = useState<FeedItem | null>(null);

  async function load() {
    const res = await fetch("/api/assignments", { cache: "no-store" });
    const json: ApiResponse<FeedItem[]> = await res.json();
    if (json.success) setFeed(json.data);
  }

  useEffect(() => {
    load();
  }, []);

  const list = (feed ?? []).filter((t) => {
    const done = !!t.submission;
    const st = dueInfo(t.dueAt).state;
    switch (filter) {
      case "done":
        return done;
      case "today":
        return !done && st === "today";
      case "over":
        return !done && st === "over";
      case "week":
        return !done && (st === "today" || st === "soon");
      default:
        return true;
    }
  });

  const overview = useMemo(() => {
    const items = feed ?? [];
    const done = items.filter((t) => !!t.submission).length;
    const open = items.length - done;
    const overdue = items.filter((t) => !t.submission && dueInfo(t.dueAt).state === "over").length;
    const todayN = items.filter((t) => !t.submission && dueInfo(t.dueAt).state === "today").length;

    // workload across the next 5 days (open assignments, by due day)
    const today = startOfDay(new Date());
    const workload: Bar[] = [];
    for (let i = 0; i < 5; i++) {
      const day = today + i * 86_400_000;
      const count = items.filter(
        (t) => !t.submission && t.dueAt && startOfDay(new Date(t.dueAt)) === day,
      ).length;
      workload.push({
        label: new Date(day).toLocaleDateString(undefined, { weekday: "short" }),
        value: count,
        color: i === 0 ? "var(--accent)" : "var(--accent-line)",
      });
    }

    return { done, open, overdue, todayN, workload, total: items.length };
  }, [feed]);

  const { done, open, overdue, todayN, workload, total } = overview;
  const onTrack = done + open > 0 ? Math.round((done / (done + open)) * 100) : 0;

  return (
    <StudentShell active="assign">
      <div className="dh">
        <div>
          <h1>
            Your <span className="var">assignments</span>
          </h1>
          <p className="dsub">
            {feed === null
              ? "Loading…"
              : `${total} total · ${todayN} due today · ${overdue} overdue`}
          </p>
        </div>
      </div>

      {/* overview graphics */}
      {feed !== null && total > 0 && (
        <div className="dgrid g-assign reveal" style={{ marginBottom: "var(--gap)" }}>
          <div className="card mini-stat">
            <Donut
              segments={[
                { value: done, color: "var(--good)" },
                { value: open, color: "var(--accent)" },
              ]}
              size={120}
              stroke={14}
            >
              <div className="gauge-num" style={{ fontSize: 24 }}>
                <CountUp to={onTrack} suffix="%" />
              </div>
              <div className="gauge-lab">on track</div>
            </Donut>
            <div className="mini-stat-legend">
              <div className="leg-row">
                <span className="sdot" style={{ background: "var(--good)" }} />
                <span className="leg-l">Done</span>
                <span className="leg-v">{done}</span>
              </div>
              <div className="leg-row">
                <span className="sdot" style={{ background: "var(--accent)" }} />
                <span className="leg-l">Open</span>
                <span className="leg-v">{open}</span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-hd">
              <span className="tile-eyebrow">Workload · next 5 days</span>
              <span className="card-hd-r">open by due date</span>
            </div>
            <VBars h={132} showVal data={workload} />
          </div>
        </div>
      )}

      <div className="filterbar reveal" style={{ animationDelay: "70ms" }}>
        {FILTERS.map(([k, l]) => (
          <button key={k} className={"fpill " + (filter === k ? "on" : "")} onClick={() => setFilter(k)}>
            {l}
          </button>
        ))}
      </div>

      <div className="card reveal" style={{ animationDelay: "110ms" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {list.map((t) => {
            const isDone = !!t.submission;
            const graded = t.submission?.status !== "SUBMITTED" && t.submission?.grade;
            const d = dueInfo(t.dueAt);
            return (
              <button key={t.id} className="task" style={{ padding: "13px 12px" }} onClick={() => setActive(t)}>
                <div
                  className="cbox"
                  style={isDone ? { background: "var(--accent)", borderColor: "var(--accent)" } : {}}
                />
                <div className="body">
                  <div
                    className="ti"
                    style={isDone ? { color: "var(--ink-faint)", textDecoration: "line-through" } : { fontSize: 16 }}
                  >
                    {t.title}
                  </div>
                  <div className="mt">
                    <span className="sdot" style={{ background: subjectColor(t.class.id), width: 7, height: 7 }} />
                    {t.class.name}
                  </div>
                </div>
                <span
                  className={
                    "due-chip " +
                    (isDone ? "done" : d.state === "today" ? "today" : d.state === "over" ? "over" : "")
                  }
                >
                  {graded ? t.submission!.grade : isDone ? "Submitted" : d.label}
                </span>
              </button>
            );
          })}
          {feed !== null && list.length === 0 && (
            <div style={{ color: "var(--ink-dim)", padding: "20px 12px" }}>
              Nothing here — you&apos;re all caught up.
            </div>
          )}
          {feed === null && <div style={{ color: "var(--ink-dim)", padding: "20px 12px" }}>Loading…</div>}
        </div>
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
    </StudentShell>
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
        <div style={{ fontSize: 22, fontWeight: 700 }}>{item.title}</div>
        <div style={{ fontSize: 12, color: "var(--ink-dim)", fontFamily: "var(--font-mono)" }}>
          {item.class.name}
          {item.dueAt ? ` · due ${new Date(item.dueAt).toLocaleString()}` : ""}
        </div>
        {item.instructions && (
          <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
            {item.instructions}
          </div>
        )}

        {item.submission && (
          <div
            style={{
              border: "1px solid var(--stroke)",
              borderRadius: 10,
              padding: "10px 12px",
              fontSize: 13,
              color: "var(--ink-dim)",
            }}
          >
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
            style={textareaStyle}
          />
          {err && <div style={{ color: "var(--danger)", fontSize: 14 }}>{err}</div>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={onClose} className="btn">
              Close
            </button>
            <button type="submit" disabled={submitting || !content.trim()} className="btn primary">
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
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
  padding: 16,
};

const modalStyle: React.CSSProperties = {
  background: "var(--bg-2)",
  border: "1px solid var(--stroke-2)",
  borderRadius: 17,
  padding: 24,
  display: "flex",
  flexDirection: "column",
  gap: 14,
  boxShadow: "0 30px 60px -20px rgba(0,0,0,0.8)",
};

const textareaStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 11,
  border: "1px solid var(--stroke-2)",
  background: "var(--bg-2)",
  color: "var(--ink)",
  fontSize: 15,
  fontFamily: "var(--font-sans)",
  resize: "vertical",
  outline: "none",
};
