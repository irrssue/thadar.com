"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "../ThemeProvider";
import ParentIcon from "./ParentIcon";
import type { ParentChild, ParentChildSummary } from "@/types/parent";
import "../../app/student.css";
import "../../app/admin.css";
import "../../app/parent.css";

type NavId = "overview" | "classes" | "grades" | "trends" | "profile";

const NAV: { id: NavId; label: string; href: string; icon: string }[] = [
  { id: "overview", label: "Overview", href: "/parent", icon: "overview" },
  { id: "classes", label: "Classes", href: "/parent/classes", icon: "classes" },
  { id: "grades", label: "Grades", href: "/parent/grades", icon: "grades" },
  { id: "trends", label: "Trends & focus", href: "/parent/trends", icon: "trends" },
  { id: "profile", label: "Profile", href: "/parent/profile", icon: "profile" },
];

const NAV_OPEN_KEY = "thadar-nav-open";
const ACTIVE_CHILD_KEY = "thadar-parent-child";

type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

// ---- shared parent data (linked children + selected child payload) ----
type ParentData = {
  children: ParentChildSummary[] | null;
  activeId: string | null;
  setActiveId: (id: string) => void;
  child: ParentChild | null;
  loading: boolean;
};

const ParentDataContext = createContext<ParentData | null>(null);

export function useParentData(): ParentData {
  const ctx = useContext(ParentDataContext);
  if (!ctx) throw new Error("useParentData must be used inside ParentShell");
  return ctx;
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

const labelStyle = { whiteSpace: "nowrap" as const, overflow: "hidden" as const };

export default function ParentShell({
  active,
  children,
}: {
  active: NavId;
  children: React.ReactNode;
}) {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(true);

  const [list, setList] = useState<ParentChildSummary[] | null>(null);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [child, setChild] = useState<ParentChild | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(NAV_OPEN_KEY);
    if (saved !== null) {
      setOpen(saved === "1");
    } else if (window.innerWidth <= 768) {
      setOpen(false);
    }
  }, []);

  // Load the linked-children list once, then pick the active child.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/parent/children", { cache: "no-store" });
        const json: ApiResponse<ParentChildSummary[]> = await res.json();
        if (!alive || !json.success) return;
        setList(json.data);
        const stored = localStorage.getItem(ACTIVE_CHILD_KEY);
        const pick = json.data.find((c) => c.id === stored)?.id ?? json.data[0]?.id ?? null;
        setActiveIdState(pick);
        if (!pick) setLoading(false);
      } catch {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Load the selected child's full payload whenever the selection changes.
  useEffect(() => {
    if (!activeId) return;
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/parent/children/${activeId}`, { cache: "no-store" });
        const json: ApiResponse<ParentChild> = await res.json();
        if (!alive) return;
        setChild(json.success ? json.data : null);
      } catch {
        if (alive) setChild(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeId]);

  const setActiveId = (id: string) => {
    localStorage.setItem(ACTIVE_CHILD_KEY, id);
    setActiveIdState(id);
  };

  const toggleOpen = () =>
    setOpen((v) => {
      const next = !v;
      localStorage.setItem(NAV_OPEN_KEY, next ? "1" : "0");
      return next;
    });

  const data: ParentData = { children: list, activeId, setActiveId, child, loading };

  return (
    <ParentDataContext.Provider value={data}>
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
          <ParentIcon name="menu" size={28} />
        </button>

        {open && (
          <div
            onClick={toggleOpen}
            aria-hidden
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.32)", zIndex: 52 }}
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
          aria-label="Parent navigation"
          aria-hidden={!open}
        >
          <Link
            href="/parent"
            className="side-brand"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 12px 0 52px",
              height: 42,
              marginBottom: 4,
              textDecoration: "none",
              color: "var(--ink)",
            }}
            aria-label="Thadar parents"
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
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "1px",
                textTransform: "uppercase",
                color: "var(--ink-faint)",
                border: "1px solid var(--stroke)",
                borderRadius: 999,
                padding: "3px 8px",
              }}
            >
              parents
            </span>
          </Link>

          {child && (
            <div
              style={{
                padding: "0 12px 0 14px",
                margin: "0 0 8px",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--ink-dim)",
                ...labelStyle,
              }}
            >
              viewing {child.first}
            </div>
          )}

          <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {NAV.map((item) => {
              const isActive = active === item.id;
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
                    <ParentIcon name={item.icon} />
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
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light" : "Switch to dark"}
              style={rowStyle(false)}
              className="nav-btn"
            >
              <span style={{ display: "inline-flex", flexShrink: 0 }}>
                <ParentIcon name={theme === "dark" ? "sun" : "moon"} />
              </span>
              <span style={labelStyle}>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
            </button>
          </div>
        </aside>

        <style>{`
          :root { --sidebar-w: 240px; }
          .nav-btn:hover { background: var(--surface-hover); color: var(--ink); }
          .nav-burger:hover { background: var(--surface-hover); }
          @media (max-width: 520px) { :root { --sidebar-w: 86vw; } }
        `}</style>
      </div>
    </ParentDataContext.Provider>
  );
}
