// HypothesisOS — Decision Intelligence Layer
// Derives higher-level decision support from navigation + evidence.
// Pure functions, no side effects, no threshold or verdict logic changes.

import { THRESHOLDS } from './engine.mjs';

const round2 = (x) => Math.round(x * 100) / 100;
const isMeasured = (v) => typeof v === 'number' && !Number.isNaN(v);

// ── Evidence Debt ────────────────────────────────────────────────────────────
// Average normalized remaining gap across all 4 GO criteria.
export function evidenceDebt(evidence, navigation) {
  const e = evidence || {};
  const T = THRESHOLDS;
  const support = typeof navigation?.currentSupport === 'number' ? navigation.currentSupport : 0;

  const supportGap  = Math.max(0, T.goSupport    - support) / T.goSupport;
  const repVal      = isMeasured(e.replication) ? e.replication : 0;
  const repGap      = Math.max(0, T.goReplication - repVal)  / T.goReplication;
  const powerVal    = isMeasured(e.power)       ? e.power       : 0;
  const powerGap    = Math.max(0, T.goPower      - powerVal) / T.goPower;
  const ciGap       = e.ciExcludesNull ? 0 : 1;

  const debt = (supportGap + repGap + powerGap + ciGap) / 4;
  const pct  = Math.round(debt * 100);

  const band =
    pct <= 10  ? 'Near GO' :
    pct <= 30  ? 'Moderate debt' :
    pct <= 60  ? 'Significant debt' :
                 'Major evidence deficit';

  return { debt: round2(debt), pct, band };
}

// ── Decision Effort ──────────────────────────────────────────────────────────
// LOW / MEDIUM / HIGH with estimated study cycles, derived from navigation.
export function decisionEffort(navigation) {
  if (!navigation || !navigation.navigable) return { level: 'HIGH', studyCycles: null };

  const dist     = navigation.distanceToGo;
  const unmetLen = (navigation.unmetGoCriteria || []).length;

  if (dist === '1 evidence move')    return { level: 'LOW',    studyCycles: 1 };
  if (dist === '2 evidence moves')   return { level: unmetLen <= 2 ? 'LOW' : 'MEDIUM', studyCycles: 2 };
  if (dist === '2–3 evidence moves') return { level: 'MEDIUM', studyCycles: 2 };
  return { level: 'HIGH', studyCycles: null };
}

// ── Path to GO ───────────────────────────────────────────────────────────────
// Ordered list of concrete improvement steps ranked by leverage.
const DIM_ACTION = {
  effect:          'Strengthen direct effect evidence — a pre-registered study or A/B test with a clear outcome metric.',
  replication:     'Obtain at least one independent replication from a different team, lab, or dataset.',
  hostileSurvival: 'Run hostile and adversarial tests to verify the effect survives counter-conditions.',
  confoundControl: 'Rule out primary confounds with controlled comparisons, matched cohorts, or IV designs.',
  generalization:  'Test in at least one out-of-sample context to establish cross-context validity.',
};

export function pathToGo(navigation) {
  if (!navigation || !navigation.navigable) return [];

  const gains   = (navigation.dimensionGains || []).filter(g => g.maxGain > 0.005);
  const unmet   = new Set(navigation.unmetGoCriteria || []);
  const covered = new Set();
  const steps   = [];

  for (const g of gains.slice(0, 3)) {
    steps.push({ dimension: g.dimension, label: g.label, action: DIM_ACTION[g.dimension] || `Increase ${g.label.toLowerCase()}.`, maxGain: g.maxGain });
    covered.add(g.dimension);
  }

  const extras = {
    ciExcludesNull: { label: 'CI excludes null', action: 'Ensure the confidence interval excludes zero — pre-register the hypothesis and use a two-sided test with adequate power.' },
    power:          { label: 'Statistical power',  action: 'Increase sample size or run a power analysis to ensure the study is adequately powered.' },
  };
  for (const c of ['ciExcludesNull', 'power']) {
    if (unmet.has(c) && !covered.has(c)) {
      steps.push({ dimension: c, label: extras[c].label, action: extras[c].action, maxGain: null });
    }
  }

  return steps.slice(0, 4);
}

// ── Confidence Breakdown ─────────────────────────────────────────────────────
// Explains the calibration score as positive contributors and negative penalties.
export function confidenceBreakdown(evidence, calibrationScore) {
  const e = evidence || {};
  const STRONG = 0.70, WEAK = 0.40;
  const contributors = [], penalties = [];

  const check = (val, strong, weak) => {
    if (!isMeasured(val)) return;
    if (val >= STRONG) contributors.push(strong);
    else if (val < WEAK) penalties.push(weak);
  };

  check(e.effect,          'Strong effect size',      'Weak effect size');
  check(e.hostileSurvival, 'Strong hostile survival', 'Limited hostile testing');
  check(e.confoundControl, 'Strong confound control', 'Weak confound control');
  check(e.replication,     'Strong replication',      'Weak replication');
  check(e.generalization,  'Strong generalization',   'Limited generalization evidence');
  check(e.power,           'High statistical power',  'Low statistical power');

  if (e.ciExcludesNull === true)  contributors.push('CI excludes the null');
  else if (e.ciExcludesNull === false) penalties.push('CI does not exclude null');

  return { score: calibrationScore, contributors, penalties };
}

// ── Executive Summary ────────────────────────────────────────────────────────
// One-card decision brief: verdict + reason + fastest route + effort + debt.
export function executiveSummary(verdict, nav, debt, effort) {
  const v = (verdict || '').toUpperCase();
  let reason;

  if (v === 'GO') {
    reason = 'All evidence criteria are satisfied.';
  } else if (v === 'KILL') {
    const gates = (nav?.killedBy || []).map(g => g.gate).join(' and ');
    reason = gates
      ? `Kill gate${(nav?.killedBy || []).length > 1 ? 's' : ''} fired on ${gates}.`
      : 'Evidence falls below minimum kill-gate threshold.';
  } else {
    const unmet = nav?.unmetGoCriteria || [];
    if (unmet.length === 0) {
      reason = 'Evidence is positive but criteria status is indeterminate.';
    } else {
      const LABELS = { support: 'weighted support', replication: 'replication', ciExcludesNull: 'CI excludes null', power: 'statistical power' };
      const named  = unmet.slice(0, 2).map(c => LABELS[c] || c).join(' and ');
      reason = `${named.charAt(0).toUpperCase() + named.slice(1)} remain${unmet.length === 1 ? 's' : ''} below acceptance threshold${unmet.length > 1 ? 's' : ''}.`;
    }
  }

  const fastestRoute = nav?.navigable && nav?.dimensionGains?.[0]
    ? nav.dimensionGains[0].label
    : null;

  return {
    verdict: v,
    reason,
    fastestRoute,
    effort:      effort?.level ?? null,
    studyCycles: effort?.studyCycles ?? null,
    debtPct:     debt?.pct  ?? null,
    debtBand:    debt?.band ?? null,
  };
}
