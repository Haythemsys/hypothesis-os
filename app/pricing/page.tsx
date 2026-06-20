"use client";
import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo/Logo";

const TIERS = [
  {
    name: "Public Beta",
    price: "Free",
    period: "",
    badge: "Current",
    badgeClass: "bg-go/10 text-go",
    features: [
      "Unlimited decisions",
      "Full engine access (12 dimensions)",
      "GO / KILL / UNRESOLVED verdicts",
      "Evidence debt & risk analysis",
      "Export to PDF, JSON, CSV, Markdown",
      "Decision library & search",
      "Portfolio overview",
      "All AI intelligence features",
    ],
    cta: "Start free →",
    ctaHref: "/workflow",
    ctaStyle: "btn-primary",
    interestKey: null,
  },
  {
    name: "Individual",
    price: "€19",
    period: "/ month",
    badge: "Planned",
    badgeClass: "bg-amber/10 text-amber",
    features: [
      "Everything in Beta",
      "Decision history (unlimited)",
      "Advanced audit trail",
      "Weekly intelligence report",
      "Priority support",
      "Early access to new features",
    ],
    cta: "Would you pay €19/mo?",
    ctaHref: null,
    ctaStyle: "btn-ghost",
    interestKey: "individual_19",
  },
  {
    name: "Team",
    price: "€99",
    period: "/ month",
    badge: "Planned",
    badgeClass: "bg-amber/10 text-amber",
    features: [
      "Everything in Individual",
      "Up to 10 team members",
      "Shared workspaces & approvals",
      "Collaborative decision review",
      "Team analytics & learning",
      "Executive dashboard",
      "Board brief generation",
    ],
    cta: "Would you pay €99/mo?",
    ctaHref: null,
    ctaStyle: "btn-ghost",
    interestKey: "team_99",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    badge: "Planned",
    badgeClass: "bg-steel/20 text-steel",
    features: [
      "Everything in Team",
      "Unlimited members",
      "SSO / SAML",
      "Custom data retention",
      "On-premise deployment option",
      "Dedicated support & SLA",
      "Custom integrations",
    ],
    cta: "Contact us",
    ctaHref: null,
    ctaStyle: "btn-ghost",
    interestKey: "enterprise",
  },
];

export default function PricingPage() {
  const [clicked, setClicked] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  async function trackInterest(key: string, label: string) {
    if (clicked[key]) return;
    setSubmitting(key);
    try {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "pricing_interest", properties: { tier: key, label } }),
      });
      setClicked((c) => ({ ...c, [key]: true }));
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="min-h-screen bg-obsidian text-ivory flex flex-col">
      <header className="border-b border-border-hair px-4 py-3 flex items-center gap-3">
        <Logo size={20} href="/" />
        <div className="flex-1" />
        <Link href="/workflow" className="btn-primary text-sm">Try free →</Link>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 py-14">
        <div className="text-center mb-12">
          <div className="label text-amber mb-2">Pricing</div>
          <h1 className="text-3xl font-bold">Simple, transparent pricing.</h1>
          <p className="text-steel mt-3 max-w-xl mx-auto">
            HypothesisOS is free during the beta. The plans below show where we&apos;re headed.
            Tell us what you&apos;d pay — it directly shapes what we build next.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded border p-5 flex flex-col gap-4 ${tier.badge === "Current" ? "border-go/40 bg-go/5" : "border-graphite bg-graphite/20"}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-bold text-ivory">{tier.name}</span>
                  <span className={`pill text-[10px] font-bold ${tier.badgeClass}`}>{tier.badge}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-ivory">{tier.price}</span>
                  {tier.period && <span className="text-steel text-sm">{tier.period}</span>}
                </div>
              </div>

              <ul className="space-y-1.5 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-xs text-steel">
                    <span className="text-go mt-0.5 shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {tier.ctaHref ? (
                <Link href={tier.ctaHref} className={`${tier.ctaStyle} text-center text-sm w-full`}>
                  {tier.cta}
                </Link>
              ) : tier.interestKey ? (
                <button
                  className={`${tier.ctaStyle} text-sm w-full ${clicked[tier.interestKey!] ? "opacity-60 cursor-default" : ""}`}
                  disabled={submitting === tier.interestKey || clicked[tier.interestKey!]}
                  onClick={() => trackInterest(tier.interestKey!, tier.name)}
                >
                  {clicked[tier.interestKey!] ? "✓ Recorded — thank you!" : submitting === tier.interestKey ? "Saving…" : tier.cta}
                </button>
              ) : (
                <Link href="/beta" className={`${tier.ctaStyle} text-center text-sm w-full`}>
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Pricing signal CTA */}
        <div className="mt-12 rounded border border-amber/20 bg-amber/5 p-6 text-center">
          <h2 className="text-lg font-bold mb-2">Not sure? Tell us what you&apos;d actually pay.</h2>
          <p className="text-steel text-sm mb-4 max-w-lg mx-auto">
            Click a plan above to register your interest. We use this to decide which paid features to build first.
            No card required, no commitment.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              className={`btn-ghost text-sm ${clicked["not_yet"] ? "opacity-60 cursor-default" : ""}`}
              disabled={!!clicked["not_yet"]}
              onClick={() => trackInterest("not_yet", "Not yet — needs more features")}
            >
              {clicked["not_yet"] ? "✓ Noted" : "Not yet — needs more features"}
            </button>
            <button
              className={`btn-ghost text-sm ${clicked["free_only"] ? "opacity-60 cursor-default" : ""}`}
              disabled={!!clicked["free_only"]}
              onClick={() => trackInterest("free_only", "I only need the free tier")}
            >
              {clicked["free_only"] ? "✓ Noted" : "I only need the free tier"}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate">
          All plans include the full deterministic engine. No AI black box. No hidden scoring.
          <Link href="/trust" className="text-amber ml-1 hover:underline">How it works →</Link>
        </div>
      </div>
    </div>
  );
}
