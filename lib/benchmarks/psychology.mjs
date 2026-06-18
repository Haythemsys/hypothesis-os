// Multi-domain benchmark — PSYCHOLOGY.
// Curated fixtures reflecting the replication-crisis record. The engine classifies from
// evidence only. Teaching fixtures, not new data.

export const PSYCHOLOGY = [
  {
    id: "psy_power_posing",
    title: "Power posing changes hormone levels",
    expected: "KILL",
    note: "Hormonal effect failed to replicate (original author disavowed it).",
    evidence: { effect: 0.1, replication: 1.0, hostileSurvival: 0.15, confoundControl: 0.6,
      generalization: 0.1, power: 0.7, ciExcludesNull: false, claimRequiresGeneralization: false },
  },
  {
    id: "psy_ego_depletion",
    title: "Ego depletion: willpower is a depletable resource",
    expected: "KILL",
    note: "Large multi-lab replication found ~zero effect.",
    evidence: { effect: 0.12, replication: 1.0, hostileSurvival: 0.2, confoundControl: 0.6,
      generalization: 0.1, power: 0.8, ciExcludesNull: false, claimRequiresGeneralization: false },
  },
  {
    id: "psy_growth_mindset",
    title: "Growth-mindset interventions produce large gains for all students",
    expected: "UNRESOLVED",
    note: "Real but small and heterogeneous; the 'large for all' claim is not supported.",
    evidence: { effect: 0.3, replication: 1.0, hostileSurvival: 0.5, confoundControl: 0.5,
      generalization: 0.4, power: 0.7, ciExcludesNull: true, claimRequiresGeneralization: false },
  },
  {
    id: "psy_spacing_effect",
    title: "Spaced practice improves long-term retention",
    expected: "GO",
    note: "One of the most replicated findings in learning science.",
    evidence: { effect: 0.7, replication: 1.0, hostileSurvival: 0.8, confoundControl: 0.7,
      generalization: 0.75, power: 0.8, ciExcludesNull: true, claimRequiresGeneralization: false },
  },
  {
    id: "psy_stereotype_threat",
    title: "Stereotype threat universally lowers test performance",
    expected: "UNRESOLVED",
    note: "Effect exists in some settings; universality and size are contested.",
    evidence: { effect: 0.35, replication: 0.5, hostileSurvival: 0.4, confoundControl: 0.35,
      generalization: 0.4, power: 0.3, ciExcludesNull: true, claimRequiresGeneralization: false },
  },
];
