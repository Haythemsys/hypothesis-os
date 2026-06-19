#!/usr/bin/env node
// OUTCOME_STUDY_V1 — scoring. Reads the JSON output of run-outcome-study.mjs from stdin
// or from a file path argument, then computes accuracy, false-GO rate, false-KILL rate,
// and calibration quality for both evaluators.
//
// Usage:
//   node scripts/run-outcome-study.mjs | node scripts/score-outcome-study.mjs
//   node scripts/score-outcome-study.mjs results.json

import { readFileSync } from "fs";

const raw = process.argv[2]
  ? readFileSync(process.argv[2], "utf8")
  : readFileSync("/dev/stdin", "utf8");

const results = JSON.parse(raw);

// ── Scoring helpers ───────────────────────────────────────────────────────────────────────
function scoreVerdict(got, expected) {
  if (got === expected) return "CORRECT";
  if (got === "GO"   && expected === "KILL")        return "FALSE_GO";
  if (got === "KILL" && expected === "GO")          return "FALSE_KILL";
  if (got === "GO"   && expected === "UNRESOLVED")  return "OVERCONFIDENT_GO";
  if (got === "KILL" && expected === "UNRESOLVED")  return "OVERCONFIDENT_KILL";
  if (got === "UNRESOLVED" && expected !== "UNRESOLVED") return "MISSED";
  return "OTHER";
}

function metrics(rows, key) {
  const n = rows.length;
  let correct = 0, falseGo = 0, falseKill = 0, overGoCount = 0, overKillCount = 0, missed = 0;
  const cases = [];

  for (const r of rows) {
    const got = r[key].verdict;
    const exp = r.expected;
    const verdict = scoreVerdict(got, exp);
    if (verdict === "CORRECT")            correct++;
    if (verdict === "FALSE_GO")           falseGo++;
    if (verdict === "FALSE_KILL")         falseKill++;
    if (verdict === "OVERCONFIDENT_GO")   overGoCount++;
    if (verdict === "OVERCONFIDENT_KILL") overKillCount++;
    if (verdict === "MISSED")             missed++;
    cases.push({ id: r.id, expected: exp, got, verdict, domain: r.domain });
  }

  const expectedKill = rows.filter(r => r.expected === "KILL").length;
  const expectedGo   = rows.filter(r => r.expected === "GO").length;
  const expectedUnr  = rows.filter(r => r.expected === "UNRESOLVED").length;

  return {
    n, correct,
    accuracy: (correct / n * 100).toFixed(1) + "%",
    falseGoRate:   expectedKill > 0 ? (falseGo / expectedKill * 100).toFixed(1) + "%" : "N/A",
    falseKillRate: expectedGo   > 0 ? (falseKill / expectedGo * 100).toFixed(1) + "%" : "N/A",
    overconfidentGoRate:   expectedUnr > 0 ? (overGoCount / expectedUnr * 100).toFixed(1) + "%" : "N/A",
    overconfidentKillRate: expectedUnr > 0 ? (overKillCount / expectedUnr * 100).toFixed(1) + "%" : "N/A",
    counts: { correct, falseGo, falseKill, overGoCount, overKillCount, missed,
              expectedKill, expectedGo, expectedUnr },
    cases,
  };
}

const hos = metrics(results, "hypothesisos");
const bl  = metrics(results, "baseline");

// ── Print report ──────────────────────────────────────────────────────────────────────────
const W = 72;
const line = "─".repeat(W);
const pad  = (s, n) => String(s).padEnd(n);

console.log("\n" + "═".repeat(W));
console.log("  OUTCOME STUDY V1 — Scoring Report");
console.log("  HypothesisOS vs. Naive-Average Baseline");
console.log("  Cases: " + results.length + "  |  Domains: " + [...new Set(results.map(r => r.domain))].join(", "));
console.log("═".repeat(W));

// Per-case table
console.log("\n" + pad("ID", 34) + pad("EXPECTED", 12) + pad("HOS", 12) + pad("BASELINE", 12));
console.log(line);
for (const r of results) {
  const hosV  = r.hypothesisos.verdict;
  const blV   = r.baseline.verdict;
  const exp   = r.expected;
  const hosS  = scoreVerdict(hosV, exp);
  const blS   = scoreVerdict(blV, exp);
  const hosC  = hosS === "CORRECT" ? "✓" : hosS === "FALSE_GO" ? "⚠ FALSE GO" : hosS === "FALSE_KILL" ? "✗ FALSE KILL" : hosS === "OVERCONFIDENT_KILL" ? "✗ OVR KILL" : "- MISSED";
  const blC   = blS  === "CORRECT" ? "✓" : blS  === "FALSE_GO" ? "⚠ FALSE GO" : blS  === "FALSE_KILL" ? "✗ FALSE KILL" : blS  === "OVERCONFIDENT_KILL" ? "✗ OVR KILL" : "- MISSED";
  console.log(
    pad(r.id, 34) +
    pad(exp, 12) +
    pad(hosV + " " + hosC, 22) +
    blV + " " + blC
  );
}

