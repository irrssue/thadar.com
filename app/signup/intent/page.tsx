"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/app/components/Icon";

type Intent = "teacher" | "student";

export default function IntentPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Intent | null>(null);

  function handleContinue() {
    if (!selected) return;
    router.push(`/signup/register?role=${selected}`);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "var(--ink)",
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "-0.3px",
              marginBottom: 24,
            }}
          >
            <span style={{ color: "var(--accent)", display: "inline-flex" }}>
              <Icon name="spark" size={22} />
            </span>
            Thadar
          </div>
          <h1
            style={{
              fontSize: 30,
              fontWeight: 600,
              margin: "0 0 10px",
              letterSpacing: "-0.4px",
            }}
          >
            What brings you to Thadar?
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: 15, margin: 0 }}>
            Choose how you’ll start. You can switch any time.
          </p>
        </div>

        <div
          className="intent-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          <IntentCard
            emoji="📚"
            title="I want to teach"
            description="Create classes, post lessons, give assignments."
            active={selected === "teacher"}
            onClick={() => setSelected("teacher")}
          />
          <IntentCard
            emoji="🎒"
            title="I want to learn"
            description="Join a class with a code and start learning."
            active={selected === "student"}
            onClick={() => setSelected("student")}
          />
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selected}
          style={{
            marginTop: 22,
            width: "100%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "13px 16px",
            borderRadius: 10,
            border: "1px solid var(--accent-ring)",
            background: selected ? "var(--accent)" : "var(--surface-2)",
            color: selected ? "#1a1814" : "var(--ink-dim)",
            fontSize: 14,
            fontWeight: 600,
            cursor: !selected ? "not-allowed" : "pointer",
            transition: "background 140ms",
          }}
        >
          Continue
          <Icon name="arrow-right" size={16} />
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: 20,
            color: "var(--ink-faint)",
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          This sets where you land after login. It is not a permanent role.
        </p>
      </div>

      <style>{`
        @media (max-width: 420px) {
          .intent-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

interface IntentCardProps {
  emoji: string;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

function IntentCard({ emoji, title, description, active, onClick }: IntentCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        textAlign: "left",
        padding: "20px 18px",
        borderRadius: 14,
        border: `1px solid ${active ? "var(--accent-ring)" : "var(--stroke)"}`,
        background: active ? "var(--accent-soft, var(--surface-2))" : "var(--surface)",
        cursor: "pointer",
        transition: "border-color 140ms, background 140ms, transform 140ms",
        transform: active ? "translateY(-1px)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        outline: "none",
      }}
    >
      <div style={{ fontSize: 28, lineHeight: 1 }}>{emoji}</div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "var(--ink)",
          letterSpacing: "-0.2px",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 13, color: "var(--ink-dim)", lineHeight: 1.5 }}>
        {description}
      </div>
    </button>
  );
}
