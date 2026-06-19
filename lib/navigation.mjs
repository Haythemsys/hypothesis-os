// HypothesisOS — Evidence Navigation Layer
// Given an evidence vector and current verdict, computes:
//   - what's blocking GO
//   - which dimension has highest leverage
//   - whether GO is realistically achievable
//   - what evidence action to take next
//
// DESIGN INVARIANTS (never relax these):
//   1. Engine thresholds are read-only — navigation reads them, never adjusts them.
//   2. Navigable=true does NOT mean GO is likely; it means GO is achievable IF evidence supports it.
//   3. A KILL verdict is never presented as navigable to GO — only navigable to UNRESOLVED (escape kill).
//   4. False GO protection is preserved: no path here allows inflating scores to force GO.

import {
  classify, supportScore, supportBreakdown,
  THRESHOLDS, SUPPORT_WEIGHTS, VERDICT,
} from "./engine.mjs";

const isMeasured = (v) => typeof v === "number" && !Number.isNaN(v);
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const round2 = (x) => Math.round(x * 100) / 100;

// What evidence to collect next, per dimension
const ACTION_MAP = {
  effect:
    "Collect stronger direct evidence of effect size — a pre-registered study, dose-response data, or an A/B test with a clear outcome metric.",
  replication:
    "Seek at least one independent replication from a different team, lab, or dataset.",
  hostileSurvival:
    "Run hostile tests: expose the hypothesis to its strongest known counter-evidence and measure whether the effect survives.",
  confoundControl:
    "Identify and rule out the primary confounds with controlled comparisons, matched cohorts, or instrumental variables.",
  generalization:
    "Test the claim in at least one out-of-sample context to establish cross-context validity.",
};

const DIMENSION_LABEL = {
  effect: "Effect strength",
  replication: "Replication",
  hostileSurvival: "Hostile-test survival",
  confoundControl: "Confound control",
  generalization: "Generalization",
};

/** Returns per-dimension potential support gains, sorted descending by maxGain. */
function dimensionGains(e, W) {
  const CRG = !!e.claimRequiresGeneralization;
  const dims = [
    { dimension: "effect",          weight: W.effect },
    { dimension: "replication",     weight: W.replication },
    { dimension: "hostileSurvival", weight: W.hostileSurvival },
    { dimension: "confoundControl", weight: W.confoundControl },
    // generalization contributes nothing when CRG=false (neutralized to fixed 0.5*0.10)
    { dimension: "generalization",  weight: CRG ? W.generalization : 0 },
  ];

  return dims.map(({ dimension, weight }) => {
    const val = isMeasured(e[dimension]) ? clamp01(e[dimension]) : 0;
    const maxGain = round2(weight * (1.0 - val));
    return { dimension, label: DIMENSION_LABEL[dimension], current: round2(val), weight, maxGain };
  }).sort((a, b) => b.maxGain - a.maxGain);
}

/** How many evidence "moves" (study cycles) realistically close the support gap. */
function estimateMoves(supportGap, unmetGoCriteria, gains) {
  let remaining = supportGap;
  let moves = 0;
  for (const d of gains) {
    if (remaining <= 0) break;
    remaining -= d.maxGain * 0.55; // ~55 % of max gain per study cycle = realistic
    moves++;
    if (moves >= 5) break;
  }
  // GO criteria beyond support (replication, ci, power) each add at least one move
  const blocker_moves = unmetGoCriteria.filter((k) => k !== "support").length;
  moves = Math.max(moves, blocker_moves);
  if (moves <= 1) return "1 evidence move";
  if (moves === 2) return "2 evidence moves";
  if (moves <= 3) return "2–3 evidence moves";
  return "3+ evidence moves";
}

/**
 * Navigate from an UNRESOLVED verdict toward GO.
 * Returns the full navigation object.
 */
