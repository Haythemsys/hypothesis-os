#!/usr/bin/env node
// Self-validation: run the engine on the BAPA benchmark and score it against the
// historically established outcomes. The engine classifies from evidence only.
import { classify, VERDICT } from "../lib/engine.mjs";
import { BAPA_HYPOTHESES, MAJOR_IDS } from "../lib/bapa-benchmark.mjs";

let correct = 0, majorCorrect = 0, majorTotal = 0;
const rows = [];
for (const h of BAPA_HYPOTHESES) {
  const r = classify(h.evidence);
  const ok = r.verdict === h.expected;
  correct += ok ? 1 : 0;
  const isMajor = MAJOR_IDS.includes(h.id);
  if (isMajor) { majorTotal++; majorCorrect += ok ? 1 : 0; }
  rows.push({ id: h.id, expected: h.expected, got: r.verdict, ok, major: isMajor,
              support: r.support, reason: r.reasons[0] });
}

console.log("HypothesisOS — BAPA benchmark\n" + "=".repeat(64));
for (const r of rows) {
  console.log(`${r.ok ? "PASS" : "FAIL"} ${r.major ? "*" : " "} ${r.id.padEnd(24)} ` +
              `exp=${r.expected.padEnd(10)} got=${r.got.padEnd(10)} sup=${r.support}  ${r.reason}`);
}
console.log("=".repeat(64));
console.log(`overall: ${correct}/${BAPA_HYPOTHESES.length} correct`);
console.log(`MAJOR (success criterion): ${majorCorrect}/${majorTotal} correct`);
const pass = majorCorrect === majorTotal;
console.log(pass ? "SUCCESS CRITERION MET ✓" : "SUCCESS CRITERION FAILED ✗");
process.exit(pass ? 0 : 1);
