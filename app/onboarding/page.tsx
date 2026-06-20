"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo/Logo";

const TEMPLATES = [
  {
    label: "Startup Launch",
    hypothesis: "We should launch our product to market now.",
    stakes: "12 months of runway and team morale depend on this decision.",
    killCondition: "If less than 3 paying customers in 30 days, we stop.",
  },
  {
    label: "Investment Thesis",
    hypothesis: "This opportunity meets our investment criteria.",
    stakes: "Capital allocation of €500k+ and opportunity cost.",
    killCondition: "If the TAM is under €100M or team has no prior exits.",
  },
  {
    label: "Research Claim",
    hypothesis: "Our core research hypothesis is valid and reproducible.",
    stakes: "6 months of research direction depends on this being true.",
    killCondition: "If replication fails in 2 independent experiments.",
  },
];

const ROLES = ["Founder / CEO", "Product Manager", "Investor / VC", "Researcher", "Executive", "Consultant", "Other"];
const DECISION_TYPES = ["Product launch", "Investment", "Research", "Hiring", "Strategy", "Partnership", "Other"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    hypothesis: "",
    stakes: "",
    killCondition: "",
    role: "",
    decisionType: "",
  });

  const steps = [
    "What to decide",
    "Why it matters",
    "Kill condition",
    "About you",
    "First decision",
  ];

  function applyTemplate(t: typeof TEMPLATES[0]) {
    setData((d) => ({ ...d, hypothesis: t.hypothesis, stakes: t.stakes, killCondition: t.killCondition }));
  }

  function next() { setStep((s) => Math.min(s + 1, 4)); }
  function back() { setStep((s) => Math.max(s - 1, 0)); }

  function launch() {
    if (typeof window !== "undefined") {
      try {
        const draft = { hypothesis: data.hypothesis, evidence: {} };
        localStorage.setItem("hypothesisos.workflow.draft.v1", JSON.stringify(draft));
      } catch {}
    }
    router.push("/workflow");
  }

  return (
    <div className="min-h-screen bg-obsidian text-ivory flex flex-col">
      {/* Header */}
      <header className="border-b border-border-hair px-4 py-3 flex items-center gap-3">
        <Logo size={20} href="/" />
        <span className="text-sm text-steel ml-2">Quick Start</span>
        <div className="flex-1" />
        <Link href="/workflow" className="text-sm text-steel hover:text-ivory transition-colors">
          Skip → go straight to the engine
        </Link>
      </header>

      {/* Progress bar */}
      <div className="flex gap-1 px-4 pt-4">
        {steps.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1 w-full rounded-full transition-colors ${i <= step ? "bg-amber" : "bg-graphite"}`} />
            <span className={`text-[10px] ${i === step ? "text-amber" : "text-slate"} hidden sm:block`}>{s}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">

          {step === 0 && (
            <div className="space-y-6">
              <div>
                <div className="label text-amber mb-1">Step 1 of 5</div>
                <h1 className="text-2xl font-bold">What decision are you trying to make?</h1>
                <p className="text-steel mt-2 text-sm">Write it as a clear hypothesis — something that can be true or false.</p>
              </div>
              <textarea
                className="w-full rounded border border-graphite bg-graphite/40 px-3 py-2 text-sm text-ivory placeholder:text-slate focus:border-amber focus:outline-none resize-none"
                rows={3}
                placeholder="e.g. We should launch our product to market now."
                value={data.hypothesis}
                onChange={(e) => setData((d) => ({ ...d, hypothesis: e.target.value }))}
              />
              <div>
                <p className="text-xs text-slate mb-3">Or start from a template:</p>
                <div className="flex flex-col gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => { applyTemplate(t); next(); }}
                      className="text-left border border-graphite rounded px-3 py-2 text-sm hover:border-amber/60 transition-colors"
                    >
                      <span className="text-ivory font-medium">{t.label}</span>
                      <span className="block text-slate text-xs mt-0.5 truncate">{t.hypothesis}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="btn-primary w-full"
                disabled={!data.hypothesis.trim()}
                onClick={next}
              >
                Continue →
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="label text-amber mb-1">Step 2 of 5</div>
                <h1 className="text-2xl font-bold">Why does this decision matter?</h1>
                <p className="text-steel mt-2 text-sm">What are the stakes? What happens if you get it wrong?</p>
              </div>
              <textarea
                className="w-full rounded border border-graphite bg-graphite/40 px-3 py-2 text-sm text-ivory placeholder:text-slate focus:border-amber focus:outline-none resize-none"
                rows={3}
                placeholder="e.g. 12 months of runway and team morale depend on this decision."
                value={data.stakes}
                onChange={(e) => setData((d) => ({ ...d, stakes: e.target.value }))}
              />
              <div className="flex gap-3">
                <button className="btn-ghost flex-1" onClick={back}>← Back</button>
                <button
                  className="btn-primary flex-1"
                  disabled={!data.stakes.trim()}
                  onClick={next}
                >Continue →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="label text-amber mb-1">Step 3 of 5</div>
                <h1 className="text-2xl font-bold">What would change your mind?</h1>
                <p className="text-steel mt-2 text-sm">Define a condition that would make you stop — your "kill switch".</p>
              </div>
              <textarea
                className="w-full rounded border border-graphite bg-graphite/40 px-3 py-2 text-sm text-ivory placeholder:text-slate focus:border-amber focus:outline-none resize-none"
                rows={3}
                placeholder="e.g. If less than 3 paying customers in 30 days, we stop."
                value={data.killCondition}
                onChange={(e) => setData((d) => ({ ...d, killCondition: e.target.value }))}
              />
              <div className="flex gap-3">
                <button className="btn-ghost flex-1" onClick={back}>← Back</button>
                <button
                  className="btn-primary flex-1"
                  disabled={!data.killCondition.trim()}
                  onClick={next}
                >Continue →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="label text-amber mb-1">Step 4 of 5</div>
                <h1 className="text-2xl font-bold">Tell us about yourself</h1>
                <p className="text-steel mt-2 text-sm">Optional — helps us improve the tool for your use case.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate block mb-1">Your role</label>
                  <select
                    className="w-full rounded border border-graphite bg-graphite/40 px-3 py-2 text-sm text-ivory focus:border-amber focus:outline-none"
                    value={data.role}
                    onChange={(e) => setData((d) => ({ ...d, role: e.target.value }))}
                  >
                    <option value="">Select role…</option>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate block mb-1">Type of decision</label>
                  <select
                    className="w-full rounded border border-graphite bg-graphite/40 px-3 py-2 text-sm text-ivory focus:border-amber focus:outline-none"
                    value={data.decisionType}
                    onChange={(e) => setData((d) => ({ ...d, decisionType: e.target.value }))}
                  >
                    <option value="">Select type…</option>
                    {DECISION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="btn-ghost flex-1" onClick={back}>← Back</button>
                <button className="btn-primary flex-1" onClick={next}>Continue →</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <div className="label text-amber mb-1">Step 5 of 5 — Ready</div>
                <h1 className="text-2xl font-bold">Your first decision is ready.</h1>
                <p className="text-steel mt-2 text-sm">We&apos;ll load it into the engine. Fill in the evidence sliders and get your verdict in under 3 minutes.</p>
              </div>
              <div className="rounded border border-graphite bg-graphite/20 p-4 space-y-2 text-sm">
                <div>
                  <span className="text-slate text-xs">Hypothesis</span>
                  <p className="text-ivory mt-0.5">{data.hypothesis}</p>
                </div>
                {data.stakes && (
                  <div>
                    <span className="text-slate text-xs">Stakes</span>
                    <p className="text-ivory mt-0.5">{data.stakes}</p>
                  </div>
                )}
                {data.killCondition && (
                  <div>
                    <span className="text-slate text-xs">Kill condition</span>
                    <p className="text-ivory mt-0.5">{data.killCondition}</p>
                  </div>
                )}
              </div>
              <button className="btn-primary w-full text-base" onClick={launch}>
                Run the engine →
              </button>
              <p className="text-center text-xs text-slate">Takes about 2-3 minutes. No account needed.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
