"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  selfCritique, navigate, evidenceDebt, decisionRisk, calibrate,
  type Evidence,
} from "@/lib/core";

type CaseStudy = {
  id: string;
  category: string;
  title: string;
  context: string;
  hypothesis: string;
  evidence: Evidence;
  outcome: string;
  lesson: string;
  tags: string[];
};

const CASES: CaseStudy[] = [
  {
    id: "startup-launch",
    category: "Startup",
    title: "Consumer App Launch Decision",
    context: "Series A startup deciding whether to launch a consumer fintech app nationwide after a limited pilot.",
    hypothesis: "Our app drives a statistically meaningful improvement in savings rate for users in the 25–40 cohort based on 3-month pilot data.",
    evidence: {
      effect: 0.72, replication: 0.45, hostileSurvival: 0.60, confoundControl: 0.55,
      generalization: 0.40, power: 0.50, ciExcludesNull: true, claimRequiresGeneralization: true,
    },
    outcome: "UNRESOLVED → delayed launch for replication study",
    lesson: "Strong effect size with only one data source is insufficient for a national rollout. Replication across independent cohorts is non-negotiable before scaling.",
    tags: ["fintech", "consumer", "go/no-go"],
  },
  {
    id: "hiring-decision",
    category: "Talent",
    title: "Engineering Hiring Freeze",
    context: "Mid-stage startup evaluating whether to freeze engineering hiring given Q3 runway projections.",
    hypothesis: "Reducing engineering headcount growth by 50% for 2 quarters will extend runway without materially impacting product velocity.",
    evidence: {
      effect: 0.68, replication: 0.60, hostileSurvival: 0.70, confoundControl: 0.65,
      generalization: 0.55, power: 0.72, ciExcludesNull: true, claimRequiresGeneralization: false,
    },
    outcome: "GO — hiring freeze implemented, runway extended 7 months",
    lesson: "Internally-sourced decisions (financial runway) can achieve higher evidence confidence because you control the data. Well-controlled evidence is tractable.",
    tags: ["hiring", "operations", "kill"],
  },
  {
    id: "marketing-campaign",
    category: "Marketing",
    title: "Performance Marketing Channel Expansion",
    context: "B2B SaaS company testing whether LinkedIn Ads outperform Google Ads for enterprise customer acquisition.",
    hypothesis: "LinkedIn Ads produce a higher-quality enterprise pipeline per dollar spent than Google Search Ads for our ICP.",
    evidence: {
      effect: 0.55, replication: 0.40, hostileSurvival: 0.45, confoundControl: 0.35,
      generalization: 0.30, power: 0.38, ciExcludesNull: false, claimRequiresGeneralization: true,
    },
    outcome: "KILL — insufficient evidence, Google Ads maintained as primary",
    lesson: "Marketing attribution is notoriously confounded. Without proper holdout groups and multi-touch controls, channel comparisons are unreliable.",
    tags: ["marketing", "b2b", "attribution"],
  },
  {
    id: "research-project",
    category: "Research",
    title: "Clinical Research Continuation",
    context: "Life sciences company deciding whether to continue Phase 2 trials for a metabolic compound.",
    hypothesis: "Compound X demonstrates clinically meaningful improvement in insulin sensitivity versus placebo with acceptable safety profile.",
    evidence: {
      effect: 0.82, replication: 0.75, hostileSurvival: 0.80, confoundControl: 0.85,
      generalization: 0.65, power: 0.88, ciExcludesNull: true, claimRequiresGeneralization: true,
    },
    outcome: "GO — Phase 3 trials initiated",
    lesson: "Clinical research protocols enforce evidence rigour by design. When each dimension is independently assessed, the composite verdict is reliable. This is the gold standard.",
    tags: ["pharma", "clinical", "go"],
  },
  {
    id: "investment-thesis",
    category: "Investment",
    title: "Series B Investment Thesis",
    context: "VC firm evaluating a $15M Series B investment in a vertical SaaS company with 2-year revenue history.",
    hypothesis: "The company will achieve a 3x revenue multiple within 36 months based on documented retention, expansion revenue, and TAM evidence.",
    evidence: {
      effect: 0.60, replication: 0.50, hostileSurvival: 0.55, confoundControl: 0.40,
      generalization: 0.35, power: 0.45, ciExcludesNull: true, claimRequiresGeneralization: true,
    },
    outcome: "UNRESOLVED — term sheet issued with milestone gates",
    lesson: "Investment theses suffer from single-company generalization risk and confounded growth attribution. Milestone-gated structures create natural evidence checkpoints.",
    tags: ["investment", "vc", "saas"],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Startup: "bg-amber/15 text-amber",
  Talent: "bg-go/15 text-go",
  Marketing: "bg-kill/15 text-kill",
  Research: "bg-go/15 text-go",
  Investment: "bg-amber/15 text-amber",
};

function CaseMetrics({ evidence }: { evidence: Evidence }) {
  const crit = useMemo(() => selfCritique(evidence), [evidence]);
  const nav  = useMemo(() => navigate(evidence, crit.finalVerdict), [evidence, crit]);
  const debt = useMemo(() => evidenceDebt(evidence, nav), [evidence, nav]);
  const cal  = useMemo(() => calibrate(evidence), [evidence]);
  const risk = useMemo(() => decisionRisk(debt, nav, cal.score), [debt, nav, cal]);

  const RISK_CLS: Record<string, string> = {
    LOW: "text-go", MEDIUM: "text-unresolved", HIGH: "text-kill", CRITICAL: "text-kill",
  };
  const V_CLS: Record<string, string> = {
    GO: "bg-go/15 text-go", KILL: "bg-kill/15 text-kill", UNRESOLVED: "bg-amber/15 text-unresolved",
  };

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      <span className={`pill text-xs ${V_CLS[crit.finalVerdict]}`}>{crit.finalVerdict}</span>
      <span className="pill bg-white/8 text-xs text-steel">support {(nav.currentSupport * 100).toFixed(0)}%</span>
      <span className={`pill bg-white/8 text-xs ${RISK_CLS[risk.level]}`}>{risk.level} risk</span>
      <span className="pill bg-white/8 text-xs text-slate">debt {debt.pct.toFixed(0)}%</span>
      <span className="pill bg-white/8 text-xs text-slate">cal {Math.round(cal.score)}/100</span>
    </div>
  );
}

