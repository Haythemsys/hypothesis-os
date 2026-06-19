"use client";
import type { Navigation } from "@/lib/core";

const DIM_ICON: Record<string, string> = {
  effect: "⬆",
  replication: "↩",
  hostileSurvival: "⚡",
  confoundControl: "⊘",
  generalization: "⊕",
};

function GapBar({ current, goal }: { current: number; goal: number }) {
  const pctCurrent = Math.round(current * 100);
  const pctGoal = Math.round(goal * 100);
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="absolute left-0 top-0 h-full rounded-full bg-unresolved transition-all"
        style={{ width: `${pctCurrent}%` }}
      />
      <div
        className="absolute top-0 h-full w-0.5 bg-go"
        style={{ left: `${pctGoal}%` }}
        title={`GO threshold: ${pctGoal}%`}
      />
    </div>
  );
}

const HARD_DISTANCES = new Set(["1 evidence move", "2 evidence moves", "2–3 evidence moves"]);

function navStatusLabel(distanceToGo: string | null): { label: string; sub: string; cls: string } {
  if (!distanceToGo) return { label: "Honest unresolved", sub: "", cls: "text-steel" };
  if (HARD_DISTANCES.has(distanceToGo))
    return { label: "Recommended next evidence", sub: distanceToGo, cls: "text-unresolved" };
  return { label: "Requires substantial evidence", sub: distanceToGo, cls: "text-steel" };
}

export function NavigationPanel({ nav }: { nav: Navigation }) {
  if (nav.verdict === "GO") return null;

  const isKill = nav.verdict === "KILL";

  return (
    <section className="card border border-unresolved/30 space-y-3">
      <div className="label text-unresolved">Evidence Navigation</div>

      {/* Support bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-steel">
          <span>Current support</span>
          <span className="font-mono font-semibold text-white">{nav.currentSupport}</span>
        </div>
        <GapBar current={nav.currentSupport} goal={nav.goThreshold} />
        <div className="flex justify-between text-xs text-slate">
          <span>0</span>
          <span>
            GO threshold: {nav.goThreshold}
            {nav.supportGap > 0 && (
              <span className="ml-1 text-unresolved">(gap: {nav.supportGap})</span>
            )}
          </span>
        </div>
      </div>

      {/* Kill gate info */}
      {isKill && nav.killedBy && nav.killedBy.length > 0 && (
        <div className="rounded-lg bg-kill/10 border border-kill/20 p-3 space-y-1">
          <div className="text-xs font-semibold text-kill">Kill gate(s) fired</div>
          {nav.killedBy.map((g) => (
            <div key={g.gate} className="text-xs text-steel">
              <span className="font-mono">{g.gate}</span> = {g.value}{" "}
              <span className="text-slate">(floor: {g.floor})</span>
            </div>
          ))}
          <p className="text-xs text-steel pt-1">
            Address the kill gate(s) before targeting GO. Navigation to GO is not available from a KILL verdict.
          </p>
        </div>
      )}

      {/* Navigable cases */}
      {nav.navigable && (
        <>
          {/* Highest leverage */}
          <div className="rounded-lg bg-white/5 p-3 space-y-1">
            <div className="text-xs font-semibold text-steel">
              Highest leverage dimension
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {DIM_ICON[nav.highestLeverageDimension ?? ""] ?? "→"}
              </span>
              <div>
                <div className="text-sm font-semibold text-white">
                  {nav.highestLeverageLabel ?? nav.highestLeverageDimension}
                </div>
                <div className="text-xs text-steel">
                  Max support gain: +{nav.highestLeverageGain}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended action */}
          {nav.recommendedAction && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-steel">Recommended next action</div>
              <p className="text-sm text-ivory">{nav.recommendedAction}</p>
            </div>
          )}

          {/* Unmet GO criteria */}
          {nav.unmetGoCriteria && nav.unmetGoCriteria.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-steel">
                Unmet GO criteria ({nav.unmetGoCriteria.length}/4)
              </div>
              <div className="flex flex-wrap gap-1">
                {nav.unmetGoCriteria.map((c) => (
                  <span key={c} className="rounded bg-unresolved/20 px-2 py-0.5 text-xs text-unresolved">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Distance / status label */}
          {(() => {
            const { label, sub, cls } = navStatusLabel(nav.distanceToGo);
            return (
              <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                <span className={`${cls} text-sm`}>⟳</span>
                <div>
                  <div className={`text-sm font-semibold ${cls}`}>{label}</div>
                  {sub && <div className="text-xs text-slate">{sub}</div>}
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* Not navigable */}
      {!nav.navigable && (
        <div className="rounded-lg bg-white/5 border border-white/10 p-3">
          <div className="text-xs font-semibold text-steel mb-1">Honest unresolved</div>
          {nav.impossibleReason && (
            <p className="text-sm text-steel">{nav.impossibleReason}</p>
          )}
        </div>
      )}
    </section>
  );
}
