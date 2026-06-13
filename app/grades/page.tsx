"use client";

import { useEffect, useState } from "react";
import StudentShell from "../components/student/StudentShell";
import { subjectColor } from "../components/student/subject";

type Submission = {
  id: string;
  status: "SUBMITTED" | "GRADED" | "RETURNED";
  grade: string | null;
  submittedAt: string;
};

type FeedItem = {
  id: string;
  title: string;
  dueAt: string | null;
  class: { id: string; name: string };
  submission: Submission | null;
};

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

export default function GradesPage() {
  const [feed, setFeed] = useState<FeedItem[] | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/assignments", { cache: "no-store" });
      const json: ApiResponse<FeedItem[]> = await res.json();
      if (json.success) setFeed(json.data);
    })();
  }, []);

  const graded = (feed ?? []).filter(
    (f) => f.submission && f.submission.status !== "SUBMITTED" && f.submission.grade,
  );

  // group by class, most-recent grade first within each
  const byClass = new Map<string, { name: string; items: FeedItem[] }>();
  for (const g of graded) {
    const entry = byClass.get(g.class.id) ?? { name: g.class.name, items: [] };
    entry.items.push(g);
    byClass.set(g.class.id, entry);
  }
  const classRows = [...byClass.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name));

  return (
    <StudentShell active="grades">
      <div className="dh">
        <div>
          <h1>
            Your <span className="var">grades</span>
          </h1>
          <p className="dsub">
            {feed === null ? "Loading…" : `${graded.length} graded this term`}
          </p>
        </div>
      </div>

      <div className="dgrid d-2">
        <div className="card">
          <div className="tile-eyebrow" style={{ marginBottom: 14 }}>
            By class
          </div>
          {classRows.length === 0 ? (
            <div className="empty">No grades yet.</div>
          ) : (
            <table className="gtable">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Graded</th>
                  <th style={{ textAlign: "right" }}>Latest</th>
                </tr>
              </thead>
              <tbody>
                {classRows.map(([id, { name, items }]) => {
                  const color = subjectColor(id);
                  const latest = items[items.length - 1];
                  return (
                    <tr key={id}>
                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
                          <span className="sdot" style={{ background: color }} />
                          {name}
                        </span>
                      </td>
                      <td className="num" style={{ color: "var(--ink-dim)", fontSize: 13 }}>
                        {items.length}
                      </td>
                      <td className="num" style={{ textAlign: "right", color }}>
                        {latest.submission!.grade}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="tile-eyebrow" style={{ marginBottom: 14 }}>
            Recently graded
          </div>
          {graded.length === 0 ? (
            <div className="empty">Grades from your teachers will show up here.</div>
          ) : (
            <div className="glist">
              {graded
                .slice()
                .reverse()
                .map((g, i) => (
                  <div
                    key={g.id}
                    className="grow"
                    style={{ padding: "10px 0", borderTop: i ? "1px solid var(--stroke)" : "none" }}
                  >
                    <span className="sdot" style={{ background: subjectColor(g.class.id) }} />
                    <div>
                      <div>{g.title}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-dim)" }}>
                        {g.class.name}
                      </div>
                    </div>
                    <span className="gl">{g.submission!.grade}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </StudentShell>
  );
}
