import dynamic from "next/dynamic";
import {
  LandingNav, Hero, Problem, HowItWorks, NavigationEngine,
  AuditTrail, EvidenceDebtRisk, CompareVsAI, Pricing, FAQ, FinalCTA,
} from "@/components/landing/sections";

// Live demo runs the engine client-side — lazy-loaded below the fold.
const LiveDemo = dynamic(() => import("@/components/landing/LiveDemo"));

function DemoSection() {
  return (
    <section id="demo" className="scroll-mt-20 border-t border-border-hair py-14 sm:py-20">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <div className="label text-amber">Live decision engine</div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Move the evidence. Watch it decide.</h2>
        <p className="mt-2 max-w-2xl text-steel">
          This is the real engine — not a screenshot. Drag a slider and the verdict recomputes instantly.
        </p>
        <div className="mt-6"><LiveDemo /></div>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <DemoSection />
        <NavigationEngine />
        <AuditTrail />
        <EvidenceDebtRisk />
        <CompareVsAI />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
    </>
  );
}
