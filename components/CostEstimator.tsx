import type { EvidenceDebt, DecisionEffort, Navigation, DecisionRisk } from "@/lib/core";

type Props = {
  verdict: string;
  debt: EvidenceDebt;
  effort: DecisionEffort;
  nav: Navigation;
  risk: DecisionRisk;
};

type CostEstimate = {
  label: string;
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  mitigant: string;
};

function estimateCosts(
  verdict: string,
  debt: EvidenceDebt,
  effort: DecisionEffort,
  nav: Navigation,
  risk: DecisionRisk,
): { wrongGo: CostEstimate; wrongKill: CostEstimate; delay: CostEstimate } {
  const debtHigh = debt.pct > 50;
  const debtMed  = debt.pct > 25;
  const effortHigh = effort.level === "HIGH";
  const effortMed  = effort.level === "MEDIUM";
  const support = nav.currentSupport;

  // Wrong GO: pursued a false hypothesis
  const wrongGoLevel: CostEstimate["level"] =
    (debtHigh && support < 0.6) ? "CRITICAL" :
    (debtHigh || (support < 0.5)) ? "HIGH" :
    debtMed ? "MEDIUM" : "LOW";

  const wrongGo: CostEstimate = {
    label: "Cost of Wrong GO",
    level: wrongGoLevel,
    description:
      wrongGoLevel === "CRITICAL"
        ? "High evidence debt combined with low support — acting on a GO would likely consume resources on a false hypothesis."
        : wrongGoLevel === "HIGH"
        ? "Significant uncertainty remains. A premature GO risks misallocating capital, time, and team attention."
        : wrongGoLevel === "MEDIUM"
        ? "Moderate evidence gaps. A wrong GO is recoverable but will require course-correction."
        : "Evidence is solid. A wrong GO would be surprising and reversible.",
    mitigant:
      wrongGoLevel === "CRITICAL" ? "Do not proceed without addressing top evidence gaps." :
      wrongGoLevel === "HIGH"     ? "Run a hostile test before committing to GO." :
      wrongGoLevel === "MEDIUM"   ? "Define clear failure criteria and a checkpoint at 30 days." :
      "Standard monitoring is sufficient.",
  };

  // Wrong KILL: killed a true hypothesis
  const wrongKillLevel: CostEstimate["level"] =
    (verdict === "KILL" && support > 0.45) ? "HIGH" :
    (verdict === "UNRESOLVED" && support > 0.55) ? "MEDIUM" :
    (debt.pct > 60) ? "MEDIUM" : "LOW";

  const wrongKill: CostEstimate = {
    label: "Cost of Wrong KILL",
    level: wrongKillLevel,
    description:
      wrongKillLevel === "HIGH"
        ? "Support score is non-trivial despite a KILL verdict — the hypothesis may be true but evidence incomplete. Killing it now carries real opportunity cost."
        : wrongKillLevel === "MEDIUM"
        ? "Opportunity cost is moderate. Evidence gaps may be masking a valid hypothesis."
        : "KILL verdict is well-supported by the evidence. Opportunity cost is low.",
    mitigant:
      wrongKillLevel === "HIGH"   ? "Before killing, run one more targeted experiment on the highest-leverage dimension." :
      wrongKillLevel === "MEDIUM" ? "Document why the hypothesis was killed for future review." :
      "Decision is evidence-backed. Safe to archive.",
  };

  // Delay: cost of not deciding
  const delayCycles = effort.studyCycles ?? (effortHigh ? 8 : effortMed ? 4 : 2);
  const delayLevel: CostEstimate["level"] =
    (effortHigh && debt.pct > 50) ? "CRITICAL" :
    (effortHigh || (debt.pct > 40 && risk.level === "HIGH")) ? "HIGH" :
    (effortMed || debt.pct > 20) ? "MEDIUM" : "LOW";

  const delay: CostEstimate = {
    label: "Cost of Delay",
    level: delayLevel,
    description:
      delayLevel === "CRITICAL"
        ? `Estimated ${delayCycles} study cycles to resolve. High debt + high effort means delay is expensive — indecision has compounding costs.`
        : delayLevel === "HIGH"
        ? `Approximately ${delayCycles} cycles to resolve. Extended deferral risks market window closure or competitor pre-emption.`
        : delayLevel === "MEDIUM"
        ? `Around ${delayCycles} cycles needed. Reasonable to gather more evidence, but set a decision deadline.`
        : `Only ~${delayCycles} cycles needed. Resolution is near. Decide quickly.`,
    mitigant:
      delayLevel === "CRITICAL" ? "Set a hard decision deadline. Use the fastest-kill experiment." :
      delayLevel === "HIGH"     ? "Run targeted evidence collection on highest-leverage dimension only." :
      delayLevel === "MEDIUM"   ? "Schedule a decision checkpoint in 2–4 weeks." :
      "Proceed to verdict. Evidence is near-complete.",
  };

  return { wrongGo, wrongKill, delay };
}

const LEVEL_CLS: Record<string, { pill: string; text: string; bar: string }> = {
  LOW:      { pill: "bg-go/15 text-go",         text: "text-go",         bar: "bg-go" },
  MEDIUM:   { pill: "bg-amber/15 text-unresolved", text: "text-unresolved", bar: "bg-amber" },
  HIGH:     { pill: "bg-kill/15 text-kill",      text: "text-kill",       bar: "bg-kill" },
  CRITICAL: { pill: "bg-kill/25 text-kill",      text: "text-kill",       bar: "bg-kill" },
};
const LEVEL_SCORE: Record<string, number> = { LOW: 25, MEDIUM: 50, HIGH: 75, CRITICAL: 95 };

export function CostEstimator({ verdict, debt, effort, nav, risk }: Props) {
  const costs = estimateCosts(verdict, debt, effort, nav, risk);

  return (
    <div className="space-y-3">
      <div className="label">Decision Cost Estimator</div>
      <p className="text-xs text-slate">Consequences of each error type, ranked by severity given current evidence.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[costs.wrongGo, costs.wrongKill, costs.delay].map((cost) => {
          const cls = LEVEL_CLS[cost.level];
          const score = LEVEL_SCORE[cost.level];
          return (
            <div key={cost.label} className="rounded-inner border border-border-hair bg-white/3 p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] font-semibold text-steel">{cost.label}</div>
                <span className={`pill text-[10px] ${cls.pill}`}>{cost.level}</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/8">
                <div className={`h-full rounded-full ${cls.bar}`} style={{ width: `${score}%` }} />
              </div>
              <p className="text-[11px] text-slate leading-relaxed">{cost.description}</p>
              <div className="border-t border-border-hair pt-2">
                <div className="text-[10px] font-semibold text-go mb-0.5">Mitigant</div>
                <p className="text-[11px] text-steel">{cost.mitigant}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
