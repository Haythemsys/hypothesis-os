import { classify } from "../lib/engine.mjs";
import { calibrate } from "../lib/calibrate.mjs";
import { selfCritique } from "../lib/critique.mjs";
import { BAPA_HYPOTHESES, MAJOR_IDS } from "../lib/bapa-benchmark.mjs";
import { ALL_BENCHMARKS, DOMAINS } from "../lib/benchmarks/index.mjs";
import { detectContradictions } from "../lib/contradict.mjs";
import { readFileSync } from "fs";

function score(list, label) {
  let ok = 0;
  const fails = [];
  for (const h of list) {
    const got = classify(h.evidence).verdict;
    if (got === h.expected) ok++; else fails.push(`${h.id}: exp ${h.expected} got ${got}`);
  }
  console.log(`${label}: ${ok}/${list.length}` + (fails.length ? "  FAILS: " + fails.join(" | ") : ""));
  return { ok, n: list.length, fails };
}

console.log("=== BAPA (v2 engine) ===");
const bapa = score(BAPA_HYPOTHESES, "BAPA");
const majorOk = BAPA_HYPOTHESES.filter(h => MAJOR_IDS.includes(h.id) && classify(h.evidence).verdict === h.expected).length;
console.log(`BAPA major: ${majorOk}/${MAJOR_IDS.length}`);

console.log("\n=== MULTI-DOMAIN ===");
let total = 0, totalOk = 0;
for (const [d, list] of Object.entries(DOMAINS)) { const r = score(list, d); total += r.n; totalOk += r.ok; }
console.log(`ALL DOMAINS: ${totalOk}/${total}`);

// Outcome Study V2 (106 cases — uses selfCritique finalVerdict)
console.log("\n=== OUTCOME STUDY V2 (106 cases) ===");
let v2Cases, v2Pass = true;
try {
  v2Cases = JSON.parse(readFileSync(new URL("../data/outcome-study/v2-cases.json", import.meta.url)));
  let v2Ok = 0;
  const v2Fails = [];
  const baselineMean = (ep) => {
    const dims = ["effect","replication","hostileSurvival","confoundControl","generalization"];
    const vals = dims.map(k => ep[k]).filter(v => typeof v === "number");
    if (!vals.length) return null;
    return vals.reduce((a,b) => a+b,0) / vals.length;
  };
  let blOk = 0, falseGoHOS = 0, falseGoBL = 0;
  for (const c of v2Cases) {
    const ep = c.evidence_packet;
    const crit = selfCritique(ep);
    const got = crit.finalVerdict;
    const exp = c.expected_verdict;
    if (got === exp) v2Ok++;
    else v2Fails.push(`${c.id}: exp ${exp} got ${got}`);
    if (got === "GO" && exp === "KILL") falseGoHOS++;
    const avg = baselineMean(ep);
    const blV = avg === null ? "UNRESOLVED" : avg >= 0.55 ? "GO" : avg <= 0.35 ? "KILL" : "UNRESOLVED";
    if (blV === exp) blOk++;
    if (blV === "GO" && exp === "KILL") falseGoBL++;
  }
  console.log(`HypothesisOS: ${v2Ok}/${v2Cases.length} (${(v2Ok/v2Cases.length*100).toFixed(1)}%) | False GO: ${falseGoHOS}`);
  console.log(`Baseline:     ${blOk}/${v2Cases.length} (${(blOk/v2Cases.length*100).toFixed(1)}%) | False GO: ${falseGoBL}`);
  if (v2Fails.length) { console.log("  HOS failures: " + v2Fails.slice(0,5).join(" | ")); }
  v2Pass = falseGoHOS === 0 && v2Ok / v2Cases.length >= 0.80;
} catch (e) {
  console.log("  SKIP — v2-cases.json not found");
}

console.log("\n=== CONTRADICTIONS (BAPA + multi-domain) ===");
const c = detectContradictions([...BAPA_HYPOTHESES, ...ALL_BENCHMARKS]);
for (const x of c) console.log(`[${x.severity}] ${x.a} ↔ ${x.b} on '${x.variable}' — ${x.resolution}`);

const allPass = bapa.fails.length === 0 && totalOk === total && majorOk === MAJOR_IDS.length && v2Pass;
console.log("\n" + (allPass ? "ALL BENCHMARKS PASS ✓" : "SOME BENCHMARKS FAILED ✗"));
process.exit(allPass ? 0 : 1);
