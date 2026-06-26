"use client";

import { useRouter } from "next/navigation";
import ParentShell, { useParentData } from "@/components/parent/ParentShell";
import ParentIcon from "@/components/parent/ParentIcon";
import { PageHead, DirTag, ParentNotice } from "@/components/parent/parts";
import { trendDir } from "@/components/parent/util";
import { RadialGauge, MiniSpark, CountUp } from "@/components/student/charts";

function Classes() {
  const router = useRouter();
  const { child, loading } = useParentData();

  if (loading && !child) return <ParentNotice>Loading…</ParentNotice>;
  if (!child) return <ParentNotice>No student to show.</ParentNotice>;

  return (
    <div className="reveal">
      <PageHead
        title={`${child.first}'s`}
        accent="classes"
        sub={`${child.classes.length} ${child.classes.length === 1 ? "class" : "classes"} with grades`}
      />
      {child.classes.length === 0 ? (
        <ParentNotice>No graded classes yet.</ParentNotice>
      ) : (
        <div className="dgrid d-2 stagger">
          {child.classes.map((c, i) => (
            <div
              key={c.id}
              className="classcard reveal"
              style={{ ["--c" as string]: c.color, animationDelay: `${i * 55}ms` }}
              onClick={() => router.push("/parent/grades")}
            >
              <div className="cc-main">
                <RadialGauge pct={c.grade} size={88} stroke={9} color={c.color} delay={i * 60 + 120}>
                  <div className="ring-letter" style={{ color: c.color, fontSize: 21 }}>
                    {c.letter}
                  </div>
                  <div className="ring-pct">
                    <CountUp to={c.grade} />
                  </div>
                </RadialGauge>
                <div className="cc-body">
                  <div className="cname">{c.name}</div>
                  <div className="cteach">
                    {c.teacher ?? "—"}
                    {c.room ? ` · Rm ${c.room}` : ""}
                  </div>
                  <div className="cc-spark">
                    <MiniSpark data={c.trend} w={112} h={28} color={c.color} />
                    <DirTag tr={c.trend} />
                  </div>
                </div>
              </div>
              <div className="cc-foot">
                <span className="stag">
                  <span className="sdot" style={{ background: c.color }} />
                  {trendDir(c.trend) === "up"
                    ? "improving"
                    : trendDir(c.trend) === "down"
                      ? "needs attention"
                      : "holding steady"}
                </span>
                <span className="cc-due" style={{ color: "var(--ink-dim)" }}>
                  view grades <ParentIcon name="arrow" size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ParentClassesPage() {
  return (
    <ParentShell active="classes">
      <Classes />
    </ParentShell>
  );
}
