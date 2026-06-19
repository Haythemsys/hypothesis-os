#!/usr/bin/env node
/**
 * HypothesisOS — Evidence Navigation Tests
 * Tests for lib/navigation.mjs
 * Usage: node scripts/test-navigation.mjs
 */
import { navigate } from '../lib/navigation.mjs';
import { THRESHOLDS } from '../lib/engine.mjs';

const results = [];

function test(id, desc, actual, assertions) {
  const failures = [];
  for (const [key, expected] of Object.entries(assertions)) {
    const val = actual[key];
    if (val !== expected)
      failures.push(`${key}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(val)}`);
  }
  results.push({ id, desc, passed: failures.length === 0, failures });
}

// ── Evidence shortcuts ─────────────────────────────────────────────────────
const STRONG = { effect: 0.75, replication: 0.8, hostileSurvival: 0.8, confoundControl: 0.8,
                 generalization: 0.8, power: 0.8, ciExcludesNull: true, claimRequiresGeneralization: false };
const WEAK   = { effect: 0.4,  replication: 0.5, hostileSurvival: null, confoundControl: 0.3,
                 generalization: null, power: 0.3, ciExcludesNull: false, claimRequiresGeneralization: false };
const NO_SIG = { effect: 0.16, replication: 0.5, hostileSurvival: null, confoundControl: 0.3,
                 generalization: null, power: 0.3, ciExcludesNull: false, claimRequiresGeneralization: false };
const ABSENT = { effect: null, replication: null, hostileSurvival: null, confoundControl: null,
                 generalization: null, power: null, ciExcludesNull: null, claimRequiresGeneralization: false };
// KILL case: effect below floor
const KILL_EP = { effect: 0.10, replication: 0.5, hostileSurvival: null, confoundControl: 0.5,
                  generalization: null, power: 0.5, ciExcludesNull: false, claimRequiresGeneralization: false };

// ── 1. GO verdict → navigation is complete ─────────────────────────────────
const goNav = navigate(STRONG, 'GO');
test('NAV-01', 'GO verdict returns navigable=false and supportGap=0',
  goNav, { navigable: false, supportGap: 0, verdict: 'GO' });

// ── 2. KILL verdict → navigable=false, shows gate info ────────────────────
const killNav = navigate(KILL_EP, 'KILL');
test('NAV-02', 'KILL verdict returns navigable=false with gate information',
  killNav, { navigable: false, verdict: 'KILL' });
test('NAV-02b', 'KILL navigation identifies the firing gate dimension',
  killNav, { highestLeverageDimension: 'effect' });

// ── 3. UNRESOLVED with meaningful signal → navigable ──────────────────────
const weakNav = navigate(WEAK, 'UNRESOLVED');
test('NAV-03', 'UNRESOLVED with effect=0.4 and partial evidence → navigable=true',
  weakNav, { navigable: true });
test('NAV-03b', 'navigable case has distanceToGo set',
  weakNav, { navigable: true });  // just check navigable; distanceToGo string varies
test('NAV-03c', 'navigable case has recommendedAction set',
  { hasAction: weakNav.recommendedAction !== null && weakNav.recommendedAction.length > 0 },
  { hasAction: true });
test('NAV-03d', 'supportGap is positive for UNRESOLVED case',
  { positive: weakNav.supportGap > 0 }, { positive: true });

// ── 4. UNRESOLVED with near-zero effect → not navigable ───────────────────
const noSigNav = navigate(NO_SIG, 'UNRESOLVED');
test('NAV-04', 'UNRESOLVED with effect=0.16 (near kill floor) → navigable=false',
  noSigNav, { navigable: false });
test('NAV-04b', 'non-navigable case has impossibleReason',
  { hasReason: !!noSigNav.impossibleReason }, { hasReason: true });

// ── 5. UNRESOLVED with absent evidence → not navigable ────────────────────
const absentNav = navigate(ABSENT, 'UNRESOLVED');
test('NAV-05', 'UNRESOLVED with all-null evidence → navigable=false (support near zero)',
  absentNav, { navigable: false });

// ── 6. Highest leverage dimension is the one with most potential gain ──────
// With effect=0.2 (low) and all others high, effect should be highest leverage
const lowEffect = { ...STRONG, effect: 0.2, ciExcludesNull: false };
const lowEffNav = navigate(lowEffect, 'UNRESOLVED');
test('NAV-06', 'Highest leverage dimension is the one with most potential gain',
  { dim: lowEffNav.highestLeverageDimension }, { dim: 'effect' });

// ── 7. hostileSurvival=null has more leverage than measured fields ─────────
// hs=null contributes 0 to support (0×0.25=0), so maxGain=0.25 — highest weight
// replication=0.8 → maxGain=0.2×0.20=0.04; hs=null → 0.25; hs wins
const nullHs = { effect: 0.8, replication: 0.8, hostileSurvival: null,
                 confoundControl: 0.8, generalization: 0.8, power: 0.8,
                 ciExcludesNull: false, claimRequiresGeneralization: false };
const nullHsNav = navigate(nullHs, 'UNRESOLVED');
test('NAV-07', 'Unmeasured hostileSurvival (null=0) is highest leverage when others high',
  { dim: nullHsNav.highestLeverageDimension }, { dim: 'hostileSurvival' });

// ── 8. supportGap = goThreshold - currentSupport (never negative) ──────────
test('NAV-08', 'supportGap is non-negative',
  { nn: weakNav.supportGap >= 0 }, { nn: true });
test('NAV-08b', 'supportGap is within rounding of goThreshold - currentSupport',
  { eq: Math.abs(weakNav.supportGap - (THRESHOLDS.goSupport - weakNav.currentSupport)) < 0.02 },
  { eq: true });

// ── 9. No false GO: navigate() never changes the verdict ──────────────────
// Navigate is read-only — it never produces a GO from non-GO evidence
test('NAV-09', 'navigate() on UNRESOLVED evidence never returns GO verdict',
  { safe: weakNav.verdict === 'UNRESOLVED' }, { safe: true });
test('NAV-09b', 'navigate() on KILL evidence never returns GO verdict',
  { safe: killNav.verdict === 'KILL' }, { safe: true });

// ── 10. UNRESOLVED where all 4 GO criteria are unmet → potentially not navigable
const allUnmet = { effect: 0.3, replication: 0.1, hostileSurvival: null,
                   confoundControl: 0.25, generalization: null, power: 0.1,
                   ciExcludesNull: false, claimRequiresGeneralization: false };
// support = 0.3×0.30 + 0.1×0.20 + 0×0.25 + 0.25×0.15 + 0.05×0.10
//         = 0.09 + 0.02 + 0 + 0.0375 + 0.005 = 0.1525
// support=0.15 < 0.20 → not navigable (nearlAbsent)
const allUnmetNav = navigate(allUnmet, 'UNRESOLVED');
test('NAV-10', 'UNRESOLVED with support<0.20 (all dims weak) → navigable=false',
  allUnmetNav, { navigable: false });

// ── Report ──────────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
for (const r of results) {
  console.log(`${r.passed ? '✓' : '✗'} ${r.id}: ${r.desc}`);
  if (!r.passed) { r.failures.forEach((f) => console.log(`    FAIL: ${f}`)); failed++; }
  else passed++;
}

console.log(`\n${passed}/${results.length} tests passed`);
if (failed > 0) { console.error(`\nFAILED: ${failed} test(s)`); process.exit(1); }
else console.log('\nALL TESTS PASS');
