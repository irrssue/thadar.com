"use client";

// Profile — the signed-in admin's account, session & permissions, from
// /api/admin/me. Sign out ends the Auth.js session.

import { signOut } from "next-auth/react";
import PageHead from "../../components/PageHead";
import AdminIcon from "../../components/AdminIcon";
import { initials, type AdminProfile } from "../../data";
import { useAdminData } from "../../useAdmin";

export default function ProfilePage() {
  const { data, loading, error } = useAdminData<AdminProfile>("/api/admin/me");

  if (loading) return <div className="reveal"><PageHead title="Admin" accent="account" sub="loading…" /></div>;
  if (error || !data) return <div className="reveal"><PageHead title="Admin" accent="account" sub={error ?? "Failed to load."} /></div>;

  return (
    <div className="reveal">
      <PageHead title="Admin" accent="account" sub="your session & permissions" />
      <div className="prof-hd">
        <span className="av" style={{ width: 64, height: 64, fontSize: 22 }}>
          {initials(data.name)}
        </span>
        <div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{data.name}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-dim)", marginTop: 4 }}>
            {data.id} · {data.role.toLowerCase()} · {data.email}
          </div>
        </div>
        <button className="btn" style={{ marginLeft: "auto" }} onClick={() => signOut({ callbackUrl: "/admin/login" })}>
          <AdminIcon name="logout" size={16} /> Sign out
        </button>
      </div>

      <div className="statgrid stagger">
        <div className="stat">
          <div className="sl">Role</div>
          <div className="sv" style={{ fontSize: 22 }}>
            {data.role}
          </div>
        </div>
        <div className="stat">
          <div className="sl">Managed users</div>
          <div className="sv">{data.managedUsers.toLocaleString()}</div>
        </div>
        <div className="stat">
          <div className="sl">Actions · 30d</div>
          <div className="sv">{data.actions30d.toLocaleString()}</div>
        </div>
        <div className="stat">
          <div className="sl">Last login</div>
          <div className="sv" style={{ fontSize: 22 }}>
            {data.lastLogin}
          </div>
        </div>
      </div>

      <div style={{ height: "var(--gap)" }} />
      <div className="card reveal">
        <div className="tile-title" style={{ fontSize: 17, marginBottom: 8 }}>
          Permissions
        </div>
        {data.permissions.map((p) => (
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
