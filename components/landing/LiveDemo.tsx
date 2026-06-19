"use client";
import { useMemo, useState } from "react";
import { selfCritique, navigate, calibrate, evidenceDebt, decisionRisk, type Evidence } from "@/lib/core";
import { VerdictPill } from "@/components/Verdict";
import { Slider, Toggle } from "@/components/ui/Slider";
import { Counter } from "@/components/ui/Counter";

const FIELDS: { key: keyof Evidence; label: string }[] = [
  { key: "effect", label: "Effect size" },
  { key: "replication", label: "Replication" },
  { key: "hostileSurvival", label: "Hostile survival" },
  { key: "confoundControl", label: "Confound control" },
  { key: "power", label: "Power" },
];

const BORDER: Record<string, string> = { GO: "border-go/50", KILL: "border-kill/50", UNRESOLVED: "border-amber-dim" };

export default function LiveDemo() {
  // Default state sits just below GO on replication — raising it flips UNRESOLVED → GO.
  const [e, setE] = useState<Evidence>({
    effect: 0.7, replication: 0.3, hostileSurvival: 0.6, confoundControl: 0.55,
    generalization: 0.5, power: 0.45, ciExcludesNull: true, claimRequiresGeneralization: false,
  });
  const set = (k: keyof Evidence, v: number | boolean) => setE((p) => ({ ...p, [k]: v }));

  const crit = useMemo(() => selfCritique(e), [e]);
  const cal  = useMemo(() => calibrate(e), [e]);
  const nav  = useMemo(() => navigate(e, crit.finalVerdict), [e, crit.finalVerdict]);
  const debt = useMemo(() => evidenceDebt(e, nav), [e, nav]);
  const risk = useMemo(() => decisionRisk(debt, nav, cal.score), [debt, nav, cal.score]);
  const v = crit.finalVerdict;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
      {/* Verdict */}
      <div className={`card border-2 ${BORDER[v] ?? "border-border-hair"} space-y-3 lg:sticky lg:top-6`}>
        <div className="flex items-center justify-between">
          <div className="label">Verdict</div>
          <VerdictPill verdict={v} size="md" />
        </div>
        <div className="flex items-end gap-5">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-slate">Support</div>
            <Counter value={nav.currentSupport} className="text-4xl font-bold text-ivory" />
          </div>
          <div className="pb-1">
            <div className="text-[10px] uppercase tracking-wide text-slate">Debt</div>
            <span className="data text-xl text-steel">{debt.pct}%</span>
          </div>
          <div className="pb-1">
            <div className="text-[10px] uppercase tracking-wide text-slate">Risk</div>
            <span className="data text-xl text-steel">{risk.level}</span>
          </div>
        </div>
        <p className="text-sm text-steel">
          {v === "GO" ? "All GO criteria satisfied — the evidence supports moving forward."
            : v === "KILL" ? "A kill gate fired — the evidence is fatally weak on at least one dimension."
            : "Promising, but at least one GO criterion is unmet. Not yet defensible."}
        </p>
        <p className="rounded-inner bg-amber/10 px-3 py-2 text-xs text-amber">
          ↑ Raise <strong>Replication</strong> past 0.50 and watch UNRESOLVED become GO.
        </p>
      </div>

      {/* Evidence controls */}
      <div className="card space-y-4">
        <div className="label">Move the evidence</div>
        {FIELDS.map((f) => (
          <Slider key={f.key} label={f.label} value={e[f.key] as number} onChange={(val) => set(f.key, val)} />
        ))}
        <Toggle on={e.ciExcludesNull} label="Interval excludes the null" onClick={() => set("ciExcludesNull", !e.ciExcludesNull)} />
        <p className="text-xs text-slate">
          Runs the real deterministic engine in your browser. No account, no server call.
        </p>
      </div>
    </div>
  );
}
