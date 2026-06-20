"use client";

// Classes — org-wide directory of every class.

import PageHead from "../../components/PageHead";
import { CLASSES } from "../../data";

export default function ClassesPage() {
  const active = CLASSES.filter((c) => c.status === "active").length;
  const totalStudents = CLASSES.reduce((s, c) => s + c.students, 0);

  return (
    <div className="reveal">
      <PageHead
        title="All"
        accent="classes"
        sub={`${CLASSES.length} classes · ${active} active · ${totalStudents} enrolments`}
        action="New class"
      />
      <div className="acgrid stagger">
        {CLASSES.map((c) => (
          <div key={c.code} className="accard" style={{ ["--c" as string]: c.color }}>
            <div className="ach">
              <div style={{ minWidth: 0 }}>
                <div className="acname">{c.name}</div>
                <div className="accode">{c.code}</div>
              </div>
              <span className={"pill " + c.status}>
                <span className="pd" />
                {c.status}
              </span>
            </div>
            <div className="acmeta">
              <div className="acm">
                <span className="acm-n">{c.students}</span>
                <span className="acm-l">students</span>
              </div>
              <div className="acm">
                <span className="acm-n" style={{ color: c.color }}>
                  {c.code.split("-")[0]}
                </span>
                <span className="acm-l">subject</span>
              </div>
              <span className="acteacher">{c.teacher}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
