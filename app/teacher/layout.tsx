import TeacherNav from "./components/TeacherNav";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "40px 56px 160px",
        }}
        className="teacher-page"
      >
        {children}
      </div>
      <TeacherNav />
      <style>{`
        @media (max-width: 880px) {
          /* Top padding clears the fixed hamburger button (top:18, h:42). */
          .teacher-page { padding: 64px 20px 140px !important; }
          .teacher-split { grid-template-columns: 1fr !important; }
          .teacher-two-col { grid-template-columns: 1fr !important; }
          .hide-mobile { display: none !important; }
        }
        @media (max-width: 640px) {
          .teacher-page { padding: 60px 16px 132px !important; }
          /* Hero headings (44–56px) are too tall for a phone. */
          .teacher-page h1 { font-size: 30px !important; line-height: 1.15 !important; }
          .teacher-stats-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 380px) {
          .teacher-page h1 { font-size: 26px !important; }
        }
      `}</style>
    </>
  );
}
