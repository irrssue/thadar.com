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

const NAV_OPEN_KEY = "thadar-nav-open";

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
  const [open, setOpen] = useState(true);
  const [badges, setBadges] = useState<Badges>({ assign: 0, inbox: 0 });

  useEffect(() => {
    const saved = localStorage.getItem(NAV_OPEN_KEY);
    if (saved !== null) {
      setOpen(saved === "1");
      return;
    }
    // No saved preference: keep the menu out of the way on phones, where the
    // nav is a full-screen overlay rather than a docked sidebar.
    if (window.innerWidth <= 768) setOpen(false);
  }, []);

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

  const toggleOpen = () =>
    setOpen((v) => {
      const next = !v;
      localStorage.setItem(NAV_OPEN_KEY, next ? "1" : "0");
      return next;
    });

  const badgeFor = (id: NavId) =>
    id === "assign" ? badges.assign : id === "inbox" ? badges.inbox : 0;

  return (
    <div className="student-surface">
      <div className="page" data-screen-label={active}>
        {children}
      </div>

      <button
        onClick={toggleOpen}
        aria-label={open ? "Hide menu" : "Show menu"}
        aria-expanded={open}
        className="nav-burger"
        style={{
          position: "fixed",
          top: 18,
          left: 14,
          width: 42,
          height: 42,
          borderRadius: 10,
          border: "none",
          background: "transparent",
          color: "var(--ink)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 60,
          transition: "background 120ms",
        }}
      >
        <Icon name="menu" size={28} />
      </button>

      {open && (
        <div
          onClick={toggleOpen}
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.32)",
            zIndex: 52,
          }}
        />
      )}

      <aside
        className="side-nav"
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
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 180ms ease",
          boxShadow: open ? "var(--nav-shadow)" : "none",
        }}
        aria-label="Student navigation"
        aria-hidden={!open}
      >
        <Link
          href="/home"
          className="side-brand"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "0 12px 0 52px",
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
        @media (max-width: 520px) {
          :root { --sidebar-w: 86vw; }
        }
      `}</style>
    </div>
  );
}
