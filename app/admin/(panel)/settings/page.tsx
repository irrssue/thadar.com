"use client";

// Settings — platform configuration & policy.

import PageHead from "../../components/PageHead";

function SetToggle({ on }: { on: boolean }) {
  return <span className={"toggle " + (on ? "on" : "")} role="switch" aria-checked={on} />;
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="setrow">
      <div className="sbody">
        <div className="sl">{label}</div>
        {desc && <div className="sd">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div className="reveal">
      <PageHead title="Platform" accent="settings" sub="thadar.com · configuration & policy" />
      <div className="set-grid">
        <div className="card reveal">
          <div className="tile-title" style={{ fontSize: 17, marginBottom: 8 }}>
            Access & security
          </div>
          <Row label="Enforce 2FA for staff" desc="all teacher & admin accounts">
            <SetToggle on />
          </Row>
          <Row label="Admin domain lock" desc="sign-in only from admin.thadar.com">
            <SetToggle on />
          </Row>
          <Row label="Session timeout" desc="idle auto-logout">
            <span className="sval">30 min</span>
          </Row>
          <Row label="Allow self-registration" desc="students via invite code">
            <SetToggle on />
          </Row>
        </div>
        <div className="card reveal">
          <div className="tile-title" style={{ fontSize: 17, marginBottom: 8 }}>
            Content & moderation
          </div>
          <Row label="Auto-filter messages" desc="flag before delivery">
            <SetToggle on />
          </Row>
          <Row label="Require teacher verification" desc="manual document check">
            <SetToggle on />
          </Row>
          <Row label="Profanity blocking" desc="block on send">
            <SetToggle on={false} />
          </Row>
          <Row label="Data retention" desc="submissions & logs">
            <span className="sval">24 months</span>
          </Row>
        </div>
        <div className="card reveal">
          <div className="tile-title" style={{ fontSize: 17, marginBottom: 8 }}>
            Branding
          </div>
          <Row label="Platform name" desc="shown across the app">
            <span className="sval">thadar.</span>
          </Row>
          <Row label="Primary accent" desc="UI theme colour">
            <span className="sval" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: "var(--accent)", display: "inline-block" }} />
              warm
            </span>
          </Row>
          <Row label="Support email" desc="footer contact">
            <span className="sval">help@thadar.edu</span>
          </Row>
        </div>
        <div className="card reveal">
          <div className="tile-title" style={{ fontSize: 17, marginBottom: 8 }}>
            Maintenance
          </div>
          <Row label="Nightly backups" desc="03:00 UTC · 341 GB">
            <SetToggle on />
          </Row>
          <Row label="Maintenance mode" desc="read-only for non-admins">
            <SetToggle on={false} />
          </Row>
          <Row label="Release channel" desc="deploy ring">
            <span className="sval">stable</span>
          </Row>
        </div>
      </div>
    </div>
  );
}