function navigateUnresolved(e, support) {
  const T = THRESHOLDS;
  const W = SUPPORT_WEIGHTS;

  const goThreshold = T.goSupport;
  const supportGap = round2(Math.max(0, goThreshold - support));

  // Which of the 4 GO criteria are unmet?
  const unmetGoCriteria = [];
  if (support < T.goSupport)
    unmetGoCriteria.push({ criterion: "support", current: round2(support), required: T.goSupport });
  if ((e.replication ?? 0) < T.goReplication)
    unmetGoCriteria.push({ criterion: "replication", current: round2(e.replication ?? 0), required: T.goReplication });
  if (!e.ciExcludesNull)
    unmetGoCriteria.push({ criterion: "ciExcludesNull", current: false, required: true });
  if ((e.power ?? 0) < T.goPower)
    unmetGoCriteria.push({ criterion: "power", current: round2(e.power ?? 0), required: T.goPower });

  const gains = dimensionGains(e, W);
  const highestLeverage = gains[0];

  // ── Navigability decision ───────────────────────────────────────────────────
  // Not navigable when there is no meaningful positive signal to build upon:
  //
  // A. Effect measured AND < 0.20 — just above the kill gate floor, essentially no signal.
  //    Even perfect replication of a negligible effect should not yield GO.
  // B. Support < 0.20 — evidence is near-absent across all dimensions.
  //    This is qualitatively different from "weak": it means the hypothesis has not been tested.
  // C. All 4 GO criteria unmet AND supportGap > 0.45 — the claim needs a complete evidence
  //    rebuild, not incremental improvement. UNRESOLVED is the honest state until then.
  //
  // These conditions deliberately do NOT fire on null fields (untested ≠ disproven).

  const effectVal = isMeasured(e.effect) ? e.effect : null;
  const tooLowEffect = effectVal !== null && effectVal < 0.20;
  const nearlAbsent = support < 0.20;
  const rebuiltNeeded = unmetGoCriteria.length >= 4 && supportGap > 0.45;

  const navigable = !tooLowEffect && !nearlAbsent && !rebuiltNeeded;

  let impossibleReason = null;
  if (!navigable) {
    if (tooLowEffect) {
      impossibleReason =
        `Effect strength is measured at ${effectVal.toFixed(2)} — near the kill-gate floor and ` +
        `providing no meaningful positive signal. Improving other dimensions cannot substitute ` +
        `for the absence of a real effect. UNRESOLVED is the honest answer here.`;
    } else if (nearlAbsent) {
      impossibleReason =
        `Overall support (${round2(support)}) is near-zero across all dimensions. ` +
        `The hypothesis has not been meaningfully tested yet. ` +
        `Start by establishing a basic effect measurement before attempting further navigation.`;
    } else {
      impossibleReason =
        `All four GO criteria are unmet and the support gap (${supportGap}) is large. ` +
        `Navigation would require rebuilding the evidence base from scratch across every dimension. ` +
        `UNRESOLVED correctly reflects that this hypothesis remains untested at the required depth.`;
    }
  }

  const distanceToGo = navigable
    ? estimateMoves(supportGap, unmetGoCriteria.map((u) => u.criterion), gains)
    : null;

  // Explanation
  const metCriteria = ["support", "replication", "ciExcludesNull", "power"].filter(
    (c) => !unmetGoCriteria.find((u) => u.criterion === c)
  );
  const explanation =
    unmetGoCriteria.length === 0
      ? "All GO criteria are met."
      : `Missing GO criteria: ${unmetGoCriteria.map((u) => u.criterion).join(", ")}. ` +
        (metCriteria.length
          ? `Already satisfied: ${metCriteria.join(", ")}.`
          : "No GO criteria are satisfied yet.");

  return {
    verdict: VERDICT.UNRESOLVED,
    currentSupport: round2(support),
    goThreshold,
    supportGap,
    navigable,
    distanceToGo,
    highestLeverageDimension: highestLeverage.dimension,
    highestLeverageLabel: highestLeverage.label,
    highestLeverageGain: highestLeverage.maxGain,
    unmetGoCriteria: unmetGoCriteria.map((u) => u.criterion),
    unmetGoCriteriaDetail: unmetGoCriteria,
    recommendedAction: ACTION_MAP[highestLeverage.dimension],
    explanation,
    impossibleReason,
    dimensionGains: gains,
  };
}

