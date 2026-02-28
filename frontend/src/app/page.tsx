import { Sidebar } from "@/components/sidebar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { BentoGrid } from "@/components/bento-grid";
import { Stats } from "@/components/stats";
import { CtaSection } from "@/components/cta-section";

export default function Home() {
  return (
    <main className="relative z-10 min-h-screen overflow-hidden">
      <Sidebar />

      <Hero />

      <div className="gradient-line mx-auto w-32" />

      <HowItWorks />

      <div className="gradient-line mx-auto w-32" />

      <BentoGrid />

      <div className="gradient-line mx-auto w-32" />

      <Stats />

      <CtaSection />

      {/* Footer */}
      <footer className="flex flex-col items-center gap-2 py-16">
        <div className="gradient-line mb-4 w-24" />
        <p className="text-annotation text-sm text-slate-400">
          © 2026 Clarity · Built at CUhackit
        </p>
      </footer>
    </main>
  );
}
