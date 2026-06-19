import type { Navigation, NavigationDimensionGain } from "@/lib/core";

type Props = { nav: Navigation; verdict: string };

const DIMENSION_ADVICE: Record<string, { action: string; example: string; timeWeeks: string }> = {
  effect: {
    action: "Run a pre-registered A/B test with pre-specified minimum detectable effect",
    example: "Compare treatment vs. control with ≥80% power for your expected effect size",
    timeWeeks: "4–8",
  },
  replication: {
    action: "Commission an independent replication with a different team or dataset",
    example: "Same protocol, different lab, population, or time period",
    timeWeeks: "6–12",
  },
  hostileSurvival: {
    action: "Assign a red team to actively attempt to falsify the hypothesis",
    example: "Structured devil's advocacy with access to all data and explicit mandate to disprove",
    timeWeeks: "2–4",
  },
  confoundControl: {
    action: "Design a natural experiment or use instrumental variables to isolate causality",
    example: "Diff-in-diff, regression discontinuity, or randomized controlled trial",
    timeWeeks: "4–10",
  },
  generalization: {
    action: "Test in at least two distinct contexts, populations, or geographies",
    example: "Run the same intervention in a different demographic segment or market",
    timeWeeks: "6–16",
  },
  power: {
    action: "Increase sample size to achieve ≥80% statistical power",
    example: "Compute required n from expected effect size and alpha, then collect more data",
    timeWeeks: "2–6",
  },
};

const GAIN_CLS = (gain: number) => gain > 0.1 ? "text-go" : gain > 0.05 ? "text-unresolved" : "text-slate";

export function EvidenceAssistant({ nav, verdict }: Props) {
  const gains: NavigationDimensionGain[] = (nav.dimensionGains ?? [])
    .filter((g) => g.maxGain > 0.005)
    .sort((a, b) => b.maxGain - a.maxGain)
    .slice(0, 5);

  if (gains.length === 0 && verdict === "GO") {
    return (
      <div className="rounded-inner border border-go/20 bg-go/5 px-4 py-3">
        <div className="label text-go mb-1">Evidence Status: Complete</div>
        <p className="text-sm text-steel">All evidence criteria are satisfied. No additional collection needed to maintain GO verdict.</p>
      </div>
    );
  }

  if (nav.impossibleReason) {
    return (
      <div className="rounded-inner border border-kill/20 bg-kill/5 px-4 py-3">
        <div className="label text-kill mb-1">Evidence Path Blocked</div>
        <p className="text-sm text-steel">{nav.impossibleReason}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="label">Evidence Assistant</div>
        <p className="text-xs text-slate mt-0.5">Ranked by maximum support gain — collect these first.</p>
      </div>

      {nav.highestLeverageLabel && (
        <div className="rounded-inner border border-amber/20 bg-amber/5 px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="text-amber text-lg">⚡</span>
            <div>
              <div className="text-xs font-semibold text-amber">Highest Leverage Action</div>
              <p className="text-sm text-ivory mt-0.5">{nav.recommendedAction ?? `Improve ${nav.highestLeverageLabel}`}</p>
              {nav.highestLeverageGain && (
                <p className="text-xs text-steel mt-0.5">
                  Max support gain: <span className="text-go font-semibold">+{(nav.highestLeverageGain * 100).toFixed(1)}%</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <ol className="space-y-2">
        {gains.map((g, i) => {
          const advice = DIMENSION_ADVICE[g.dimension] ?? null;
          return (
            <li key={g.dimension} className="rounded-inner bg-white/3 px-3 py-3">
              <div className="flex items-start gap-3">
                <span className="data text-xs text-slate shrink-0 mt-0.5">#{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-ivory">{g.label}</span>
                    <span className={`data text-xs font-bold ${GAIN_CLS(g.maxGain)}`}>
                      +{(g.maxGain * 100).toFixed(1)}% max gain
                    </span>
                    <span className="text-[10px] text-slate">
                      current: {(g.current * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-amber/40" style={{ width: `${g.current * 100}%` }} />
                  </div>
                  {advice && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-steel">{advice.action}</p>
                      <p className="text-[10px] text-slate italic">e.g. {advice.example}</p>
                      <p className="text-[10px] text-slate">Est. time: {advice.timeWeeks} weeks</p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {nav.unmetGoCriteria && nav.unmetGoCriteria.length > 0 && (
        <div className="rounded-inner border border-kill/20 bg-kill/5 px-3 py-2">
          <div className="label text-kill mb-1">Unmet GO Criteria</div>
          <ul className="space-y-1">
            {nav.unmetGoCriteria.map((c: string, i: number) => (
              <li key={i} className="text-xs text-steel flex items-start gap-1.5">
                <span className="text-kill shrink-0">✕</span>{c}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