const FIELDS: (keyof Evidence)[] = ["effect", "replication", "hostileSurvival", "confoundControl", "generalization", "power"];
const FIELD_LABELS: Record<string, string> = {
  effect: "Effect", replication: "Replication", hostileSurvival: "Hostile", confoundControl: "Confound", generalization: "General.", power: "Power",
};

export default function CaseStudyLibrary() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("ALL");
  const categories = ["ALL", ...Array.from(new Set(CASES.map((c) => c.category)))];

  const filtered = CASES.filter((c) => category === "ALL" || c.category === category);

  return (
    <div className="space-y-5">
      <div>
        <div className="label">Case Study Library</div>
        <h1 className="text-2xl font-bold tracking-tight">Decision Intelligence Examples</h1>
        <p className="mt-1 text-sm text-slate">Real-world decision scenarios with evidence profiles, engine verdicts, and lessons learned.</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`pill text-xs transition-colors ${category === cat ? "bg-amber text-obsidian" : "bg-white/8 text-slate hover:text-ivory"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Case cards */}
      <div className="space-y-4">
        {filtered.map((c) => (
          <div key={c.id} className="card space-y-3">
            {/* Header */}
            <div
              className="cursor-pointer"
              onClick={() => setExpanded(expanded === c.id ? null : c.id)}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`pill text-[10px] ${CATEGORY_COLORS[c.category] ?? "bg-white/10 text-steel"}`}>{c.category}</span>
                  <h2 className="font-bold text-ivory text-base">{c.title}</h2>
                </div>
                <span className="text-slate text-xs">{expanded === c.id ? "▲" : "▼"}</span>
              </div>
              <p className="mt-1 text-sm text-steel">{c.context}</p>
              <CaseMetrics evidence={c.evidence} />
            </div>

            {/* Expanded detail */}
            {expanded === c.id && (
              <div className="border-t border-border-hair pt-4 space-y-4">
                {/* Hypothesis */}
                <div>
                  <div className="label mb-1">Hypothesis</div>
                  <p className="text-sm text-ivory italic">"{c.hypothesis}"</p>
                </div>

                {/* Evidence profile */}
                <div>
                  <div className="label mb-2">Evidence Profile</div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {FIELDS.map((f) => {
                      const val = c.evidence[f] as number;
                      return (
                        <div key={f} className="rounded-inner bg-white/3 px-2 py-2 text-center">
                          <div className="text-[9px] text-slate">{FIELD_LABELS[f]}</div>
                          <div className="data text-base font-bold text-ivory mt-0.5">{val.toFixed(2)}</div>
                          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/8">
                            <div
                              className={`h-full rounded-full ${val >= 0.7 ? "bg-go" : val >= 0.4 ? "bg-amber" : "bg-kill"}`}
                              style={{ width: `${val * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-2 flex gap-3 text-xs text-slate">
                    <span>CI excludes null: <span className={c.evidence.ciExcludesNull ? "text-go" : "text-kill"}>{c.evidence.ciExcludesNull ? "YES" : "NO"}</span></span>
                    <span>Requires generalization: <span className="text-steel">{c.evidence.claimRequiresGeneralization ? "YES" : "NO"}</span></span>
                  </div>
                </div>

                {/* Outcome + Lesson */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-inner bg-white/3 px-3 py-3">
                    <div className="label mb-1">Actual Outcome</div>
                    <p className="text-sm text-ivory">{c.outcome}</p>
                  </div>
                  <div className="rounded-inner bg-amber/5 border border-amber/20 px-3 py-3">
                    <div className="label mb-1">Key Lesson</div>
                    <p className="text-sm text-steel">{c.lesson}</p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {c.tags.map((tag) => (
                    <span key={tag} className="pill bg-white/5 text-[10px] text-slate">#{tag}</span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex gap-2 text-sm">
                  <Link href="/workflow" className="btn-primary text-sm">Run similar analysis →</Link>
                  <Link href="/import" className="btn-ghost text-sm">Import this scenario</Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="card-accent text-center space-y-2 py-6">
        <div className="font-bold text-ivory">Ready to analyze your own decision?</div>
        <p className="text-sm text-steel">Apply the same rigor to your hypothesis in under 5 minutes.</p>
        <Link href="/workflow" className="btn-primary inline-flex text-sm">Start Decision Workflow →</Link>
      </div>
    </div>
  );
}
