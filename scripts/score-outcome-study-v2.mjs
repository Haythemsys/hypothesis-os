#!/usr/bin/env node
// OUTCOME_STUDY_V2 — scoring. Reads the JSON output of run-outcome-study-v2.mjs.
//
// Usage:
//   node scripts/run-outcome-study-v2.mjs | node scripts/score-outcome-study-v2.mjs
//   node scripts/score-outcome-study-v2.mjs data/outcome-study/v2-results.json

import { readFileSync, writeFileSync } from "fs";

const raw = process.argv[2]
  ? readFileSync(process.argv[2], "utf8")
  : readFileSync("/dev/stdin", "utf8");

const results = JSON.parse(raw);

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
    falseGoRate:          expectedKill > 0 ? (falseGo / expectedKill * 100).toFixed(1) + "%" : "N/A",
    falseKillRate:        expectedGo   > 0 ? (falseKill / expectedGo * 100).toFixed(1) + "%" : "N/A",
    overconfidentGoRate:  expectedUnr > 0 ? (overGoCount / expectedUnr * 100).toFixed(1) + "%" : "N/A",
    overconfidentKillRate:expectedUnr > 0 ? (overKillCount / expectedUnr * 100).toFixed(1) + "%" : "N/A",
    counts: { correct, falseGo, falseKill, overGoCount, overKillCount, missed,
              expectedKill, expectedGo, expectedUnr },
    cases,
  };
}

const hos = metrics(results, "hypothesisos");
const bl  = metrics(results, "baseline");

// Per-domain breakdown
const domains = [...new Set(results.map(r => r.domain))].sort();
const domainStats = domains.map(d => {
  const dRows = results.filter(r => r.domain === d);
  const hosM = metrics(dRows, "hypothesisos");
  const blM  = metrics(dRows, "baseline");
  return {
    domain: d,
    n: dRows.length,
    hos_accuracy: hosM.accuracy,
    bl_accuracy:  blM.accuracy,
    hos_falseGo:  hosM.falseGoRate,
    bl_falseGo:   blM.falseGoRate,
    hos_falseKill: hosM.falseKillRate,
    hos_overKill:  hosM.overconfidentKillRate,
  };
});

// ── Print report ──────────────────────────────────────────────────────────────────────────
const W = 76;
const line = "─".repeat(W);
const pad  = (s, n) => String(s).padEnd(n);

console.log("\n" + "═".repeat(W));
console.log("  OUTCOME STUDY V2 — Scoring Report");
console.log("  HypothesisOS vs. Naive-Average Baseline");
console.log(`  Cases: ${results.length}  |  Domains: ${domains.join(", ")}`);
console.log("═".repeat(W));

// Per-case table
console.log("\n" + pad("ID", 36) + pad("EXP", 12) + pad("HOS", 20) + "BASELINE");
console.log(line);

const labelOf = (sc) => {
  if (sc === "CORRECT")            return "✓";
  if (sc === "FALSE_GO")           return "⚠ FALSE GO";
  if (sc === "FALSE_KILL")         return "✗ FALSE KILL";
  if (sc === "OVERCONFIDENT_KILL") return "✗ OVR KILL";
  if (sc === "OVERCONFIDENT_GO")   return "⚠ OVR GO";
  return "- MISSED";
};

for (const r of results) {
  const hosV = r.hypothesisos.verdict;
  const blV  = r.baseline.verdict;
  const exp  = r.expected;
  const hosS = scoreVerdict(hosV, exp);
  const blS  = scoreVerdict(blV, exp);
  console.log(
    pad(r.id.slice(0, 35), 36) +
    pad(exp, 12) +
    pad(hosV + " " + labelOf(hosS), 24) +
    blV + " " + labelOf(blS)
  );
}

// Summary
console.log("\n" + "═".repeat(W));
console.log("  OVERALL SUMMARY");
console.log("═".repeat(W));
console.log(pad("Metric", 48) + pad("HypothesisOS", 16) + "Baseline");
console.log(line);

const summaryRows = [
  ["Overall accuracy", hos.accuracy, bl.accuracy],
  ["False GO rate  (said GO, was KILL)", hos.falseGoRate, bl.falseGoRate],
  ["False KILL rate (said KILL, was GO)", hos.falseKillRate, bl.falseKillRate],
  ["Overconfident KILL (said KILL, was UNRESOLVED)", hos.overconfidentKillRate, bl.overconfidentKillRate],
  ["Overconfident GO  (said GO, was UNRESOLVED)", hos.overconfidentGoRate, bl.overconfidentGoRate],
  ["Missed (said UNRESOLVED, was GO or KILL)", `${hos.counts.missed}/${hos.n}`, `${bl.counts.missed}/${bl.n}`],
];
for (const [label, a, b] of summaryRows) {
  console.log(pad(label, 48) + pad(a, 16) + b);
}

