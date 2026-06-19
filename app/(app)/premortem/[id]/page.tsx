"use client";
import { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import {
  selfCritique, navigate, evidenceDebt, decisionRisk, calibrate,
  type Evidence, type Navigation, type EvidenceDebt,
} from "@/lib/core";

type HypDetail = {
  hypothesis: { id: string; title: string; kinds: string[]; assumptions: string[]; confounds: string[] };
  evidence: { id: string; evidence: Evidence; label: string; createdAt: string }[];
  verdicts: { finalVerdict: string; support: number; calibration: number }[];
};

type FailureMode = {
  rank: number;
  probability: number; // 0-100
  impact: number;      // 0-100
  score: number;       // probability × impact
  dimension: string;
  title: string;
  description: string;
  mitigation: string;
};

const DIMENSION_WEIGHTS: Record<keyof Omit<Evidence, "ciExcludesNull" | "claimRequiresGeneralization">, number> = {
  effect: 0.30,
  replication: 0.25,
  hostileSurvival: 0.20,
  confoundControl: 0.15,
  generalization: 0.06,
  power: 0.04,
};

const FAILURE_TEMPLATES: Record<string, { title: string; description: string; mitigation: string }> = {
  effect: {
    title: "Effect size may not be real or meaningful",
    description: "The observed effect could be statistical noise, publication bias, or too small to be practically significant at scale.",
    mitigation: "Run a pre-registered replication with an a priori power calculation. Compute minimum detectable effect for your context.",
  },
  replication: {
    title: "Findings fail to replicate in independent studies",
    description: "A single study showing a positive result is insufficient. Without replication, the finding may be idiosyncratic to the original context, lab, or dataset.",
    mitigation: "Commission or find at least two independent replications with different teams, populations, or settings.",
  },
  hostileSurvival: {
    title: "Evidence dissolves under adversarial scrutiny",
    description: "A skeptic could construct a compelling counter-argument. The hypothesis may be unfalsifiable as stated or the evidence cherry-picked.",
    mitigation: "Assign a red team to actively attempt to falsify the hypothesis. Require evidence that survives hostile questioning.",
  },
  confoundControl: {
    title: "Confounders drive the apparent result",
    description: "A third variable explains the relationship. Without proper controls, you may act on a spurious correlation.",
    mitigation: "Identify the top 3 plausible confounders. Design controls or natural experiments that isolate the causal variable.",
  },
  generalization: {
    title: "Result only holds for the tested population or context",
    description: "Evidence from a narrow context (specific demographic, time window, or geography) may not transfer to your target deployment environment.",
    mitigation: "Test across at least two distinct populations or contexts. Specify the boundary conditions explicitly.",
  },
  power: {
    title: "Study was underpowered to detect true effects",
    description: "Insufficient sample size increases false negative risk. Positive results from underpowered studies are also more likely to be inflated.",
    mitigation: "Compute the required sample size for 80% power given expected effect size. Rerun with adequate n.",
  },
};

const STRUCTURAL_FAILURES = [
  {
    dimension: "execution",
    title: "Resource and timeline overrun",
    description: "The investment required to resolve remaining evidence gaps exceeds available budget or the decision window.",
    mitigation: "Map the cheapest-kill experiment first. Define a decision deadline and minimum evidence threshold before committing resources.",
    baseProbability: 35,
    baseImpact: 70,
  },
  {
    dimension: "market",
    title: "Context changes before decision finalizes",
    description: "Market conditions, competitive dynamics, or regulatory environment shift while evidence is being collected, invalidating the hypothesis.",
    mitigation: "Set a maximum evidence-collection horizon. If the window is less than 90 days, prioritize fast experiments.",
    baseProbability: 25,
    baseImpact: 80,
  },
  {
    dimension: "framing",
    title: "Hypothesis is unfalsifiable as stated",
    description: "The hypothesis cannot in principle be disproved. Without clear falsification criteria, evidence collection has no logical endpoint.",
    mitigation: "Restate the hypothesis with explicit, measurable go/no-go criteria. A good hypothesis can fail.",
    baseProbability: 20,
    baseImpact: 60,
  },
  {
    dimension: "selection",
    title: "Evidence selection bias toward confirmation",
    description: "Researchers unconsciously or consciously select evidence that confirms the hypothesis while discarding contradictory signals.",
    mitigation: "Pre-register the analysis plan. Use blind evaluation where possible. Track hostile evidence explicitly.",
    baseProbability: 30,
    baseImpact: 65,
  },
];

function generatePremortem(ev: Evidence, nav: Navigation, debt: EvidenceDebt, verdict: string): FailureMode[] {
  const modes: FailureMode[] = [];

  // Evidence-based failures
  const dims = (Object.keys(DIMENSION_WEIGHTS) as (keyof typeof DIMENSION_WEIGHTS)[]);
  dims.forEach((dim, i) => {
    const val = ev[dim] as number;
    const weight = DIMENSION_WEIGHTS[dim];
    const gap = Math.max(0, 1 - val);
    // Probability: inverse of evidence strength, weighted
    const probability = Math.round(Math.max(5, Math.min(95, (1 - val) * 85 + 10)));
    // Impact: higher weight dimensions have higher impact
    const impact = Math.round(55 + weight * 300);
    const score = (probability / 100) * (impact / 100) * 100;
    const template = FAILURE_TEMPLATES[dim];
    if (template && gap > 0.1) {
      modes.push({
        rank: 0,
        probability,
        impact: Math.min(95, impact),
        score,
        dimension: dim,
        title: template.title,
        description: template.description,
        mitigation: template.mitigation,
      });
    }
  });

  // Structural failures — adjust probability based on evidence state
  const debtModifier = debt.pct / 100;
  STRUCTURAL_FAILURES.forEach((sf) => {
    const adjustedProb = Math.round(Math.min(90, sf.baseProbability * (1 + debtModifier * 0.5)));
    const score = (adjustedProb / 100) * (sf.baseImpact / 100) * 100;
    modes.push({
      rank: 0,
      probability: adjustedProb,
      impact: sf.baseImpact,
      score,
      dimension: sf.dimension,
      title: sf.title,
      description: sf.description,
      mitigation: sf.mitigation,
    });
  });

  // Add CI failure if ciExcludesNull is false
  if (!ev.ciExcludesNull) {
    modes.push({
      rank: 0,
      probability: 70,
      impact: 75,
      score: 52.5,
      dimension: "statistical",
      title: "Confidence interval includes the null",
      description: "The confidence interval does not exclude zero, meaning the effect may be zero. This is a foundational statistical failure.",
      mitigation: "Collect more data to narrow the confidence interval, or accept that the null cannot be rejected at the required threshold.",
    });
  }

  // Sort by score descending
  modes.sort((a, b) => b.score - a.score);

  // Assign ranks and return top 10
  return modes.slice(0, 10).map((m, i) => ({ ...m, rank: i + 1 }));
}

const PROB_CLS = (p: number) => p >= 70 ? "text-kill" : p >= 40 ? "text-unresolved" : "text-go";
const IMP_CLS  = (i: number) => i >= 70 ? "text-kill" : i >= 40 ? "text-unresolved" : "text-go";

export default function Premortem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<HypDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    api<HypDetail>(`/api/hypotheses/${id}`)
      .then(setData)
      .catch((e: any) => setErr(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const ev = data?.evidence?.[data.evidence.length - 1]?.evidence ?? null;
  const crit = useMemo(() => ev ? selfCritique(ev) : null, [ev]);
  const nav  = useMemo(() => ev && crit ? navigate(ev, crit.finalVerdict) : null, [ev, crit]);
  const debt = useMemo(() => ev && nav ? evidenceDebt(ev, nav) : null, [ev, nav]);
  const cal  = useMemo(() => ev ? calibrate(ev) : null, [ev]);
  const risk = useMemo(() => debt && nav && cal ? decisionRisk(debt, nav, cal.score) : null, [debt, nav, cal]);
  const modes = useMemo(
    () => ev && nav && debt && crit ? generatePremortem(ev, nav, debt, crit.finalVerdict) : [],
    [ev, nav, debt, crit]
  );

  const avgProbability = modes.length > 0 ? Math.round(modes.reduce((s, m) => s + m.probability, 0) / modes.length) : 0;
  const topRisk = modes[0];

  if (loading) return <p className="card text-sm text-steel animate-pulse">Running premortem analysis…</p>;
  if (err)     return <p className="card text-sm text-kill">{err}</p>;
  if (!data || !ev) return (
    <div className="card space-y-3">
      <p className="text-sm text-steel">No evidence recorded. <Link href="/workflow" className="text-amber hover:underline">Add evidence →</Link></p>
    </div>
  );

  const { hypothesis } = data;
  const verdict = crit?.finalVerdict ?? "UNRESOLVED";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="label">Premortem Analysis</div>
        <h1 className="text-2xl font-bold tracking-tight">Failure Map</h1>
        <p className="mt-1 text-sm text-slate">Imagine the decision failed. What went wrong? Ranked by probability × impact.</p>
      </div>

      {/* Decision context */}
      <div className="card space-y-2">
        <div className="text-xs text-slate font-semibold">Analyzing</div>
        <p className="font-semibold text-ivory">{hypothesis.title}</p>
        <div className="flex flex-wrap gap-2 text-xs text-slate">
          <span className={`pill ${verdict === "GO" ? "bg-go/15 text-go" : verdict === "KILL" ? "bg-kill/15 text-kill" : "bg-amber/15 text-unresolved"}`}>{verdict}</span>
          {risk && <span className={`pill bg-white/8 ${PROB_CLS(risk.score)}`}>{risk.level} risk</span>}
          {debt && <span className="pill bg-white/8 text-steel">{debt.pct.toFixed(0)}% evidence debt</span>}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-inner border border-border-hair bg-white/3 px-3 py-3 text-center">
          <div className="text-[10px] uppercase tracking-wide text-slate">Failure Modes</div>
          <div className="data mt-1 text-2xl font-bold text-ivory">{modes.length}</div>
        </div>
        <div className="rounded-inner border border-border-hair bg-white/3 px-3 py-3 text-center">
          <div className="text-[10px] uppercase tracking-wide text-slate">Avg Probability</div>
          <div className={`data mt-1 text-2xl font-bold ${PROB_CLS(avgProbability)}`}>{avgProbability}%</div>
        </div>
        <div className="rounded-inner border border-border-hair bg-white/3 px-3 py-3 text-center">
          <div className="text-[10px] uppercase tracking-wide text-slate">Primary Risk</div>
          <div className="data mt-1 text-sm font-bold text-kill truncate">{topRisk?.dimension ?? "—"}</div>
        </div>
      </div>

      {/* Risk matrix visual */}
      <div className="card space-y-3">
        <div className="label">Risk Matrix</div>
        <div className="relative h-48 rounded-inner bg-white/3 overflow-hidden">
          {/* Quadrant labels */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 text-[9px] text-white/10 font-semibold pointer-events-none">
            <div className="flex items-start justify-start p-2">LOW PRIORITY</div>
            <div className="flex items-start justify-end p-2">MONITOR</div>
            <div className="flex items-end justify-start p-2">INVESTIGATE</div>
            <div className="flex items-end justify-end p-2">CRITICAL</div>
          </div>
          {/* Dividers */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
          {/* Plot points */}
          {modes.map((m, i) => {
            const x = (m.probability / 100) * 90 + 5;
            const y = 100 - ((m.impact / 100) * 90 + 5);
            const color = m.rank <= 3 ? "#E5544B" : m.rank <= 6 ? "#E8A23D" : "#3FB67A";
            return (
              <div
                key={i}
                className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[8px] font-bold text-obsidian cursor-pointer hover:scale-125 transition-transform"
                style={{ left: `${x}%`, top: `${y}%`, backgroundColor: color }}
                title={m.title}
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                {m.rank}
              </div>
            );
          })}
          {/* Axis labels */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-slate">→ PROBABILITY</div>
          <div className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] text-slate">↑ IMPACT</div>
        </div>
        <p className="text-[10px] text-slate">Click a point to expand. Numbers indicate rank. Red = top 3.</p>
      </div>

      {/* Failure mode list */}
      <div className="space-y-2">
        <div className="label">Top {modes.length} Failure Modes</div>
        {modes.map((m, i) => (
          <div
            key={i}
            className={`card cursor-pointer transition-all ${expanded === i ? "border-amber/30" : ""}`}
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <div className="flex items-start gap-3">
              <span className={`data shrink-0 text-lg font-bold ${m.rank <= 3 ? "text-kill" : m.rank <= 6 ? "text-unresolved" : "text-slate"}`}>
                #{m.rank}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm text-ivory">{m.title}</span>
                  <span className="pill bg-white/8 text-[10px] text-steel font-mono">{m.dimension}</span>
                </div>
                <div className="mt-1 flex gap-3 text-xs">
                  <span>Probability: <span className={`font-bold ${PROB_CLS(m.probability)}`}>{m.probability}%</span></span>
                  <span>Impact: <span className={`font-bold ${IMP_CLS(m.impact)}`}>{m.impact}%</span></span>
                  <span className="text-slate">Score: <span className="text-steel">{m.score.toFixed(0)}</span></span>
                </div>
              </div>
              <span className="shrink-0 text-slate text-xs">{expanded === i ? "▲" : "▼"}</span>
            </div>

            {expanded === i && (
              <div className="mt-3 border-t border-border-hair pt-3 space-y-2">
                <div>
                  <div className="label text-steel mb-1">Why This Fails</div>
                  <p className="text-sm text-steel">{m.description}</p>
                </div>
                <div>
                  <div className="label text-go mb-1">Mitigation</div>
                  <p className="text-sm text-steel">{m.mitigation}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href={`/report/${id}`} className="btn-ghost">Full Report →</Link>
        <Link href={`/memory`} className="text-steel hover:text-ivory mt-3 flex items-center">Evolution Timeline →</Link>
        <Link href={`/portfolio`} className="text-steel hover:text-ivory mt-3 flex items-center">Portfolio View →</Link>
      </div>
    </div>
  );
}
