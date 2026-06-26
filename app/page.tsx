import type { Metadata } from "next";
import { MarketingNav } from "./_components/MarketingNav";
import { Hero } from "./_components/Hero";
import { DashboardPreview } from "./_components/DashboardPreview";
import { Features } from "./_components/Features";
import { CtaBand } from "./_components/CtaBand";
import { MarketingFooter } from "./_components/MarketingFooter";

export const metadata: Metadata = {
  title: "Thadar — The classroom platform teachers deserve",
  description:
    "Thadar is the classroom platform for teachers and students — lessons, assignments, and progress in one place.",
};

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MarketingNav />

      <main style={{ flex: 1 }}>
        <Hero />
        <DashboardPreview />
        <Features />
        <CtaBand />
      </main>

      <MarketingFooter />
    </div>
  );
}
