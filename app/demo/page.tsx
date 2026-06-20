"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo/Logo";

// Pre-filled demo scenarios — deterministic results based on these evidence values
const DEMOS = [
  {
    id: "startup-launch",
    title: "Startup Launch Decision",
    category: "Product",
    hypothesis: "We should launch our SaaS product to market in Q1.",
    context: "B2B SaaS, 3-person team, 6 months runway, 12 pilot customers completed.",
    evidence: {
      marketSize: 0.75,
      competitiveAdvantage: 0.60,
      teamCapability: 0.80,
      evidenceStrength: 0.65,
      feasibility: 0.70,
      stakeholderBuyIn: 0.55,
      riskMitigation: 0.45,
      novelty: 0.70,
      reproducibility: 0.60,
      costBenefit: 0.65,
      timeConstraint: 0.50,
      reversibility: 0.80,
    },
    verdict: "GO",
    support: 0.64,
    debt: 38,
    insight: "Market size and team capability are strong. Stakeholder buy-in and risk mitigation are the evidence gaps to close before committing resources.",
  },
  {
    id: "investment-thesis",
    title: "Investment Thesis Validation",
    category: "Finance",
    hypothesis: "Series A investment in this climate-tech company meets our return criteria.",
    context: "€2M ticket, 10x target, 5-year horizon, B2B SaaS model, EU market.",
    evidence: {
      marketSize: 0.85,
      competitiveAdvantage: 0.70,
      teamCapability: 0.90,
      evidenceStrength: 0.40,
      feasibility: 0.65,
      stakeholderBuyIn: 0.80,
      riskMitigation: 0.35,
      novelty: 0.75,
      reproducibility: 0.30,
      costBenefit: 0.70,
      timeConstraint: 0.60,
      reversibility: 0.25,
    },
    verdict: "UNRESOLVED",
    support: 0.52,
    debt: 61,
    insight: "Strong team and market size. Evidence strength, risk mitigation and reproducibility are critically low — this needs a deeper due diligence sprint before committing capital.",
  },
  {
    id: "research-claim",
    title: "Research Claim Assessment",
    category: "Research",
    hypothesis: "Our proposed intervention reduces cognitive load by 30% in controlled trials.",
    context: "Academic research, n=120 pilot study completed, peer review pending.",
    evidence: {
      marketSize: 0.50,
      competitiveAdvantage: 0.65,
      teamCapability: 0.85,
      evidenceStrength: 0.80,
      feasibility: 0.90,
      stakeholderBuyIn: 0.70,
      riskMitigation: 0.75,
      novelty: 0.80,
      reproducibility: 0.70,
      costBenefit: 0.65,
      timeConstraint: 0.85,
      reversibility: 0.90,
    },
    verdict: "GO",
    support: 0.75,
    debt: 18,
    insight: "Strong evidence base with high reproducibility and feasibility. The engine returns GO — proceed to full study and publication.",
  },
];

const VERDICT_COLOR: Record<string, string> = {
  GO: "text-go",
  KILL: "text-kill",
  UNRESOLVED: "text-unresolved",
};

const VERDICT_BG: Record<string, string> = {
  GO: "bg-go/10 border-go/30",
  KILL: "bg-kill/10 border-kill/30",
  UNRESOLVED: "bg-unresolved/10 border-unresolved/30",
};

function EvidenceBar({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-36 text-slate truncate capitalize">{label.replace(/([A-Z])/g, " $1").trim()}</span>
      <div className="flex-1 h-1.5 bg-graphite rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${value >= 0.65 ? "bg-go" : value >= 0.4 ? "bg-unresolved" : "bg-kill"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`w-8 text-right ${value >= 0.65 ? "text-go" : value >= 0.4 ? "text-unresolved" : "text-kill"}`}>
        {pct}%
      </span>
    </div>
  );
}

export default function DemoPage() {
  const [active, setActive] = useState(0);
  const demo = DEMOS[active];

  useEffect(() => {
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "demo_viewed", properties: { id: demo.id } }),
    }).catch(() => {});
  }, [active, demo.id]);

  return (
    <div className="min-h-screen bg-obsidian text-ivory flex flex-col">
      <header className="border-b border-border-hair px-4 py-3 flex items-center gap-3">
        <Logo size={20} href="/" />
        <span className="text-xs text-steel border border-graphite rounded px-2 py-0.5 ml-2">Live Demo</span>
        <div className="flex-1" />
        <Link href="/workflow" className="btn-primary text-sm">Try with your decision →</Link>
      </header>

      <div className="mx-auto w-full max-w-4xl px-4 py-10 flex flex-col gap-8">
        <div className="text-center">
          <div className="label text-amber mb-2">3 real scenarios, pre-filled evidence</div>
          <h1 className="text-3xl font-bold">See the engine decide.</h1>
          <p className="text-steel mt-2 max-w-xl mx-auto">
            No login. No prompt. Just real evidence values fed into the deterministic engine — watch it return a verdict.
          </p>
        </div>

        {/* Scenario tabs */}
        <div className="flex gap-2 border-b border-border-hair pb-0">
          {DEMOS.map((d, i) => (
            <button
              key={d.id}
              onClick={() => setActive(i)}
              className={`px-4 py-2 text-sm border-b-2 transition-colors ${
                i === active
                  ? "border-amber text-ivory font-medium"
                  : "border-transparent text-steel hover:text-ivory"
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>

        {/* Demo content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: scenario info + evidence bars */}
          <div className="space-y-5">
            <div>
              <span className="pill bg-graphite text-slate text-[10px]">{demo.category}</span>
              <h2 className="text-lg font-bold mt-2">{demo.hypothesis}</h2>
              <p className="text-steel text-sm mt-1">{demo.context}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate uppercase tracking-wide">Evidence dimensions</p>
              {Object.entries(demo.evidence).map(([k, v]) => (
                <EvidenceBar key={k} label={k} value={v} />
              ))}
            </div>
          </div>

          {/* Right: verdict result */}
          <div className="space-y-4">
            <div className={`rounded border p-5 ${VERDICT_BG[demo.verdict]}`}>
              <div className="text-xs text-slate uppercase tracking-wide mb-1">Engine verdict</div>
              <div className={`text-4xl font-black ${VERDICT_COLOR[demo.verdict]}`}>{demo.verdict}</div>
              <div className="mt-3 flex gap-4 text-sm">
                <div>
                  <div className="text-slate text-xs">Evidence support</div>
                  <div className="text-ivory font-semibold">{Math.round(demo.support * 100)}%</div>
                </div>
                <div>
                  <div className="text-slate text-xs">Evidence debt</div>
                  <div className="text-ivory font-semibold">{demo.debt}%</div>
                </div>
              </div>
            </div>

            <div className="rounded border border-graphite bg-graphite/20 p-4">
              <div className="text-xs text-slate uppercase tracking-wide mb-1">Engine insight</div>
              <p className="text-sm text-ivory leading-relaxed">{demo.insight}</p>
            </div>

            <div className="rounded border border-graphite p-4 text-sm text-steel">
              <p className="text-xs text-slate uppercase tracking-wide mb-2">How this works</p>
              <p>The verdict is computed deterministically from the evidence values above. No AI prompt. No opinion. Same input always returns the same output.</p>
            </div>

            <Link
              href="/workflow"
              className="btn-primary w-full text-center block text-sm"
              onClick={() => {
                fetch("/api/events", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name: "demo_started", properties: { from: demo.id } }),
                }).catch(() => {});
              }}
            >
              Run your own decision →
            </Link>
            <Link href="/beta" className="btn-ghost w-full text-center block text-sm">
              Join the beta waitlist
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
