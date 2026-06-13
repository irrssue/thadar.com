"use client";

import { useCallback, useEffect, useState, use } from "react";
import Link from "next/link";
import FloatingNav from "../../components/FloatingNav";
import CommandBar from "../../components/CommandBar";
import Icon from "../../components/Icon";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

type ClassInfo = {
  id: string;
  name: string;
  description: string | null;
  role: "TEACHER" | "STUDENT";
  owner: { name: string | null };
  _count: { memberships: number };
};

type Lesson = { id: string; title: string; content: string; order: number; viewed: boolean };

type StudentSub = { id: string; status: string; grade: string | null; submittedAt: string };
type Assignment = {
  id: string;
  title: string;
  instructions: string;
  dueAt: string | null;
  createdAt: string;
  submissions: StudentSub[];
};

type Tab = "lessons" | "assignments" | "progress";

export default function StudentClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [active, setActiveNav] = useState("classes");
  const [info, setInfo] = useState<ClassInfo | null>(null);
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [assignments, setAssignments] = useState<Assignment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("lessons");

  const load = useCallback(async () => {
    setError(null);
    const [ci, ls, as] = await Promise.all([
      fetch(`/api/classes/${id}`, { cache: "no-store" }).then((r) => r.json() as Promise<ApiResponse<ClassInfo>>),
      fetch(`/api/classes/${id}/lessons`, { cache: "no-store" }).then((r) => r.json() as Promise<ApiResponse<Lesson[]>>),
      fetch(`/api/classes/${id}/assignments`, { cache: "no-store" }).then((r) => r.json() as Promise<ApiResponse<Assignment[]>>),
    ]);
    if (!ci.success) { setError(ci.error); return; }
    setInfo(ci.data);
    if (ls.success) setLessons(ls.data);
    if (as.success) setAssignments(as.data);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="app-page" style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 56px 160px" }}>
        <Link href="/classes" style={{ color: "var(--ink-dim)", fontSize: 14, textDecoration: "none" }}>← Classes</Link>

        {error && !info && <div style={{ color: "var(--danger)", marginTop: 16 }}>{error}</div>}
        {!info && !error && <div style={{ color: "var(--ink-dim)", padding: "32px 0" }}>Loading…</div>}

        {info && (
          <>
            <h1 style={{ fontWeight: 600, fontSize: 44, margin: "12px 0 4px", letterSpacing: "-0.5px" }}>{info.name}</h1>
            {info.description && (
              <p style={{ color: "var(--ink-dim)", fontSize: 17, margin: "0 0 12px", fontWeight: 300 }}>{info.description}</p>
            )}
            <div style={{ display: "flex", gap: 14, color: "var(--ink-dim)", fontSize: 14, marginBottom: 24 }}>
              {info.owner.name && <span>Teacher: {info.owner.name}</span>}
              <span>{info._count.memberships} students</span>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 22, flexWrap: "wrap" }}>
              {([
                { id: "lessons", label: "Lessons" },
                { id: "assignments", label: "Assignments" },
                { id: "progress", label: "Progress" },
              ] as { id: Tab; label: string }[]).map((t) => (
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

            {tab === "lessons" && <LessonsList classId={id} lessons={lessons} />}
            {tab === "assignments" && <AssignmentsList classId={id} assignments={assignments} />}
            {tab === "progress" && <Progress lessons={lessons} assignments={assignments} />}
          </>
        )}

        <CommandBar />
      </div>
      <FloatingNav active={active} onChange={setActiveNav} />
    </>
  );
}

function LessonsList({ classId, lessons }: { classId: string; lessons: Lesson[] | null }) {
  if (!lessons) return <Muted>Loading lessons…</Muted>;
  if (lessons.length === 0) return <Empty>No lessons published yet. Check back soon.</Empty>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {lessons.map((l, i) => (
        <Link key={l.id} href={`/classes/${classId}/lessons/${l.id}`} style={rowLink}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-faint)", width: 28 }}>{String(i + 1).padStart(2, "0")}</span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 17 }}>{l.title}</span>
          {l.viewed ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--accent)", fontSize: 13 }}>
              <Icon name="check" size={15} /> Done
            </span>
          ) : (
            <span style={{ color: "var(--ink-faint)", fontSize: 13 }}>Not started</span>
          )}
          <Icon name="arrow-right" size={16} />
        </Link>
      ))}
    </div>
  );
}

