"use client";
import { useState } from "react";
import { experiments } from "@/lib/core";

const TIER_CLS: Record<string, string> = {
  "CHEAP KILL": "border-unresolved/40",
  "STRONG TEST": "border-white/20",
  "HOSTILE TEST": "border-kill/40",
};

export default function Experiments() {
  const [text, setText] = useState("");
  const [plan, setPlan] = useState<any>(null);

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-xl font-bold">Experiment Engine</h1>
        <p className="mt-1 text-sm text-gray-400">
          Three escalating tests: a cheap attempt to kill the claim, a controlled estimate, and a
          hostile attempt to prove the result is an artifact.
        </p>
        <textarea className="input mt-3 min-h-[80px]" value={text}
          placeholder="Paste the hypothesis to design tests for…"
          onChange={(e) => setText(e.target.value)} />
        <button className="btn mt-3" onClick={() => setPlan(experiments(text))}>Generate tests</button>
      </section>

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
