"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import { useTheme } from "../ThemeProvider";
import ViewSwitcher from "../ViewSwitcher";
import "../../app/student.css";

type NavId = "home" | "classes" | "assign" | "grades" | "inbox" | "profile";

// Mirrors the teacher sidebar (TeacherNav) so the two surfaces match.
// `icon` maps to the shared <Icon> set; "grades" has no glyph so it borrows
// the trophy.
const NAV: { id: NavId; label: string; href: string; icon: string }[] = [
  { id: "home", label: "Home", href: "/home", icon: "home" },
  { id: "classes", label: "Classes", href: "/classes", icon: "classes" },
  { id: "assign", label: "Assignments", href: "/assignments", icon: "assign" },
  { id: "grades", label: "Grades", href: "/grades", icon: "trophy" },
  { id: "inbox", label: "Inbox", href: "/inbox", icon: "inbox" },
  { id: "profile", label: "Profile", href: "/profile", icon: "profile" },
];

type Badges = { assign: number; inbox: number };

const rowStyle = (isActive: boolean) =>
  ({
    width: "100%",
    height: 42,
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "0 12px",
    borderRadius: 10,
    border: "none",
    background: isActive ? "var(--nav-active)" : "transparent",
    color: isActive ? "var(--ink)" : "var(--ink-dim)",
    boxShadow: isActive ? "0 0 0 1px var(--nav-active-inset) inset" : "none",
    cursor: "pointer",
    textDecoration: "none",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    fontWeight: isActive ? 500 : 400,
    transition: "background 120ms, color 120ms",
  }) as const;

const labelStyle = {
  whiteSpace: "nowrap" as const,
  overflow: "hidden" as const,
};

export default function StudentShell({
  active,
  children,
}: {
  active: NavId;
  children: React.ReactNode;
}) {
  const { theme, toggle } = useTheme();
  const [badges, setBadges] = useState<Badges>({ assign: 0, inbox: 0 });
  const [mobileOpen, setMobileOpen] = useState(false);

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
        {children}
      </div>

      {/* Mobile hamburger button */}
      <button
        className="nav-burger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        style={{
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 60,
          width: 40,
          height: 40,
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--nav-bg)",
          border: "1px solid var(--nav-border)",
          borderRadius: 10,
          cursor: "pointer",
          color: "var(--ink)",
        }}
      >
        <Icon name="menu" />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            display: "none",
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 54,
          }}
          className="mobile-backdrop"
        />
      )}

      <aside
        className={`side-nav${mobileOpen ? " mobile-open" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "var(--sidebar-w)",
          background: "var(--nav-bg)",
          borderRight: "1px solid var(--nav-border)",
          display: "flex",
          flexDirection: "column",
          padding: "18px 12px 16px",
          gap: 4,
          zIndex: 55,
          overflowY: "auto",
        }}
        aria-label="Student navigation"
      >
        {/* Close button — mobile only */}
        <button
          className="nav-close"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          style={{
            display: "none",
            alignSelf: "flex-end",
            width: 32,
            height: 32,
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: "var(--ink-dim)",
            marginBottom: 4,
          }}
        >
          <Icon name="close" />
        </button>

        <Link
          href="/home"
          className="side-brand"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 12px",
            height: 42,
            marginBottom: 8,
            textDecoration: "none",
            color: "var(--ink)",
          }}
          aria-label="Thadar home"
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              background: "var(--accent)",
              display: "inline-block",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.3px", ...labelStyle }}>
            Thadar
          </span>
        </Link>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map((item) => {
            const isActive = active === item.id;
            const badge = badgeFor(item.id);
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                style={rowStyle(isActive)}
                className="nav-btn"
              >
                <span style={{ display: "inline-flex", flexShrink: 0 }}>
                  <Icon name={item.icon} />
                </span>
                <span style={labelStyle}>{item.label}</span>
                {badge > 0 ? (
                  <span
                    style={{
                      marginLeft: "auto",
                      minWidth: 18,
                      height: 18,
                      padding: "0 6px",
                      borderRadius: 999,
                      background: "var(--accent)",
                      color: "var(--bg)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                    }}
                  >
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            marginTop: "auto",
            paddingTop: 12,
            borderTop: "1px solid var(--nav-border)",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <button
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
            style={rowStyle(false)}
            className="nav-btn"
          >
            <span style={{ display: "inline-flex", flexShrink: 0 }}>
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </span>
            <span style={labelStyle}>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
          <ViewSwitcher current="STUDENT" />
        </div>
      </aside>

      <style>{`
        :root { --sidebar-w: 240px; }
        .nav-btn:hover { background: var(--surface-hover); color: var(--ink); }
        .nav-burger:hover { background: var(--surface-hover); }
        @media (max-width: 760px) {
          :root { --sidebar-w: 86vw; }
          .nav-burger { display: flex !important; }
          .side-nav { transform: translateX(-100%); transition: transform 200ms ease; }
          .side-nav.mobile-open { transform: translateX(0); }
          .mobile-backdrop { display: block !important; }
          .nav-close { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
