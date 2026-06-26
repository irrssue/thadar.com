"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Icon from "@/components/Icon";
import { useRedirectIfAuthenticated } from "@/components/useRedirectIfAuthenticated";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageInner />
    </Suspense>
  );
}

function RegisterPageInner() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") === "teacher" ? "teacher" : "student";

  // Already signed in? Don't show the registration form.
  const authStatus = useRedirectIfAuthenticated();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Could not create account");
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (authStatus === "authenticated") return null;

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
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column" }}>
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
          {done ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>🎉</div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  margin: "0 0 10px",
                  letterSpacing: "-0.3px",
                }}
              >
                Account created!
              </h1>
              <p style={{ color: "var(--ink-dim)", fontSize: 14, margin: "0 0 20px", lineHeight: 1.6 }}>
                Your account is pending admin approval. You&apos;ll be able to sign in once approved.
              </p>
              <Link
                href="/login"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "1px solid var(--stroke)",
                  background: "var(--surface-2)",
                  color: "var(--ink)",
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 20 }}>
                <Link
                  href="/signup/intent"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    color: "var(--ink-dim)",
                    fontSize: 13,
                    textDecoration: "none",
                    marginBottom: 16,
                  }}
                >
                  ← Back
                </Link>
                <h1
                  style={{
                    fontSize: 26,
                    fontWeight: 600,
                    margin: "0 0 6px",
                    letterSpacing: "-0.3px",
                  }}
                >
                  Create your account
                </h1>
                <p style={{ color: "var(--ink-dim)", fontSize: 14, margin: 0 }}>
                  Joining as a{" "}
                  <span style={{ color: "var(--ink)", fontWeight: 500 }}>
                    {role === "teacher" ? "teacher" : "student"}
                  </span>
                  .
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Field
                  icon="profile"
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={setName}
                />
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
                  {submitting ? "Creating account…" : "Create account"}
                  <Icon name="arrow-right" size={16} />
                </button>
              </form>
            </>
          )}
        </div>

        {!done && (
          <p
            style={{
              textAlign: "center",
              marginTop: 18,
              color: "var(--ink-dim)",
              fontSize: 14,
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "var(--accent)",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </p>
        )}

        {!done && (
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
        )}
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
