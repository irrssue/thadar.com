// ParentIcon — the icon set for the parent portal, ported from the Claude
// Design handoff (parent-data.jsx). Mirrors the student surface's own
// StudentIcon so the parent view doesn't have to extend the shared <Icon>.
// `sun`/`moon` are added here for the sidebar theme toggle.

type Props = { name: string; size?: number };

export default function ParentIcon({ name, size = 20 }: Props) {
  const s = size;
  const k = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
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
    case "classes":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M3 6h13a2 2 0 0 1 2 2v12H5a2 2 0 0 1-2-2z M3 6a2 2 0 0 1 2-2h11v2 M8 10h6 M8 14h6" />
        </svg>
      );
    case "grades":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M4 19V9 M9 19V5 M14 19v-7 M19 19v-10 M3 21h18" />
        </svg>
      );
    case "trends":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M4 17l5-5 4 3 7-8 M15 4h5v5" />
        </svg>
      );
    case "profile":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...k} cx="12" cy="9" r="3.4" />
          <path {...k} d="M5 20c1.2-3.2 4-5 7-5s5.8 1.8 7 5" />
        </svg>
      );
    case "star":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M12 3.6l2.5 5.1 5.6.8-4 4 .95 5.6L12 16.5 6.95 19.1 7.9 13.5l-4-4 5.6-.8z" />
        </svg>
      );
    case "target":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...k} cx="12" cy="12" r="8" />
          <circle {...k} cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1.4" fill="currentColor" />
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
    case "flat":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M5 12h14" />
        </svg>
      );
    case "bell":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6 M10 20a2 2 0 0 0 4 0" />
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
    case "eye":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle {...k} cx="12" cy="12" r="3" />
        </svg>
      );
    case "check":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M5 13l4 4 10-11" />
        </svg>
      );
    case "search":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...k} cx="11" cy="11" r="6" />
          <path {...k} d="M20 20l-4.5-4.5" />
        </svg>
      );
    case "spark":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M12 4l1.7 4.6L18 10l-4.3 1.4L12 16l-1.7-4.6L6 10l4.3-1.4z" />
        </svg>
      );
    case "clock":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...k} cx="12" cy="12" r="8" />
          <path {...k} d="M12 8v4l3 2" />
        </svg>
      );
    case "download":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M12 4v11 M8 11l4 4 4-4 M5 20h14" />
        </svg>
      );
    case "mail":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <rect {...k} x="3" y="5" width="18" height="14" rx="2" />
          <path {...k} d="M4 7l8 5 8-5" />
        </svg>
      );
    case "calendar":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <rect {...k} x="4" y="5" width="16" height="16" rx="2" />
          <path {...k} d="M4 9h16 M8 3v4 M16 3v4" />
        </svg>
      );
    case "sun":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...k} cx="12" cy="12" r="4" />
          <path {...k} d="M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case "moon":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...k} d="M21 12.8A8 8 0 1 1 11.2 3a6 6 0 0 0 9.8 9.8z" />
        </svg>
      );
    default:
      return null;
  }
}
