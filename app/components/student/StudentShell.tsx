"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import StudentIcon from "./StudentIcon";
import { initials } from "./subject";
import ViewSwitcher from "../ViewSwitcher";
import "../../student.css";

type NavId = "home" | "classes" | "assign" | "grades" | "inbox" | "profile";

const NAV: { id: NavId; label: string; href: string }[] = [
  { id: "home", label: "Home", href: "/home" },
  { id: "classes", label: "Classes", href: "/classes" },
  { id: "assign", label: "Assignments", href: "/assignments" },
  { id: "grades", label: "Grades", href: "/grades" },
  { id: "inbox", label: "Inbox", href: "/inbox" },
  { id: "profile", label: "Profile", href: "/profile" },
];

type Badges = { assign: number; inbox: number };

export default function StudentShell({
  active,
  children,
}: {
  active: NavId;
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [menu, setMenu] = useState(false);
  const [badges, setBadges] = useState<Badges>({ assign: 0, inbox: 0 });

  const name = session?.user?.name ?? "Student";
  const ini = initials(name);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [aRes, mRes] = await Promise.all([
          fetch("/api/assignments", { cache: "no-store" }),
          fetch("/api/messages?box=inbox", { cache: "no-store" }),
        ]);
        const aJson = await aRes.json();
        const mJson = await mRes.json();
        if (!alive) return;
        const assign = aJson.success
          ? (aJson.data as { submission: unknown | null }[]).filter((f) => !f.submission).length
          : 0;
        const inbox = mJson.success ? (mJson.data.unread as number) : 0;
        setBadges({ assign, inbox });
      } catch {
        /* badges are decorative — ignore fetch errors */
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const badgeFor = (id: NavId) =>
    id === "assign" ? badges.assign : id === "inbox" ? badges.inbox : 0;

  return (
    <div className="student-surface">
      <div className="page" data-screen-label={active}>
        <div className="topbar">
          <button className="iconbtn" aria-label="Menu" onClick={() => setMenu(true)}>
            <StudentIcon name="menu" size={22} />
          </button>
          <Link href="/home" className="brand">
            thadar<b>.</b>
          </Link>
          <div className="spacer" />
          <Link href="/profile" className="av" title="Profile" style={{ textDecoration: "none" }}>
            {ini}
          </Link>
        </div>

        {children}
      </div>

      {/* drawer overlay */}
      <div className={"scrim " + (menu ? "open" : "")} onClick={() => setMenu(false)} />
      <nav className={"drawer " + (menu ? "open" : "")} aria-hidden={!menu}>
        <div className="drawer-hd">
          <button className="iconbtn ghost" aria-label="Close menu" onClick={() => setMenu(false)}>
            <StudentIcon name="close" size={20} />
          </button>
          <span className="brand">
            thadar<b>.</b>
          </span>
        </div>
        <div className="drawer-user">
          <span className="av" style={{ width: 38, height: 38 }}>
            {ini}
          </span>
          <div>
            <div style={{ fontSize: 16 }}>{name}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-dim)" }}>
              student
            </div>
          </div>
        </div>
        <div className="drawer-sep" />
        <div className="drawer-scroll">
          {NAV.map((it) => {
            const b = badgeFor(it.id);
            return (
              <Link
                key={it.id}
                href={it.href}
                className={"drawer-item " + (active === it.id ? "active" : "")}
                onClick={() => setMenu(false)}
                aria-current={active === it.id ? "page" : undefined}
              >
                <StudentIcon name={it.id === "home" ? "home" : it.id} size={20} />
                <span>{it.label}</span>
                {b > 0 ? <span className="badge2">{b}</span> : null}
              </Link>
            );
          })}
        </div>
        {/* "Switch view" — intentionally left unchanged per design scope. */}
        <div className="drawer-foot">
          <ViewSwitcher current="STUDENT" />
        </div>
      </nav>
    </div>
  );
}
