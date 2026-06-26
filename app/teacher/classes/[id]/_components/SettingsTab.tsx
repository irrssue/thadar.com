"use client";

import { useState } from "react";
import { Btn } from "../../../components/primitives";
import type { ApiResponse, ClassDetail } from "./types";
import { denyBtn } from "./ui";

/* ---------------- Settings (invite code + edit/delete) ---------------- */

export function SettingsTab({ klass, onChange }: { klass: ClassDetail; onChange: () => void }) {
  const [working, setWorking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState({ inviteCode: klass.inviteCode, inviteCodeEnabled: klass.inviteCodeEnabled });

  async function generateCode() {
    setWorking(true); setErr(null);
    try {
      const res = await fetch(`/api/classes/${klass.id}/invite-code`, { method: "POST" });
      const json: ApiResponse<{ inviteCode: string; inviteCodeEnabled: boolean }> = await res.json();
      if (!json.success) { setErr(json.error); return; }
      setCode(json.data);
    } finally { setWorking(false); }
  }
  async function toggleEnabled(enabled: boolean) {
    setWorking(true); setErr(null);
    try {
      const res = await fetch(`/api/classes/${klass.id}/invite-code`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      const json: ApiResponse<{ inviteCode: string | null; inviteCodeEnabled: boolean }> = await res.json();
      if (!json.success) { setErr(json.error); return; }
      setCode(json.data);
    } finally { setWorking(false); }
  }
  async function copyCode() {
    if (!code.inviteCode) return;
    await navigator.clipboard.writeText(code.inviteCode);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  }
  async function deleteClass() {
    if (!confirm(`Delete "${klass.name}"? This removes all lessons, assignments, and the roster. This cannot be undone.`)) return;
    const res = await fetch(`/api/classes/${klass.id}`, { method: "DELETE" });
    const json: ApiResponse<unknown> = await res.json();
    if (json.success) window.location.href = "/teacher/classes";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ border: "1.5px dashed var(--stroke)", borderRadius: 14, background: "var(--surface)", padding: "22px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Invite code</div>
          {code.inviteCode && (
            <button
              onClick={copyCode}
              title="Copy invite code"
              aria-label="Copy invite code"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, border: "1.2px solid var(--stroke)", background: "var(--bg)", color: "var(--ink)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
        {code.inviteCode ? (
          <>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 36, fontWeight: 700, letterSpacing: 4, padding: "16px 20px", borderRadius: 10, background: "var(--bg)", border: "1.4px solid var(--stroke)", textAlign: "center" }}>
              {code.inviteCode}
            </div>
            <p style={{ color: "var(--ink-dim)", fontSize: 14, margin: 0 }}>
              {code.inviteCodeEnabled ? "Joining is enabled." : "Joining is disabled — students can't use this code right now."}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Btn onClick={copyCode}>{copied ? "Copied!" : "Copy code"}</Btn>
              <Btn onClick={generateCode} style={{ opacity: working ? 0.5 : 1 }}>{working ? "Working…" : "Regenerate"}</Btn>
              <Btn onClick={() => toggleEnabled(!code.inviteCodeEnabled)} style={{ marginLeft: "auto", opacity: working ? 0.5 : 1 }}>
                {code.inviteCodeEnabled ? "Disable joining" : "Enable joining"}
              </Btn>
            </div>
          </>
        ) : (
          <>
            <p style={{ color: "var(--ink-dim)", fontSize: 14, margin: 0 }}>Generate an invite code so students can request to join.</p>
            <div><Btn variant="primary" onClick={generateCode} style={{ opacity: working ? 0.5 : 1 }}>{working ? "Generating…" : "Generate invite code"}</Btn></div>
          </>
        )}
        {err && <div style={{ color: "var(--danger)", fontSize: 14 }}>{err}</div>}
      </div>

      <div style={{ border: "1.5px dashed var(--danger)", borderRadius: 14, padding: "22px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--danger)" }}>Danger zone</div>
        <p style={{ color: "var(--ink-dim)", fontSize: 14, margin: 0 }}>Deleting a class is permanent.</p>
        <div><button onClick={deleteClass} style={denyBtn}>Delete this class</button></div>
      </div>
    </div>
  );
}
