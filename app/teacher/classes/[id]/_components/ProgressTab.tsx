"use client";

import { useEffect, useState } from "react";
import type { ApiResponse, Gradebook, GradebookSub } from "./types";
import { Muted, thCell, tdCell } from "./ui";

/* ---------------- Progress / gradebook ---------------- */

export function ProgressTab({ classId }: { classId: string }) {
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
