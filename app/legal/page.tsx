"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "var(--ink)",
          marginBottom: 12,
          paddingBottom: 10,
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.75,
          color: "var(--ink-dim)",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ marginBottom: 12 }}>{children}</p>;
}

function Ul({ children }: { children: React.ReactNode }) {
  return (
    <ul
      style={{
        paddingLeft: 20,
        marginBottom: 12,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      {children}
    </ul>
  );
}

function TermsContent() {
  return (
    <div>
      <Section title="1. Acceptance of Terms">
        <P>
          By accessing or using Thadar ("the Platform", "we", "us", or "our")
          at thadar.com, you agree to be bound by these Terms of Service. If
          you do not agree to these terms, please do not use the Platform.
        </P>
        <P>
          These terms apply to all users of the Platform, including students,
          teachers, and administrators.
        </P>
      </Section>

      <Section title="2. Description of Service">
        <P>
          Thadar is an educational technology platform that provides tools for
          teachers to create and deliver lessons, and for students to access
          course content, complete assignments, and track their learning
          progress.
        </P>
        <P>Features include but are not limited to:</P>
        <Ul>
          <li>Video and text-based lesson delivery</li>
          <li>Assignment creation and submission</li>
          <li>Progress tracking and grade management</li>
          <li>Direct messaging between teachers and students</li>
          <li>Class management tools for teachers</li>
        </Ul>
      </Section>

      <Section title="3. User Accounts">
        <P>
          You must create an account to use most features of the Platform.
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activity that occurs under your
          account.
        </P>
        <P>You agree to:</P>
        <Ul>
          <li>Provide accurate and complete registration information</li>
          <li>Keep your password secure and not share it with others</li>
          <li>Notify us immediately of any unauthorized use of your account</li>
          <li>Not create accounts for others without their consent</li>
        </Ul>
        <P>
          We reserve the right to suspend or terminate accounts that violate
          these terms or that have been inactive for an extended period.
        </P>
      </Section>

      <Section title="4. Acceptable Use">
        <P>You agree not to use the Platform to:</P>
        <Ul>
          <li>Upload or share content that is illegal, harmful, or offensive</li>
          <li>Harass, bully, or intimidate other users</li>
          <li>
            Share, copy, or distribute course content without permission from
            the content creator
          </li>
          <li>
            Attempt to gain unauthorized access to any part of the Platform or
            other users&apos; accounts
          </li>
          <li>
            Use automated tools (bots, scrapers) to access or collect data from
            the Platform
          </li>
          <li>
            Impersonate any person or entity, or falsely represent your
            affiliation with a person or entity
          </li>
          <li>Engage in academic dishonesty, including plagiarism or cheating</li>
        </Ul>
      </Section>

      <Section title="5. Content Ownership">
        <P>
          <strong style={{ color: "var(--ink)" }}>Teacher content:</strong>{" "}
          Teachers retain ownership of all course materials, lessons, and
          assignments they create and upload. By uploading content to the
          Platform, teachers grant Thadar a non-exclusive, royalty-free license
          to host, display, and deliver that content to enrolled students.
        </P>
        <P>
          <strong style={{ color: "var(--ink)" }}>Student submissions:</strong>{" "}
          Students retain ownership of their assignment submissions and work.
          Teachers may view and grade submitted work as part of their
          instructional role.
        </P>
        <P>
          <strong style={{ color: "var(--ink)" }}>Platform content:</strong>{" "}
          All other content on the Platform, including the design, interface,
          logos, and software, is owned by Thadar and protected by intellectual
          property laws.
        </P>
      </Section>

      <Section title="6. Privacy">
        <P>
          Your privacy is important to us. Please review our{" "}
          <Link
            href="/legal?tab=privacy"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            Privacy Policy
          </Link>{" "}
          to understand how we collect, use, and protect your personal
          information.
        </P>
      </Section>

      <Section title="7. Disclaimers">
        <P>
          The Platform is provided on an "as is" and "as available" basis
          without warranties of any kind, either express or implied, including
          but not limited to warranties of merchantability, fitness for a
          particular purpose, or non-infringement.
        </P>
        <P>
          We do not guarantee that the Platform will be uninterrupted,
          error-free, or free of viruses or other harmful components.
        </P>
      </Section>

      <Section title="8. Limitation of Liability">
        <P>
          To the fullest extent permitted by law, Thadar shall not be liable
          for any indirect, incidental, special, consequential, or punitive
          damages arising from your use of or inability to use the Platform,
          even if we have been advised of the possibility of such damages.
        </P>
      </Section>

      <Section title="9. Changes to Terms">
        <P>
          We reserve the right to modify these terms at any time. We will
          notify users of material changes by posting a notice on the Platform
          or by email. Continued use of the Platform after changes constitutes
          acceptance of the updated terms.
        </P>
      </Section>

      <Section title="10. Contact">
        <P>
          For questions about these Terms of Service, please contact us at{" "}
          <a
            href="mailto:liam@irrssue.com"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            liam@irrssue.com
          </a>
          .
        </P>
      </Section>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div>
      <Section title="1. Introduction">
        <P>
          Thadar ("we", "our", or "us") is committed to protecting your
          personal information. This Privacy Policy explains what data we
          collect, how we use it, and your rights regarding that data.
        </P>
        <P>
          This policy applies to all users of thadar.com, including students,
          teachers, and administrators.
        </P>
      </Section>

      <Section title="2. Information We Collect">
        <P>
          <strong style={{ color: "var(--ink)" }}>
            Information you provide:
          </strong>
        </P>
        <Ul>
          <li>Name and email address when you register</li>
          <li>Profile information you choose to add</li>
          <li>Content you upload (lessons, assignments, submissions)</li>
          <li>Messages sent through the Platform</li>
        </Ul>
        <P>
          <strong style={{ color: "var(--ink)" }}>
            Information collected automatically:
          </strong>
        </P>
        <Ul>
          <li>
            Usage data — pages visited, features used, time spent on the
            Platform
          </li>
          <li>Device and browser information</li>
          <li>IP address and approximate location (country/region level)</li>
          <li>
            Lesson progress data — which lessons you&apos;ve watched and how far
          </li>
          <li>Assignment completion and grade data</li>
        </Ul>
      </Section>

      <Section title="3. How We Use Your Information">
        <P>We use the information we collect to:</P>
        <Ul>
          <li>Provide, operate, and improve the Platform</li>
          <li>Authenticate your identity and maintain your session</li>
          <li>Track and display your learning progress</li>
          <li>Facilitate communication between teachers and students</li>
          <li>Send important account and Platform updates</li>
          <li>Detect and prevent fraud, abuse, and security incidents</li>
          <li>Comply with legal obligations</li>
        </Ul>
        <P>
          We do not sell your personal information to third parties. We do not
          use your data for targeted advertising.
        </P>
      </Section>

      <Section title="4. Data Storage and Security">
        <P>
          Your data is stored on servers located on private infrastructure. We
          implement appropriate technical and organizational measures to protect
          your personal information against unauthorized access, alteration,
          disclosure, or destruction.
        </P>
        <P>
          Measures include encrypted connections (HTTPS/TLS), access controls,
          and regular backups. However, no method of transmission over the
          internet is 100% secure, and we cannot guarantee absolute security.
        </P>
      </Section>

      <Section title="5. Data Sharing">
        <P>
          We do not share your personal information with third parties except in
          the following circumstances:
        </P>
        <Ul>
          <li>
            <strong style={{ color: "var(--ink)" }}>Within your class:</strong>{" "}
            Teachers can see student names and progress within their own
            classes. Students can see teacher names and published course
            content.
          </li>
          <li>
            <strong style={{ color: "var(--ink)" }}>Service providers:</strong>{" "}
            We use a limited number of trusted third-party services (e.g.,
            email delivery, error monitoring) that may process data on our
            behalf under strict confidentiality obligations.
          </li>
          <li>
            <strong style={{ color: "var(--ink)" }}>Legal requirements:</strong>{" "}
            If required by law or in response to valid legal process.
          </li>
        </Ul>
      </Section>

      <Section title="6. Cookies and Sessions">
        <P>
          We use session cookies to keep you logged in and to remember your
          preferences. We do not use tracking cookies or third-party advertising
          cookies.
        </P>
        <P>
          You can configure your browser to refuse cookies, but some features
          of the Platform may not function properly without them.
        </P>
      </Section>

      <Section title="7. Children's Privacy">
        <P>
          The Platform may be used by students under the age of 13 in an
          educational context. In such cases, we collect only the minimum
          information necessary to provide the service, and we do not use
          children&apos;s data for any purpose other than delivering the
          educational service.
        </P>
        <P>
          If you are a parent or guardian and believe your child has provided
          us with personal information without your consent, please contact us
          and we will promptly address the situation.
        </P>
      </Section>

      <Section title="8. Your Rights">
        <P>You have the right to:</P>
        <Ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>
            Request deletion of your account and associated personal data
          </li>
          <li>Export your data in a portable format</li>
          <li>Withdraw consent where processing is based on consent</li>
        </Ul>
        <P>
          To exercise any of these rights, please contact us at{" "}
          <a
            href="mailto:liam@irrssue.com"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            liam@irrssue.com
          </a>
          .
        </P>
      </Section>

      <Section title="9. Data Retention">
        <P>
          We retain your personal information for as long as your account is
          active or as needed to provide the service. If you request account
          deletion, we will delete your personal data within 30 days, except
          where retention is required by law.
        </P>
        <P>
          Anonymized or aggregated data (e.g., usage statistics) may be
          retained indefinitely as it cannot be used to identify you.
        </P>
      </Section>

      <Section title="10. Changes to This Policy">
        <P>
          We may update this Privacy Policy from time to time. We will notify
          you of significant changes by posting a notice on the Platform or by
          email. The date at the top of this page reflects the most recent
          update.
        </P>
      </Section>

      <Section title="11. Contact">
        <P>
          For questions, concerns, or requests related to this Privacy Policy,
          please contact us at{" "}
          <a
            href="mailto:liam@irrssue.com"
            style={{ color: "var(--accent)", textDecoration: "none" }}
          >
            liam@irrssue.com
          </a>
          .
        </P>
      </Section>
    </div>
  );
}
