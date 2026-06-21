import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { getAdminProfile, getQueue } from "@/server/admin";
import AdminNav from "../components/AdminNav";
import { AdminProvider } from "../AdminProvider";

// The control-panel shell. This is the auth gate for the whole panel: only a
// platform ADMIN / SUPER_ADMIN may pass — everyone else is bounced to the
// admin login. The admin-surface theming comes from the parent admin layout.
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.platformRole;
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  if (!session?.user?.id || !isAdmin) redirect("/admin/login");

  const [profile, queue] = await Promise.all([
    getAdminProfile(session.user.id),
    getQueue(),
  ]);
  const ctx = {
    name: profile?.name ?? "Admin",
    role: profile?.role ?? "Admin",
    isSuper: role === "SUPER_ADMIN",
  };
  const urgent = queue.filter((q) => q.urgent).length;

  return (
    <AdminProvider value={ctx}>
      <div className="page" data-surface="admin">
        <AdminNav name={ctx.name} role={ctx.role} badge={urgent} />
        {children}
      </div>
    </AdminProvider>
  );
}
