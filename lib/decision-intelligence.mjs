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

// ── Decision Risk Score ──────────────────────────────────────────────────────
// Composite risk across evidence debt, unmet criteria, calibration, and distance.
// Levels: LOW / MEDIUM / HIGH / CRITICAL. Does not change any verdict or threshold.
const CRITERION_LABEL = {
  support: 'weighted support', replication: 'replication',
  ciExcludesNull: 'CI excludes null', power: 'statistical power',
};

export function decisionRisk(debt, navigation, calibrationScore) {
  const debtPct    = debt?.pct ?? 0;
  const unmetCount = (navigation?.unmetGoCriteria || []).length;
  const dist       = navigation?.distanceToGo;
  const cal        = calibrationScore ?? 50;

  let score = 0;
  if (debtPct >= 60) score += 3; else if (debtPct >= 30) score += 2; else if (debtPct >= 10) score += 1;
  if (unmetCount >= 4) score += 3; else if (unmetCount >= 3) score += 2; else if (unmetCount >= 2) score += 1;
  if (cal < 40) score += 2; else if (cal < 70) score += 1;
  if (!navigation?.navigable || dist === '3+ evidence moves') score += 2;
  else if (dist === '2–3 evidence moves') score += 1;

  const level = score >= 8 ? 'CRITICAL' : score >= 5 ? 'HIGH' : score >= 3 ? 'MEDIUM' : 'LOW';

  const unmet = navigation?.unmetGoCriteria || [];
  let reason;
  if (unmet.length >= 2) {
    const named = unmet.slice(0, 2).map(c => CRITERION_LABEL[c] || c).join(' and ');
    reason = `${named.charAt(0).toUpperCase() + named.slice(1)} remain below acceptance thresholds.`;
  } else if (unmet.length === 1) {
    reason = `${(CRITERION_LABEL[unmet[0]] || unmet[0]).charAt(0).toUpperCase() + (CRITERION_LABEL[unmet[0]] || unmet[0]).slice(1)} remains below the acceptance threshold.`;
  } else if (debtPct >= 30) {
    reason = `Evidence debt is ${debtPct}% — significant gaps remain before GO.`;
  } else if (!navigation?.navigable) {
    reason = 'Evidence is too weak or actively undermines the hypothesis.';
  } else {
    reason = 'Evidence is mostly complete but a support gap to GO remains.';
  }

  return { level, score, reason };
}

// ── Resolution Timeline ──────────────────────────────────────────────────────
// Per-criterion time estimates (in weeks) for resolving each unmet GO criterion.
const TIMELINE = {
  support:        { min: 3, max: 8,  label: 'Overall support' },
  replication:    { min: 2, max: 6,  label: 'Independent replication' },
  ciExcludesNull: { min: 1, max: 2,  label: 'CI calculation' },
  power:          { min: 1, max: 3,  label: 'Statistical power' },
  effect:         { min: 4, max: 12, label: 'Effect size measurement' },
  hostileSurvival:{ min: 1, max: 4,  label: 'Hostile testing' },
  confoundControl:{ min: 2, max: 6,  label: 'Confound control' },
  generalization: { min: 2, max: 8,  label: 'Generalization testing' },
};

export function resolutionTimeline(navigation) {
  if (!navigation?.navigable) return null;

  const unmet  = navigation.unmetGoCriteriaDetail || [];
  const gains  = (navigation.dimensionGains || []).filter(g => g.maxGain > 0.01);
  const items  = [];
  const seen   = new Set();

  for (const u of unmet) {
    const tw = TIMELINE[u.criterion];
    if (tw) { items.push({ dimension: u.criterion, label: tw.label, minWeeks: tw.min, maxWeeks: tw.max }); seen.add(u.criterion); }
  }
  for (const g of gains.slice(0, 2)) {
    if (!seen.has(g.dimension)) {
      const tw = TIMELINE[g.dimension];
      if (tw) { items.push({ dimension: g.dimension, label: g.label, minWeeks: tw.min, maxWeeks: tw.max }); seen.add(g.dimension); }
    }
  }

  if (items.length === 0) return null;

  const maxMin   = Math.max(...items.map(i => i.minWeeks));
  const maxMax   = Math.max(...items.map(i => i.maxWeeks));
  const totalMin = Math.round(maxMin * 1.2);
  const totalMax = Math.round(maxMax * 1.5);

  return { items, totalMin, totalMax };
}

// ── Cost to Resolve ──────────────────────────────────────────────────────────
export function costToResolve(effort, navigation) {
  const unmetCount = (navigation?.unmetGoCriteria || []).length;
  const effortLevel = effort?.level;

  if (effortLevel === 'LOW') {
    return { level: 'LOW', description: 'Existing public data likely sufficient — analysis and targeted re-measurement.' };
  }
  if (effortLevel === 'HIGH' || unmetCount >= 3) {
    return { level: 'HIGH', description: 'Multiple studies and independent replication required — substantial time and resource commitment.' };
  }
  return { level: 'MEDIUM', description: 'One controlled experiment or targeted data collection required.' };
}

// ── Investor / Founder View ──────────────────────────────────────────────────
// YES / NO / NOT YET — based solely on evidence debt, risk, and distance to GO.
// Never modifies the scientific verdict or thresholds.
export function investorView(debt, risk, navigation) {
  const debtPct  = debt?.pct ?? 0;
  const riskLevel = risk?.level;
  const navigable = navigation?.navigable;
  const dist      = navigation?.distanceToGo;

  if (riskLevel === 'CRITICAL' || !navigable || debtPct >= 65) {
    return {
      verdict: 'NO',
      reason: 'High risk and major evidence gaps make further investment premature without hypothesis revision.',
    };
  }
  if (riskLevel === 'LOW' && debtPct <= 20 && (dist === '1 evidence move' || dist === '2 evidence moves')) {
    return {
      verdict: 'YES',
      reason: 'Risk is low and evidence debt is manageable. Further evidence investment is well-justified.',
    };
  }
  return {
    verdict: 'NOT YET',
    reason: 'Evidence is promising but additional targeted collection is needed before committing further resources.',
  };
}
