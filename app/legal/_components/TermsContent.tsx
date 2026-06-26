import Link from "next/link";
import { Section, P, Ul } from "./prose";

export function TermsContent() {
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
