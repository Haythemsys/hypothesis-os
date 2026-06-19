"use client";
import type {
  Navigation, ExecutiveSummary, EvidenceDebt, DecisionEffort, PathStep, ConfidenceBreakdown,
} from "@/lib/core";

// ── Color helpers ────────────────────────────────────────────────────────────
const VERDICT_TEXT: Record<string, string> = {
  GO: "text-go", KILL: "text-kill", UNRESOLVED: "text-unresolved",
};
const EFFORT_CLS: Record<string, string> = {
  LOW: "text-go", MEDIUM: "text-unresolved", HIGH: "text-kill",
};
const debtCls = (pct: number) =>
  pct <= 10 ? "text-go" : pct <= 30 ? "text-unresolved" : "text-kill";

// ── 1. Executive Summary Card ────────────────────────────────────────────────
export function ExecutiveSummaryCard({
  summary, verdict,
}: {
  summary: ExecutiveSummary;
  verdict: string;
}) {
  const vText  = VERDICT_TEXT[verdict] ?? "text-ivory";
  const eff    = summary.effort;
  const effCls = eff ? EFFORT_CLS[eff] ?? "text-ivory" : "text-steel";

  return (
    <section className={`card border-2 verdict-${verdict} space-y-3`}>
      <div className="label">Executive Decision Summary</div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs text-steel">Verdict</div>
          <div className={`text-xl font-bold ${vText}`}>{verdict}</div>
        </div>
        {eff && (
          <div className="text-right min-w-0">
            <div className="text-xs text-steel">Estimated effort</div>
            <div className={`text-sm font-bold ${effCls}`}>{eff}</div>
            {summary.studyCycles !== null && (
              <div className="text-xs text-slate">
                {summary.studyCycles} study cycle{summary.studyCycles !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="text-xs text-steel mb-0.5">Reason</div>
        <p className="text-sm text-ivory leading-relaxed">{summary.reason}</p>
      </div>

      {summary.fastestRoute && (
        <div>
          <div className="text-xs text-steel mb-0.5">Fastest route</div>
          <p className="text-sm font-medium text-white">{summary.fastestRoute}</p>
        </div>
      )}

      {verdict !== "GO" && summary.debtPct !== null && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-xs text-steel">Evidence debt:</span>
          <span className={`text-sm font-bold ${debtCls(summary.debtPct)}`}>
            {summary.debtPct}%
          </span>
          {summary.debtBand && (
            <span className="text-xs text-slate">· {summary.debtBand}</span>
          )}
        </div>
      )}
    </section>
  );
}

// ── 2. GO Blockers Panel ─────────────────────────────────────────────────────
const CRITERION_LABEL: Record<string, string> = {
  support:       "Weighted support",
  replication:   "Replication",
  ciExcludesNull:"CI excludes null",
  power:         "Statistical power",
};

export function GoBlockersPanel({ nav }: { nav: Navigation }) {
  const details = nav.unmetGoCriteriaDetail;
  if (!details || details.length === 0 || nav.verdict !== "UNRESOLVED") return null;

  return (
    <section className="card border border-kill/20 space-y-3">
      <div className="label text-kill">GO Blockers</div>
      <div className="space-y-2">
        {details.map((d) => {
          const isBool    = typeof d.required === "boolean";
          const currentStr = isBool
            ? (d.current ? "YES" : "NO")
            : String(d.current);
          const requiredStr = isBool ? "YES" : String(d.required);
          const gapStr = isBool
            ? (d.current ? "—" : "Required")
            : String(Math.round((Number(d.required) - Number(d.current)) * 100) / 100);

          return (
            <div key={d.criterion} className="rounded-lg bg-obsidian p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-kill text-sm" aria-hidden>✗</span>
                <span className="text-sm font-semibold text-white">
                  {CRITERION_LABEL[d.criterion] ?? d.criterion}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-slate mb-0.5">Current</div>
                  <div className="font-mono text-ivory">{currentStr}</div>
                </div>
                <div>
                  <div className="text-slate mb-0.5">Required</div>
                  <div className="font-mono text-ivory">{requiredStr}</div>
                </div>
                <div>
                  <div className="text-slate mb-0.5">Gap</div>
                  <div className="font-mono text-unresolved">{gapStr}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── 3. Evidence Debt Panel ───────────────────────────────────────────────────
export function EvidenceDebtPanel({ debt }: { debt: EvidenceDebt }) {
  const pct = debt.pct;
  const cls = debtCls(pct);
  const barWidth = Math.min(100, pct);

  return (
    <section className="card space-y-3">
      <div className="label">Evidence Debt</div>
      <div className="flex items-end justify-between gap-2">
        <div className={`text-3xl font-bold tabular-nums ${cls}`}>{pct}%</div>
        <div className="text-xs text-steel text-right">{debt.band}</div>
      </div>

      {/* Progress bar — fill represents debt (red = more debt) */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all ${
            pct <= 10 ? "bg-go" : pct <= 30 ? "bg-unresolved" : "bg-kill"
          }`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate">
        <span>0–10%  Near GO</span>
        <span>30–60%  Significant</span>
        <span>10–30%  Moderate</span>
        <span>60%+  Major deficit</span>
      </div>
    </section>
  );
}

// ── 4. Decision Effort Panel ─────────────────────────────────────────────────
const EFFORT_BG: Record<string, string> = {
  LOW: "bg-go/10 border-go/20", MEDIUM: "bg-unresolved/10 border-unresolved/20", HIGH: "bg-kill/10 border-kill/20",
};

export function EffortPanel({ effort }: { effort: DecisionEffort }) {
  const cls    = EFFORT_CLS[effort.level] ?? "text-ivory";
  const bgCls  = EFFORT_BG[effort.level]  ?? "bg-white/5 border-white/10";

  return (
    <section className={`card border space-y-2 ${bgCls}`}>
      <div className="label">Decision Effort Estimate</div>
      <div className={`text-3xl font-bold ${cls}`}>{effort.level}</div>
      {effort.studyCycles !== null ? (
        <div className="text-sm text-steel">
          Estimated study cycles: <span className="font-semibold text-white">{effort.studyCycles}</span>
        </div>
      ) : (
        <div className="text-sm text-steel">
          Multiple study cycles required — no single move closes the gap.
        </div>
      )}
    </section>
  );
}

// ── 5. Path to GO Panel ──────────────────────────────────────────────────────
export function PathToGoPanel({ steps }: { steps: PathStep[] }) {
  if (steps.length === 0) return null;

  return (
    <section className="card space-y-3">
      <div className="label">Path to GO</div>
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={s.dimension} className="flex gap-3 min-w-0">
            <div className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-steel">
              {i + 1}
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="text-sm font-semibold text-white truncate">{s.label}</div>
              <p className="text-xs text-steel leading-relaxed">{s.action}</p>
              {s.maxGain !== null && (
                <span className="inline-block text-xs text-go">+{s.maxGain} max support gain</span>
              )}
            </div>
          </li>
        ))}
      </ol>
      <div className="rounded-lg bg-white/5 px-3 py-2 text-xs text-steel">
        Expected outcome: <span className="text-white font-medium">GO becomes eligible</span>
      </div>
    </section>
  );
}

// ── 6. Confidence Explanation Panel ─────────────────────────────────────────
export function ConfidenceExplanationPanel({ breakdown }: { breakdown: ConfidenceBreakdown }) {
  const hasContent = breakdown.contributors.length > 0 || breakdown.penalties.length > 0;
  if (!hasContent) return null;

  return (
    <section className="card space-y-3">
      <div className="flex items-baseline gap-2">
        <div className="label">Why {breakdown.score}?</div>
        <span className="text-xs text-slate">Calibration score breakdown</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {breakdown.contributors.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-go mb-1.5">Contributors</div>
            <ul className="space-y-1">
              {breakdown.contributors.map((c) => (
                <li key={c} className="flex items-start gap-1.5 text-xs text-steel">
                  <span className="text-go shrink-0 mt-0.5">+</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {breakdown.penalties.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-kill mb-1.5">Penalties</div>
            <ul className="space-y-1">
              {breakdown.penalties.map((p) => (
                <li key={p} className="flex items-start gap-1.5 text-xs text-steel">
                  <span className="text-kill shrink-0 mt-0.5">−</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
