"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { TermsContent } from "./_components/TermsContent";
import { PrivacyContent } from "./_components/PrivacyContent";

type Tab = "terms" | "privacy";

export default function LegalPage() {
  return (
    <Suspense>
      <LegalContent />
    </Suspense>
  );
}

function LegalContent() {
  const params = useSearchParams();
  const [tab, setTab] = useState<Tab>(() =>
    params.get("tab") === "privacy" ? "privacy" : "terms"
  );

  useEffect(() => {
    if (params.get("tab") === "privacy") setTab("privacy");
  }, [params]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
        color: "var(--ink)",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "60px 24px 80px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--ink-dim)",
              fontSize: 13,
              textDecoration: "none",
              marginBottom: 32,
            }}
          >
            ← Back to Thadar
          </Link>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "var(--ink)",
              marginBottom: 6,
            }}
          >
            Legal
          </h1>
          <p style={{ color: "var(--ink-dim)", fontSize: 14 }}>
            Last updated: June 24, 2026
          </p>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            gap: 4,
            backgroundColor: "var(--surface)",
            border: "1px solid var(--hairline)",
            borderRadius: 10,
            padding: 4,
            marginBottom: 48,
            width: "fit-content",
          }}
        >
          {(["terms", "privacy"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 20px",
                borderRadius: 7,
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 500,
                transition: "all 0.15s ease",
                backgroundColor: tab === t ? "var(--accent)" : "transparent",
                color: tab === t ? "#000" : "var(--ink-dim)",
              }}
            >
              {t === "terms" ? "Terms of Service" : "Privacy Policy"}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "terms" ? <TermsContent /> : <PrivacyContent />}
      </div>
    </div>
  );
}
