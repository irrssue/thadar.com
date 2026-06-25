"use client";

// AdminIcon — the admin control panel's icon set, ported verbatim from the
// Claude Design handoff (admin-data.jsx). Kept separate from the shared
// components/Icon so the admin glyphs (server, shield, flag, audit, logout…)
// stay self-contained to this surface.

const k = {
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function AdminIcon({ name, size = 20 }: { name: string; size?: number }) {
  const s = size;
  switch (name) {
    case "overview":
    case "home":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <rect {...k} x="4" y="4" width="7" height="7" rx="1.5" />
          <rect {...k} x="13" y="4" width="7" height="5" rx="1.5" />
          <rect {...k} x="4" y="13" width="7" height="7" rx="1.5" />
          <rect {...k} x="13" y="11" width="7" height="9" rx="1.5" />
        </svg>
      );
    case "users":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...k} cx="9" cy="9" r="3" />
          <circle {...k} cx="17" cy="11" r="2.4" />
          <path {...k} d="M3 19c.8-3 3.4-4.5 6-4.5s5.2 1.5 6 4.5 M14.5 19c.6-2 2.2-3 4-3" />
        </svg>
      );
    case "classes":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M3 6h13a2 2 0 0 1 2 2v12H5a2 2 0 0 1-2-2z M3 6a2 2 0 0 1 2-2h11v2 M8 10h6 M8 14h6" />
        </svg>
      );
    case "content":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M6 4h9l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z M14 4v5h5 M9 13h6 M9 16h4" />
        </svg>
      );
    case "system":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <rect {...k} x="3" y="4" width="18" height="6" rx="1.5" />
          <rect {...k} x="3" y="14" width="18" height="6" rx="1.5" />
          <path {...k} d="M7 7h.01 M7 17h.01" />
        </svg>
      );
    case "audit":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z M9 12l2 2 4-4" />
        </svg>
      );
    case "settings":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...k} cx="12" cy="12" r="3" />
          <path {...k} d="M12 3v2 M12 19v2 M5 5l1.4 1.4 M17.6 17.6L19 19 M3 12h2 M19 12h2 M5 19l1.4-1.4 M17.6 6.4L19 5" />
        </svg>
      );
    case "profile":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...k} cx="12" cy="9" r="3.4" />
          <path {...k} d="M5 20c1.2-3.2 4-5 7-5s5.8 1.8 7 5" />
        </svg>
      );
    case "menu":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M4 7h16 M4 12h16 M4 17h16" />
        </svg>
      );
    case "close":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M6 6l12 12 M18 6l-12 12" />
        </svg>
      );
    case "arrow":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M5 12h14 M13 6l6 6-6 6" />
        </svg>
      );
    case "back":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M19 12H5 M11 6l-6 6 6 6" />
        </svg>
      );
    case "send":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M4 12l16-8-6 16-3-7z" />
        </svg>
      );
    case "plus":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M12 5v14 M5 12h14" />
        </svg>
      );
    case "up":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M12 19V5 M6 11l6-6 6 6" />
        </svg>
      );
    case "down":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M12 5v14 M6 13l6 6 6-6" />
        </svg>
      );
    case "search":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...k} cx="11" cy="11" r="6" />
          <path {...k} d="M20 20l-4.5-4.5" />
        </svg>
      );
    case "pencil":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M4 20l4-1 11-11-3-3L5 16z M14 6l3 3" />
        </svg>
      );
    case "alert":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M12 4l9 16H3z M12 10v4 M12 17.5v.4" />
        </svg>
      );
    case "check":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M5 13l4 4 10-11" />
        </svg>
      );
    case "bell":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6 M10 20a2 2 0 0 0 4 0" />
        </svg>
      );
    case "globe":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...k} cx="12" cy="12" r="8" />
          <path {...k} d="M4 12h16 M12 4c2.5 2.5 2.5 13.5 0 16 M12 4c-2.5 2.5-2.5 13.5 0 16" />
        </svg>
      );
    case "lock":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <rect {...k} x="5" y="11" width="14" height="9" rx="2" />
          <path {...k} d="M8 11V8a4 4 0 0 1 8 0v3 M12 15v2" />
        </svg>
      );
    case "logout":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M14 7V5a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-2 M10 12h10 M17 9l3 3-3 3" />
        </svg>
      );
    case "server":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <rect {...k} x="4" y="4" width="16" height="7" rx="1.5" />
          <rect {...k} x="4" y="13" width="16" height="7" rx="1.5" />
          <path {...k} d="M8 7.5h.01 M8 16.5h.01" />
        </svg>
      );
    case "flag":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M5 21V4 M5 5h11l-2 3 2 3H5" />
        </svg>
      );
    case "shield":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" />
        </svg>
      );
    case "more":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle cx="6" cy="12" r="1.4" fill="currentColor" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" />
          <circle cx="18" cy="12" r="1.4" fill="currentColor" />
        </svg>
      );
    case "filter":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M4 5h16l-6 8v5l-4 2v-7z" />
        </svg>
      );
    case "download":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M12 4v11 M8 11l4 4 4-4 M5 20h14" />
        </svg>
      );
    case "clock":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...k} cx="12" cy="12" r="8" />
          <path {...k} d="M12 8v4l3 2" />
        </svg>
      );
    case "sun":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...k} cx="12" cy="12" r="4" />
          <path {...k} d="M12 2v2 M12 20v2 M2 12h2 M20 12h2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case "moon":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        </svg>
      );
    case "eye":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle fill="none" stroke="currentColor" strokeWidth={1.6} cx="12" cy="12" r="3" />
        </svg>
      );
    case "eye-off":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line {...k} x1="1" y1="1" x2="23" y2="23" />
        </svg>
      );
    default:
      return null;
  }
}