function AssignmentsList({ classId, assignments }: { classId: string; assignments: Assignment[] | null }) {
  if (!assignments) return <Muted>Loading assignments…</Muted>;
  if (assignments.length === 0) return <Empty>No assignments yet.</Empty>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {assignments.map((a) => {
        const sub = a.submissions[0];
        const overdue = a.dueAt && !sub && new Date(a.dueAt) < new Date();
        return (
          <Link key={a.id} href={`/classes/${classId}/assignments/${a.id}`} style={rowLink}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 17 }}>{a.title}</span>
              <span style={{ display: "block", fontSize: 12, color: overdue ? "var(--danger)" : "var(--ink-dim)", fontFamily: "var(--font-mono)" }}>
                {a.dueAt ? `due ${new Date(a.dueAt).toLocaleDateString()}` : "no due date"}
                {overdue ? " · overdue" : ""}
              </span>
            </span>
            <StatusPill sub={sub} />
            <Icon name="arrow-right" size={16} />
          </Link>
        );
      })}
    </div>
  );
}

function StatusPill({ sub }: { sub: StudentSub | undefined }) {
  let label = "Not submitted";
  let color = "var(--ink-faint)";
  if (sub) {
    if (sub.status === "GRADED" || sub.status === "RETURNED") {
      label = sub.grade ? `Graded · ${sub.grade}` : "Graded";
      color = "var(--accent)";
    } else {
      label = "Submitted";
      color = "var(--ink-dim)";
    }
  }
  return <span style={{ fontSize: 13, color }}>{label}</span>;
}

function Progress({ lessons, assignments }: { lessons: Lesson[] | null; assignments: Assignment[] | null }) {
  if (!lessons || !assignments) return <Muted>Loading…</Muted>;
  const lessonsDone = lessons.filter((l) => l.viewed).length;
  const submitted = assignments.filter((a) => a.submissions.length > 0).length;
  const graded = assignments.filter((a) => a.submissions[0] && (a.submissions[0].status === "GRADED" || a.submissions[0].status === "RETURNED"));
  const pct = lessons.length ? Math.round((lessonsDone / lessons.length) * 100) : 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={cardBox}>
        <div style={{ fontSize: 14, color: "var(--ink-dim)", marginBottom: 8 }}>Lessons completed</div>
        <div style={{ fontSize: 28, fontWeight: 700 }}>{lessonsDone} / {lessons.length}</div>
        <div style={{ marginTop: 12, height: 8, borderRadius: 999, background: "var(--bg)", overflow: "hidden", border: "1px solid var(--ink-faint)" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "var(--accent)" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
        <div style={{ ...cardBox, flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 14, color: "var(--ink-dim)", marginBottom: 8 }}>Assignments submitted</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{submitted} / {assignments.length}</div>
        </div>
        <div style={{ ...cardBox, flex: 1, minWidth: 160 }}>
          <div style={{ fontSize: 14, color: "var(--ink-dim)", marginBottom: 8 }}>Grades received</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{graded.length}</div>
        </div>
      </div>
      {graded.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 13, color: "var(--ink-dim)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1 }}>Recent grades</div>
          {graded.map((a) => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", border: "1.2px dashed var(--ink-faint)", borderRadius: 10 }}>
              <span>{a.title}</span>
              <strong style={{ color: "var(--accent)" }}>{a.submissions[0].grade}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const rowLink: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
  border: "1px solid var(--ink-faint)", borderRadius: 12, background: "var(--surface)",
  textDecoration: "none", color: "var(--ink)",
};
const cardBox: React.CSSProperties = {
  border: "1px solid var(--ink-faint)", borderRadius: 14, background: "var(--surface)", padding: "18px 20px",
};

function Muted({ children }: { children: React.ReactNode }) {
  return <div style={{ color: "var(--ink-dim)", fontSize: 14, padding: "8px 0" }}>{children}</div>;
}
function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid var(--ink-faint)", borderRadius: 14, background: "var(--surface)", padding: "48px 24px", textAlign: "center", color: "var(--ink-dim)", fontSize: 14 }}>
      {children}
    </div>
  );
}
