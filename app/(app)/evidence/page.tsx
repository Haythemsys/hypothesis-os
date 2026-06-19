"use client";
import { useMemo, useState } from "react";
import {
  explain, calibrate, selfCritique, navigate,
  evidenceDebt, decisionEffort, pathToGo, confidenceBreakdown, executiveSummary,
  decisionRisk, resolutionTimeline, costToResolve, investorView,
  type Evidence,
} from "@/lib/core";
import { VerdictPill, Bar } from "@/components/Verdict";
import { NavigationPanel } from "@/components/NavigationPanel";
import {
  GoBlockersPanel, EvidenceDebtPanel,
  EffortPanel, PathToGoPanel, ConfidenceExplanationPanel,
} from "@/components/DecisionIntelligence";
import {
  DecisionRiskCard, ResolutionTimelinePanel, CostToResolvePanel,
  InvestorViewCard, WhatIfSimulator,
} from "@/components/CommercialIntelligence";
import { Card } from "@/components/ui/Card";
import { Slider, Toggle } from "@/components/ui/Slider";
import { Counter } from "@/components/ui/Counter";

const FIELDS: { key: keyof Evidence; label: string; hint: string }[] = [
  { key: "effect",          label: "Effect size",       hint: "strength of the measured effect" },
  { key: "replication",     label: "Replication",       hint: "0 none · .5 one · 1 multiple" },
  { key: "hostileSurvival", label: "Hostile survival",  hint: "fraction of adversarial tests survived" },
  { key: "confoundControl", label: "Confound control",  hint: "0 confounded · 1 ruled out" },
  { key: "generalization",  label: "Generalization",    hint: "holds out-of-sample / cross-context" },
  { key: "power",           label: "Power",             hint: "data sufficiency / n / CI width" },
];

const VERDICT_BORDER: Record<string, string> = {
  GO: "border-go/40", KILL: "border-kill/40", UNRESOLVED: "border-amber-dim",
};

