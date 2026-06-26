"use client";

// Icon set for the student surface, matching the Claude Design handoff line
// weights (1.7px strokes). Kept separate from the app's main Icon so the two
// visual languages don't drift into each other.

interface Props {
  name: string;
  size?: number;
  sw?: number;
}

export default function StudentIcon({ name, size = 20, sw = 1.7 }: Props) {
  const s = size;
  const k = {
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "home":
      return <svg width={s} height={s} viewBox="0 0 24 24"><path {...k} d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" /></svg>;
    case "classes":
      return <svg width={s} height={s} viewBox="0 0 24 24"><path {...k} d="M3 6h13a2 2 0 0 1 2 2v12H5a2 2 0 0 1-2-2z M3 6a2 2 0 0 1 2-2h11v2 M8 10h6 M8 14h6" /></svg>;
    case "assign":
      return <svg width={s} height={s} viewBox="0 0 24 24"><path {...k} d="M6 4h9l4 4v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z M14 4v5h5 M9 14l2 2 4-4" /></svg>;
    case "grades":
      return <svg width={s} height={s} viewBox="0 0 24 24"><path {...k} d="M4 19V9 M9 19V5 M14 19v-7 M19 19v-10 M3 21h18" /></svg>;
    case "inbox":
      return <svg width={s} height={s} viewBox="0 0 24 24"><path {...k} d="M4 7l8 5 8-5 M4 7v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7l-8-4z" /></svg>;
    case "profile":
      return <svg width={s} height={s} viewBox="0 0 24 24"><circle {...k} cx="12" cy="9" r="3.4" /><path {...k} d="M5 20c1.2-3.2 4-5 7-5s5.8 1.8 7 5" /></svg>;
    case "send":
      return <svg width={s} height={s} viewBox="0 0 24 24"><path {...k} d="M4 12l16-8-6 16-3-7z" /></svg>;
    case "arrow":
      return <svg width={s} height={s} viewBox="0 0 24 24"><path {...k} d="M5 12h14 M13 6l6 6-6 6" /></svg>;
    case "back":
      return <svg width={s} height={s} viewBox="0 0 24 24"><path {...k} d="M19 12H5 M11 6l-6 6 6 6" /></svg>;
    case "up":
      return <svg width={s} height={s} viewBox="0 0 24 24"><path {...k} d="M5 17l5-5 4 3 6-8 M16 4h4v4" /></svg>;
    case "plus":
      return <svg width={s} height={s} viewBox="0 0 24 24"><path {...k} d="M12 5v14 M5 12h14" /></svg>;
    case "edit":
      return <svg width={s} height={s} viewBox="0 0 24 24"><path {...k} d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3" /></svg>;
    case "menu":
      return <svg width={s} height={s} viewBox="0 0 24 24"><path {...k} d="M4 7h16 M4 12h16 M4 17h16" /></svg>;
    case "close":
      return <svg width={s} height={s} viewBox="0 0 24 24"><path {...k} d="M6 6l12 12 M18 6L6 18" /></svg>;
    case "switch":
      return <svg width={s} height={s} viewBox="0 0 24 24"><path {...k} d="M4 8h13l-3-3 M20 16H7l3 3" /></svg>;
    default:
      return null;
  }
}
