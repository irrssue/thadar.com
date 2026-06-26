"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Icon from "./Icon";

/**
 * View toggle for the nav. Switching persists default_view server-side, updates
 * the JWT via useSession().update, then navigates to the matching surface
 * (teacher.* / student.*). Per §1.4 this is UI only — never authorization.
 *
 * `current` is the surface the button currently sits on, so the toggle always
 * offers the *other* view.
 */
export default function ViewSwitcher({ current }: { current: "TEACHER" | "STUDENT" }) {
  const router = useRouter();
  const { update } = useSession();
  const [working, setWorking] = useState(false);

  const target = current === "TEACHER" ? "STUDENT" : "TEACHER";
  const label = target === "TEACHER" ? "Switch to teaching" : "Switch to learning";

  async function switchView() {
    if (working) return;
    setWorking(true);
    try {
      const res = await fetch("/api/me/view", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ view: target }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) return;
      // Keep the client session in sync so the next render knows the new view.
      await update({ defaultView: target });
      router.push(json.data.redirect);
      router.refresh();
    } finally {
      setWorking(false);
    }
  }

  return (
    <button
      onClick={switchView}
      aria-label={label}
      title={label}
      disabled={working}
      style={{
        pointerEvents: "auto",
        width: "100%",
        height: 42,
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 12px",
        borderRadius: 10,
        border: "none",
        background: "transparent",
        color: "var(--ink-dim)",
        cursor: working ? "default" : "pointer",
        opacity: working ? 0.5 : 1,
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        transition: "background 120ms, color 120ms",
      }}
      className="nav-btn"
    >
      <span style={{ display: "inline-flex", flexShrink: 0 }}>
        <Icon name={target === "TEACHER" ? "book" : "students"} />
      </span>
      <span className="side-label" style={{ whiteSpace: "nowrap", overflow: "hidden" }}>
        {label}
      </span>
    </button>
  );
}
