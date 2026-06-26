"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import ParentShell, { useParentData } from "@/components/parent/ParentShell";
import ParentIcon from "@/components/parent/ParentIcon";
import { ParentNotice } from "@/components/parent/parts";
import { initials } from "@/components/student/subject";

function Profile() {
  const router = useRouter();
  const { data: session } = useSession();
  const { children, activeId, setActiveId, loading } = useParentData();

  const name = session?.user?.name ?? "Guardian";
  const email = session?.user?.email ?? "";

  if (loading && !children) return <ParentNotice>Loading…</ParentNotice>;

  return (
    <div className="reveal">
      <button className="back" onClick={() => router.push("/parent")}>
        <ParentIcon name="back" size={15} /> Overview
      </button>
      <div className="dh">
        <div>
          <h1>
            Family <span className="var">account</span>
          </h1>
          <div className="dsub" style={{ margin: "6px 0 0" }}>
            your guardian profile &amp; linked students
          </div>
        </div>
      </div>
      <div style={{ height: 26 }} />

      <div className="prof-hd">
        <span className="av" style={{ width: 64, height: 64, fontSize: 22 }}>
          {initials(name)}
        </span>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{name}</div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--ink-dim)",
              marginTop: 4,
            }}
          >
            guardian{email ? ` · ${email}` : ""}
          </div>
        </div>
        <button className="btn" style={{ marginLeft: "auto" }} onClick={() => signOut({ callbackUrl: "/login" })}>
          <ParentIcon name="logout" size={16} /> Sign out
        </button>
      </div>

      {/* linked children */}
      <div className="card reveal" style={{ marginBottom: "var(--gap)" }}>
        <div className="tile-title" style={{ fontSize: 17, marginBottom: 12 }}>
          Linked students
        </div>
        <div className="linked-list">
          {(children ?? []).map((c) => (
            <button
              key={c.id}
              className={"linked-row " + (c.id === activeId ? "on" : "")}
              onClick={() => {
                setActiveId(c.id);
                router.push("/parent");
              }}
            >
              <span className="av-sm childav">{initials(c.name)}</span>
              <div className="linked-body">
                <div className="linked-name">{c.name}</div>
                <div className="linked-meta">
                  {c.grade ? `${c.grade} · ` : ""}
                  {c.code}
                </div>
              </div>
              <span className="linked-gpa">GPA {c.gpa.toFixed(1)}</span>
              {c.id === activeId ? (
                <span className="pill active">
                  <span className="pd" />
                  viewing
                </span>
              ) : (
                <span className="linked-go">
                  view <ParentIcon name="arrow" size={12} />
                </span>
              )}
            </button>
          ))}
          {(children ?? []).length === 0 && <div className="empty-note">No linked students yet.</div>}
        </div>
      </div>

      {/* access — explicitly view-only */}
      <div className="card reveal" style={{ animationDelay: "60ms" }}>
        <div className="tile-title" style={{ fontSize: 17, marginBottom: 8 }}>
          Your access
        </div>
        <div className="setrow">
          <div className="sbody">
            <div className="sl">View classes &amp; grades</div>
            <div className="sd">for linked students</div>
          </div>
          <span className="pill active">
            <span className="pd" />
            granted
          </span>
        </div>
        <div className="setrow">
          <div className="sbody">
            <div className="sl">View trends &amp; focus areas</div>
            <div className="sd">term history</div>
          </div>
          <span className="pill active">
            <span className="pd" />
            granted
          </span>
        </div>
        <div className="setrow">
          <div className="sbody">
            <div className="sl">Edit grades or coursework</div>
            <div className="sd">teacher-only</div>
          </div>
          <span className="pill">
            <span className="pd" />
            view only
          </span>
        </div>
        <div className="setrow">
          <div className="sbody">
            <div className="sl">Message students directly</div>
            <div className="sd">contact the teacher</div>
          </div>
          <span className="pill">
            <span className="pd" />
            view only
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ParentProfilePage() {
  return (
    <ParentShell active="profile">
      <Profile />
    </ParentShell>
  );
}
