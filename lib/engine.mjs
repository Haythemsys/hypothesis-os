// HypothesisOS — core decision engine (v2).
// Purpose: evaluate a hypothesis from EVIDENCE (never from the known answer) and return
// GO / KILL / UNRESOLVED with a transparent rationale. Pure ESM JS so it runs in Node
// (benchmark) and imports cleanly into the Next.js app. No dependencies.

/**
 * Evidence schema (every field is evidence ABOUT the claim, not the claim's label):
 *  effect            0..1  strength of the measured effect supporting the claim
 *  replication       0..1  0=none, 0.5=one independent, 1=multiple independent replications
 *  hostileSurvival   0..1  fraction of adversarial / confound-removal tests it survived
 *  confoundControl   0..1  0=fully confounded, 1=major confounds ruled out
 *  generalization    0..1  holds out-of-sample / cross-context (only scored if claimRequiresGeneralization)
 *  power             0..1  data sufficiency / statistical power (n, CI width)
 *  ciExcludesNull    bool  does the interval/ test exclude the null?
 *  claimRequiresGeneralization bool  does the CLAIM assert it holds across contexts?
 *
 * v2 principle — ABSENCE OF EVIDENCE IS NOT EVIDENCE OF ABSENCE.
 * A numeric field is "measured". A field left null/undefined is "not measured" and can NOT
 * trigger a KILL gate — it can only keep a verdict UNRESOLVED. This stops the engine from
 * confidently KILLING a hypothesis nobody has tested yet.
 */

export const VERDICT = { GO: "GO", KILL: "KILL", UNRESOLVED: "UNRESOLVED" };

// Transparent, pre-registered thresholds (the engine's "constitution").
export const THRESHOLDS = {
  effectFloor: 0.15,         // below this (when measured): no real effect -> KILL
  hostileFloor: 0.34,        // survives < a third of hostile tests -> KILL
  confoundFloor: 0.20,       // claim explained away by confound -> KILL
  generalizationFloor: 0.34, // claim needs generality but fails OOS -> KILL
  goSupport: 0.65,           // support needed to confirm
  goReplication: 0.5,        // >=1 independent replication
  goPower: 0.4,              // minimum power to confirm
};

// Weights used to build the support score (single source of truth).
export const SUPPORT_WEIGHTS = {
  effect: 0.30, replication: 0.20, hostileSurvival: 0.25,
  confoundControl: 0.15, generalization: 0.10,
};

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const isMeasured = (v) => typeof v === "number" && !Number.isNaN(v);

/** Per-field breakdown of the support score (used by the explanation layer). */
export function supportBreakdown(e) {
  const e2 = e || {};
  const fields = ["effect", "replication", "hostileSurvival", "confoundControl"];
  const rows = fields.map((k) => {
    const measured = isMeasured(e2[k]);
    const value = measured ? clamp01(e2[k]) : 0;
    return { field: k, measured, value, weight: SUPPORT_WEIGHTS[k], contribution: value * SUPPORT_WEIGHTS[k] };
  });
  // generalization only counts when the claim requires it; otherwise a neutral 0.5.
  const genMeasured = isMeasured(e2.generalization);
  const genValue = e2.claimRequiresGeneralization ? (genMeasured ? clamp01(e2.generalization) : 0) : 0.5;
  rows.push({ field: "generalization", measured: e2.claimRequiresGeneralization ? genMeasured : true,
              value: genValue, weight: SUPPORT_WEIGHTS.generalization, contribution: genValue * SUPPORT_WEIGHTS.generalization,
              neutralized: !e2.claimRequiresGeneralization });
  return rows;
}

/** Weighted support that the claim is REAL (excludes the kill-gates). */
export function supportScore(e) {
  const s = supportBreakdown(e).reduce((a, r) => a + r.contribution, 0);
  return clamp01(s);
}

/** Classify a hypothesis from its evidence. Returns {verdict, confidence, support, reasons[]}. */
export function classify(evidence) {
  const e = evidence || {};
  const T = THRESHOLDS;
  const reasons = [];
  const support = supportScore(e);

  // --- KILL gates (the claim is contradicted or explained away) ---
  // A gate fires ONLY on a MEASURED value below its floor. Unmeasured -> cannot kill.
  const killGates = [];
  if (isMeasured(e.effect) && e.effect < T.effectFloor)
    killGates.push(`no measurable effect (effect ${fmt(e.effect)} < ${T.effectFloor})`);
  if (isMeasured(e.hostileSurvival) && e.hostileSurvival < T.hostileFloor)
    killGates.push(`fails hostile/confound tests (survival ${fmt(e.hostileSurvival)} < ${T.hostileFloor})`);
  if (isMeasured(e.confoundControl) && e.confoundControl < T.confoundFloor)
    killGates.push(`explained by an uncontrolled confound (control ${fmt(e.confoundControl)} < ${T.confoundFloor})`);
  if (e.claimRequiresGeneralization && isMeasured(e.generalization) && e.generalization < T.generalizationFloor)
    killGates.push(`claim asserts generality but it does not generalize (gen ${fmt(e.generalization)} < ${T.generalizationFloor})`);

  if (killGates.length) {
    return { verdict: VERDICT.KILL, confidence: round(1 - support), support: round(support),
             reasons: killGates };
  }

  // --- GO criteria (confirmed) ---
  const goChecks = [
    [support >= T.goSupport, `support ${fmt(support)} >= ${T.goSupport}`],
    [(e.replication ?? 0) >= T.goReplication, `replicated (${fmt(e.replication)} >= ${T.goReplication})`],
    [!!e.ciExcludesNull, `interval excludes the null`],
    [(e.power ?? 0) >= T.goPower, `adequate power (${fmt(e.power)} >= ${T.goPower})`],
  ];
  if (goChecks.every(([ok]) => ok)) {
    goChecks.forEach(([, r]) => reasons.push(r));
    return { verdict: VERDICT.GO, confidence: round(support), support: round(support), reasons };
  }

  // --- otherwise UNRESOLVED, with the missing pieces named ---
  goChecks.filter(([ok]) => !ok).forEach(([, r]) => reasons.push("missing: " + r));
  if (!reasons.length) reasons.push("evidence neither confirms nor refutes");
  return { verdict: VERDICT.UNRESOLVED, confidence: round(0.5), support: round(support), reasons };
}

function fmt(x) { return (x ?? 0).toFixed(2); }
function round(x) { return Math.round(x * 100) / 100; }