/**
 * Navigate from a KILL verdict.
 * Shows which gate fired and what it would take to move to UNRESOLVED.
 * Does NOT project a path to GO — escaping KILL is a different goal.
 */
function navigateFromKill(e) {
  const T = THRESHOLDS;

  const firedGates = [];
  if (isMeasured(e.effect) && e.effect < T.effectFloor)
    firedGates.push({ gate: "effect", value: round2(e.effect), floor: T.effectFloor,
      action: "Obtain substantially larger effect sizes with a well-powered, controlled study." });
  if (isMeasured(e.hostileSurvival) && e.hostileSurvival < T.hostileFloor)
    firedGates.push({ gate: "hostileSurvival", value: round2(e.hostileSurvival), floor: T.hostileFloor,
      action: "Show that the effect survives when tested under the strongest counter-conditions." });
  if (isMeasured(e.confoundControl) && e.confoundControl < T.confoundFloor)
    firedGates.push({ gate: "confoundControl", value: round2(e.confoundControl), floor: T.confoundFloor,
      action: "Design a study that systematically rules out the primary confounds." });
  if (e.claimRequiresGeneralization && isMeasured(e.generalization) && e.generalization < T.generalizationFloor)
    firedGates.push({ gate: "generalization", value: round2(e.generalization), floor: T.generalizationFloor,
      action: "Test the claim across diverse contexts to establish out-of-sample validity." });

  const primaryGate = firedGates[0];
  return {
    verdict: VERDICT.KILL,
    currentSupport: round2(supportScore(e)),
    goThreshold: T.goSupport,
    supportGap: round2(Math.max(0, T.goSupport - supportScore(e))),
    navigable: false,
    distanceToGo: null,
    killedBy: firedGates,
    highestLeverageDimension: primaryGate?.gate ?? null,
    highestLeverageLabel: primaryGate ? DIMENSION_LABEL[primaryGate.gate] : null,
    highestLeverageGain: null,
    unmetGoCriteria: null,
    recommendedAction: primaryGate?.action ?? null,
    explanation:
      `KILL gate(s) fired: ${firedGates.map((g) => `${g.gate}=${g.value} < ${g.floor}`).join("; ")}. ` +
      `To escape KILL, the evidence must be strengthened above the gate floor(s) first. ` +
      `Navigation to GO is not in scope — establish that the kill is wrong before seeking GO.`,
    impossibleReason:
      "KILL verdicts are not navigable to GO from this starting point. The kill gate must be addressed first.",
    dimensionGains: dimensionGains(e, SUPPORT_WEIGHTS),
  };
}

/**
 * Main export: navigate(evidenceVector, verdict)
 *
 * @param {object} evidenceVector - The evidence packet (all 8 fields)
 * @param {string} verdict        - The current verdict: GO, KILL, or UNRESOLVED
 * @returns Navigation object
 */
export function navigate(evidenceVector, verdict) {
  const e = evidenceVector || {};
  const support = supportScore(e);
  const v = (verdict || "").toUpperCase();

  if (v === VERDICT.GO) {
    return {
      verdict: VERDICT.GO,
      currentSupport: round2(support),
      goThreshold: THRESHOLDS.goSupport,
      supportGap: 0,
      navigable: false,
      distanceToGo: null,
      highestLeverageDimension: null,
      highestLeverageLabel: null,
      highestLeverageGain: null,
      unmetGoCriteria: [],
      recommendedAction: null,
      explanation: "Verdict is GO. All criteria are satisfied. Navigation complete.",
      impossibleReason: null,
      dimensionGains: dimensionGains(e, SUPPORT_WEIGHTS),
    };
  }

  if (v === VERDICT.KILL) return navigateFromKill(e);

  // UNRESOLVED (default)
  return navigateUnresolved(e, support);
}
