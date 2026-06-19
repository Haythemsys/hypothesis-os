#!/usr/bin/env node
// OUTCOME_STUDY_V1 — run both evaluators against 20 historical cases with known outcomes.
// The engine never sees the expected verdict. Expected is used only in score-outcome-study.mjs.
//
// Evaluator A: HypothesisOS deterministic engine (classify → explain → calibrate → selfCritique)
// Evaluator B: Baseline naive-average evaluator — simulates a generic LLM response that
//              assesses overall evidence quality without systematic kill gates or conjunction
//              requirements for GO. This is the "fair" baseline: same evidence, no structure.

import { readFileSync } from "fs";
import { classify } from "../lib/engine.mjs";
import { calibrate } from "../lib/calibrate.mjs";
import { selfCritique } from "../lib/critique.mjs";

const CASES = JSON.parse(readFileSync(new URL("../data/outcome-study/cases.json", import.meta.url)));

// ── Baseline evaluator ──────────────────────────────────────────────────────────────────────
// Logic: compute unweighted mean of all MEASURED numeric evidence dimensions.
//   mean >= 0.55 → GO
//   mean <= 0.35 → KILL
//   else         → UNRESOLVED
// This mimics a generic "looks at the evidence holistically" approach:
//   - Does NOT use kill gates (a single fatal dimension can be drowned out by others)
//   - Does NOT require all GO criteria simultaneously
//   - Does NOT treat absence-of-effect differently from low-quality evidence
const BASELINE_GO   = 0.55;
const BASELINE_KILL = 0.35;

function baselineEvaluate(ep) {
  const dims = ["effect", "replication", "hostileSurvival", "confoundControl", "generalization"];
  const measured = dims.map(k => ep[k]).filter(v => typeof v === "number" && !Number.isNaN(v));
  if (!measured.length) return { verdict: "UNRESOLVED", score: null, reasoning: "No dimensions measured." };
  const avg = measured.reduce((a, b) => a + b, 0) / measured.length;
  const r = (x) => Math.round(x * 100) / 100;
  if (avg >= BASELINE_GO)   return { verdict: "GO",         score: r(avg), reasoning: `Mean evidence quality ${r(avg)} ≥ ${BASELINE_GO} threshold.` };
  if (avg <= BASELINE_KILL) return { verdict: "KILL",       score: r(avg), reasoning: `Mean evidence quality ${r(avg)} ≤ ${BASELINE_KILL} threshold.` };
  return { verdict: "UNRESOLVED", score: r(avg), reasoning: `Mean evidence quality ${r(avg)} is ambiguous (${BASELINE_KILL}–${BASELINE_GO}).` };
}

// ── Run both evaluators ────────────────────────────────────────────────────────────────────
const results = [];

for (const c of CASES) {
  const ep = c.evidence_packet;

  // A — HypothesisOS
  const hos = classify(ep);
  const cal = calibrate(ep);
  const crit = selfCritique(ep);

  // B — Baseline
  const bl = baselineEvaluate(ep);

  results.push({
    id:              c.id,
    domain:          c.domain,
    hypothesis:      c.hypothesis,
    decision_date:   c.decision_date,
    expected:        c.expected_verdict,

    hypothesisos: {
      verdict:     crit.finalVerdict,
      baseVerdict: crit.baseVerdict,
      support:     hos.support,
      calibration: cal.score,
      band:        cal.band,
      downgrade:   crit.downgrade,
      reasons:     hos.reasons,
    },

    baseline: {
      verdict:   bl.verdict,
      score:     bl.score,
      reasoning: bl.reasoning,
    },

    // DO NOT compare to expected here — scoring is separate (score-outcome-study.mjs).
    // This ensures the runner never uses the label during evaluation.
  });
}

// Output JSON (piped to score-outcome-study.mjs or saved)
process.stdout.write(JSON.stringify(results, null, 2));
process.stdout.write("\n");
