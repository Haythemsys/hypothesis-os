// HypothesisOS v2 — Phase D: Contradiction Engine.
// Auto-detect when two hypotheses make opposing claims about the same variable:
// A implies (var, +) while B implies (var, -). Each hypothesis carries an `implications`
// list of {var, sign} where sign is +1 / -1. Pairs with the same var and opposite sign,
// where BOTH are confirmed (verdict GO), are hard contradictions; one GO + one KILL on the
// same var is consistent (the data already adjudicated it).

import { classify } from "./engine.mjs";

/** Detect contradictions across a set of {id, title, evidence, implications} hypotheses. */
export function detectContradictions(hypotheses) {
  const enriched = hypotheses.map((h) => ({ ...h, verdict: classify(h.evidence).verdict }));
  const out = [];

  for (let i = 0; i < enriched.length; i++) {
    for (let j = i + 1; j < enriched.length; j++) {
      const A = enriched[i], B = enriched[j];
      for (const ia of A.implications || []) {
        for (const ib of B.implications || []) {
          if (ia.var !== ib.var) continue;
          if (Math.sign(ia.sign) === Math.sign(ib.sign)) continue; // same direction = agreement
          // opposite signs on the same variable
          const bothConfirmed = A.verdict === "GO" && B.verdict === "GO";
          out.push({
            a: A.id, b: B.id, variable: ia.var,
            aClaim: `${A.id} ⇒ ${signWord(ia.sign)} ${ia.var}`,
            bClaim: `${B.id} ⇒ ${signWord(ib.sign)} ${ib.var}`,
            severity: bothConfirmed ? "hard" : "soft",
            resolution: bothConfirmed
              ? "Both verdicts are GO yet they oppose — at least one is wrong; re-examine."
              : `Adjudicated by evidence: ${A.id}=${A.verdict}, ${B.id}=${B.verdict}.`,
          });
        }
      }
    }
  }
  return out.sort((x, y) => (x.severity === "hard" ? -1 : 1) - (y.severity === "hard" ? -1 : 1));
}

function signWord(s) { return s > 0 ? "increases" : "decreases"; }
