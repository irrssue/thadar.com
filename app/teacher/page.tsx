"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Icon from "../components/Icon";
import { WfBox, CornerTag, PillStub, Row, Btn, AiInput, Bubble, CommandBar, Avatar } from "./components/primitives";

type OverviewAssignment = { id: string; title: string; status: string; dueAt: string | null; _count: { submissions: number } };
type Member = { id: string; status: string; user: { id: string; name: string | null; email: string } };
type OverviewClass = { id: string; name: string; assignments: OverviewAssignment[]; pending: Member[]; activeCount: number };
type Overview = {
  totals: { classes: number; students: number; pending: number; assignments: number; needsGrading: number };
  classes: OverviewClass[];
};
type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

export default function TeacherHome() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const [data, setData] = useState<Overview | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/teacher/overview", { cache: "no-store" });
    const json: ApiResponse<Overview> = await res.json();
    if (json.success) setData(json.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function decide(classId: string, mid: string, action: "approve" | "deny") {
    setBusy(mid);
    try {
      await fetch(`/api/classes/${classId}/members/${mid}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
      await load();
    } finally { setBusy(null); }
  }

  const gradingQueue = (data?.classes ?? []).flatMap((c) =>
    c.assignments
      .filter((a) => a.status === "PUBLISHED" && a._count.submissions > 0)
      .map((a) => ({ ...a, className: c.name, classId: c.id })),
  );
  const pending = (data?.classes ?? []).flatMap((c) => c.pending.map((p) => ({ ...p, className: c.name, classId: c.id })));

  const subtitle = data
    ? `${data.totals.classes} classes · ${data.totals.students} students · ${data.totals.pending} pending · ${gradingQueue.length} with submissions`
    : "Loading your classroom…";

  return (
    <>
      <h1 style={{ fontWeight: 700, fontSize: 52, margin: "16px 0 4px", letterSpacing: "-0.5px" }}>
        Welcome back,{" "}
        <Link href="/teacher/profile" style={{ color: "var(--accent)", textDecoration: "none" }}>
          {firstName}
        </Link>
      </h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 18, margin: "0 0 28px", fontWeight: 300 }}>{subtitle}</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 28 }} className="teacher-split">
        {/* Grading queue (real) */}
        <WfBox>
          <CornerTag label="to grade" />
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Submissions</div>
            <span style={{ color: "var(--ink-dim)", fontSize: 14, fontWeight: 300 }}>{gradingQueue.length} assignments</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
            {!data && <Muted>Loading…</Muted>}
            {data && gradingQueue.length === 0 && <Muted>No submissions waiting. You&apos;re all caught up.</Muted>}
            {gradingQueue.map((a) => (
              <Link key={a.id} href={`/teacher/classes/${a.classId}`} style={{ textDecoration: "none", color: "inherit" }}>
                <Row>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 17 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-dim)", fontFamily: "var(--font-mono)" }}>{a.className}</div>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", marginLeft: "auto" }}>
                    {a._count.submissions} submitted
                  </div>
                </Row>
              </Link>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <Link href="/teacher/assignments" style={{ textDecoration: "none" }}>
              <Btn variant="primary"><Icon name="pencil" size={14} /> Manage assignments</Btn>
            </Link>
          </div>
        </WfBox>

        {/* Co-teacher AI — showcase placeholder (AI features are post-MVP, plan v5) */}
        <WfBox style={{ display: "flex", flexDirection: "column" }}>
          <CornerTag label="co-teacher · coming soon" />
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontSize: 22, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <Icon name="spark" /> Draft with co-teacher
            </div>
            <span style={{ color: "var(--ink-dim)", fontSize: 14, fontWeight: 300 }}>AI · preview</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "10px 0 14px", minHeight: 160 }}>
            <Bubble>Soon I&apos;ll help you draft assignments, rubrics, and family updates from your curriculum.</Bubble>
            <Bubble me>can&apos;t wait</Bubble>
          </div>
          <AiInput placeholder="AI co-teacher arrives in a later release…" />
        </WfBox>
      </div>

      {/* Pending approvals (real) */}
      <div style={{ marginTop: 28 }}>
        <WfBox>
          <CornerTag label="needs attention" />
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Pending approvals</div>
            <span style={{ color: "var(--ink-dim)", fontSize: 14, fontWeight: 300 }}>{pending.length} waiting</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {!data && <Muted>Loading…</Muted>}
            {data && pending.length === 0 && <Muted>No pending requests right now.</Muted>}
            {pending.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1.2px dashed var(--accent)", borderRadius: 10 }}>
                <Avatar name={p.user.name ?? p.user.email} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16 }}>{p.user.name ?? p.user.email}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>{p.className}</div>
                </div>
                <button onClick={() => decide(p.classId, p.id, "approve")} disabled={busy === p.id} style={approveBtn}>Approve</button>
                <button onClick={() => decide(p.classId, p.id, "deny")} disabled={busy === p.id} style={denyBtn}>Deny</button>
              </div>
            ))}
          </div>
        </WfBox>
      </div>

      <CommandBar />
    </>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <div style={{ color: "var(--ink-dim)", fontSize: 14, padding: "8px 0" }}>{children}</div>;
}
const approveBtn: React.CSSProperties = { padding: "6px 14px", borderRadius: 999, border: "1.4px solid var(--accent)", background: "var(--accent-soft)", color: "var(--accent)", fontSize: 13, cursor: "pointer" };
const denyBtn: React.CSSProperties = { padding: "6px 14px", borderRadius: 999, border: "1.2px solid var(--danger)", background: "transparent", color: "var(--danger)", fontSize: 13, cursor: "pointer" };
