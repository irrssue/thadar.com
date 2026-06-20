import TeacherNav from "./components/TeacherNav";
import "../student.css"; // shared in-app design system (scopes .teacher-surface too)
import "../teacher-extra.css"; // teacher-only additions

// The teacher layout IS the surface shell: it themes every teacher page with
// the hi-fi design system (`.teacher-surface`) and docks the sidebar nav. Pages
// just render their content into `.page`. Mirrors the student StudentShell.
export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="teacher-surface">
        <div className="page" data-surface="teacher">
          {children}
        </div>
      </div>
      <TeacherNav />
    </>
  );
}
