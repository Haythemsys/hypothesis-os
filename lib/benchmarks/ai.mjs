// Multi-domain benchmark — AI / ML.
// Curated fixtures reflecting the current empirical record. Engine classifies from evidence.

export const AI = [
  {
    id: "ai_scaling_laws",
    title: "Scaling model/data/compute predictably lowers loss",
    expected: "GO",
    note: "Replicated across labs and modalities; smooth power-law fits.",
    evidence: { effect: 0.8, replication: 1.0, hostileSurvival: 0.8, confoundControl: 0.7,
      generalization: 0.8, power: 0.8, ciExcludesNull: true, claimRequiresGeneralization: true },
  },
  {
    id: "ai_chain_of_thought",
    title: "Chain-of-thought prompting improves multi-step reasoning",
    expected: "GO",
    note: "Replicated gains on reasoning benchmarks for capable models.",
    evidence: { effect: 0.6, replication: 1.0, hostileSurvival: 0.6, confoundControl: 0.6,
      generalization: 0.6, power: 0.7, ciExcludesNull: true, claimRequiresGeneralization: true },
  },
  {
    id: "ai_longer_context",
    title: "A longer context window always improves task accuracy",
    expected: "KILL",
    note: "'Lost in the middle' — accuracy can fall with longer contexts. Fails generality.",
    evidence: { effect: 0.4, replication: 1.0, hostileSurvival: 0.4, confoundControl: 0.5,
      generalization: 0.2, power: 0.6, ciExcludesNull: true, claimRequiresGeneralization: true },
  },
  {
    id: "ai_rlhf_full_alignment",
    title: "RLHF fully aligns models to human intent",
    expected: "KILL",
    note: "Jailbreaks and reward hacking refute the 'fully' claim across contexts.",
    evidence: { effect: 0.4, replication: 1.0, hostileSurvival: 0.3, confoundControl: 0.5,
      generalization: 0.25, power: 0.6, ciExcludesNull: true, claimRequiresGeneralization: true },
  },
  {
    id: "ai_emergent_abilities",
    title: "Emergent abilities are genuine capability discontinuities",
    expected: "UNRESOLVED",
    note: "Contested — may be an artifact of discontinuous metrics.",
    evidence: { effect: 0.4, replication: 0.5, hostileSurvival: 0.4, confoundControl: 0.35,
      generalization: 0.4, power: 0.3, ciExcludesNull: true, claimRequiresGeneralization: false },
  },
];
