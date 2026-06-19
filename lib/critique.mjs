// HypothesisOS v2 — Phase H: Autonomous Self-Critique.
// Before issuing a final verdict, the engine attacks its own case on three fronts:
// destroy the hypothesis, destroy the verdict, destroy the evidence. A verdict that
// survives is annotated; a verdict that does NOT survive is downgraded toward UNRESOLVED.

import { classify, THRESHOLDS, VERDICT } from "./engine.mjs";
import { calibrate } from "./calibrate.mjs";

const isNum = (v) => typeof v === "number" && !Number.isNaN(v);

// One attack = {target, attack, survives, note}. survives=false means the attack lands.
function attacks(evidence, result) {
  const e = evidence || {};
  const a = [];

  // --- Attack the HYPOTHESIS (is it even falsifiable / scoped?) ---
  a.push({
    target: "hypothesis",
    attack: "Is the claim falsifiable and scoped, or vague enough to never be wrong?",
    survives: e.ciExcludesNull != null || isNum(e.effect),
    note: "A claim with no stated test or interval can't be confirmed OR refuted.",
  });
  if (e.claimRequiresGeneralization) {
    a.push({
      target: "hypothesis",
      attack: "The claim asserts it holds across contexts — was that actually tested out-of-sample?",
      survives: isNum(e.generalization),
      note: "Generality is claimed; it must be measured, not assumed.",
    });
  }

  // --- Attack the EVIDENCE (is it real, replicated, powered?) ---
  a.push({
    target: "evidence",
    attack: "Could this be a single underpowered / unreplicated result?",
    survives: (e.replication ?? 0) >= THRESHOLDS.goReplication && (e.power ?? 0) >= THRESHOLDS.goPower,
    note: "One small study is a lead, not a verdict.",
  });
  a.push({
    target: "evidence",
    attack: "Is the effect just an uncontrolled confound (context, topic, selection)?",
    survives: isNum(e.confoundControl) && e.confoundControl >= 0.5,
    note: "If confounds aren't controlled, the effect may belong to something else.",
  });
  a.push({
    target: "evidence",
    attack: "Does the effect survive removing the easy cue (hostile test)?",
    survives: isNum(e.hostileSurvival) && e.hostileSurvival >= THRESHOLDS.hostileFloor,
    note: "An effect that vanishes under adversarial conditions is an artifact.",
  });

  // --- Attack the VERDICT (is the call premature given what's missing?) ---
  if (result.verdict === VERDICT.GO) {
    a.push({
      target: "verdict",
      attack: "Is GO premature — any GO criterion barely cleared or any confound open?",
      survives: Math.round(result.support * 100) >= Math.round((THRESHOLDS.goSupport + 0.05) * 100) && (e.confoundControl ?? 0) >= 0.5,
      note: "A borderline GO should be MEDIUM-confidence at best.",
    });
  } else if (result.verdict === VERDICT.KILL) {
    // Use the exact THRESHOLDS keys — "hostileSurvivalFloor" and "confoundControlFloor" don't exist;
    // the correct keys are "hostileFloor" and "confoundFloor". Using the wrong key causes a silent
    // undefined → effectFloor fallback that makes this annotation report false negatives.
    a.push({
      target: "verdict",
      attack: "Is KILL based on a MEASURED failure, not just absent data?",
      survives: (isNum(e.effect) && e.effect < THRESHOLDS.effectFloor) ||
                (isNum(e.hostileSurvival) && e.hostileSurvival < THRESHOLDS.hostileFloor) ||
                (isNum(e.confoundControl) && e.confoundControl < THRESHOLDS.confoundFloor) ||
                (isNum(e.generalization) && e.generalization < THRESHOLDS.generalizationFloor),
      note: "You may only KILL on evidence of absence, not absence of evidence.",
    });
  } else {
    a.push({
      target: "verdict",
      attack: "Is UNRESOLVED just laziness — is the decisive test cheap and obvious?",
      survives: true, // UNRESOLVED is the honest default; the attack never forces a stronger call
      note: "UNRESOLVED correctly withholds judgment when evidence is incomplete.",
    });
  }

  return a;
}

/** Full self-critique: returns the verdict, the attacks, and any downgrade applied. */
export function selfCritique(evidence) {
  const base = classify(evidence);
  const cal = calibrate(evidence);
  const log = attacks(evidence, base);
  const landed = log.filter((x) => !x.survives);

  // Downgrade rule: a GO that fails an evidence/verdict attack, or any verdict with LOW
  // calibration, is not allowed to stand as a confident final call.
  let finalVerdict = base.verdict;
  let downgrade = null;
  const seriousLanded = landed.filter((x) => x.target !== "hypothesis").length;

  if (base.verdict === VERDICT.GO && seriousLanded >= 1) {
    finalVerdict = VERDICT.UNRESOLVED;
    downgrade = `GO downgraded to UNRESOLVED: ${seriousLanded} hostile attack(s) landed on the evidence/verdict.`;
  } else if (base.verdict !== VERDICT.UNRESOLVED && cal.band === "LOW CONFIDENCE") {
    downgrade = `Verdict stands but flagged LOW CONFIDENCE (calibration ${cal.score}/100).`;
  }

  return {
    baseVerdict: base.verdict,
    finalVerdict,
    downgrade,
    calibration: cal,
    attacks: log,
    landed: landed.length,
    survived: log.length - landed.length,
    reasons: base.reasons,
  };
}
