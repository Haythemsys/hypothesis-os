#!/usr/bin/env node
/**
 * HypothesisOS — Engine Structural Test Suite
 * 10 pre-registered experiments covering all kill gates, GO gates, self-critique,
 * and the discovered annotation bug in critique.mjs.
 *
 * ALL tests operate on the closed evidence-vector space. They do not validate
 * the accuracy of raw evidence encoding (text → numeric fields).
 *
 * Usage: node scripts/engine-structural-tests.mjs
 * Pass: exit 0, "ALL TESTS PASS"
 * Fail: exit 1, lists which tests failed
 */
import { classify, THRESHOLDS, VERDICT } from '../lib/engine.mjs';
import { selfCritique } from '../lib/critique.mjs';

const results = [];

function test(id, description, evidence, assertions) {
  const c = classify(evidence);
  const sc = selfCritique(evidence);
  const killAttack = sc.attacks.find(a => a.target === 'verdict' && a.attack.includes('MEASURED'));

  const ctx = {
    verdict: c.verdict,
    finalVerdict: sc.finalVerdict,
    support: c.support,
    reasons: c.reasons,
    downgrade: sc.downgrade,
    killAttackSurvives: killAttack?.survives,
  };

  const failures = [];
  for (const [key, expected] of Object.entries(assertions)) {
    const actual = ctx[key];
    if (actual !== expected) {
      failures.push(`${key}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  results.push({ id, description, passed: failures.length === 0, failures, ctx });
}

// ── EXP-01: Effect kill gate — below floor ────────────────────────────────────
// Pre-registered: effect=0.14 is below effectFloor=0.15 → must KILL.
test('EXP-01', 'Effect kill gate fires when effect < effectFloor (0.14 < 0.15)',
  { effect: 0.14, replication: 0.8, hostileSurvival: 0.8, confoundControl: 0.8,
    generalization: 0.8, power: 0.8, ciExcludesNull: true, claimRequiresGeneralization: false },
  { verdict: VERDICT.KILL, finalVerdict: VERDICT.KILL }
);

// ── EXP-02: Effect kill gate — exactly at floor ───────────────────────────────
// Pre-registered: effect=0.15 is NOT below floor (gate is strict <) → must NOT KILL.
// Expected: UNRESOLVED (support < 0.65 because effect contributes 0.15×0.30=0.045 too low for full support).
test('EXP-02', 'Effect kill gate does NOT fire at boundary (effect = effectFloor = 0.15)',
  { effect: 0.15, replication: 0.8, hostileSurvival: 0.8, confoundControl: 0.8,
    generalization: 0.8, power: 0.8, ciExcludesNull: true, claimRequiresGeneralization: false },
  { verdict: VERDICT.UNRESOLVED, finalVerdict: VERDICT.UNRESOLVED }
);

// ── EXP-03: Absence of evidence ≠ KILL ───────────────────────────────────────
// Pre-registered: hostileSurvival=null (unmeasured) must NOT trigger kill gate.
// v2 principle: only MEASURED values below floor can kill.
test('EXP-03', 'Unmeasured hostileSurvival (null) does not trigger KILL',
  { effect: 0.7, replication: 0.8, hostileSurvival: null, confoundControl: 0.8,
    generalization: 0.8, power: 0.8, ciExcludesNull: true, claimRequiresGeneralization: false },
  { verdict: VERDICT.UNRESOLVED }  // not KILL; support=0.54 < 0.65, so also not GO
);

// ── EXP-04: Hostile survival kill gate ────────────────────────────────────────
// Pre-registered: hostileSurvival=0.33 is below hostileFloor=0.34 → must KILL.
test('EXP-04', 'Hostile survival kill gate fires when hostileSurvival < hostileFloor (0.33 < 0.34)',
  { effect: 0.7, replication: 0.8, hostileSurvival: 0.33, confoundControl: 0.8,
    generalization: 0.8, power: 0.8, ciExcludesNull: true, claimRequiresGeneralization: false },
  { verdict: VERDICT.KILL, finalVerdict: VERDICT.KILL }
);

// ── EXP-05: Confound control kill gate ────────────────────────────────────────
// Pre-registered: confoundControl=0.19 is below confoundFloor=0.20 → must KILL.
test('EXP-05', 'Confound kill gate fires when confoundControl < confoundFloor (0.19 < 0.20)',
  { effect: 0.7, replication: 0.8, hostileSurvival: 0.8, confoundControl: 0.19,
    generalization: 0.8, power: 0.8, ciExcludesNull: true, claimRequiresGeneralization: false },
  { verdict: VERDICT.KILL, finalVerdict: VERDICT.KILL }
);

// ── EXP-06: Generalization gate fires with CRG=true ───────────────────────────
// Pre-registered: generalization=0.33 + claimRequiresGeneralization=true → must KILL.
test('EXP-06', 'Generalization kill gate fires when gen < floor AND CRG=true (0.33 < 0.34)',
  { effect: 0.7, replication: 0.8, hostileSurvival: 0.8, confoundControl: 0.8,
    generalization: 0.33, power: 0.8, ciExcludesNull: true, claimRequiresGeneralization: true },
  { verdict: VERDICT.KILL, finalVerdict: VERDICT.KILL }
);

// ── EXP-07: Generalization gate silent with CRG=false ─────────────────────────
// Pre-registered: same generalization=0.33, but CRG=false → gate must NOT fire → GO.
test('EXP-07', 'Generalization kill gate silent when CRG=false (gate conditional on claim scope)',
  { effect: 0.7, replication: 0.8, hostileSurvival: 0.8, confoundControl: 0.8,
    generalization: 0.33, power: 0.8, ciExcludesNull: true, claimRequiresGeneralization: false },
  { verdict: VERDICT.GO, finalVerdict: VERDICT.GO }
);

// ── EXP-08: All GO criteria met ───────────────────────────────────────────────
// Pre-registered: support>=0.65, replication>=0.5, ciExcludesNull=true, power>=0.4 → GO.
test('EXP-08', 'All four GO criteria met → GO',
  { effect: 0.75, replication: 0.8, hostileSurvival: 0.8, confoundControl: 0.8,
    generalization: 0.8, power: 0.8, ciExcludesNull: true, claimRequiresGeneralization: false },
  { verdict: VERDICT.GO, finalVerdict: VERDICT.GO }
);

// ── EXP-09: Self-critique downgrades GO when hostile test unmeasured ──────────
// Pre-registered: effect=1.0 all fields high but hostileSurvival=null.
// classify → GO (support=0.70 clears 0.65, no kill gate fires for null).
// selfCritique: "hostile test" attack lands (hostileSurvival=null, attack survives=false).
// Expected: finalVerdict=UNRESOLVED (GO downgraded).
test('EXP-09', 'Self-critique downgrades GO→UNRESOLVED when hostile test unmeasured (null)',
  { effect: 1.0, replication: 1.0, hostileSurvival: null, confoundControl: 1.0,
    generalization: null, power: 1.0, ciExcludesNull: true, claimRequiresGeneralization: false },
  { verdict: VERDICT.GO, finalVerdict: VERDICT.UNRESOLVED }
);

// ── EXP-10: Self-critique KILL annotation bug (pre-registered to FAIL before fix) ──
// Pre-registered: hostileSurvival=0.20 correctly kills (0.20 < 0.34).
// Self-critique KILL annotation should report killAttackSurvives=true (measured failure exists).
// KNOWN BUG: critique.mjs looks up THRESHOLDS["hostileSurvivalFloor"] which is undefined.
// Falls back to effectFloor=0.15. Since 0.20 >= 0.15, reports survives=false (incorrect).
// After fix: killAttackSurvives must be true.
test('EXP-10', 'Self-critique KILL annotation correctly flags measured kill (hostileSurvival=0.20)',
  { effect: 0.5, replication: 0.8, hostileSurvival: 0.20, confoundControl: 0.8,
    generalization: 0.8, power: 0.8, ciExcludesNull: true, claimRequiresGeneralization: false },
  { verdict: VERDICT.KILL, killAttackSurvives: true }
);

// ── Report ─────────────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
for (const r of results) {
  const mark = r.passed ? '✓' : '✗';
  console.log(`${mark} ${r.id}: ${r.description}`);
  if (!r.passed) {
    for (const f of r.failures) console.log(`    FAIL: ${f}`);
    failed++;
  } else {
    passed++;
  }
}

console.log(`\n${passed}/${results.length} tests passed`);

if (failed > 0) {
  console.log(`\nFAILED: ${failed} test(s)`);
  process.exit(1);
} else {
  console.log('\nALL TESTS PASS');
}
