"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Icon from "@/components/Icon";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageInner />
    </Suspense>
  );
}

function ResetPasswordPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <PageShell>
        <StatusCard
          icon="alert-circle"
          heading="Invalid link"
          body="This password reset link is missing or malformed. Request a new one from the sign-in page."
          cta={{ label: "Back to sign in", href: "/login" }}
        />
      </PageShell>
    );
  }

  if (done) {
    return (
      <PageShell>
        <StatusCard
          icon="check-circle"
          heading="Password updated"
          body="Your new password is set. Sign in to continue."
          cta={{ label: "Sign in", href: "/login" }}
        />
      </PageShell>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(
          json?.error ?? "This reset link is invalid or has expired. Request a new one.",
        );
        return;
      }
      setDone(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell>
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
          Set new password
        </h1>
        <p style={{ color: "var(--ink-dim)", fontSize: 14, margin: "0 0 22px" }}>
          Choose a new password for your account.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <Field
            icon="lock"
            type={showPw ? "text" : "password"}
            placeholder="New password"
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

          <Field
            icon="lock"
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirm}
            onChange={setConfirm}
            trailing={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--ink-dim)",
                  display: "inline-flex",
                  padding: 2,
                }}
              >
                <Icon name={showConfirm ? "eye-off" : "eye"} size={16} />
              </button>
            }
          />

          {error && (
            <div
              role="alert"
              style={{
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
            {submitting ? "Updating…" : "Update password"}
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
        <Link
          href="/login"
          style={{
            color: "var(--accent)",
            fontWeight: 500,
            textDecoration: "none",
            padding: "6px 4px",
            margin: "-6px -4px",
            display: "inline-block",
          }}
        >
          Back to sign in
        </Link>
      </p>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
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
        {children}
      </div>
    </div>
  );
}

function StatusCard({
  icon,
  heading,
  body,
  cta,
}: {
  icon: string;
  heading: string;
  body: string;
  cta: { label: string; href: string };
}) {
  return (
    <div
      style={{
        border: "1px solid var(--ink-faint)",
        borderRadius: 16,
        background: "var(--surface)",
        padding: "28px 28px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 12,
      }}
    >
      <span style={{ color: "var(--ink-dim)", display: "inline-flex" }}>
        <Icon name={icon} size={32} />
      </span>
      <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: "-0.3px" }}>
        {heading}
      </h1>
      <p style={{ color: "var(--ink-dim)", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
        {body}
      </p>
      <Link
        href={cta.href}
        style={{
          marginTop: 8,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "11px 20px",
          borderRadius: 10,
          border: "1px solid var(--accent-ring)",
          background: "var(--accent)",
          color: "#1a1814",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
          letterSpacing: "0.1px",
        }}
      >
        {cta.label}
        <Icon name="arrow-right" size={16} />
      </Link>
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
          fontSize: 16,
          fontFamily: "inherit",
        }}
      />
      {trailing}
    </label>
  );
}
