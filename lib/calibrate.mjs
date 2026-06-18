// HypothesisOS v2 — Phase B: Calibration Engine.
// A correct verdict is not enough — the system must know WHEN it is uncertain.
// Produces a 0–100 calibration score and a HIGH / MEDIUM / LOW band, independent of the
// verdict direction. Low calibration means "don't trust this verdict yet", whatever it says.

const isNum = (v) => typeof v === "number" && !Number.isNaN(v);
const clamp01 = (x) => Math.max(0, Math.min(1, x));

// The four components the mission specifies, each 0..1.
export function calibrationComponents(evidence) {
  const e = evidence || {};

  // 1. Evidence completeness — how many decision dimensions were actually measured.
  const dims = ["effect", "replication", "hostileSurvival", "confoundControl", "power"];
  if (e.claimRequiresGeneralization) dims.push("generalization");
  const measured = dims.filter((k) => isNum(e[k])).length + (e.ciExcludesNull != null ? 1 : 0);
  const evidenceCompleteness = clamp01(measured / (dims.length + 1));

  // 2. Confound coverage — were confounds addressed at all (not whether they passed).
  const confoundCoverage = isNum(e.confoundControl) ? clamp01(e.confoundControl) : 0;

  // 3. Contradiction coverage — did the claim face hostile / adversarial tests.
  const contradictionCoverage = isNum(e.hostileSurvival) ? clamp01(e.hostileSurvival) : 0;

  // 4. Benchmark / statistical confidence — replication + power + interval.
  const benchmarkConfidence = clamp01(
    0.4 * (isNum(e.replication) ? e.replication : 0) +
    0.4 * (isNum(e.power) ? e.power : 0) +
    0.2 * (e.ciExcludesNull ? 1 : 0)
  );

  return { evidenceCompleteness, confoundCoverage, contradictionCoverage, benchmarkConfidence };
}

const WEIGHTS = { evidenceCompleteness: 0.30, confoundCoverage: 0.25, contradictionCoverage: 0.25, benchmarkConfidence: 0.20 };

export function calibrate(evidence) {
  const c = calibrationComponents(evidence);
  const raw = Object.entries(WEIGHTS).reduce((a, [k, w]) => a + c[k] * w, 0);
  const score = Math.round(clamp01(raw) * 100);
  const band = score >= 70 ? "HIGH CONFIDENCE" : score >= 40 ? "MEDIUM CONFIDENCE" : "LOW CONFIDENCE";

  // The weakest component is the most useful thing to tell the user.
  const weakest = Object.entries(c).sort((a, b) => a[1] - b[1])[0];
  const LABEL = {
    evidenceCompleteness: "measure the unmeasured dimensions",
    confoundCoverage: "control the main confounds",
    contradictionCoverage: "run hostile / adversarial tests",
    benchmarkConfidence: "replicate and increase statistical power",
  };

  return {
    score, band, components: c,
    limitingFactor: weakest[0],
    recommendation: weakest[1] >= 0.7 ? "Calibration is well-rounded." : `To raise calibration, ${LABEL[weakest[0]]}.`,
  };
}
