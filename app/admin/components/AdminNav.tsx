"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminIcon from "./AdminIcon";
import { useTheme } from "../../components/ThemeProvider";
import { ADMIN, initials } from "../data";

type NavItem = { id: string; label: string; href: string; badge?: number };

const NAV: NavItem[] = [
  { id: "overview", label: "Overview", href: "/admin" },
  { id: "users", label: "Users", href: "/admin/users" },
  { id: "classes", label: "Classes", href: "/admin/classes" },
  { id: "content", label: "Content", href: "/admin/content", badge: 2 },
  { id: "system", label: "System", href: "/admin/system" },
  { id: "audit", label: "Audit log", href: "/admin/audit" },
  { id: "settings", label: "Settings", href: "/admin/settings" },
  { id: "profile", label: "Profile", href: "/admin/profile" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminNav() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [menu, setMenu] = useState(false);
  const av = initials(ADMIN.name);

  return (
    <>
      {/* in-flow top bar */}
      <div className="topbar">
        <button className="iconbtn" aria-label="Menu" onClick={() => setMenu(true)}>
          <AdminIcon name="menu" size={22} />
        </button>
        <div className="brand">
          thadar<b>.</b>
        </div>
        <span className="tag-admin">admin</span>
        <div className="spacer" />
        <button className="iconbtn" aria-label="Toggle theme" onClick={toggle}>
          <AdminIcon name={theme === "light" ? "moon" : "sun"} size={19} />
        </button>
        <button className="iconbtn" aria-label="Notifications" style={{ position: "relative" }}>
          <AdminIcon name="bell" size={20} />
          <span
            style={{ position: "absolute", top: 8, right: 9, width: 7, height: 7, borderRadius: 999, background: "var(--accent)" }}
          />
        </button>
        <Link href="/admin/profile" className="av" title="Profile" style={{ textDecoration: "none" }}>
          {av}
        </Link>
      </div>

      {/* slide-out drawer */}
      <div className={"scrim " + (menu ? "open" : "")} onClick={() => setMenu(false)} />
      <nav className={"drawer " + (menu ? "open" : "")} aria-hidden={!menu}>
        <div className="drawer-hd">
          <button className="iconbtn ghost" aria-label="Close menu" onClick={() => setMenu(false)}>
            <AdminIcon name="close" size={20} />
          </button>
          <div className="brand">
            thadar<b>.</b> <span style={{ color: "var(--ink-faint)", fontSize: 11 }}>admin</span>
          </div>
        </div>
        <div className="drawer-user">
          <span className="av" style={{ width: 38, height: 38 }}>
            {av}
          </span>
          <div>
            <div style={{ fontSize: 16 }}>{ADMIN.name}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-dim)" }}>super admin</div>
          </div>
        </div>
        <div className="drawer-sep" />
        {NAV.map((it) => (
          <Link
            key={it.id}
            href={it.href}
            className={"drawer-item " + (isActive(pathname, it.href) ? "active" : "")}
            onClick={() => setMenu(false)}
          >
            <AdminIcon name={it.id} size={20} />
            <span>{it.label}</span>
            {it.badge ? <span className="badge2">{it.badge}</span> : null}
          </Link>
        ))}
      </nav>
    </>
  );
}
