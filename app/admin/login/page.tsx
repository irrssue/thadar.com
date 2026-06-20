"use client";

// Admin login gate — restricted to admin.thadar.com.
//
// Presentational for now: there is no platform-admin role in the backend yet,
// so "Sign in" routes into the control panel rather than authenticating. When
// an admin role + /api/admin auth lands, wire this form to it (and gate the
// (panel) routes behind it in auth.config / proxy.ts).

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminIcon from "../components/AdminIcon";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@thadar.edu");
  const [pw, setPw] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push("/admin");
  }

  return (
    <div className="login-wrap">
      <form className="login-card reveal" onSubmit={submit}>
        <div className="login-domain">
          <span className="dot" />
          secure · <b>admin.thadar.com</b>
        </div>
        <div className="login-lock">
          <AdminIcon name="lock" size={24} />
        </div>
        <h1 className="login-title">
          thadar<span className="var">.</span> admin
        </h1>
        <p className="login-sub">Control panel access is restricted to platform administrators.</p>

        <div className="field">
          <div className="field-lab">Work email</div>
          <div className="field-in">
            <span className="ico">
              <AdminIcon name="users" size={18} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@thadar.edu"
              autoComplete="username"
            />
          </div>
        </div>
        <div className="field">
          <div className="field-lab">Password</div>
          <div className="field-in">
            <span className="ico">
              <AdminIcon name="lock" size={18} />
            </span>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••••"
              autoComplete="current-password"
            />
          </div>
        </div>

        <button type="submit" className="login-btn">
          Sign in <AdminIcon name="arrow" size={16} />
        </button>

        <div className="login-foot">
          <span className="ok">
            <span className="dot" />
            SSO · 2FA enforced
          </span>
          <span>v3.2 · build 1842</span>
        </div>
      </form>
      <div className="login-bg-meta">All access is logged · sessions expire after 30m idle</div>
    </div>
  );
}
