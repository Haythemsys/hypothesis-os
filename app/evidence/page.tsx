"use client";
import { useState } from "react";
import { classify, type Evidence } from "@/lib/core";
import { VerdictPill, Bar } from "@/components/Verdict";

const FIELDS: { key: keyof Evidence; label: string; hint: string }[] = [
  { key: "effect", label: "Effect size", hint: "strength of the measured effect" },
  { key: "replication", label: "Replication", hint: "0 none · .5 one · 1 multiple" },
  { key: "hostileSurvival", label: "Hostile survival", hint: "fraction of adversarial tests survived" },
  { key: "confoundControl", label: "Confound control", hint: "0 confounded · 1 ruled out" },
  { key: "generalization", label: "Generalization", hint: "holds out-of-sample / cross-context" },
  { key: "power", label: "Power", hint: "data sufficiency / n / CI width" },
];

export default function EvidenceEngine() {
  const [e, setE] = useState<Evidence>({
    effect: 0.5, replication: 0.5, hostileSurvival: 0.5, confoundControl: 0.5,
    generalization: 0.5, power: 0.5, ciExcludesNull: true, claimRequiresGeneralization: true,
  });
  const r = classify(e);
  const set = (k: keyof Evidence, v: number | boolean) => setE((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4">
      <section className={`card border-2 verdict-${r.verdict}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Evidence Engine</h1>
          <VerdictPill verdict={r.verdict} />
        </div>
        <div className="mt-2 text-sm text-gray-300">
          support <b>{r.support}</b> · confidence <b>{r.confidence}</b>
        </div>
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-gray-400">
          {r.reasons.map((x, i) => <li key={i}>{x}</li>)}
        </ul>
      </section>

      <section className="card space-y-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <Bar value={e[f.key] as number} label={`${f.label} — ${f.hint}`} />
            <input type="range" min={0} max={1} step={0.01} className="mt-1 w-full"
              value={e[f.key] as number}
              onChange={(ev) => set(f.key, parseFloat(ev.target.value))} />
          </div>
        ))}
        <div className="flex flex-col gap-2 pt-1">
          <Toggle on={e.ciExcludesNull} label="Interval excludes the null"
            onClick={() => set("ciExcludesNull", !e.ciExcludesNull)} />
          <Toggle on={e.claimRequiresGeneralization} label="Claim asserts it holds across contexts"
            onClick={() => set("claimRequiresGeneralization", !e.claimRequiresGeneralization)} />
        </div>
      </section>
    </div>
  );
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center justify-between rounded-xl border border-line px-3 py-2 text-sm">
      <span>{label}</span>
      <span className={`pill ${on ? "verdict-GO" : "bg-white/10"}`}>{on ? "YES" : "NO"}</span>
    </button>
  );
}
