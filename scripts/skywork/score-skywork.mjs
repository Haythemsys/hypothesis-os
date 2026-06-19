#!/usr/bin/env node
/**
 * Phase 7 — Skywork Blind Validation Scoring
 * Run AFTER reveal: reads predictions + answer_key, computes accuracy metrics.
 * Usage: node scripts/skywork/score-skywork.mjs
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..', '..');

const predictionsPath = join(ROOT, 'data/processed/skywork-validation-results.json');
const answerKeyPath = join(ROOT, 'data/external/skywork-hypo-data/answer_key.jsonl');

const predictions = JSON.parse(readFileSync(predictionsPath, 'utf8'));
const answerLines = readFileSync(answerKeyPath, 'utf8').trim().split('\n');
const answers = Object.fromEntries(answerLines.map(l => {
  const r = JSON.parse(l);
  return [r.case_id, r];
}));

// Normalize verdict: HOS outputs GO/KILL/UNRESOLVED, answer_key uses same
function norm(v) {
  if (!v) return 'UNRESOLVED';
  return v.toUpperCase().replace(/\s+/g, '_');
}

const domains = ['startups_products','science_replication','ai_technology_predictions','business_strategy','finance_market_theses'];

const stats = {
  total: 0, correct: 0, falseGO: 0, falseKILL: 0, missed: 0,
  domainStats: Object.fromEntries(domains.map(d => [d, { total: 0, correct: 0, falseGO: 0 }])),
  confusionMatrix: { GO_GO: 0, GO_KILL: 0, GO_UNRESOLVED: 0, KILL_GO: 0, KILL_KILL: 0, KILL_UNRESOLVED: 0, UNRESOLVED_GO: 0, UNRESOLVED_KILL: 0, UNRESOLVED_UNRESOLVED: 0 },
  failures: []
};

for (const pred of predictions.hos_predictions) {
  const key = answers[pred.case_id];
  if (!key) { console.error(`No answer for ${pred.case_id}`); continue; }

  const expected = norm(key.expected_verdict);
  const got = norm(pred.verdict);
  const domain = pred.domain;

  stats.total++;
  const ds = stats.domainStats[domain];
  if (ds) ds.total++;

  const correct = expected === got;
  if (correct) {
    stats.correct++;
    if (ds) ds.correct++;
  } else {
    let failType = 'WRONG';
    if (expected === 'KILL' && got === 'GO') {
      failType = 'FALSE_GO'; stats.falseGO++; if (ds) ds.falseGO++;
    } else if (expected === 'GO' && got === 'KILL') {
      failType = 'FALSE_KILL'; stats.falseKILL++;
    } else if ((expected === 'GO' || expected === 'KILL') && got === 'UNRESOLVED') {
      failType = 'MISSED';  stats.missed++;
    }
    stats.failures.push({
      case_id: pred.case_id, domain, expected, got, type: failType,
      hypothesis: pred.hypothesis?.slice(0, 80)
    });
  }

  const cmKey = `${expected}_${got}`;
  if (cmKey in stats.confusionMatrix) stats.confusionMatrix[cmKey]++;
}

// Baseline scoring
const baselineStats = { total: 0, correct: 0, falseGO: 0, falseKILL: 0, missed: 0, failures: [] };
for (const pred of predictions.baseline_predictions) {
  const key = answers[pred.case_id];
  if (!key) continue;
  const expected = norm(key.expected_verdict);
  const got = norm(pred.verdict);
  baselineStats.total++;
  if (expected === got) { baselineStats.correct++; }
  else {
    let failType = 'WRONG';
    if (expected === 'KILL' && got === 'GO')                        { failType = 'FALSE_GO'; baselineStats.falseGO++; }
    else if (expected === 'GO' && got === 'KILL')                   { failType = 'FALSE_KILL'; baselineStats.falseKILL++; }
    else if ((expected === 'GO' || expected === 'KILL') && got === 'UNRESOLVED') { failType = 'MISSED'; baselineStats.missed++; }
    baselineStats.failures.push({ case_id: pred.case_id, domain: pred.domain, expected, got, type: failType });
  }
}

const acc = stats.correct / stats.total;
const falseGORate = stats.falseGO / stats.total;
const bAcc = baselineStats.correct / baselineStats.total;

// Pre-registered thresholds (must not change after seeing results)
// GO:         acc ≥ 0.80 AND falseGO ≤ 0.05
// UNRESOLVED: acc 0.70–0.79 OR falseGO 0.05–0.10
// KILL/PIVOT: acc < 0.70  OR falseGO > 0.10

let verdict;
if (acc >= 0.80 && falseGORate <= 0.05) verdict = 'GO';
else if (acc >= 0.70 && falseGORate <= 0.10) verdict = 'UNRESOLVED';
else verdict = 'KILL_PIVOT';

// Print report
console.log('\n' + '═'.repeat(72));
console.log('  SKYWORK BLIND VALIDATION — SCORING REPORT');
console.log('  Pre-registered thresholds. Results revealed AFTER predictions locked.');
console.log('═'.repeat(72));
console.log('\n── OVERALL RESULTS ──────────────────────────────────────────────────');
console.log(`${'Metric'.padEnd(40)} ${'HypothesisOS'.padEnd(16)} Baseline`);
console.log('─'.repeat(72));
console.log(`${'Overall accuracy'.padEnd(40)} ${(acc*100).toFixed(1)+'%'.padEnd(16)} ${(bAcc*100).toFixed(1)}%`);
console.log(`${'False GO rate (KILL→predicted GO)'.padEnd(40)} ${(falseGORate*100).toFixed(1)+'%'.padEnd(16)} ${(baselineStats.falseGO/baselineStats.total*100).toFixed(1)}%`);
console.log(`${'False KILL rate (GO→predicted KILL)'.padEnd(40)} ${(stats.falseKILL/stats.total*100).toFixed(1)+'%'.padEnd(16)} ${(baselineStats.falseKILL/baselineStats.total*100).toFixed(1)}%`);
console.log(`${'Missed (GO/KILL→UNRESOLVED)'.padEnd(40)} ${stats.missed+'/'+stats.total+''.padEnd(14)} ${baselineStats.missed}/${baselineStats.total}`);
console.log(`${'Correct'.padEnd(40)} ${stats.correct+'/'+stats.total+''.padEnd(14)} ${baselineStats.correct}/${baselineStats.total}`);

console.log('\n── PER-DOMAIN BREAKDOWN ─────────────────────────────────────────────');
console.log(`${'Domain'.padEnd(32)} ${'Correct'.padEnd(10)} ${'Accuracy'.padEnd(10)} FalseGO`);
console.log('─'.repeat(72));
for (const d of domains) {
  const ds = stats.domainStats[d];
  const dAcc = ds.total > 0 ? ds.correct/ds.total : 0;
  const dFGO = ds.total > 0 ? ds.falseGO/ds.total : 0;
  console.log(`${d.slice(0,31).padEnd(32)} ${(ds.correct+'/'+ds.total).padEnd(10)} ${(dAcc*100).toFixed(1)+'%'.padEnd(10)} ${(dFGO*100).toFixed(1)}%`);
}

console.log('\n── CONFUSION MATRIX ─────────────────────────────────────────────────');
console.log('                    Predicted: GO    KILL    UNRESOLVED');
for (const exp of ['GO','KILL','UNRESOLVED']) {
  const row = ['GO','KILL','UNRESOLVED'].map(got => {
    const k = `${exp}_${got}`;
    return String(stats.confusionMatrix[k] ?? 0).padStart(6);
  }).join('');
  console.log(`Actual: ${exp.padEnd(12)} ${row}`);
}

console.log('\n── HOS FAILURES ─────────────────────────────────────────────────────');
if (stats.failures.length === 0) {
  console.log('  None.');
} else {
  for (const f of stats.failures) {
    console.log(`  [${f.type}] ${f.case_id} (${f.domain}) | expected=${f.expected} got=${f.got}`);
    if (f.hypothesis) console.log(`    ${f.hypothesis}...`);
  }
}

console.log('\n── PRE-REGISTERED VERDICT ───────────────────────────────────────────');
console.log(`  Threshold GO:         acc ≥ 80% AND falseGO ≤ 5%`);
console.log(`  Threshold UNRESOLVED: acc 70–79% OR falseGO 5–10%`);
console.log(`  Threshold KILL/PIVOT: acc < 70% OR falseGO > 10%`);
console.log(`\n  Observed: accuracy=${(acc*100).toFixed(1)}%, falseGO=${(falseGORate*100).toFixed(1)}%`);
console.log(`\n  VERDICT: ${verdict}`);
console.log('═'.repeat(72) + '\n');

// Machine-readable output
const output = {
  scored_at: new Date().toISOString(),
  hos_accuracy: acc,
  hos_false_go_rate: falseGORate,
  hos_false_kill_rate: stats.falseKILL / stats.total,
  hos_missed_rate: stats.missed / stats.total,
  hos_correct: stats.correct,
  hos_total: stats.total,
  baseline_accuracy: bAcc,
  baseline_false_go_rate: baselineStats.falseGO / baselineStats.total,
  domain_breakdown: stats.domainStats,
  confusion_matrix: stats.confusionMatrix,
  hos_failures: stats.failures,
  baseline_failures: baselineStats.failures,
  verdict,
  thresholds: { go: 'acc>=0.80 AND falseGO<=0.05', unresolved: 'acc>=0.70 AND falseGO<=0.10', kill: 'else' }
};

import { writeFileSync } from 'fs';
writeFileSync(join(ROOT, 'data/processed/skywork-scoring-output.json'), JSON.stringify(output, null, 2));
console.log('Machine-readable output: data/processed/skywork-scoring-output.json');
