#!/usr/bin/env node
/**
 * HypothesisOS — Blind Encoding Study
 *
 * Tests whether an LLM, given only raw text evidence, can encode a hypothesis
 * into the numeric evidence schema and reproduce the expected verdict.
 *
 * BLINDING PROTOCOL:
 *   - Strips evidence_packet and expected_verdict from each case before encoding
 *   - Sends only: hypothesis, domain, evidence_available, ground_truth_notes
 *   - LLM must not see the pre-coded evidence_packet or known_outcome
 *
 * Requires: ANTHROPIC_API_KEY in environment
 * Uses native https (no SDK) to call api.anthropic.com
 *
 * Usage: node scripts/run-blind-encoding-study.mjs > RAW_blind.txt 2>&1
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');

// ── Config ──────────────────────────────────────────────────────────────────
const CASES_PATH = join(ROOT, 'data/outcome-study/v2-cases.json');
const API_KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = 'claude-opus-4-8'; // most capable for encoding accuracy
const CONCURRENCY = 3;           // parallel API calls

if (!API_KEY) {
  console.error('ERROR: ANTHROPIC_API_KEY is not set. Export it before running.');
  process.exit(1);
}

// ── Load and blind cases ─────────────────────────────────────────────────────
const rawCases = JSON.parse(readFileSync(CASES_PATH, 'utf8'));
console.log(`Loaded ${rawCases.length} cases from ${CASES_PATH}`);
console.log('Stripping evidence_packet, known_outcome, expected_verdict (blinding)...');

const blindedCases = rawCases.map(c => ({
  id: c.id,
  domain: c.domain,
  hypothesis: c.hypothesis,
  decision_date: c.decision_date,
  evidence_available: c.evidence_available,
  ground_truth_notes: c.ground_truth_notes,
  // kept for scoring AFTER encoding:
  _expected_verdict: c.expected_verdict,
  _evidence_packet_reference: c.evidence_packet,
}));

// ── Anthropic API call ───────────────────────────────────────────────────────
function callAnthropic(systemPrompt, userContent) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    });

    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) reject(new Error(parsed.error.message));
          else resolve(parsed);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Encoding system prompt ───────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are a BLIND evidence encoder for HypothesisOS. You receive a hypothesis and
the evidence that was available at the time of the decision. You must encode this evidence into a
numeric evidence schema WITHOUT knowing the actual outcome.

CRITICAL: Encode from the evidence text ONLY. Do not use your knowledge of what happened afterward.

SCHEMA (return all fields as a JSON object named "evidence_packet"):
{
  "effect": <float 0-1>,          // strength of the measured effect supporting the claim
                                   // 0.0-0.14=no effect/contradicted, 0.15-0.39=weak, 0.40-0.64=moderate,
                                   // 0.65-0.84=strong, 0.85-1.0=very strong
  "replication": <float 0-1>,     // independent replications: 0=none, 0.5=one, 1.0=multiple
  "hostileSurvival": <float 0-1 or null>,  // fraction surviving adversarial tests; null if no hostile tests
  "confoundControl": <float 0-1>, // 0=fully confounded, 1=major confounds ruled out
  "generalization": <float 0-1 or null>,   // holds out-of-sample/cross-context; null if not tested
  "power": <float 0-1>,           // data adequacy: 0.0-0.39=thin, 0.40-0.69=moderate, 0.70-1.0=substantial
  "ciExcludesNull": <boolean or null>,     // confidence interval clearly excludes zero effect?
  "claimRequiresGeneralization": <boolean> // does the hypothesis assert cross-context validity?
}

Return ONLY valid JSON in this exact format, no prose:
{"evidence_packet": {...}, "encoding_notes": "1 sentence explaining key encoding decision"}`;

// ── Engine import ────────────────────────────────────────────────────────────
import { classify } from '../lib/engine.mjs';
import { selfCritique } from '../lib/critique.mjs';

// ── Encode one case ──────────────────────────────────────────────────────────
async function encodeCase(c) {
  const userContent = `DOMAIN: ${c.domain}
HYPOTHESIS: ${c.hypothesis}
DECISION DATE: ${c.decision_date || 'unknown'}
EVIDENCE AVAILABLE AT TIME:
${c.evidence_available}

ADDITIONAL CONTEXT (background notes, NOT outcomes):
${c.ground_truth_notes || 'none'}`;

  let response;
  try {
    response = await callAnthropic(SYSTEM_PROMPT, userContent);
  } catch (err) {
    return { id: c.id, error: err.message, verdict: null, expected: c._expected_verdict };
  }

  const text = response.content?.[0]?.text || '';
  let ep, notes;
  try {
    const parsed = JSON.parse(text);
    ep = parsed.evidence_packet;
    notes = parsed.encoding_notes;
  } catch (e) {
    return { id: c.id, error: `JSON parse failed: ${e.message}`, raw: text, verdict: null, expected: c._expected_verdict };
  }

  const critique = selfCritique(ep);
  return {
    id: c.id,
    domain: c.domain,
    hypothesis: c.hypothesis?.slice(0, 80),
    expected: c._expected_verdict,
    verdict: critique.finalVerdict,
    raw_verdict: critique.baseVerdict,
    evidence_packet: ep,
    reference_packet: c._evidence_packet_reference,
    encoding_notes: notes,
    downgrade: critique.downgrade,
  };
}

// ── Run all cases with concurrency limit ─────────────────────────────────────
async function runBatch(cases, concurrency) {
  const results = [];
  let idx = 0;

  async function worker() {
    while (idx < cases.length) {
      const c = cases[idx++];
      const n = results.length + 1;
      process.stderr.write(`[${n}/${cases.length}] Encoding ${c.id}...\n`);
      const r = await encodeCase(c);
      results.push(r);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

// ── Score results ────────────────────────────────────────────────────────────
function score(results) {
  let total = 0, correct = 0, falseGO = 0, falseKILL = 0, missed = 0, errors = 0;
  const byDomain = {};
  const failures = [];

  for (const r of results) {
    if (r.error) { errors++; continue; }
    total++;
    const exp = r.expected?.toUpperCase();
    const got = r.verdict?.toUpperCase();

    const dom = r.domain || 'unknown';
    if (!byDomain[dom]) byDomain[dom] = { total: 0, correct: 0 };
    byDomain[dom].total++;

    if (exp === got) {
      correct++;
      byDomain[dom].correct++;
    } else {
      let type = 'WRONG';
      if (exp === 'KILL' && got === 'GO') { type = 'FALSE_GO'; falseGO++; }
      else if (exp === 'GO' && got === 'KILL') { type = 'FALSE_KILL'; falseKILL++; }
      else if ((exp === 'GO' || exp === 'KILL') && got === 'UNRESOLVED') { type = 'MISSED'; missed++; }
      failures.push({ id: r.id, domain: dom, expected: exp, got, type });
    }
  }

  return { total, correct, falseGO, falseKILL, missed, errors, byDomain, failures };
}

// ── Main ─────────────────────────────────────────────────────────────────────
console.log(`\nStarting blind encoding study — model: ${MODEL}, concurrency: ${CONCURRENCY}`);
console.log('='.repeat(72));

const results = await runBatch(blindedCases, CONCURRENCY);

const s = score(results);
const acc = s.total > 0 ? s.correct / s.total : 0;

console.log('\n' + '='.repeat(72));
console.log('  BLIND ENCODING STUDY — RAW RESULTS');
console.log('='.repeat(72));

console.log('\n--- PER-CASE RESULTS ---');
for (const r of results) {
  if (r.error) {
    console.log(`ERROR  ${r.id}: ${r.error}`);
  } else {
    const match = r.expected === r.verdict ? '✓' : '✗';
    console.log(`${match} ${r.id.padEnd(40)} expected=${r.expected?.padEnd(12)} got=${r.verdict}`);
  }
}

console.log('\n--- ENCODING vs REFERENCE COMPARISON (first 10) ---');
for (const r of results.slice(0, 10)) {
  if (r.error || !r.evidence_packet) continue;
  console.log(`\n${r.id} [expected=${r.expected}, got=${r.verdict}]:`);
  const fields = ['effect','replication','hostileSurvival','confoundControl','generalization','power'];
  for (const f of fields) {
    const enc = r.evidence_packet[f];
    const ref = r.reference_packet?.[f];
    const diff = (typeof enc === 'number' && typeof ref === 'number') ? (enc - ref).toFixed(2) : 'n/a';
    console.log(`  ${f.padEnd(20)} encoded=${String(enc).padEnd(8)} reference=${String(ref).padEnd(8)} diff=${diff}`);
  }
  console.log(`  notes: ${r.encoding_notes}`);
}

console.log('\n--- SUMMARY ---');
console.log(`Total cases:          ${s.total}`);
console.log(`Errors (API/parse):   ${s.errors}`);
console.log(`Correct:              ${s.correct} / ${s.total} (${(acc*100).toFixed(1)}%)`);
console.log(`False GO rate:        ${s.falseGO} / ${s.total} (${(s.falseGO/s.total*100).toFixed(1)}%)`);
console.log(`False KILL rate:      ${s.falseKILL} / ${s.total} (${(s.falseKILL/s.total*100).toFixed(1)}%)`);
console.log(`Missed:               ${s.missed} / ${s.total}`);

console.log('\n--- PER-DOMAIN ---');
for (const [d, ds] of Object.entries(s.byDomain)) {
  const dAcc = ds.total > 0 ? ds.correct/ds.total : 0;
  console.log(`  ${d.padEnd(30)} ${ds.correct}/${ds.total} (${(dAcc*100).toFixed(1)}%)`);
}

console.log('\n--- FAILURES ---');
for (const f of s.failures) {
  console.log(`  [${f.type}] ${f.id} (${f.domain}): expected=${f.expected} got=${f.got}`);
}

console.log('\n--- PRE-REGISTERED VERDICT THRESHOLDS ---');
console.log('  GO:         accuracy >= 80% AND false GO <= 5%');
console.log('  UNRESOLVED: accuracy 70-79% OR false GO 5-10%');
console.log('  KILL/PIVOT: accuracy < 70% OR false GO > 10%');
const fgoRate = s.falseGO / s.total;
let verdict;
if (acc >= 0.80 && fgoRate <= 0.05) verdict = 'GO';
else if (acc >= 0.70 && fgoRate <= 0.10) verdict = 'UNRESOLVED';
else verdict = 'KILL_PIVOT';
console.log(`\n  Observed: accuracy=${(acc*100).toFixed(1)}%, falseGO=${(fgoRate*100).toFixed(1)}%`);
console.log(`  VERDICT: ${verdict}`);
console.log('='.repeat(72));

// Raw JSON output for machine processing
console.log('\n--- RAW JSON ---');
console.log(JSON.stringify({ metadata: { model: MODEL, cases: s.total + s.errors, scored: s.total },
  summary: { accuracy: acc, falseGO: s.falseGO/s.total, correct: s.correct, total: s.total },
  byDomain: s.byDomain, failures: s.failures, verdict }, null, 2));
