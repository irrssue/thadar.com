import AdminNav from "../components/AdminNav";

// The control-panel shell: docks the top bar + drawer nav and the `.page`
// container. The admin-surface theming comes from the parent admin layout.
// The login gate sits outside this group, so it renders without the nav.
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page" data-surface="admin">
      <AdminNav />
      {children}
    </div>
  );
}
