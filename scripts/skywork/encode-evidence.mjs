#!/usr/bin/env node
/**
 * Phase 5 — Skywork Blind Evidence Encoding (Mode B)
 * Converts raw text evidence to HypothesisOS numeric schema via LLM.
 *
 * NOTE: This script documents the encoding approach.
 * The actual encoding was performed by the workflow at:
 * /tmp/skywork_encoding_workflow.js
 * Output saved to: data/processed/skywork-validation-results.json
 *
 * ENCODING RULES (enforced in workflow prompt):
 * 1. Encode ONLY from evidence_available_at_time
 * 2. Do NOT use knowledge of post-decision outcomes
 * 3. decision_taken is what they did, not what happened
 * 4. hostileSurvival=null when no hostile tests were run (NOT 0.0)
 *
 * Usage (for re-encoding): see /tmp/skywork_encoding_workflow.js
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..', '..');

const blindedPath = join(ROOT, 'data/external/skywork-hypo-data/blinded_cases.jsonl');
const cases = readFileSync(blindedPath, 'utf8').trim().split('\n').map(l => JSON.parse(l));

console.log(`Blinded cases: ${cases.length}`);
console.log('Fields present:', Object.keys(cases[0]).join(', '));

const outcomeFields = ['known_outcome','expected_verdict','why_expected_verdict','outcome_date','failure_mode','success_mode'];
const leaks = outcomeFields.filter(f => cases[0].hasOwnProperty(f));
if (leaks.length > 0) {
  console.error(`LEAKAGE DETECTED: ${leaks.join(', ')}`);
  process.exit(1);
}
console.log('Leakage check: CLEAN (no outcome fields)');
console.log('\nEncodings are stored in: data/processed/skywork-validation-results.json');
console.log('To view: node -e "const r=JSON.parse(require(\'fs\').readFileSync(\'data/processed/skywork-validation-results.json\')); console.log(r.hos_verdict_distribution)"');
