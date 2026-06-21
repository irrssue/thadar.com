"use client";

// Settings — platform configuration & policy, persisted to PlatformSetting.
// Boolean rows are live toggles that PATCH /api/admin/settings; value rows are
// shown read-only for now.

import { useState } from "react";
import PageHead from "../../components/PageHead";
import { type SettingsData } from "../../data";
import { useAdminData, adminMutate } from "../../useAdmin";

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
  const { data, loading, error, refetch } = useAdminData<SettingsData>("/api/admin/settings");
  const [busy, setBusy] = useState<string | null>(null);
  const s = data ?? {};

  async function toggle(key: string) {
    if (busy) return;
    setBusy(key);
    try {
      await adminMutate("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({ key, value: !s[key] }),
      });
      await refetch();
    } catch {
      // surfaced by a no-op; value simply won't flip
    } finally {
      setBusy(null);
    }
  }

  function Toggle({ k }: { k: string }) {
    const on = !!s[k];
    return (
      <button
        type="button"
        className={"toggle " + (on ? "on" : "")}
        role="switch"
        aria-checked={on}
        disabled={!!busy}
        onClick={() => toggle(k)}
        style={{ cursor: busy ? "default" : "pointer", border: "none", padding: 0 }}
      />
    );
  }

  const Val = ({ k }: { k: string }) => <span className="sval">{String(s[k] ?? "—")}</span>;

  return (
    <div className="reveal">
      <PageHead title="Platform" accent="settings" sub={loading ? "loading…" : "thadar.com · configuration & policy"} />
      {error && <div className="card" style={{ padding: 16, color: "var(--danger)" }}>{error}</div>}
      <div className="set-grid">
        <div className="card reveal">
          <div className="tile-title" style={{ fontSize: 17, marginBottom: 8 }}>
            Access & security
          </div>
          <Row label="Enforce 2FA for staff" desc="all teacher & admin accounts">
            <Toggle k="security.enforce2fa" />
          </Row>
          <Row label="Admin domain lock" desc="sign-in only from admin.thadar.com">
            <Toggle k="security.adminDomainLock" />
          </Row>
          <Row label="Session timeout" desc="idle auto-logout">
            <Val k="security.sessionTimeout" />
          </Row>
          <Row label="Allow self-registration" desc="students via invite code">
            <Toggle k="security.selfRegistration" />
          </Row>
        </div>
        <div className="card reveal">
          <div className="tile-title" style={{ fontSize: 17, marginBottom: 8 }}>
            Content & moderation
          </div>
          <Row label="Auto-filter messages" desc="flag before delivery">
            <Toggle k="moderation.autoFilter" />
          </Row>
          <Row label="Require teacher verification" desc="manual document check">
            <Toggle k="moderation.requireTeacherVerification" />
          </Row>
          <Row label="Profanity blocking" desc="block on send">
            <Toggle k="moderation.profanityBlock" />
          </Row>
          <Row label="Data retention" desc="submissions & logs">
            <Val k="moderation.dataRetention" />
          </Row>
        </div>
        <div className="card reveal">
          <div className="tile-title" style={{ fontSize: 17, marginBottom: 8 }}>
            Branding
          </div>
          <Row label="Platform name" desc="shown across the app">
            <Val k="branding.platformName" />
          </Row>
          <Row label="Support email" desc="footer contact">
            <Val k="branding.supportEmail" />
          </Row>
        </div>
        <div className="card reveal">
          <div className="tile-title" style={{ fontSize: 17, marginBottom: 8 }}>
            Maintenance
          </div>
          <Row label="Nightly backups" desc="03:00 UTC">
            <Toggle k="maintenance.nightlyBackups" />
          </Row>
          <Row label="Maintenance mode" desc="read-only for non-admins">
            <Toggle k="maintenance.maintenanceMode" />
          </Row>
          <Row label="Release channel" desc="deploy ring">
            <Val k="maintenance.releaseChannel" />
          </Row>
        </div>
      </div>
    </div>
  );
}
