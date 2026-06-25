"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Icon from "../components/Icon";

// Only allow same-origin paths — callbackUrl comes from the query string,
// so anything else is an open-redirect vector.
function safeCallbackPath(raw: string | null): string {
  if (!raw) return "/home";
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return "/home";
    return url.pathname + url.search;
  } catch {
    return "/home";
  }
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        const statusRes = await fetch(
          `/api/auth/account-status?email=${encodeURIComponent(email)}`,
        ).catch(() => null);
        const statusJson = statusRes
          ? await statusRes.json().catch(() => null)
          : null;
        if (statusJson?.status === "pending") {
          setError("Your account is pending admin approval. You'll be able to sign in once approved.");
        } else if (statusJson?.status === "suspended") {
          setError("Your account has been suspended. Contact an admin for help.");
        } else {
          setError("Invalid email or password");
        }
        return;
      }

      // Full-page navigation: a client-side router.push here can reuse the
      // pre-login prefetch of the target route (a 307 back to /login), which
      // bounces the user to the login form even though the session is valid.
      window.location.assign(safeCallbackPath(callbackUrl));
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link
            href="/home"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              color: "var(--ink)",
              fontSize: 24,
              fontWeight: 600,
              letterSpacing: "-0.3px",
            }}
          >
            <span style={{ color: "var(--accent)", display: "inline-flex" }}>
              <Icon name="spark" size={22} />
            </span>
            Thadar
          </Link>
        </div>

        <div
          style={{
            border: "1px solid var(--ink-faint)",
            borderRadius: 16,
            background: "var(--surface)",
            padding: "28px 28px 24px",
          }}
        >
          <h1
            style={{
              fontSize: 26,
              fontWeight: 600,
              margin: "0 0 6px",
              letterSpacing: "-0.3px",
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              color: "var(--ink-dim)",
              fontSize: 14,
              margin: "0 0 22px",
            }}
          >
            Sign in to continue your learning.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field
              icon="mail"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
            />

            <Field
              icon="lock"
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={setPassword}
              trailing={
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
                    padding: 2,
                  }}
                >
                  <Icon name={showPw ? "eye-off" : "eye"} size={16} />
                </button>
              }
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -4 }}>
              <a
                href="#"
                style={{
                  color: "var(--ink-dim)",
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </a>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  marginTop: 4,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--danger-ring, #b54a3d)",
                  background: "var(--danger-bg, rgba(181, 74, 61, 0.08))",
                  color: "var(--danger, #b54a3d)",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 6,
                width: "100%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid var(--accent-ring)",
                background: "var(--accent)",
                color: "#1a1814",
                fontSize: 14,
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
                letterSpacing: "0.1px",
              }}
            >
              {submitting ? "Signing in…" : "Sign in"}
              <Icon name="arrow-right" size={16} />
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: 18,
            color: "var(--ink-dim)",
            fontSize: 14,
          }}
        >
          New to Thadar?{" "}
          <Link
            href="/signup/intent"
            style={{
              color: "var(--accent)",
              fontSize: 14,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Create one
          </Link>
        </p>

        <p
          style={{
            textAlign: "center",
            marginTop: 24,
            color: "var(--ink-faint)",
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          By continuing, you agree to our{" "}
          <Link href="/legal" style={{ color: "var(--ink-dim)" }}>
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/legal?tab=privacy" style={{ color: "var(--ink-dim)" }}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

interface FieldProps {
  icon: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  trailing?: React.ReactNode;
}

function Field({ icon, type, placeholder, value, onChange, trailing }: FieldProps) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: "1px solid var(--stroke)",
        borderRadius: 10,
        padding: "10px 12px",
        background: "var(--surface-2)",
      }}
    >
      <span style={{ color: "var(--ink-dim)", display: "inline-flex" }}>
        <Icon name={icon} size={16} />
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "var(--ink)",
          fontSize: 14,
          fontFamily: "inherit",
        }}
      />
      {trailing}
    </label>
  );
}