// Summary table
console.log("\n" + "═".repeat(W));
console.log("  SUMMARY");
console.log("═".repeat(W));
console.log(pad("Metric", 40) + pad("HypothesisOS", 16) + "Baseline");
console.log(line);

const rows = [
  ["Overall accuracy", hos.accuracy, bl.accuracy],
  ["False GO rate  (said GO, was KILL)", hos.falseGoRate, bl.falseGoRate],
  ["False KILL rate (said KILL, was GO)", hos.falseKillRate, bl.falseKillRate],
  ["Overconfident KILL rate (said KILL, was UNRESOLVED)", hos.overconfidentKillRate, bl.overconfidentKillRate],
  ["Overconfident GO rate  (said GO, was UNRESOLVED)", hos.overconfidentGoRate, bl.overconfidentGoRate],
  ["Missed (said UNRESOLVED, was GO or KILL)", `${hos.counts.missed}/${hos.n}`, `${bl.counts.missed}/${bl.n}`],
];
for (const [label, a, b] of rows) {
  console.log(pad(label, 40) + pad(a, 16) + b);
}

console.log(line);
console.log("\nHypothesisOS calibration (of GO verdicts):");
const hosGoCal = results.filter(r => r.hypothesisos.verdict === "GO");
const hosAvgCal = hosGoCal.length
  ? (hosGoCal.reduce((a, r) => a + r.hypothesisos.calibration, 0) / hosGoCal.length).toFixed(1)
  : "N/A";
console.log(`  GO verdicts: ${hosGoCal.length}  Average calibration score: ${hosAvgCal}/100`);

const hosKillCal = results.filter(r => r.hypothesisos.verdict === "KILL");
const hosAvgKillCal = hosKillCal.length
  ? (hosKillCal.reduce((a, r) => a + r.hypothesisos.calibration, 0) / hosKillCal.length).toFixed(1)
  : "N/A";
console.log(`  KILL verdicts: ${hosKillCal.length}  Average calibration score: ${hosAvgKillCal}/100`);

// Failures detail
const hosFails = hos.cases.filter(c => c.verdict !== "CORRECT");
const blFails  = bl.cases.filter(c => c.verdict !== "CORRECT");

console.log("\n" + "═".repeat(W));
console.log("  FAILURES — HypothesisOS (" + hosFails.length + " cases)");
console.log("═".repeat(W));
if (hosFails.length === 0) {
  console.log("  None.");
} else {
  for (const f of hosFails) console.log(`  [${f.verdict}] ${f.id}  expected=${f.expected}  got=${f.got}`);
}

console.log("\n" + "═".repeat(W));
console.log("  FAILURES — Baseline (" + blFails.length + " cases)");
console.log("═".repeat(W));
if (blFails.length === 0) {
  console.log("  None.");
} else {
  for (const f of blFails) console.log(`  [${f.verdict}] ${f.id}  expected=${f.expected}  got=${f.got}`);
}

// Return exit code based on whether HypothesisOS outperforms on the most critical metric
const hosOverall = hos.counts.correct;
const blOverall  = bl.counts.correct;
const hosFalseGoN = hos.counts.falseGo + hos.counts.overGoCount;
const blFalseGoN  = bl.counts.falseGo  + bl.counts.overGoCount;

console.log("\n" + "═".repeat(W));
if (hosOverall >= blOverall && hosFalseGoN <= blFalseGoN) {
  console.log("  VERDICT: HypothesisOS meets or exceeds baseline on accuracy AND false-GO rate.");
} else if (hosFalseGoN < blFalseGoN) {
  console.log("  VERDICT: HypothesisOS has lower false-GO rate than baseline (primary criterion met).");
  console.log("  NOTE: Overall accuracy parity or deficit — see failure analysis.");
} else {
  console.log("  VERDICT: HypothesisOS does NOT clearly outperform baseline. See failure analysis.");
}
console.log("═".repeat(W) + "\n");
