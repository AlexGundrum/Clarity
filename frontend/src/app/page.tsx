import { Hero } from "@/components/hero";
import { Integrations } from "@/components/integrations";
import { BentoGrid } from "@/components/bento-grid";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <Hero />
      <Integrations />
      <BentoGrid />

      {/* Footer */}
      <footer className="flex flex-col items-center gap-2 py-20">
        <div className="gradient-line mb-4 w-24" />
        <p className="text-annotation text-sm text-slate-400">
          © 2026 Clarity · Built at CUhackit
        </p>
      </footer>
    </main>
  );
}
