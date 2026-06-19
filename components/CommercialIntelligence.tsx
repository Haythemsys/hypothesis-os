"use client";
import { useMemo, useState } from "react";
import type {
  Evidence, Navigation, EvidenceDebt, DecisionRisk,
  ResolutionTimeline, CostToResolve, InvestorView,
} from "@/lib/core";
import {
  classify, selfCritique, navigate as navFn,
  evidenceDebt as debtFn, decisionEffort as effortFn,
} from "@/lib/core";

// ── Color helpers ────────────────────────────────────────────────────────────
const RISK_CLS: Record<string, string> = {
  LOW: "text-go",  MEDIUM: "text-unresolved",
  HIGH: "text-kill", CRITICAL: "text-kill",
};
const RISK_BG: Record<string, string> = {
  LOW: "bg-go/10 border-go/20", MEDIUM: "bg-unresolved/10 border-unresolved/20",
  HIGH: "bg-kill/10 border-kill/20", CRITICAL: "bg-kill/20 border-kill/40",
};
const COST_CLS: Record<string, string> = { LOW: "text-go", MEDIUM: "text-unresolved", HIGH: "text-kill" };
const INV_CLS: Record<string, string>  = { YES: "text-go", NO: "text-kill", "NOT YET": "text-unresolved" };
const INV_BG: Record<string, string>   = {
  YES: "bg-go/10 border-go/20", NO: "bg-kill/10 border-kill/20",
  "NOT YET": "bg-unresolved/10 border-unresolved/20",
};

// ── 1. Decision Risk Card ────────────────────────────────────────────────────
export function DecisionRiskCard({ risk }: { risk: DecisionRisk }) {
  const cls  = RISK_CLS[risk.level]  ?? "text-gray-200";
  const bgCls = RISK_BG[risk.level]  ?? "bg-white/5 border-white/10";
  return (
    <section className={`card border space-y-2 ${bgCls}`}>
      <div className="label">Decision Risk</div>
      <div className={`text-3xl font-bold ${cls}`}>{risk.level}</div>
      <p className="text-sm text-gray-300 leading-relaxed">{risk.reason}</p>
    </section>
  );
}

