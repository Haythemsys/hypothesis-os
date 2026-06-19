"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Evidence } from "@/lib/core";

const DRAFT_KEY = "hypothesisos.workflow.draft.v1";

type Template = {
  id: string;
  category: string;
  title: string;
  description: string;
  hypothesisTemplate: string;
  evidence: Partial<Evidence>;
  keyQuestions: string[];
  successCriteria: string[];
  tags: string[];
  icon: string;
};

const TEMPLATES: Template[] = [
  {
    id: "startup-launch",
    category: "Startup",
    icon: "🚀",
    title: "Startup Launch",
    description: "Validate product-market fit before scaling. Use this template to assess whether evidence supports a broad market launch.",
    hypothesisTemplate: "Our product achieves statistically meaningful adoption and retention among our target segment in the [MARKET] based on [TIMEFRAME] pilot data.",
    evidence: { effect: 0.6, replication: 0.4, hostileSurvival: 0.5, confoundControl: 0.4, generalization: 0.35, power: 0.45, ciExcludesNull: true, claimRequiresGeneralization: true },
    keyQuestions: ["What is the minimum viable adoption rate?", "Is retention sustainable without incentives?", "Does the effect hold across user cohorts?"],
    successCriteria: ["Effect size ≥ 0.7 with CI excluding null", "Replication in ≥2 independent cohorts", "Hostile survival test passes"],
    tags: ["pmf", "b2c", "early-stage"],
  },
  {
    id: "investment-thesis",
    category: "Investment",
    icon: "💰",
    title: "Investment Thesis",
    description: "Structure an investment decision with evidence around return potential, market dynamics, and risk factors.",
    hypothesisTemplate: "Investment in [COMPANY/ASSET] will generate [RETURN TARGET] returns within [TIMEFRAME] based on [KEY METRICS].",
    evidence: { effect: 0.55, replication: 0.45, hostileSurvival: 0.50, confoundControl: 0.40, generalization: 0.35, power: 0.42, ciExcludesNull: true, claimRequiresGeneralization: true },
    keyQuestions: ["What drives the return assumption?", "How robust is the thesis under adverse conditions?", "What is the falsification criteria?"],
    successCriteria: ["Documented unit economics", "Stress-tested under 3 bear scenarios", "Comparable cohort data available"],
    tags: ["vc", "investment", "thesis"],
  },
  {
    id: "hiring-decision",
    category: "Talent",
    icon: "👥",
    title: "Hiring Decision",
    description: "Evidence-based approach to evaluating whether a role, candidate, or team expansion is justified.",
    hypothesisTemplate: "Hiring a [ROLE] at this stage will materially improve [OUTCOME METRIC] without proportionally increasing organizational overhead.",
    evidence: { effect: 0.65, replication: 0.55, hostileSurvival: 0.60, confoundControl: 0.60, generalization: 0.50, power: 0.65, ciExcludesNull: false, claimRequiresGeneralization: false },
    keyQuestions: ["Is the bottleneck the role or the process?", "Will the hire create headcount dependency?", "Does the org structure support this expansion?"],
    successCriteria: ["Clear OKR attribution to role", "Manager bandwidth confirmed", "30/60/90 day success metrics defined"],
    tags: ["hr", "talent", "operations"],
  },
  {
    id: "research-validation",
    category: "Research",
    icon: "🔬",
    title: "Research Validation",
    description: "Academic or applied research hypothesis validation following evidence quality standards.",
    hypothesisTemplate: "Treatment/intervention [X] produces a statistically and practically significant improvement in [OUTCOME] compared to [CONTROL] in [POPULATION].",
    evidence: { effect: 0.70, replication: 0.65, hostileSurvival: 0.70, confoundControl: 0.75, generalization: 0.55, power: 0.80, ciExcludesNull: true, claimRequiresGeneralization: true },
    keyQuestions: ["Is the study pre-registered?", "Is the sample representative?", "Are alternative explanations controlled?"],
    successCriteria: ["Pre-registered protocol", "Power ≥ 0.80 at α=0.05", "External replication required before GO"],
    tags: ["research", "clinical", "academic"],
  },
  {
    id: "marketing-campaign",
    category: "Marketing",
    icon: "📢",
    title: "Marketing Campaign",
    description: "Evaluate whether a marketing hypothesis has sufficient causal evidence before scaling spend.",
    hypothesisTemplate: "[CHANNEL/CAMPAIGN] drives a measurable increase in [METRIC] for [TARGET SEGMENT] at a CAC below [THRESHOLD].",
    evidence: { effect: 0.50, replication: 0.35, hostileSurvival: 0.40, confoundControl: 0.30, generalization: 0.25, power: 0.38, ciExcludesNull: false, claimRequiresGeneralization: true },
    keyQuestions: ["Are holdout groups in place?", "Is attribution multi-touch or last-click?", "Does the effect survive seasonality adjustment?"],
    successCriteria: ["Randomized holdout group", "2+ attribution models agree", "Signal persists over 4+ weeks"],
    tags: ["marketing", "growth", "attribution"],
  },
  {
    id: "product-launch",
    category: "Product",
    icon: "📦",
    title: "Product Launch",
    description: "Validate product readiness and market fit before a major launch commitment.",
    hypothesisTemplate: "[PRODUCT/FEATURE] achieves target adoption and satisfaction metrics in the [SEGMENT] without creating disproportionate support burden.",
    evidence: { effect: 0.58, replication: 0.48, hostileSurvival: 0.52, confoundControl: 0.45, generalization: 0.40, power: 0.50, ciExcludesNull: true, claimRequiresGeneralization: true },
    keyQuestions: ["Does beta data generalize to the broader audience?", "What is the rollback plan?", "Are success metrics pre-defined?"],
    successCriteria: ["Beta cohort NPS ≥ target", "Support ticket rate within acceptable bounds", "Performance benchmarks met"],
    tags: ["product", "saas", "launch"],
  },
  {
    id: "acquisition-analysis",
    category: "M&A",
    icon: "🤝",
    title: "Acquisition Analysis",
    description: "Apply evidence rigor to an acquisition or merger decision.",
    hypothesisTemplate: "Acquiring [TARGET] will create [SYNERGY VALUE] through [MECHANISM] within [TIMEFRAME] without proportional integration risk.",
    evidence: { effect: 0.52, replication: 0.40, hostileSurvival: 0.48, confoundControl: 0.38, generalization: 0.32, power: 0.42, ciExcludesNull: false, claimRequiresGeneralization: true },
    keyQuestions: ["Are synergies identified or assumed?", "What is the integration complexity?", "How does this perform in downside scenarios?"],
    successCriteria: ["Synergies documented with timelines", "Integration risk scored", "Hostile due diligence completed"],
    tags: ["m&a", "investment", "strategy"],
  },
  {
    id: "ai-deployment",
    category: "Technology",
    icon: "🤖",
    title: "AI Deployment",
    description: "Validate an AI/ML deployment decision with evidence around performance, safety, and business impact.",
    hypothesisTemplate: "Deploying [AI SYSTEM] in production will improve [METRIC] by [MAGNITUDE] without introducing unacceptable error rates or safety incidents.",
    evidence: { effect: 0.62, replication: 0.55, hostileSurvival: 0.65, confoundControl: 0.58, generalization: 0.48, power: 0.60, ciExcludesNull: true, claimRequiresGeneralization: true },
    keyQuestions: ["How does the model perform on edge cases?", "What are the failure modes?", "Is human-in-the-loop oversight required?"],
    successCriteria: ["Holdout test performance confirmed", "Red team adversarial test passed", "Fallback mechanism tested"],
    tags: ["ai", "ml", "technology"],
  },
  {
    id: "clinical-study",
    category: "Healthcare",
    icon: "⚕️",
    title: "Clinical Study",
    description: "High-rigour evidence template for clinical or health intervention decisions.",
    hypothesisTemplate: "[INTERVENTION] reduces/improves [CLINICAL ENDPOINT] by [MAGNITUDE] in [PATIENT POPULATION] with acceptable safety profile compared to [CONTROL].",
    evidence: { effect: 0.75, replication: 0.70, hostileSurvival: 0.75, confoundControl: 0.80, generalization: 0.60, power: 0.85, ciExcludesNull: true, claimRequiresGeneralization: true },
    keyQuestions: ["Is there a placebo/control arm?", "Is the endpoint clinically meaningful?", "What is the minimal clinically important difference?"],
    successCriteria: ["RCT or equivalent design", "Pre-registered protocol", "NNT within acceptable clinical range"],
    tags: ["clinical", "pharma", "healthcare"],
  },
  {
    id: "growth-experiment",
    category: "Growth",
    icon: "📈",
    title: "Growth Experiment",
    description: "A/B test or growth experiment validation before scaling a growth lever.",
    hypothesisTemplate: "[INTERVENTION/CHANGE] increases [NORTH STAR METRIC] for [USER SEGMENT] by [MAGNITUDE] without negatively impacting [GUARDRAIL METRIC].",
    evidence: { effect: 0.55, replication: 0.50, hostileSurvival: 0.48, confoundControl: 0.55, generalization: 0.38, power: 0.60, ciExcludesNull: true, claimRequiresGeneralization: false },
    keyQuestions: ["Is the experiment properly powered?", "Are there novelty effects?", "Does the result hold for the full user base?"],
    successCriteria: ["Pre-calculated sample size", "Duration ≥ 2 weeks to capture full-week effects", "Secondary metrics not degraded"],
    tags: ["growth", "a/b", "product"],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Startup: "bg-amber/15 text-amber",
  Investment: "bg-go/15 text-go",
  Talent: "bg-white/10 text-ivory",
  Research: "bg-go/15 text-go",
  Marketing: "bg-kill/10 text-kill",
  Product: "bg-amber/10 text-unresolved",
  "M&A": "bg-white/10 text-steel",
  Technology: "bg-amber/15 text-amber",
  Healthcare: "bg-go/15 text-go",
  Growth: "bg-amber/10 text-unresolved",
};

export default function Templates() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [category, setCategory] = useState("ALL");
  const categories = ["ALL", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))];

  const filtered = TEMPLATES.filter((t) => category === "ALL" || t.category === category);

  const applyTemplate = (t: Template) => {
    const draft = {
      title: t.hypothesisTemplate,
      project: t.category,
      ev: t.evidence,
    };
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch {}
    router.push("/workflow");
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="label">Template Marketplace</div>
        <h1 className="text-2xl font-bold tracking-tight">Decision Templates</h1>
        <p className="mt-1 text-sm text-slate">Start from a proven framework. Templates pre-fill the workflow with evidence baselines and success criteria.</p>
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

      {/* Template grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {filtered.map((t) => (
          <div key={t.id} className="card space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{t.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`pill text-[10px] ${CATEGORY_COLORS[t.category] ?? "bg-white/10 text-steel"}`}>{t.category}</span>
                  <h2 className="font-bold text-ivory text-base">{t.title}</h2>
                </div>
                <p className="mt-1 text-sm text-steel">{t.description}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {t.tags.map((tag) => (
                <span key={tag} className="pill bg-white/5 text-[9px] text-slate">#{tag}</span>
              ))}
            </div>

            {/* Expand / collapse */}
            <button
              onClick={() => setExpanded(expanded === t.id ? null : t.id)}
              className="text-xs text-slate hover:text-amber transition-colors text-left"
            >
              {expanded === t.id ? "Hide details ▲" : "Show details ▼"}
            </button>

            {expanded === t.id && (
              <div className="border-t border-border-hair pt-3 space-y-3">
                {/* Hypothesis template */}
                <div>
                  <div className="label mb-1">Hypothesis Template</div>
                  <p className="text-xs text-steel italic rounded-inner bg-obsidian px-3 py-2">{t.hypothesisTemplate}</p>
                </div>

                {/* Key questions */}
                <div>
                  <div className="label mb-1">Key Questions</div>
                  <ul className="space-y-1">
                    {t.keyQuestions.map((q, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-steel">
                        <span className="text-amber shrink-0">?</span>{q}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Success criteria */}
                <div>
                  <div className="label mb-1 text-go">Success Criteria</div>
                  <ul className="space-y-1">
                    {t.successCriteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-steel">
                        <span className="text-go shrink-0">✓</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Evidence preview bars */}
                <div>
                  <div className="label mb-2">Baseline Evidence Profile</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([
                      ["Effect", "effect"], ["Replication", "replication"], ["Hostile", "hostileSurvival"],
                      ["Confound", "confoundControl"], ["General.", "generalization"], ["Power", "power"],
                    ] as [string, keyof typeof t.evidence][]).map(([label, key]) => {
                      const val = t.evidence[key] as number;
                      return (
                        <div key={key} className="rounded-inner bg-white/3 px-2 py-1.5 text-center">
                          <div className="text-[9px] text-slate">{label}</div>
                          <div className={`data text-sm font-bold ${val >= 0.7 ? "text-go" : val >= 0.4 ? "text-unresolved" : "text-kill"}`}>{val?.toFixed(2)}</div>
                          <div className="mt-0.5 h-0.5 w-full overflow-hidden rounded-full bg-white/8">
                            <div className={`h-full rounded-full ${val >= 0.7 ? "bg-go" : val >= 0.4 ? "bg-amber" : "bg-kill"}`} style={{ width: `${(val ?? 0) * 100}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => applyTemplate(t)}
              className="btn-primary w-full text-sm"
            >
              Use Template →
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate text-center">Templates pre-fill the workflow. Edit the hypothesis title and adjust evidence before running.</p>
    </div>
  );
}
