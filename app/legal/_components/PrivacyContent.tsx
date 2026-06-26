import { Section, P, Ul } from "./prose";

export function PrivacyContent() {
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
