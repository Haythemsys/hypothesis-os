// HypothesisOS v2 — Phase A: Verdict Explanation Layer.
// For every verdict, explain WHY (not only WHAT): supporting evidence, contrary evidence,
// missing evidence, assumptions, confounds, confidence, and why alternatives were rejected.

import { classify, supportBreakdown, THRESHOLDS, VERDICT } from "./engine.mjs";
import { decompose } from "./generate.mjs";

const LABEL = {
  effect: "Effect size", replication: "Replication", hostileSurvival: "Hostile survival",
  confoundControl: "Confound control", generalization: "Generalization",
};
const FLOOR = {
  effect: THRESHOLDS.effectFloor, hostileSurvival: THRESHOLDS.hostileFloor,
  confoundControl: THRESHOLDS.confoundFloor, generalization: THRESHOLDS.generalizationFloor,
};
const isNum = (v) => typeof v === "number" && !Number.isNaN(v);

export function explain(evidence, hypothesisText = "") {
  const e = evidence || {};
  const result = classify(e);
  const rows = supportBreakdown(e);
  const d = hypothesisText ? decompose(hypothesisText) : null;

  const supporting = [];
  const against = [];
  const missing = [];

  for (const r of rows) {
    if (r.neutralized) continue; // generalization not claimed -> not relevant
    if (!r.measured) {
      missing.push(`${LABEL[r.field]} not measured (contributes 0 to support).`);
      continue;
    }
    const floor = FLOOR[r.field];
    if (floor != null && r.value < floor) {
      against.push(`${LABEL[r.field]} ${r.value.toFixed(2)} is below the kill-floor ${floor}.`);
    } else if (r.value >= 0.6) {
      supporting.push(`${LABEL[r.field]} ${r.value.toFixed(2)} is strong (weight ${r.weight}).`);
    } else if (r.value >= 0.4) {
      supporting.push(`${LABEL[r.field]} ${r.value.toFixed(2)} is moderate.`);
    } else {
      against.push(`${LABEL[r.field]} ${r.value.toFixed(2)} is weak.`);
    }
  }
  if (!isNum(e.power)) missing.push("Statistical power / sample size not specified.");
  else if (e.power < THRESHOLDS.goPower) against.push(`Power ${e.power.toFixed(2)} is below ${THRESHOLDS.goPower}.`);
  if (e.ciExcludesNull == null) missing.push("Not stated whether the interval excludes the null.");
  else if (!e.ciExcludesNull) against.push("The confidence interval includes the null.");

  // Why the two alternative verdicts were rejected.
  const alternatives = rejectedAlternatives(result.verdict, e, result.support);

  const confidenceExplanation = explainConfidence(result, missing.length);

  return {
    verdict: result.verdict,
    support: result.support,
    confidence: result.confidence,
    reasons: result.reasons,
    supporting: supporting.length ? supporting : ["No dimension reaches the supporting threshold."],
    against: against.length ? against : ["No measured dimension actively contradicts the claim."],
    missing: missing.length ? missing : ["All decision-relevant dimensions were measured."],
    assumptions: d ? d.assumptions : ["(provide hypothesis text to extract assumptions)"],
    confounds: d ? d.confounds : ["(provide hypothesis text to extract confounds)"],
    confidenceExplanation,
    rejectedAlternatives: alternatives,
  };
}

function rejectedAlternatives(verdict, e, support) {
  const out = [];
  const T = THRESHOLDS;
  if (verdict !== VERDICT.GO) {
    const why = [];
    if (support < T.goSupport) why.push(`support ${support} < ${T.goSupport}`);
    if ((e.replication ?? 0) < T.goReplication) why.push("not independently replicated");
    if (!e.ciExcludesNull) why.push("interval does not exclude the null");
    if ((e.power ?? 0) < T.goPower) why.push("insufficient power");
    out.push({ verdict: "GO", why: why.length ? why.join("; ") : "GO criteria not all met" });
  }
  if (verdict !== VERDICT.KILL) {
    const measuredLow = ["effect", "hostileSurvival", "confoundControl"]
      .some((k) => isNum(e[k]) && e[k] < (FLOOR[k] ?? 0));
    out.push({ verdict: "KILL",
      why: measuredLow ? "a kill-gate did fire but verdict logic resolved otherwise"
        : "no measured dimension fell below a kill-floor, so the claim is not refuted" });
  }
  if (verdict !== VERDICT.UNRESOLVED) {
    out.push({ verdict: "UNRESOLVED",
      why: verdict === VERDICT.GO ? "all GO criteria were satisfied" : "a kill-gate fired decisively" });
  }
  return out;
}

function explainConfidence(result, nMissing) {
  if (result.verdict === VERDICT.KILL)
    return `Confidence ${result.confidence}: a pre-registered kill-gate fired, which is decisive regardless of other evidence.`;
  if (result.verdict === VERDICT.GO)
    return `Confidence ${result.confidence} tracks the support score (${result.support}); all GO criteria were met.`;
  return `Confidence held at 0.5: the evidence neither confirms nor refutes${nMissing ? ` and ${nMissing} dimension(s) are unmeasured` : ""}.`;
}
