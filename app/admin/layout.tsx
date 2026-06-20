import "../student.css"; // shared in-app design system (scopes .admin-surface too)
import "../admin.css"; // admin-only additions

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thadar — Admin Control Panel",
};

// The admin layout themes every admin route with the shared hi-fi design
// system (`.admin-surface`). It deliberately does NOT dock the nav or the
// `.page` shell — the login gate lives directly under this layout (full-bleed,
// no nav), while the control panel itself nests under `(panel)/layout.tsx`.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-surface">{children}</div>;
}
