import { classify } from "../lib/engine.mjs";
import { BAPA_HYPOTHESES, MAJOR_IDS } from "../lib/bapa-benchmark.mjs";
import { ALL_BENCHMARKS, DOMAINS } from "../lib/benchmarks/index.mjs";
import { detectContradictions } from "../lib/contradict.mjs";

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

console.log("\n=== CONTRADICTIONS (BAPA + multi-domain) ===");
const c = detectContradictions([...BAPA_HYPOTHESES, ...ALL_BENCHMARKS]);
for (const x of c) console.log(`[${x.severity}] ${x.a} ↔ ${x.b} on '${x.variable}' — ${x.resolution}`);

const allPass = bapa.fails.length === 0 && totalOk === total && majorOk === MAJOR_IDS.length;
console.log("\n" + (allPass ? "ALL BENCHMARKS PASS ✓" : "SOME BENCHMARKS FAILED ✗"));
process.exit(allPass ? 0 : 1);
