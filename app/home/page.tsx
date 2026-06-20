"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import StudentShell from "../components/student/StudentShell";
import StudentIcon from "../components/student/StudentIcon";
import { subjectColor, initials } from "../components/student/subject";
import { dueInfo, todayLine } from "../components/student/dates";
import { MiniRing, MiniSpark, CountUp } from "../components/student/charts";
import { gradePercent, letterFromPercent, gpaFromPercents } from "../components/student/grades";

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

type Membership = {
  id: string;
  status: "ACTIVE" | "PENDING";
  class: {
    id: string;
    name: string;
    owner: { name: string | null };
    _count: { lessons: number };
  };
};

type Person = { id: string; name: string | null; email: string };
type Mail = {
  id: string;
  subject: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  sender: Person;
};

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [feed, setFeed] = useState<FeedItem[] | null>(null);
  const [classes, setClasses] = useState<Membership[] | null>(null);
  const [mail, setMail] = useState<{ messages: Mail[]; unread: number } | null>(null);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  useEffect(() => {
    (async () => {
      const [a, m, x] = await Promise.all([
        fetch("/api/assignments", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/memberships", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/messages?box=inbox", { cache: "no-store" }).then((r) => r.json()),
      ]);
      if ((a as ApiResponse<FeedItem[]>).success) setFeed(a.data);
      if ((m as ApiResponse<Membership[]>).success) setClasses(m.data);
      if ((x as ApiResponse<{ messages: Mail[]; unread: number }>).success)
        setMail({ messages: x.data.messages, unread: x.data.unread });
    })();
  }, []);

  const due = (feed ?? []).filter((f) => !f.submission);
  const dueToday = due.filter((f) => dueInfo(f.dueAt).state === "today").length;
  const activeClasses = (classes ?? []).filter((c) => c.status === "ACTIVE");
  const latest = mail?.messages[0] ?? null;
  const unread = mail?.unread ?? 0;

  // derived grade signal (GPA, sparkline, recent) from the feed
  const grades = useMemo(() => {
    const items = feed ?? [];
    const graded = items
      .filter((f) => f.submission && f.submission.status !== "SUBMITTED" && f.submission.grade)
      .map((f) => ({ ...f, pct: gradePercent(f.submission!.grade), when: new Date(f.submission!.submittedAt).getTime() }))
      .filter((g): g is FeedItem & { pct: number; when: number } => g.pct != null)
      .sort((a, b) => a.when - b.when);
    const percents = graded.map((g) => g.pct);
    const gpa = gpaFromPercents(percents);
    return { graded, percents, gpa, recent: graded.slice(-3).reverse() };
  }, [feed]);

  // latest grade letter per active class for the class minis
  const classLetter = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const f of feed ?? []) {
      if (f.submission && f.submission.status !== "SUBMITTED" && f.submission.grade) {
        const pct = gradePercent(f.submission.grade);
        if (pct != null) map.set(f.class.id, [...(map.get(f.class.id) ?? []), pct]);
      }
    }
    const out = new Map<string, string>();
    for (const [id, pcts] of map) out.set(id, letterFromPercent(Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length)));
    return out;
  }, [feed]);

  // soonest upcoming due label per class
  const classNext = useMemo(() => {
    const map = new Map<string, string>();
    const items = [...(feed ?? [])]
      .filter((f) => !f.submission && f.dueAt)
      .sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime());
    for (const f of items) if (!map.has(f.class.id)) map.set(f.class.id, dueInfo(f.dueAt).label);
    return map;
  }, [feed]);

  return (
    <StudentShell active="home">
      <div className="hero reveal">
        <h1 className="greet">
          Welcome back,{" "}
          <Link href="/profile" className="var">
            {firstName}
          </Link>
        </h1>
        <p className="subline">
          <span>{todayLine()}</span>
          {due.length > 0 && (
            <>
              <span className="sep">·</span>
              <b>{dueToday > 0 ? dueToday : due.length}</b> {dueToday > 0 ? "due today" : "open"}
            </>
          )}
          {grades.gpa != null && (
            <>
              <span className="sep">·</span>
              <span>GPA {grades.gpa.toFixed(2)}</span>
            </>
          )}
          {unread > 0 && (
            <>
              <span className="sep">·</span>
              <span className="hot">{unread} unread</span>
            </>
          )}
        </p>
      </div>

      {/* most-recent message strip */}
      {latest && (
        <Link href="/inbox" className="recent-mail reveal" style={{ animationDelay: "60ms" }}>
          <span
            className="av-sm"
            style={{
              background: `color-mix(in srgb, ${subjectColor(latest.sender.id)} 22%, transparent)`,
              color: subjectColor(latest.sender.id),
            }}
          >
            {initials(latest.sender.name ?? latest.sender.email)}
          </span>
          <div className="rm-body">
            <div className="rm-from">
              {!latest.readAt && <span className="udot" />}
              {latest.sender.name ?? latest.sender.email}
              <span className="rm-tag">· latest message</span>
            </div>
            <div className="rm-prev">
              {latest.subject} — {latest.body}
            </div>
          </div>
          <span className="rm-when">{new Date(latest.createdAt).toLocaleDateString()}</span>
          <span className="rm-open">
            Inbox <StudentIcon name="arrow" size={13} />
          </span>
        </Link>
      )}

      <div className="bento-min stagger">
        {/* ---- Due soon ---- */}
        <button className="tile link area-due" onClick={() => router.push("/assignments")}>
          <div className="tile-hd">
            <div>
              <div className="tile-eyebrow">
                {due.length} open{dueToday > 0 ? ` · ${dueToday} due today` : ""}
              </div>
              <div className="tile-title">Due soon</div>
            </div>
            <span className="tile-open">
              open <StudentIcon name="arrow" size={13} />
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {feed === null && <div className="empty">Loading…</div>}
            {feed !== null && due.length === 0 && (
              <div className="empty">You&apos;re all caught up. Nothing due.</div>
            )}
            {due.slice(0, 4).map((t) => {
              const d = dueInfo(t.dueAt);
              return (
                <div key={t.id} className="task" style={{ cursor: "default" }}>
                  <div className="cbox" />
                  <div className="body">
                    <div className="ti">{t.title}</div>
                    <div className="mt">
                      <span className="sdot" style={{ background: subjectColor(t.class.id), width: 7, height: 7 }} />
                      {t.class.name}
                    </div>
                  </div>
                  <span className={"due-chip " + (d.state === "today" ? "today" : d.state === "over" ? "over" : "")}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
          {due.length > 4 && (
            <div className="tile-foot">
              <span>+{due.length - 4} more</span>
              <span className="go">
                All assignments <StudentIcon name="arrow" size={12} />
              </span>
            </div>
          )}
        </button>

        {/* ---- Classes ---- */}
        <button className="tile link area-class" onClick={() => router.push("/classes")}>
          <div className="tile-hd">
            <div>
              <div className="tile-eyebrow">Enrolled</div>
              <div className="tile-title">Classes</div>
            </div>
            <span className="tile-count">{activeClasses.length} active</span>
          </div>
          <div className="cgrid">
            {classes === null && <div className="empty">Loading…</div>}
            {classes !== null && activeClasses.length === 0 && (
              <div className="empty">No classes yet — join one from the Classes page.</div>
            )}
            {activeClasses.slice(0, 4).map((c) => {
              const color = subjectColor(c.class.id);
              const letter = classLetter.get(c.class.id);
              const next = classNext.get(c.class.id);
              return (
                <div key={c.id} className="cmini" style={{ ["--c" as string]: color }}>
                  <div className="cn">{c.class.name}</div>
                  <div className="tch">{c.class.owner.name ?? "Teacher"}</div>
                  <div className="cfoot">
                    <span className="grade" style={{ color }}>
                      {letter ?? `${c.class._count.lessons} lessons`}
                    </span>
                    {next && <span className="nx">next: {next}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="tile-foot">
            <span>{activeClasses.length} active</span>
            <span className="go">
              Open classes <StudentIcon name="arrow" size={12} />
            </span>
          </div>
        </button>

        {/* ---- Grades ---- */}
        <button className="tile link area-grade" onClick={() => router.push("/grades")}>
          <div className="tile-hd">
            <div>
              <div className="tile-eyebrow">This term</div>
              <div className="tile-title">Grades</div>
            </div>
            <span className="tile-open">
              open <StudentIcon name="arrow" size={13} />
            </span>
          </div>

          {grades.gpa != null ? (
            <div className="gpa-wrap">
              <MiniRing pct={(grades.gpa / 4) * 100} size={66} stroke={7}>
                <div className="ring-mini-num">
                  <CountUp to={grades.gpa} dec={1} />
                </div>
              </MiniRing>
              <div className="gpa-meta">
                GPA · 4.0
                <br />
                <span>{grades.graded.length} graded</span>
              </div>
              {grades.percents.length >= 2 && (
                <div className="gpa-spark">
                  <MiniSpark data={grades.percents} w={84} h={34} />
                </div>
              )}
            </div>
          ) : (
            <div className="empty" style={{ marginBottom: 10 }}>
              {feed === null ? "Loading…" : "No grades yet."}
            </div>
          )}

          <div className="glist">
            {grades.recent.map((g) => (
              <div key={g.id} className="grow">
                <span className="sdot" style={{ background: subjectColor(g.class.id) }} />
                <span className="gn">{g.title}</span>
                <span className="gl">{g.submission!.grade}</span>
              </div>
            ))}
          </div>
          {grades.graded.length > 0 && (
            <div className="tile-foot">
              <span>{grades.graded.length} graded</span>
              <span className="go">
                Grade report <StudentIcon name="arrow" size={12} />
              </span>
            </div>
          )}
        </button>
      </div>
    </StudentShell>
  );
}
