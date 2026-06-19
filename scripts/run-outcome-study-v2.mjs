#!/usr/bin/env node
// OUTCOME_STUDY_V2 — run both evaluators against 100 historical cases with known outcomes.
// Extends V1 from 20 → 100 cases across 8 domains: AI/ML, startups, software, medicine,
// psychology, finance, technology, business strategy.
//
// Evaluator A: HypothesisOS deterministic engine (classify → calibrate → selfCritique)
// Evaluator B: Naive-average baseline (unweighted mean, no kill gates)
//
// Usage:
//   node scripts/run-outcome-study-v2.mjs | node scripts/score-outcome-study-v2.mjs
//   node scripts/run-outcome-study-v2.mjs > data/outcome-study/v2-results.json

import { readFileSync } from "fs";
import { classify } from "../lib/engine.mjs";
import { calibrate } from "../lib/calibrate.mjs";
import { selfCritique } from "../lib/critique.mjs";

const CASES = JSON.parse(
  readFileSync(new URL("../data/outcome-study/v2-cases.json", import.meta.url))
);

// ── Baseline evaluator (same as V1) ────────────────────────────────────────────────────────
const BASELINE_GO   = 0.55;
const BASELINE_KILL = 0.35;

function baselineEvaluate(ep) {
  const dims = ["effect", "replication", "hostileSurvival", "confoundControl", "generalization"];
  const measured = dims.map(k => ep[k]).filter(v => typeof v === "number" && !Number.isNaN(v));
  if (!measured.length) return { verdict: "UNRESOLVED", score: null, reasoning: "No dimensions measured." };
  const avg = measured.reduce((a, b) => a + b, 0) / measured.length;
  const r = (x) => Math.round(x * 100) / 100;
  if (avg >= BASELINE_GO)   return { verdict: "GO",         score: r(avg), reasoning: `Mean ${r(avg)} ≥ ${BASELINE_GO}.` };
  if (avg <= BASELINE_KILL) return { verdict: "KILL",       score: r(avg), reasoning: `Mean ${r(avg)} ≤ ${BASELINE_KILL}.` };
  return { verdict: "UNRESOLVED", score: r(avg), reasoning: `Mean ${r(avg)} is ambiguous.` };
}

// ── Run both evaluators ────────────────────────────────────────────────────────────────────
const results = [];

for (const c of CASES) {
  const ep = c.evidence_packet;

  const hos  = classify(ep);
  const cal  = calibrate(ep);
  const crit = selfCritique(ep);
  const bl   = baselineEvaluate(ep);

  results.push({
    id:            c.id,
    domain:        c.domain,
    hypothesis:    c.hypothesis,
    decision_date: c.decision_date,
    expected:      c.expected_verdict,
    sources:       c.sources || [],

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
  });
}

process.stdout.write(JSON.stringify(results, null, 2));
process.stdout.write("\n");
