"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { useTheme } from "./ThemeProvider";
import ViewSwitcher from "./ViewSwitcher";

const NAV_ITEMS = [
  { id: "home", label: "Home", href: "/home" },
  { id: "classes", label: "Classes", href: "/classes" },
  { id: "profile", label: "Profile", href: "/profile" },
  { id: "inbox", label: "Inbox", href: "/inbox" },
];

const NAV_OPEN_KEY = "thadar-nav-open";

interface FloatingNavProps {
  active?: string;
  onChange?: (id: string) => void;
}

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

export default function FloatingNav({ active, onChange }: FloatingNavProps) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(NAV_OPEN_KEY);
    if (saved !== null) setOpen(saved === "1");
  }, []);

  const toggleOpen = () =>
    setOpen((v) => {
      const next = !v;
      localStorage.setItem(NAV_OPEN_KEY, next ? "1" : "0");
      return next;
    });

  const currentId =
    active ??
    NAV_ITEMS.find((i) =>
      i.href === "/home" ? pathname === "/home" : pathname.startsWith(i.href),
    )?.id ??
    "home";

  return (
    <>
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
        <Icon name="menu" />
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
        aria-label="Primary"
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
          {NAV_ITEMS.map((item) => {
            const isActive = currentId === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => onChange?.(item.id)}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                style={rowStyle(isActive)}
                className="nav-btn"
              >
                <span style={{ display: "inline-flex", flexShrink: 0 }}>
                  <Icon name={item.id} />
                </span>
                <span style={labelStyle}>{item.label}</span>
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
            onClick={() => {
              toggle();
              onChange?.("theme");
            }}
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
    </>
  );
}
