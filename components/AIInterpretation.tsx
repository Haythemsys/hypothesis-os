import type { Navigation, EvidenceDebt, DecisionEffort, DecisionRisk, ExecutiveSummary } from "@/lib/core";

type Props = {
  verdict: string;
  nav: Navigation;
  debt: EvidenceDebt;
  effort: DecisionEffort;
  risk: DecisionRisk;
  exec_?: ExecutiveSummary | null;
  hypothesisTitle?: string;
};

// Deterministic AI-style interpretation layer.
// Engine verdict is authoritative. This layer only explains — never overrides.
function generateInterpretation(
  verdict: string, nav: Navigation, debt: EvidenceDebt,
  effort: DecisionEffort, risk: DecisionRisk, title?: string
): { headline: string; body: string; signal: string } {
  const supportPct = Math.round(nav.currentSupport * 100);
  const gapPct = Math.round((nav.goThreshold - nav.currentSupport) * 100);
  const highestLeverage = nav.highestLeverageLabel ?? "evidence quality";

  if (verdict === "GO") {
    return {
      headline: "Decision is ready to execute.",
      body: `All evidence criteria are satisfied with ${supportPct}% support. Evidence debt is ${debt.pct.toFixed(0)}% — ${debt.band}. Confidence is adequate for a GO decision at this stage. ${
        risk.level === "LOW"
          ? "Risk profile is low. Proceeding carries minimal exposure."
          : `Risk level is ${risk.level} — proceed with monitoring.`
      }`,
      signal: "GO_READY",
    };
  }

  if (verdict === "KILL") {
    const gapAway = nav.supportGap > 0.3;
    return {
      headline: "Evidence does not support this hypothesis.",
      body: `Support score is ${supportPct}% — ${gapAway ? "significantly" : "materially"} below the GO threshold. ${
        nav.killedBy && nav.killedBy.length > 0
          ? `The hypothesis is blocked by ${nav.killedBy[0].gate} falling below the minimum floor.`
          : "Multiple evidence dimensions are insufficient."
      } ${
        debt.pct > 60
          ? "Evidence debt is high — additional data collection is unlikely to change this verdict without a fundamentally different approach."
          : "The kill verdict reflects current evidence; additional experiments could revisit this."
      }`,
      signal: "KILL_CONFIRMED",
    };
  }

  // UNRESOLVED
  const nearGo = nav.supportGap < 0.15;
  if (nearGo) {
    return {
      headline: `This hypothesis is near GO — ${gapPct}% support gap remains.`,
      body: `Current evidence shows ${supportPct}% support. The primary gap is in ${highestLeverage}. ${
        effort.level === "LOW"
          ? "One targeted experiment could resolve the uncertainty."
          : effort.level === "MEDIUM"
          ? "Two to three study cycles are estimated to reach GO."
          : "Resolution requires significant additional evidence effort."
      } ${nav.recommendedAction ? `Priority action: ${nav.recommendedAction}` : ""} Evidence debt is ${debt.pct.toFixed(0)}% — ${debt.band}.`,
      signal: "NEAR_GO",
    };
  }

  return {
    headline: "Decision requires substantially more evidence.",
    body: `Support score is ${supportPct}% — a ${gapPct}% gap from the GO threshold. The highest-leverage area is ${highestLeverage}. ${
      effort.level === "HIGH"
        ? "Resolution will require extended evidence collection across multiple dimensions."
        : "Focused effort on key dimensions can meaningfully improve the verdict."
    } Current risk: ${risk.level}. Evidence debt: ${debt.pct.toFixed(0)}%.`,
    signal: "NEEDS_EVIDENCE",
  };
}

const SIGNAL_STYLES: Record<string, { border: string; bg: string; label: string; labelCls: string }> = {
  GO_READY:       { border: "border-go/30",    bg: "bg-go/5",    label: "GO Ready",        labelCls: "text-go" },
  KILL_CONFIRMED: { border: "border-kill/30",   bg: "bg-kill/5",  label: "Kill Confirmed",  labelCls: "text-kill" },
  NEAR_GO:        { border: "border-amber/30",  bg: "bg-amber/5", label: "Near GO",         labelCls: "text-unresolved" },
  NEEDS_EVIDENCE: { border: "border-white/10",  bg: "bg-white/3", label: "Needs Evidence",  labelCls: "text-slate" },
};

export function AIInterpretation({ verdict, nav, debt, effort, risk, exec_, hypothesisTitle }: Props) {
  const interp = generateInterpretation(verdict, nav, debt, effort, risk, hypothesisTitle);
  const style = SIGNAL_STYLES[interp.signal] ?? SIGNAL_STYLES.NEEDS_EVIDENCE;

  return (
    <div className={`rounded-card border ${style.border} ${style.bg} p-4 space-y-3`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">◈</span>
        <div>
          <div className="flex items-center gap-2">
            <span className="label">Intelligence Interpretation</span>
            <span className={`pill text-[10px] bg-white/8 ${style.labelCls}`}>{style.label}</span>
          </div>
          <p className="text-[10px] text-slate mt-0.5">Advisory only · Engine verdict is authoritative</p>
        </div>
      </div>

      <div className="border-t border-white/8 pt-3 space-y-1.5">
        <p className="font-semibold text-sm text-ivory">{interp.headline}</p>
        <p className="text-sm text-steel leading-relaxed">{interp.body}</p>
      </div>

      <div className="flex items-start gap-2 rounded-inner bg-white/3 px-3 py-2">
        <span className="shrink-0 text-xs text-slate mt-0.5">Engine Verdict:</span>
        <span className={`font-bold text-sm ${verdict === "GO" ? "text-go" : verdict === "KILL" ? "text-kill" : "text-unresolved"}`}>
          {verdict}
        </span>
        <span className="text-xs text-slate ml-auto">Deterministic · Not overridden</span>
      </div>
    </div>
  );
}