export default function EvidenceEngine() {
  const [hypothesis, setHypothesis] = useState("");
  const [e, setE] = useState<Evidence>({
    effect: 0.5, replication: 0.5, hostileSurvival: 0.5, confoundControl: 0.5,
    generalization: 0.5, power: 0.5, ciExcludesNull: true, claimRequiresGeneralization: true,
  });
  const set = (k: keyof Evidence, v: number | boolean) => setE((p) => ({ ...p, [k]: v }));

  const ex    = useMemo(() => explain(e, hypothesis),            [e, hypothesis]);
  const cal   = useMemo(() => calibrate(e),                      [e]);
  const crit  = useMemo(() => selfCritique(e),                   [e]);
  const nav   = useMemo(() => navigate(e, crit.finalVerdict),    [e, crit.finalVerdict]);
  const debt  = useMemo(() => evidenceDebt(e, nav),              [e, nav]);
  const eff   = useMemo(() => decisionEffort(nav),               [nav]);
  const path  = useMemo(() => pathToGo(nav),                     [nav]);
  const conf  = useMemo(() => confidenceBreakdown(e, cal.score), [e, cal.score]);
  const exec  = useMemo(() => executiveSummary(crit.finalVerdict, nav, debt, eff), [crit.finalVerdict, nav, debt, eff]);
  const risk  = useMemo(() => decisionRisk(debt, nav, cal.score), [debt, nav, cal.score]);
  const tline = useMemo(() => resolutionTimeline(nav),            [nav]);
  const cost  = useMemo(() => costToResolve(eff, nav),            [eff, nav]);
  const inv   = useMemo(() => investorView(debt, risk, nav),      [debt, risk, nav]);

  const v = crit.finalVerdict;
  const isUnresolved = v === "UNRESOLVED";
  const isNotGo      = v !== "GO";

  return (
    <div className="space-y-4">
      <div>
        <div className="label">Evidence Engine</div>
        <h1 className="text-2xl font-bold tracking-tight">Analyze a hypothesis</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
        {/* ── LEFT: encode evidence (sticky on desktop) ─────────────── */}
        <div className="space-y-4 lg:sticky lg:top-16">
          <Card className="space-y-1.5">
            <label className="label">Hypothesis (optional — enables assumptions &amp; confounds)</label>
            <textarea className="input min-h-[60px]" value={hypothesis}
              placeholder="State the claim…" onChange={(ev) => setHypothesis(ev.target.value)} />
          </Card>

          <Card className="space-y-4">
            <div className="label">Encode evidence</div>
            {FIELDS.map((f) => (
              <Slider key={f.key} label={f.label} hint={f.hint}
                value={e[f.key] as number} onChange={(val) => set(f.key, val)} />
            ))}
            <div className="flex flex-col gap-2 pt-1">
              <Toggle on={e.ciExcludesNull} label="Interval excludes the null"
                onClick={() => set("ciExcludesNull", !e.ciExcludesNull)} />
              <Toggle on={e.claimRequiresGeneralization} label="Claim asserts it holds across contexts"
                onClick={() => set("claimRequiresGeneralization", !e.claimRequiresGeneralization)} />
            </div>
          </Card>
        </div>

        {/* ── RIGHT: verdict-first output ───────────────────────────── */}
        <div className="space-y-4">
          {/* Verdict hero */}
          <Card variant="base" className={`border-2 ${VERDICT_BORDER[v] ?? "border-border-hair"} space-y-2`}>
            <div className="flex items-center justify-between">
              <div className="label">Verdict</div>
              <VerdictPill verdict={v} size="md" />
            </div>
            <div className="flex items-end gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-slate">Support</div>
                <Counter value={nav.currentSupport} className="text-4xl font-bold text-ivory" />
              </div>
              <div className="pb-1">
                <div className="text-[10px] uppercase tracking-wide text-slate">Calibration</div>
                <span className="data text-lg text-steel">{cal.score}<span className="text-slate">/100</span></span>
              </div>
              <div className="pb-1">
                <div className="text-[10px] uppercase tracking-wide text-slate">Debt</div>
                <span className="data text-lg text-steel">{debt.pct}%</span>
              </div>
            </div>
            <p className="text-sm text-steel">{exec.reason}</p>
          </Card>

          {isUnresolved && <GoBlockersPanel nav={nav} />}
          {isNotGo && <NavigationPanel nav={nav} />}
          {isUnresolved && path.length > 0 && <PathToGoPanel steps={path} />}

          {isNotGo && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <EvidenceDebtPanel debt={debt} />
              <EffortPanel effort={eff} />
            </div>
          )}

          <ConfidenceExplanationPanel breakdown={conf} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DecisionRiskCard risk={risk} />
            <InvestorViewCard inv={inv} />
          </div>
          {tline && <ResolutionTimelinePanel timeline={tline} />}
          <CostToResolvePanel cost={cost} />
          {isNotGo && (
            <WhatIfSimulator evidence={e} currentVerdict={v} currentSupport={nav.currentSupport} />
          )}
        </div>
      </div>

      {/* ── Full-width reasoning ─────────────────────────────────────── */}
      <Panel title="Why this verdict" tone="neutral">
        <Group label="Evidence FOR"     items={ex.supporting} cls="text-go" />
        <Group label="Evidence AGAINST" items={ex.against}    cls="text-kill" />
        <Group label="Missing evidence" items={ex.missing}    cls="text-unresolved" />
      </Panel>

      <Panel title="Why alternatives were rejected" tone="neutral">
        <ul className="space-y-1 text-sm">
          {ex.rejectedAlternatives.map((a) => (
            <li key={a.verdict}>
              <span className="font-semibold">not {a.verdict}:</span>{" "}
              <span className="text-steel">{a.why}</span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={`Self-critique — ${crit.survived}/${crit.attacks.length} attacks survived`} tone="hostile">
        <ul className="space-y-2 text-sm">
          {crit.attacks.map((a, i) => (
            <li key={i} className="flex gap-2 min-w-0">
              <span className={`pill ${a.survives ? "verdict-GO" : "verdict-KILL"} shrink-0`}>
                {a.survives ? "held" : "LANDED"}
              </span>
              <span className="min-w-0">
                <span className="text-steel">[{a.target}] {a.attack}</span>{" "}
                <span className="text-slate">— {a.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={`Calibration — ${cal.score}/100`} tone="neutral">
        <div className="space-y-2">
          <Bar value={cal.components.evidenceCompleteness}  label="Evidence completeness" />
          <Bar value={cal.components.confoundCoverage}      label="Confound coverage" />
          <Bar value={cal.components.contradictionCoverage} label="Contradiction coverage" />
          <Bar value={cal.components.benchmarkConfidence}   label="Benchmark / statistical confidence" />
          <p className="pt-1 text-xs text-slate">{cal.recommendation}</p>
        </div>
      </Panel>

      {(ex.assumptions[0] && !ex.assumptions[0].startsWith("(")) && (
        <Panel title="Key assumptions & confounds" tone="neutral">
          <Group label="Assumptions" items={ex.assumptions} cls="text-steel" />
          <Group label="Confounds"   items={ex.confounds}   cls="text-steel" />
        </Panel>
      )}
    </div>
  );
}

function Panel({ title, children, tone }: { title: string; children: React.ReactNode; tone: "neutral" | "hostile" }) {
  return (
    <section className={`card ${tone === "hostile" ? "border-kill/30" : ""}`}>
      <div className="label mb-2">{title}</div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
function Group({ label, items, cls }: { label: string; items: string[]; cls: string }) {
  return (
    <div>
      <div className={`text-xs font-semibold ${cls}`}>{label}</div>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-steel">
        {items.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    </div>
  );
}
