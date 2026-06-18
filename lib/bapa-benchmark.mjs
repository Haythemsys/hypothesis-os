// BAPA benchmark: the BAPA hypotheses (R1–R20) encoded as EVIDENCE + the historically
// established outcome. The engine never sees `expected` — it classifies from `evidence`
// only. `expected` is used solely to SCORE the engine (self-validation).

export const BAPA_HYPOTHESES = [
  {
    id: "identity_static",
    title: "Identity-in-text (static): infer WHO wrote a text",
    phase: "Phase 2 / R13C / R18",
    expected: "KILL",
    evidence: {
      effect: 0.40,                 // apparent separation existed...
      replication: 0.3,
      hostileSurvival: 0.10,        // S2 domain-shift destroyed it (2–9 SD)
      confoundControl: 0.10,        // author == genre confound, uncontrolled
      generalization: 0.05,         // collapses across context
      power: 0.4, ciExcludesNull: false,
      claimRequiresGeneralization: true,
    },
  },
  {
    id: "cognitive_fingerprint",
    title: "Cognitive fingerprint: a stable multi-dim personal signature",
    phase: "Phase 2",
    expected: "KILL",
    evidence: {
      effect: 0.35, replication: 0.3, hostileSurvival: 0.15, confoundControl: 0.15,
      generalization: 0.05, power: 0.4, ciExcludesNull: false,
      claimRequiresGeneralization: true,
    },
  },
  {
    id: "model_fingerprint",
    title: "Model fingerprinting via adaptation dynamics (RAID)",
    phase: "R10 / R11",
    expected: "KILL",
    evidence: {
      effect: 0.20,                 // ~chance over a lexical baseline
      replication: 0.5, hostileSurvival: 0.20, confoundControl: 0.3,
      generalization: 0.2, power: 0.7,
      ciExcludesNull: false,        // dynamics−lexical Δ CI includes 0
      claimRequiresGeneralization: true,
    },
  },
  {
    id: "portable_register",
    title: "Portable / context-invariant personal register",
    phase: "R18 / R20",
    expected: "KILL",
    evidence: {
      effect: 0.10,                 // cross-context re-ID at chance (0.88×, p=1.0)
      replication: 0.5, hostileSurvival: 0.15, confoundControl: 0.4,
      generalization: 0.05, power: 0.3, ciExcludesNull: false,
      claimRequiresGeneralization: true,
    },
  },
  {
    id: "context_dominance",
    title: "Context dominates register (register is a context function)",
    phase: "R18 / R20",
    expected: "GO",
    evidence: {
      effect: 0.85,                 // register predicts community 2.79× chance
      replication: 1.0,             // Enron + StackExchange + Phase-B
      hostileSurvival: 0.90, confoundControl: 0.80,
      generalization: 0.90,         // holds out-of-sample / unseen authors
      power: 0.6, ciExcludesNull: true,
      claimRequiresGeneralization: true,
    },
  },
  {
    id: "temporal_stability",
    title: "Temporal register stability WITHIN context",
    phase: "R13 / R16",
    expected: "GO",
    evidence: {
      effect: 0.72,                 // ICC ~0.67–0.72
      replication: 1.0,             // cross-platform (Enron raw + cleaned + SE)
      hostileSurvival: 0.85,        // formatting/signature/cleaning-invariant
      confoundControl: 0.70,
      generalization: 0.80,         // cross-platform replication
      power: 0.5, ciExcludesNull: true,
      claimRequiresGeneralization: false, // claim is WITHIN-context stability
    },
  },
  {
    id: "within_context_person",
    title: "Within-context weak personal signal (lexis-stripped re-ID)",
    phase: "R17",
    expected: "UNRESOLVED",
    evidence: {
      effect: 0.50,                 // re-ID 2.6–7× chance, p<0.01, but ~13% absolute
      replication: 0.5, hostileSurvival: 0.60,
      confoundControl: 0.50,        // role not separated from person
      generalization: 0.10,         // does NOT survive cross-context
      power: 0.4, ciExcludesNull: true,
      claimRequiresGeneralization: false, // claim bounded to within-context
    },
  },
  {
    id: "adaptation_layer",
    title: "Adaptation layer: AI adapts to a user from accumulated preferences (BAPA 2.0)",
    phase: "R19",
    expected: "UNRESOLVED",
    evidence: {
      effect: 0.30,                 // substrate validated; product value untested
      replication: 0.0, hostileSurvival: 0.50, confoundControl: 0.50,
      generalization: 0.5, power: 0.2, ciExcludesNull: false,
      claimRequiresGeneralization: false,
    },
  },
];

// The five "major" hypotheses the success criterion must classify correctly.
export const MAJOR_IDS = [
  "identity_static", "model_fingerprint", "portable_register",
  "context_dominance", "temporal_stability",
];