// Domain breakdown
console.log("\n" + "═".repeat(W));
console.log("  PER-DOMAIN BREAKDOWN");
console.log("═".repeat(W));
console.log(pad("Domain", 20) + pad("N", 6) + pad("HOS Acc", 12) + pad("BL Acc", 12) + pad("HOS FalseGO", 14) + "BL FalseGO");
console.log(line);
for (const d of domainStats) {
  console.log(pad(d.domain, 20) + pad(d.n, 6) + pad(d.hos_accuracy, 12) + pad(d.bl_accuracy, 12) + pad(d.hos_falseGo, 14) + d.bl_falseGo);
}

// Decision Risk Matrix
console.log("\n" + "═".repeat(W));
console.log("  DECISION RISK MATRIX (K4)");
console.log("═".repeat(W));
console.log("  Error type         | HypothesisOS | Baseline | Risk level");
console.log(line);
const totalKill = hos.counts.expectedKill;
const totalGo   = hos.counts.expectedGo;
const totalUnr  = hos.counts.expectedUnr;
const riskRows = [
  ["False GO (commit to dead end)", hos.counts.falseGo, bl.counts.falseGo, "CATASTROPHIC — wastes resources, perpetuates myths"],
  ["False KILL (kill real signal)", hos.counts.falseKill, bl.counts.falseKill, "HIGH — misses true positives"],
  ["Over-confident KILL", hos.counts.overKillCount, bl.counts.overKillCount, "MEDIUM — premature closure on uncertain cases"],
  ["Over-confident GO", hos.counts.overGoCount, bl.counts.overGoCount, "MEDIUM — false certainty on uncertain cases"],
  ["Missed (UNRESOLVED when decided)", hos.counts.missed, bl.counts.missed, "LOW — safe failure mode"],
];
for (const [err, hosN, blN, risk] of riskRows) {
  console.log(`  ${err.padEnd(28)} | HOS:${String(hosN).padStart(3)}  BL:${String(blN).padStart(3)}  | ${risk}`);
}

// Calibration
console.log("\n" + "═".repeat(W));
console.log("  CALIBRATION QUALITY (HypothesisOS)");
console.log("═".repeat(W));
const byVerdict = ["GO", "KILL", "UNRESOLVED"].map(v => {
  const vRows = results.filter(r => r.hypothesisos.verdict === v);
  const avgCal = vRows.length ? (vRows.reduce((a, r) => a + r.hypothesisos.calibration, 0) / vRows.length).toFixed(1) : "N/A";
  return { verdict: v, count: vRows.length, avgCal };
});
for (const { verdict, count: cnt, avgCal } of byVerdict) {
  console.log(`  ${verdict.padEnd(12)} n=${String(cnt).padStart(3)}  avg calibration: ${avgCal}/100`);
}

// Failures
const hosFails = hos.cases.filter(c => c.verdict !== "CORRECT");
const blFails  = bl.cases.filter(c => c.verdict !== "CORRECT");

console.log("\n" + "═".repeat(W));
console.log(`  FAILURES — HypothesisOS (${hosFails.length} / ${results.length})`);
console.log("═".repeat(W));
if (!hosFails.length) { console.log("  None."); }
else { for (const f of hosFails) console.log(`  [${f.verdict}] ${f.id}  expected=${f.expected}  got=${f.got}`); }

console.log("\n" + "═".repeat(W));
console.log(`  FAILURES — Baseline (${blFails.length} / ${results.length})`);
console.log("═".repeat(W));
if (!blFails.length) { console.log("  None."); }
else { for (const f of blFails) console.log(`  [${f.verdict}] ${f.id}  expected=${f.expected}  got=${f.got}`); }

// Verdict
console.log("\n" + "═".repeat(W));
const hosOverall = hos.counts.correct;
const blOverall  = bl.counts.correct;
const hosFGN = hos.counts.falseGo + hos.counts.overGoCount;
const blFGN  = bl.counts.falseGo  + bl.counts.overGoCount;
if (hosOverall >= blOverall && hosFGN <= blFGN) {
  console.log("  VERDICT: HypothesisOS meets or exceeds baseline on accuracy AND false-GO rate.");
} else if (hosFGN < blFGN) {
  console.log("  VERDICT: HypothesisOS has lower false-GO rate (primary criterion met).");
  console.log("  NOTE: See accuracy tradeoff in failure analysis.");
} else {
  console.log("  VERDICT: HypothesisOS does NOT clearly outperform baseline. See failure analysis.");
}
console.log("═".repeat(W) + "\n");
