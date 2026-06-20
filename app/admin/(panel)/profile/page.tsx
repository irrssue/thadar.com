"use client";

// Profile — admin account, session & permissions.

import { useRouter } from "next/navigation";
import PageHead from "../../components/PageHead";
import AdminIcon from "../../components/AdminIcon";
import { ADMIN, initials } from "../../data";

const PERMISSIONS = ["Manage users & roles", "Content moderation", "System & infrastructure", "Billing & exports"];

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="reveal">
      <PageHead title="Admin" accent="account" sub="your session & permissions" />
      <div className="prof-hd">
        <span className="av" style={{ width: 64, height: 64, fontSize: 22 }}>
          {initials(ADMIN.name)}
        </span>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{ADMIN.name}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-dim)", marginTop: 4 }}>
            {ADMIN.id} · super admin · {ADMIN.email}
          </div>
        </div>
        <button className="btn" style={{ marginLeft: "auto" }} onClick={() => router.push("/admin/login")}>
          <AdminIcon name="logout" size={16} /> Sign out
        </button>
      </div>

      <div className="statgrid stagger">
        <div className="stat">
          <div className="sl">Role</div>
          <div className="sv" style={{ fontSize: 22 }}>
            Super admin
          </div>
        </div>
        <div className="stat">
          <div className="sl">Managed users</div>
          <div className="sv">1,842</div>
        </div>
        <div className="stat">
          <div className="sl">Actions · 30d</div>
          <div className="sv">214</div>
        </div>
        <div className="stat">
          <div className="sl">Last login</div>
          <div className="sv" style={{ fontSize: 22 }}>
            09:41a
          </div>
        </div>
      </div>

      <div style={{ height: "var(--gap)" }} />
      <div className="card reveal">
        <div className="tile-title" style={{ fontSize: 17, marginBottom: 8 }}>
          Permissions
        </div>
        {PERMISSIONS.map((p) => (
          <div key={p} className="setrow">
            <div className="sbody">
              <div className="sl">{p}</div>
            </div>
            <span className="pill active">
              <span className="pd" />
              granted
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
