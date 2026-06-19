"use client";
import { useState } from "react";
import { experiments } from "@/lib/core";

const TIER_CLS: Record<string, string> = {
  "CHEAP KILL": "border-unresolved/40", "STRONG TEST": "border-white/20", "HOSTILE TEST": "border-kill/40",
};
const EXAMPLES = [
  "A person's writing style identifies them across any context",
  "Caffeine improves focus",
  "Longer context windows always improve model accuracy",
];

export default function Experiments() {
  const [text, setText] = useState("");
  const [plan, setPlan] = useState<any>(null);
  const gen = (t: string) => { setText(t); setPlan(experiments(t)); };

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-xl font-bold">Experiment Engine</h1>
        <p className="mt-1 text-sm text-gray-400">
          Every claim gets three escalating tests: a cheap attempt to kill it, a controlled
          estimate, and a hostile attempt to prove the result is an artifact. The cheapest
          claim-ending test always comes first.
        </p>
        <textarea className="input mt-3 min-h-[80px]" value={text}
          placeholder="Paste the hypothesis to design tests for…" onChange={(e) => setText(e.target.value)} />
        <button className="btn mt-3" onClick={() => gen(text)} disabled={!text.trim()}>Generate tests</button>
      </section>

      {!plan && (
        <section className="card">
          <div className="label mb-2">Try an example</div>
          <div className="flex flex-col gap-2">
            {EXAMPLES.map((e) => (
              <button key={e} onClick={() => gen(e)} className="rounded-xl border border-line px-3 py-2 text-left text-sm text-gray-300 active:bg-white/5">
                {e}
              </button>
            ))}
          </div>
        </section>
      )}

      {plan && (
        <section className="card">
          <div className="label mb-2">Decomposition</div>
          <div className="flex flex-wrap gap-1.5">
            {plan.decomposition.kinds.map((k: string) => <span key={k} className="pill bg-white/10">{k}</span>)}
            <span className={`pill ${plan.decomposition.requiresGeneralization ? "verdict-UNRESOLVED" : "bg-white/10"}`}>
              {plan.decomposition.requiresGeneralization ? "needs generalization" : "scoped"}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-400"><b>top confound:</b> {plan.decomposition.confounds[0]}</div>
        </section>
      )}

      {plan && plan.tiers.map((tier: any) => (
        <section key={tier.tier} className={`card border-2 ${TIER_CLS[tier.tier] || "border-line"}`}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{tier.tier}</h2>
            <span className="label">{tier.cost}</span>
          </div>
          <p className="mt-1 text-sm text-gray-400">{tier.purpose}</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-gray-300">
            {tier.steps.map((s: string, i: number) => <li key={i}>{s}</li>)}
          </ol>
        </section>
      ))}
    </div>
  );
}