// ── 2. Resolution Timeline Panel ─────────────────────────────────────────────
const maxWks = 12; // scale bar
export function ResolutionTimelinePanel({ timeline }: { timeline: ResolutionTimeline | null }) {
  if (!timeline) return null;
  return (
    <section className="card space-y-3">
      <div className="label">Resolution Timeline</div>
      <div className="space-y-3">
        {timeline.items.map((item) => (
          <div key={item.dimension} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm text-gray-200 min-w-0 truncate">{item.label}</span>
              <span className="text-xs text-gray-400 shrink-0 tabular-nums">
                {item.minWeeks}–{item.maxWeeks} wks
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              {/* min bar */}
              <div className="absolute left-0 top-0 h-full rounded-full bg-unresolved/60"
                style={{ width: `${Math.min(100, (item.minWeeks / maxWks) * 100)}%` }} />
              {/* max bar (lighter) */}
              <div className="absolute left-0 top-0 h-full rounded-full bg-unresolved/25"
                style={{ width: `${Math.min(100, (item.maxWeeks / maxWks) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
        <span className="text-gray-400">Overall estimate</span>
        <span className="font-semibold text-white">
          {timeline.totalMin}–{timeline.totalMax} weeks
        </span>
      </div>
    </section>
  );
}

// ── 3. Cost to Resolve Panel ─────────────────────────────────────────────────
export function CostToResolvePanel({ cost }: { cost: CostToResolve }) {
  const cls = COST_CLS[cost.level] ?? "text-gray-200";
  return (
    <section className="card space-y-2">
      <div className="label">Estimated Evidence Cost</div>
      <div className={`text-2xl font-bold ${cls}`}>{cost.level}</div>
      <p className="text-sm text-gray-300 leading-relaxed">{cost.description}</p>
    </section>
  );
}

// ── 4. Investor / Founder View ───────────────────────────────────────────────
export function InvestorViewCard({ inv }: { inv: InvestorView }) {
  const cls  = INV_CLS[inv.verdict]  ?? "text-gray-200";
  const bgCls = INV_BG[inv.verdict]  ?? "bg-white/5 border-white/10";
  return (
    <section className={`card border space-y-2 ${bgCls}`}>
      <div className="label">Should I invest more evidence?</div>
      <div className={`text-3xl font-bold tracking-wide ${cls}`}>{inv.verdict}</div>
      <p className="text-sm text-gray-300 leading-relaxed">{inv.reason}</p>
    </section>
  );
}

// ── 5. What-If Simulator ─────────────────────────────────────────────────────
const SIM_FIELDS: { key: keyof Evidence; label: string }[] = [
  { key: "effect",          label: "Effect size" },
  { key: "replication",     label: "Replication" },
  { key: "power",           label: "Power" },
  { key: "generalization",  label: "Generalization" },
  { key: "hostileSurvival", label: "Hostile survival" },
  { key: "confoundControl", label: "Confound control" },
];

const VERDICT_TEXT: Record<string, string> = { GO: "text-go", KILL: "text-kill", UNRESOLVED: "text-unresolved" };

export function WhatIfSimulator({
  evidence, currentVerdict, currentSupport,
}: {
  evidence: Evidence;
  currentVerdict: string;
  currentSupport: number;
}) {
  const [open,   setOpen]   = useState(false);
  const [sim,    setSim]    = useState<Evidence>(() => ({ ...evidence }));
  const [reset,  setReset]  = useState(0);

  const simCrit   = useMemo(() => selfCritique(sim),                [sim]);
  const simNav    = useMemo(() => navFn(sim, simCrit.finalVerdict),  [sim, simCrit.finalVerdict]);
  const simDebt   = useMemo(() => debtFn(sim, simNav),              [sim, simNav]);
  const simEffort = useMemo(() => effortFn(simNav),                 [simNav]);

  const verdictChanged = simCrit.finalVerdict !== currentVerdict;

  const resetSim = () => { setSim({ ...evidence }); setReset(r => r + 1); };

  return (
    <section className="card space-y-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <div className="label">What-If Simulator</div>
          <p className="text-xs text-gray-500 mt-0.5">Adjust evidence hypothetically — does not alter stored data</p>
        </div>
        <span className="text-gray-400 text-lg ml-2 shrink-0">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-line pt-3">
          {/* Sliders */}
          <div className="space-y-3">
            {SIM_FIELDS.map((f) => {
              const val = sim[f.key] as number;
              return (
                <div key={f.key + reset}>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{f.label}</span>
                    <span className="tabular-nums font-mono">{val.toFixed(2)}</span>
                  </div>
                  <input type="range" min={0} max={1} step={0.01}
                    className="h-6 w-full accent-white"
                    defaultValue={val}
                    onChange={(e) => setSim(p => ({ ...p, [f.key]: parseFloat(e.target.value) }))}
                  />
                </div>
              );
            })}
            <div className="flex items-center justify-between rounded-xl border border-line px-3 py-2 text-sm min-h-11">
              <span>CI excludes null</span>
              <button onClick={() => setSim(p => ({ ...p, ciExcludesNull: !p.ciExcludesNull }))}
                className={`pill shrink-0 ${sim.ciExcludesNull ? "verdict-GO" : "bg-white/10"}`}>
                {sim.ciExcludesNull ? "YES" : "NO"}
              </button>
            </div>
          </div>

          {/* Comparison */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-black/30 p-3 space-y-1.5">
              <div className="text-xs font-semibold text-gray-400">Current</div>
              <div className={`text-lg font-bold ${VERDICT_TEXT[currentVerdict] ?? "text-gray-200"}`}>
                {currentVerdict}
              </div>
              <div className="text-xs text-gray-400">Support: <span className="text-white tabular-nums">{currentSupport}</span></div>
            </div>
            <div className={`rounded-xl p-3 space-y-1.5 ${verdictChanged ? "bg-white/10 border border-white/20" : "bg-black/30"}`}>
              <div className="text-xs font-semibold text-gray-400">Projected</div>
              <div className={`text-lg font-bold ${VERDICT_TEXT[simCrit.finalVerdict] ?? "text-gray-200"}`}>
                {simCrit.finalVerdict}
                {verdictChanged && <span className="ml-1.5 text-xs font-normal text-white">↑ changed</span>}
              </div>
              <div className="text-xs text-gray-400">Support: <span className="text-white tabular-nums">{simNav.currentSupport}</span></div>
              <div className="text-xs text-gray-400">Debt: <span className="text-white tabular-nums">{simDebt.pct}%</span></div>
            </div>
          </div>

          {/* Effort under simulation */}
          {simEffort && (
            <div className="text-xs text-gray-500 text-center">
              Simulated effort: <span className={`font-semibold ${simEffort.level === "LOW" ? "text-go" : simEffort.level === "HIGH" ? "text-kill" : "text-unresolved"}`}>
                {simEffort.level}
              </span>
              {simEffort.studyCycles && ` · ${simEffort.studyCycles} study cycle${simEffort.studyCycles !== 1 ? "s" : ""}`}
            </div>
          )}

          <button onClick={resetSim} className="btn w-full text-xs text-gray-400">Reset simulation</button>
        </div>
      )}
    </section>
  );
}
