"use client";

interface IconProps {
  name: string;
  size?: number;
}

const stroke = {
  fill: "none" as const,
  stroke: "currentColor" as const,
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function Icon({ name, size = 20 }: IconProps) {
  const s = size;
  switch (name) {
    case "home":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />
        </svg>
      );
    case "classes":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M3 6h13a2 2 0 0 1 2 2v12H5a2 2 0 0 1-2-2z M3 6a2 2 0 0 1 2-2h11v2 M8 10h6 M8 14h6" />
        </svg>
      );
    case "profile":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...stroke} cx="12" cy="9" r="3.4" />
          <path {...stroke} d="M5 20c1.2-3.2 4-5 7-5s5.8 1.8 7 5" />
        </svg>
      );
    case "inbox":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M4 7l8 5 8-5 M4 7v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7l-8-4z" />
        </svg>
      );
    case "moon":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
        </svg>
      );
    case "sun":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...stroke} cx="12" cy="12" r="4" />
          <path {...stroke} d="M12 2v2 M12 20v2 M2 12h2 M20 12h2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case "send":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M4 12l16-8-6 16-3-7z" />
        </svg>
      );
    case "search":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...stroke} cx="11" cy="11" r="6" />
          <path {...stroke} d="M20 20l-4.5-4.5" />
        </svg>
      );
    case "plus":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M12 5v14 M5 12h14" />
        </svg>
      );
    case "spark":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" />
        </svg>
      );
    case "flame":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M12 3c1 3 4 4.5 4 8a4 4 0 1 1-8 0c0-1.6.7-2.6 1.5-3.5C10.5 6.5 12 5.5 12 3z" />
        </svg>
      );
    case "trophy":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M7 4h10v4a5 5 0 0 1-10 0z M5 5h2v2a2 2 0 0 1-2-2z M17 5h2a2 2 0 0 1-2 2z M9 20h6 M12 13v7" />
        </svg>
      );
    case "trend":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M4 17l5-5 4 4 7-8 M15 8h5v5" />
        </svg>
      );
    case "target":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...stroke} cx="12" cy="12" r="8" />
          <circle {...stroke} cx="12" cy="12" r="4" />
          <circle {...stroke} cx="12" cy="12" r="1" />
        </svg>
      );
    case "book":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z M5 17a3 3 0 0 1 3-3h10" />
        </svg>
      );
    case "check":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M4 12l5 5L20 6" />
        </svg>
      );
    case "clock":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...stroke} cx="12" cy="12" r="8" />
          <path {...stroke} d="M12 7v5l3 2" />
        </svg>
      );
    case "star":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M12 4l2.5 5 5.5.8-4 3.9.9 5.5L12 16.5 7.1 19.2 8 13.7 4 9.8 9.5 9z" />
        </svg>
      );
    case "star-fill":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={1.2}
            strokeLinejoin="round"
            d="M12 4l2.5 5 5.5.8-4 3.9.9 5.5L12 16.5 7.1 19.2 8 13.7 4 9.8 9.5 9z"
          />
        </svg>
      );
    case "edit":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M4 20h4l10-10-4-4L4 16z M14 6l4 4" />
        </svg>
      );
    case "mail":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M3 6h18v12H3z M3 6l9 7 9-7" />
        </svg>
      );
    case "lock":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M6 11h12v9H6z M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      );
    case "eye":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle {...stroke} cx="12" cy="12" r="3" />
        </svg>
      );
    case "eye-off":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M3 3l18 18 M10.6 6.2A10 10 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 4 M6.6 7.7A17 17 0 0 0 2 12s3.5 6 10 6c1.6 0 3-.3 4.2-.8 M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M5 12h14 M13 6l6 6-6 6" />
        </svg>
      );
    case "arrow-left":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M19 12H5 M11 18l-6-6 6-6" />
        </svg>
      );
    case "check-circle":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...stroke} cx="12" cy="12" r="9" />
          <path {...stroke} d="M8 12l3 3 5-5" />
        </svg>
      );
    case "alert-circle":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...stroke} cx="12" cy="12" r="9" />
          <path {...stroke} d="M12 8v5 M12 16.5v.5" />
        </svg>
      );
    case "students":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...stroke} cx="9" cy="9" r="3" />
          <circle {...stroke} cx="17" cy="11" r="2.4" />
          <path {...stroke} d="M3 19c.8-3 3.4-4.5 6-4.5s5.2 1.5 6 4.5 M14.5 19c.6-2 2.2-3 4-3" />
        </svg>
      );
    case "assign":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M6 4h9l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z M14 4v5h5 M9 14l2 2 4-4" />
        </svg>
      );
    case "spark":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" />
        </svg>
      );
    case "pencil":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3" />
        </svg>
      );
    case "alert":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M12 4l9 16H3z M12 10v5 M12 17.5v.5" />
        </svg>
      );
    case "plus":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M12 5v14 M5 12h14" />
        </svg>
      );
    case "search":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <circle {...stroke} cx="11" cy="11" r="6" />
          <path {...stroke} d="M20 20l-4.5-4.5" />
        </svg>
      );
    case "menu":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M4 6h16 M4 12h16 M4 18h16" />
        </svg>
      );
    case "close":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24">
          <path {...stroke} d="M18 6L6 18 M6 6l12 12" />
        </svg>
      );
    default:
      return null;
  }
}
