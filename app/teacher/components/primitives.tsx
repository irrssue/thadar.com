"use client";

import Icon from "../../components/Icon";

/* ---- Layout wrappers ---- */

export function WfBox({
  children,
  solid,
  style,
  className,
}: {
  children: React.ReactNode;
  solid?: boolean;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        border: `1.5px ${solid ? "solid" : "dashed"} var(--stroke)`,
        borderRadius: 14,
        background: "var(--surface)",
        padding: "18px 20px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CornerTag({ label }: { label: string }) {
  return (
    <span style={{
      position: "absolute",
      top: -12, left: 18,
      background: "var(--bg)",
      padding: "0 8px",
      fontFamily: "var(--font-mono)",
      fontSize: 11,
      letterSpacing: 1,
      textTransform: "uppercase" as const,
      color: "var(--ink-dim)",
    }}>
      {label}
    </span>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 14,
      color: "var(--ink-dim)",
      letterSpacing: "0.5px",
      textTransform: "uppercase" as const,
      fontFamily: "var(--font-mono)",
      marginBottom: 10,
    }}>
      {children}
    </div>
  );
}

/* ---- Pill stub ---- */

type PillVariant = "default" | "active" | "sage" | "danger";

export function PillStub({
  children,
  variant = "default",
  style,
  onClick,
}: {
  children: React.ReactNode;
  variant?: PillVariant;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const colorMap: Record<PillVariant, { border: string; color: string }> = {
    default: { border: "var(--ink-faint)", color: "var(--ink-dim)" },
    active:  { border: "var(--accent)",   color: "var(--accent)" },
    sage:    { border: "var(--accent-2)",  color: "var(--accent-2)" },
    danger:  { border: "var(--danger)",    color: "var(--danger)" },
  };
  const { border, color } = colorMap[variant];

  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      onClick={onClick}
      style={{
        border: `1.2px solid ${border}`,
        borderRadius: 999,
        padding: "4px 10px",
        color,
        fontSize: 13,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "var(--font-sans)",
        background: "transparent",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

/* ---- Avatar ---- */

export function Avatar({
  name,
  size = 32,
}: {
  name: string;
  size?: number;
}) {
  const initials = name
    .replace(/^Parent · /, "")
    .replace(/^Admin · /, "")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{
      width: size, height: size,
      borderRadius: 999,
      background: "var(--accent-soft)",
      color: "var(--accent)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-mono)",
      fontSize: size > 40 ? 18 : 11,
      fontWeight: 600,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

/* ---- Check box stub ---- */

export function CheckBox() {
  return (
    <div style={{
      width: 18, height: 18,
      border: "1.2px solid var(--stroke)",
      borderRadius: 5,
      flexShrink: 0,
    }} />
  );
}

/* ---- Row ---- */

export function Row({
  children,
  urgent,
  style,
}: {
  children: React.ReactNode;
  urgent?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 12px",
      border: `1.2px dashed ${urgent ? "rgba(217,122,122,0.45)" : "var(--ink-faint)"}`,
      borderRadius: 10,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ---- Progress bar ---- */

export function ProgressBar({ value }: { value: number }) {
  return (
    <div>
      <div style={{
        height: 6, borderRadius: 999,
        background: "rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}>
        <span style={{
          display: "block",
          height: "100%",
          width: `${value}%`,
          background: "var(--accent-2)",
        }} />
      </div>
      <div style={{
        fontSize: 11,
        color: "var(--ink-dim)",
        fontFamily: "var(--font-mono)",
        marginTop: 4,
      }}>
        {value}%
      </div>
    </div>
  );
}

/* ---- Btn ---- */

export function Btn({
  children,
  variant = "default",
  onClick,
  style,
}: {
  children: React.ReactNode;
  variant?: "default" | "primary" | "solid";
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 14px",
        borderRadius: 999,
        border: variant === "default" ? "1.4px solid var(--stroke)" : "1.4px solid var(--accent)",
        background: variant === "solid" ? "var(--accent-soft)" : "transparent",
        color: variant === "default" ? "var(--ink)" : "var(--accent)",
        fontFamily: "var(--font-sans)",
        fontSize: 15,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ---- AI chat input ---- */

export function AiInput({ placeholder }: { placeholder: string }) {
  return (
    <div style={{
      display: "flex",
      gap: 8,
      alignItems: "center",
      border: "1.4px solid var(--stroke)",
      borderRadius: 12,
      padding: "10px 12px",
      background: "var(--surface-2)",
    }}>
      <Icon name="spark" size={16} />
      <span style={{ color: "var(--ink-faint)", flex: 1, fontSize: 16 }}>{placeholder}</span>
      <span style={{
        width: 30, height: 30,
        borderRadius: 8,
        border: "1.2px solid var(--ink-faint)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--ink-dim)",
      }}>
        <Icon name="send" size={16} />
      </span>
    </div>
  );
}

/* ---- AI bubble ---- */

export function Bubble({ children, me }: { children: React.ReactNode; me?: boolean }) {
  return (
    <div style={{
      maxWidth: "86%",
      padding: "10px 14px",
      borderRadius: 14,
      border: me ? "1.2px dashed var(--accent-ring)" : "1.2px dashed var(--ink-faint)",
      background: me ? "var(--accent-tint)" : "transparent",
      fontSize: 16,
      lineHeight: 1.35,
      alignSelf: me ? "flex-end" : "flex-start",
    }}>
      {children}
    </div>
  );
}

/* ---- Command bar ---- */

export function CommandBar() {
  return (
    <div style={{
      position: "fixed",
      left: 0,
      right: 0,
      bottom: 24,
      display: "flex",
      justifyContent: "center",
      pointerEvents: "none",
      zIndex: 40,
    }}>
      <div style={{
        width: "min(50%, 720px)",
        minWidth: 280,
        border: "1.4px solid var(--stroke)",
        borderRadius: 14,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "var(--surface-2)",
        boxShadow: "0 8px 28px rgba(0,0,0,0.32)",
        pointerEvents: "auto",
      }}>
        <Icon name="search" />
        <span style={{ color: "var(--ink-faint)", fontSize: 16, flex: 1 }}>
          Jump to a class, student, assignment, or family…
        </span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--ink-dim)",
          border: "1px solid var(--ink-faint)",
          padding: "3px 6px",
          borderRadius: 5,
        }}>⌘ K</span>
      </div>
    </div>
  );
}

/* ---- Page header ---- */

export function PageHeader({
  title,
  highlight,
  sub,
}: {
  title: string;
  highlight: string;
  sub: string;
}) {
  return (
    <>
      <h1 style={{
        fontWeight: 700,
        fontSize: 56,
        margin: "16px 0 4px",
        letterSpacing: "-0.5px",
        fontFamily: "var(--font-sans)",
      }}>
        {title} <span style={{ color: "var(--accent)" }}>{highlight}</span>
      </h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 18, margin: "0 0 28px", fontWeight: 300 }}>
        {sub}
      </p>
    </>
  );
}
