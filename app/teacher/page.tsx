"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Icon from "../components/Icon";
import { MiniRing, MiniSpark, RadialGauge, CountUp } from "../components/student/charts";
import { initials } from "../components/student/subject";
import {
  type Overview,
  classMetrics,
  gradingQueue,
  roster,
  flagCounts,
} from "../components/teacher/metrics";

type Mail = {
  id: string;
  subject: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  sender: { id: string; name: string | null; email: string };
};
type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

export default function TeacherHome() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const [data, setData] = useState<Overview | null>(null);
  const [mail, setMail] = useState<Mail[]>([]);
  const [unread, setUnread] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [oRes, mRes] = await Promise.all([
      fetch("/api/teacher/overview", { cache: "no-store" }),
      fetch("/api/messages?box=inbox", { cache: "no-store" }),
    ]);
    const oJson: ApiResponse<Overview> = await oRes.json();
    const mJson: ApiResponse<{ unread: number; messages: Mail[] }> = await mRes.json();
    if (oJson.success) setData(oJson.data);
    if (mJson.success) {
      setMail(mJson.data.messages);
      setUnread(mJson.data.unread);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(classId: string, mid: string, action: "approve" | "deny") {
    setBusy(mid);
    try {
      await fetch(`/api/classes/${classId}/members/${mid}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await load();
    } finally {
      setBusy(null);
    }
  }

  const derived = useMemo(() => {
    if (!data) return null;
    const metrics = data.classes.map(classMetrics);
    const queue = gradingQueue(data.classes);
    const rows = roster(data.classes);
    const flags = flagCounts(rows);
    const pending = data.classes.flatMap((c) => c.pending.map((p) => ({ ...p, classId: c.id, className: c.name })));
    return { metrics, queue, rows, flags, pending };
  }, [data]);

  const totals = data?.totals;
  const latest = mail[0];

  return (
    <>
      <div className="hero reveal">
        <h1 className="greet">
          Welcome back, <span className="var">{firstName}</span>
        </h1>
        <p className="subline">
          <span>{today()}</span>
          <span className="sep">·</span>
          <b>{totals ? totals.toGrade : "—"}</b> to grade
          <span className="sep">·</span>
          <span>{derived ? derived.rows.length : "—"} students</span>
          <span className="sep">·</span>
          <span className={unread > 0 ? "hot" : undefined}>{unread} unread</span>
        </p>
      </div>

      {latest && (
        <div className="reveal" style={{ animationDelay: "60ms" }}>
          <Link href="/teacher/inbox" className="recent-mail" style={{ textDecoration: "none" }}>
            <span
              className="av-sm"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              {initials(latest.sender.name ?? latest.sender.email)}
            </span>
            <div className="rm-body">
              <div className="rm-from">
                {!latest.readAt && <span className="udot" />}
                {latest.sender.name ?? latest.sender.email}
                <span className="rm-tag">· latest</span>
              </div>
              <div className="rm-prev">
                {latest.subject} — {latest.body}
              </div>
            </div>
            <span className="rm-when">{new Date(latest.createdAt).toLocaleDateString()}</span>
            <span className="rm-open">
              Inbox <Icon name="arrow-right" size={13} />
            </span>
          </Link>
        </div>
      )}

      <div className="bento-teacher stagger">
        {/* To grade */}
        <Link href="/teacher/assignments" className="tile link" style={{ textDecoration: "none" }}>
          <div className="tile-hd">
            <div>
              <div className="tile-eyebrow">{totals ? `${totals.toGrade} submissions` : "—"}</div>
              <div className="tile-title">To grade</div>
            </div>
            <span className="tile-open">
              open <Icon name="arrow-right" size={13} />
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {!derived && <div className="empty">Loading…</div>}
            {derived && derived.queue.length === 0 && <div className="empty">All caught up — nothing waiting.</div>}
            {derived?.queue.slice(0, 4).map((q) => (
              <div key={q.id} className="task" style={{ cursor: "default" }}>
                <span className="cbox" />
                <div className="body">
                  <div className="ti">{q.title}</div>
                  <div className="mt">
                    <span className="sdot" style={{ background: q.color, width: 7, height: 7 }} />
                    {q.className}
                  </div>
                </div>
                <span className={"due-chip " + (q.urgent ? "over" : "")}>
                  {q.done}/{q.total}
                </span>
              </div>
            ))}
          </div>
          {derived && derived.queue.length > 4 && (
            <div className="tile-foot">
              <span>+{derived.queue.length - 4} more queued</span>
              <span className="go">
                Grade <Icon name="arrow-right" size={12} />
              </span>
            </div>
          )}
        </Link>

        {/* Classes */}
        <Link href="/teacher/classes" className="tile link" style={{ textDecoration: "none" }}>
          <div className="tile-hd">
            <div>
              <div className="tile-eyebrow">{derived ? `${derived.rows.length} students` : "—"}</div>
              <div className="tile-title">Classes</div>
            </div>
            <span className="tile-count">{totals ? `${totals.classes}` : "—"}</span>
          </div>
          <div className="cgrid">
            {derived?.metrics.map((c) => (
              <div key={c.id} className="cmini" style={{ ["--c" as string]: c.color }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <div className="cn" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.name}
                    </div>
                    <div className="tch">{c.activeCount} students</div>
                  </div>
                  <MiniRing pct={c.mastery ?? 0} size={38} stroke={4} color={c.color}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: c.color }}>{c.letter ?? "—"}</div>
                  </MiniRing>
                </div>
                <div className="cfoot">
                  {c.trend.length > 1 ? (
                    <MiniSpark data={c.trend} w={56} h={20} color={c.color} />
                  ) : (
                    <span className="nx">no grades yet</span>
                  )}
                  <span className="nx">{c.toGrade ? `${c.toGrade} to grade` : "clear"}</span>
                </div>
              </div>
            ))}
            {derived && derived.metrics.length === 0 && <div className="empty">No classes yet.</div>}
          </div>
        </Link>

        {/* Needs attention */}
        <Link href="/teacher/students" className="tile link" style={{ textDecoration: "none" }}>
          <div className="tile-hd">
            <div>
              <div className="tile-eyebrow">By recent grades</div>
              <div className="tile-title">Needs attention</div>
            </div>
            <span className="tile-open">
              open <Icon name="arrow-right" size={13} />
            </span>
          </div>
          {derived && (
            <div className="pulse-mini-wrap">
              <RadialGauge
                pct={derived.flags.graded ? (derived.flags.onTrack / derived.flags.graded) * 100 : 0}
                size={66}
                stroke={7}
                color="var(--good)"
              >
                <div className="ring-mini-num" style={{ color: "var(--good)" }}>
                  {derived.flags.onTrack}
                </div>
              </RadialGauge>
              <div className="gpa-meta">
                on track of {derived.flags.graded || "—"}
                <br />
                <span style={{ color: "var(--danger)" }}>{derived.flags.support} support</span> ·{" "}
                <span style={{ color: "var(--accent)" }}>{derived.flags.stretch} stretch</span>
              </div>
            </div>
          )}
          <div className="glist">
            {derived?.rows
              .filter((r) => r.flag)
              .slice(0, 3)
              .map((s) => (
                <div key={s.id} className="grow">
                  <span
                    className="av-sm pulse-av"
                    style={{
                      background: `color-mix(in srgb, ${s.flag === "support" ? "var(--danger)" : "var(--accent)"} 18%, transparent)`,
                      color: s.flag === "support" ? "var(--danger)" : "var(--accent)",
                    }}
                  >
                    {initials(s.name)}
                  </span>
                  <span className="gn">{s.name}</span>
                  <span
                    className="gl"
                    style={{ color: s.flag === "support" ? "var(--danger)" : "var(--accent)", fontSize: 11 }}
                  >
                    {s.flag === "support" ? "needs support" : "ready to stretch"}
                  </span>
                </div>
              ))}
            {derived && derived.rows.filter((r) => r.flag).length === 0 && (
              <div className="empty">Everyone&apos;s on track right now.</div>
            )}
          </div>
        </Link>

        {/* Pending approvals (real, inline actions) */}
        <div className="tile">
          <div className="tile-hd">
            <div>
              <div className="tile-eyebrow">Join requests</div>
              <div className="tile-title">Pending</div>
            </div>
            <span className="tile-count">{derived ? derived.pending.length : "—"}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {!derived && <div className="empty">Loading…</div>}
            {derived && derived.pending.length === 0 && (
              <div className="empty">No requests waiting. You&apos;re all set.</div>
            )}
            {derived?.pending.map((p) => (
              <div key={p.id} className="approw">
                <span className="av-sm" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                  {initials(p.user.name ?? p.user.email)}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.user.name ?? p.user.email}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}>
                    {p.className}
                  </div>
                </div>
                <button className="mini-act approve" disabled={busy === p.id} onClick={() => decide(p.classId, p.id, "approve")}>
                  Approve
                </button>
                <button className="mini-act deny" disabled={busy === p.id} onClick={() => decide(p.classId, p.id, "deny")}>
                  Deny
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function today(): string {
  return new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}
