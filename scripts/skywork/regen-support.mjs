#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { classify } from '../../lib/engine.mjs';
import { calibrate } from '../../lib/calibrate.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '../..');

const raw = JSON.parse(
  readFileSync(join(ROOT, 'data/processed/skywork-validation-results.json'), 'utf8')
);

const lines = [];
for (const p of raw.hos_predictions) {
  const ep = p.evidence_packet;
  const cl = classify(ep);
  const cal = calibrate(ep);
  lines.push(JSON.stringify({
    case_id: p.case_id,
    verdict: cl.verdict,
    support: cl.support,
    confidence: cl.confidence,
    calibration_score: cal.score,
    evidence_packet: ep,
  }));
}

const outPath = join(ROOT, 'data/processed/skywork-support-scores.jsonl');
writeFileSync(outPath, lines.join('\n') + '\n', 'utf8');
console.log(`wrote ${lines.length} lines → ${outPath}`);
