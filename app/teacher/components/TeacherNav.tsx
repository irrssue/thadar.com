"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "../../components/Icon";
import { useTheme } from "../../components/ThemeProvider";
import ViewSwitcher from "../../components/ViewSwitcher";

const NAV_ITEMS = [
  { id: "home",     label: "Home",        href: "/teacher" },
  { id: "classes",  label: "Classes",     href: "/teacher/classes" },
  { id: "assign",   label: "Assignments", href: "/teacher/assignments", badge: 4 },
  { id: "students", label: "Students",    href: "/teacher/students" },
  { id: "inbox",    label: "Inbox",       href: "/teacher/inbox", badge: 2 },
  { id: "profile",  label: "Profile",     href: "/teacher/profile" },
];

const rowStyle = (isActive: boolean) =>
  ({
    pointerEvents: "auto",
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

export default function TeacherNav() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  const currentId =
    NAV_ITEMS.find((i) =>
      i.href === "/teacher" ? pathname === "/teacher" : pathname.startsWith(i.href),
    )?.id ?? "home";

  return (
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
        zIndex: 50,
        overflowY: "auto",
      }}
      aria-label="Teacher navigation"
    >
      <Link
        href="/teacher"
        className="side-brand"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 12px",
          height: 40,
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
        <span
          className="side-label"
          style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.3px", ...labelStyle }}
        >
          Thadar
        </span>
      </Link>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = currentId === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              style={rowStyle(isActive)}
              className="nav-btn"
            >
              <span style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
                <Icon name={item.id} />
                {item.badge ? (
                  <span
                    className="badge-dot"
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      minWidth: 14,
                      height: 14,
                      padding: "0 4px",
                      borderRadius: 999,
                      background: "var(--accent)",
                      color: "var(--bg)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 9,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </span>
              <span className="side-label" style={labelStyle}>
                {item.label}
              </span>
              {item.badge ? (
                <span
                  className="side-label badge-pill"
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
                  {item.badge}
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
          <span className="side-label" style={labelStyle}>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </span>
        </button>
        <ViewSwitcher current="TEACHER" />
      </div>

      <style>{`
        :root { --sidebar-w: 240px; }
        body { padding-left: var(--sidebar-w); transition: padding-left 160ms; }
        .nav-btn:hover { background: var(--surface-hover); color: var(--ink); }
        .badge-dot { display: none; }
        @media (max-width: 880px) {
          :root { --sidebar-w: 72px; }
          .side-nav { padding-left: 8px; padding-right: 8px; }
          .side-label { display: none; }
          .side-brand { justify-content: center; padding: 0; }
          .nav-btn { justify-content: center; gap: 0; padding: 0; }
          .badge-pill { display: none; }
          .badge-dot { display: inline-flex; }
        }
      `}</style>
    </aside>
  );
}
