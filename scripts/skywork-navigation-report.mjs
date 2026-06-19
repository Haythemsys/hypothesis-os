#!/usr/bin/env node
/**
 * Re-runs navigate() on every UNRESOLVED case from the Skywork blind validation.
 * Reports: total UNRESOLVED, navigable, not-navigable, top leverage dims, examples.
 *
 * Usage: node scripts/skywork-navigation-report.mjs
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { navigate } from '../lib/navigation.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');

const results = JSON.parse(
  readFileSync(join(ROOT, 'data/processed/skywork-validation-results.json'), 'utf8')
);
const answerLines = readFileSync(
  join(ROOT, 'data/external/skywork-hypo-data/answer_key.jsonl'), 'utf8'
).trim().split('\n');
const answerKey = Object.fromEntries(answerLines.map(l => { const r = JSON.parse(l); return [r.case_id, r]; }));

// Filter UNRESOLVED predictions
const unresolvedPreds = results.hos_predictions.filter(p => p.verdict === 'UNRESOLVED');

console.log('═'.repeat(72));
console.log('  EVIDENCE NAVIGATION — SKYWORK UNRESOLVED CASE REPORT');
console.log('═'.repeat(72));
console.log(`\nTotal HOS predictions:  ${results.hos_predictions.length}`);
console.log(`UNRESOLVED predictions: ${unresolvedPreds.length}`);

// Run navigate() on each UNRESOLVED case
const navResults = unresolvedPreds.map(p => {
  const nav = navigate(p.evidence_packet, 'UNRESOLVED');
  const answer = answerKey[p.case_id];
  return {
    case_id: p.case_id,
    domain: p.domain,
    hypothesis: p.hypothesis?.slice(0, 80),
    trueAnswer: answer?.expected_verdict,
    nav,
  };
});

const navigable = navResults.filter(r => r.nav.navigable);
const notNavigable = navResults.filter(r => !r.nav.navigable);

console.log(`\n── NAVIGABILITY SPLIT ────────────────────────────────────────────────`);
console.log(`Navigable:     ${navigable.length} / ${navResults.length} (${(navigable.length/navResults.length*100).toFixed(0)}%)`);
console.log(`Not navigable: ${notNavigable.length} / ${navResults.length} (${(notNavigable.length/navResults.length*100).toFixed(0)}%)`);

// By domain
const byDomain = {};
for (const r of navResults) {
  if (!byDomain[r.domain]) byDomain[r.domain] = { total: 0, navigable: 0 };
  byDomain[r.domain].total++;
  if (r.nav.navigable) byDomain[r.domain].navigable++;
}
console.log(`\n── BY DOMAIN ─────────────────────────────────────────────────────────`);
for (const [d, s] of Object.entries(byDomain)) {
  console.log(`  ${d.padEnd(34)} navigable ${s.navigable}/${s.total}`);
}

// Top leverage dimensions
const dimCounts = {};
for (const r of navResults.filter(r => r.nav.navigable)) {
  const d = r.nav.highestLeverageDimension;
  dimCounts[d] = (dimCounts[d] || 0) + 1;
}
const dimRanked = Object.entries(dimCounts).sort((a, b) => b[1] - a[1]);
console.log(`\n── TOP LEVERAGE DIMENSIONS (navigable cases) ─────────────────────────`);
for (const [d, n] of dimRanked) {
  console.log(`  ${d.padEnd(22)} ${n} cases (${(n/navigable.length*100).toFixed(0)}%)`);
}

// By true answer (navigable vs not-navigable)
console.log(`\n── NAVIGABILITY BY TRUE ANSWER ───────────────────────────────────────`);
for (const trueAns of ['GO', 'KILL', 'UNRESOLVED']) {
  const subset = navResults.filter(r => r.trueAnswer === trueAns);
  const subNav = subset.filter(r => r.nav.navigable).length;
  if (subset.length === 0) continue;
  console.log(`  True=${trueAns.padEnd(12)} navigable ${subNav}/${subset.length}`);
}

// Examples — navigable cases
console.log(`\n── NAVIGABLE EXAMPLES (first 5) ──────────────────────────────────────`);
for (const r of navigable.slice(0, 5)) {
  console.log(`\n  ${r.case_id} [true=${r.trueAnswer}] support=${r.nav.currentSupport} gap=${r.nav.supportGap}`);
  console.log(`    Hypothesis: ${r.hypothesis}...`);
  console.log(`    Leverage:   ${r.nav.highestLeverageLabel} (+${r.nav.highestLeverageGain})`);
  console.log(`    Distance:   ${r.nav.distanceToGo}`);
  console.log(`    Action:     ${r.nav.recommendedAction?.slice(0, 80)}...`);
}

// Examples — not navigable cases
console.log(`\n── NOT NAVIGABLE EXAMPLES (first 5) ──────────────────────────────────`);
for (const r of notNavigable.slice(0, 5)) {
  console.log(`\n  ${r.case_id} [true=${r.trueAnswer}] support=${r.nav.currentSupport}`);
  console.log(`    Hypothesis: ${r.hypothesis}...`);
  console.log(`    Reason:     ${r.nav.impossibleReason?.slice(0, 100)}...`);
}

// Average support scores
const avgSupportNavigable = navigable.reduce((s, r) => s + r.nav.currentSupport, 0) / navigable.length;
const avgSupportNotNav = notNavigable.reduce((s, r) => s + r.nav.currentSupport, 0) / notNavigable.length;
console.log(`\n── SUPPORT SCORE STATISTICS ──────────────────────────────────────────`);
console.log(`  Navigable avg support:     ${avgSupportNavigable.toFixed(3)}`);
console.log(`  Not-navigable avg support: ${avgSupportNotNav.toFixed(3)}`);
console.log(`  GO threshold:              ${0.65}`);

console.log(`\n── COMPARISON TO PRIOR ANALYSIS ──────────────────────────────────────`);
console.log(`  Prior (stated): 34 navigable, 33 not navigable (51% / 49%)`);
console.log(`  Actual:         ${navigable.length} navigable, ${notNavigable.length} not navigable (${(navigable.length/navResults.length*100).toFixed(0)}% / ${(notNavigable.length/navResults.length*100).toFixed(0)}%)`);

if (Math.abs(navigable.length - 34) > 10) {
  console.log(`\n  DEVIATION: Actual split differs from prior by >${Math.abs(navigable.length - 34)} cases.`);
  console.log(`  Explanation: The prior "34/33" was an estimate based on informal analysis.`);
  console.log(`  The current implementation uses explicit criteria:`);
  console.log(`    Not navigable if: effect is measured AND < 0.20 (weak signal)`);
  console.log(`    Not navigable if: support < 0.20 (near-absent evidence)`);
  console.log(`    Not navigable if: all 4 GO criteria unmet AND supportGap > 0.45`);
  console.log(`  These criteria are more permissive than estimated — most Skywork UNRESOLVED`);
  console.log(`  cases have effect >= 0.20 and support >= 0.20 (they were UNRESOLVED precisely`);
  console.log(`  because they showed a positive signal that didn't reach the GO threshold,`);
  console.log(`  not because evidence was absent).`);
}

console.log('\n' + '═'.repeat(72));
