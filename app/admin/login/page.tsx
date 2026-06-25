"use client";

// Admin login gate — restricted to admin.thadar.com.
//
// Authenticates against Auth.js (credentials) and then verifies the account is
// a platform administrator by probing an admin endpoint. Non-admins are
// rejected with a message rather than let into the (panel) routes, which are
// themselves gated server-side in (panel)/layout.tsx.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import AdminIcon from "../components/AdminIcon";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const result = await signIn("credentials", { email, password: pw, redirect: false });
      if (!result || result.error) {
        // Only `CredentialsSignin` means the email/password were actually wrong.
        // Any other Auth.js error (e.g. `Configuration` — a server-side throw such
        // as a database/schema failure, or `MissingCSRF`) is NOT a bad password,
        // and must not be reported as one or it sends you chasing the wrong thing.
        const code = result?.error;
        if (code && code !== "CredentialsSignin") {
          setError(`Sign-in is temporarily unavailable (${code}). This is a server problem, not your password — try again shortly or check the server logs.`);
        } else {
          setError("Invalid email or password.");
        }
        return;
      }
      // Confirm platform-admin privileges before entering the panel.
      const probe = await fetch("/api/admin/me", { cache: "no-store" });
      if (!probe.ok) {
        setError("This account is not a platform administrator.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card reveal" onSubmit={submit}>
        <h1 className="login-title">
          thadar<span className="var">.</span> admin
        </h1>
        <p className="login-sub">Control panel access is restricted to platform administrators.</p>

        <div className="field">
          <div className="field-lab">Work email</div>
          <div className="field-in">
            <span className="ico">
              <AdminIcon name="users" size={18} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@thadar.edu"
              autoComplete="username"
            />
          </div>
        </div>
        <div className="field">
          <div className="field-lab">Password</div>
          <div className="field-in">
            <span className="ico">
              <AdminIcon name="lock" size={18} />
            </span>
            <input
              type={showPw ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--ink-dim)",
                display: "inline-flex",
                padding: "0 2px",
                opacity: 0.6,
              }}
            >
              <AdminIcon name={showPw ? "eye-off" : "eye"} size={16} />
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              marginTop: 4,
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid color-mix(in srgb, var(--danger) 40%, transparent)",
              background: "var(--danger-soft)",
              color: "var(--danger)",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <button type="submit" className="login-btn" disabled={busy} style={busy ? { opacity: 0.7 } : undefined}>
          {busy ? "Signing in…" : "Sign in"} <AdminIcon name="arrow" size={16} />
        </button>


      </form>
      <div className="login-bg-meta">All access is logged · sessions expire after 30m idle</div>
    </div>
  );
}
