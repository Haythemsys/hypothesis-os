// Multi-domain benchmark — MARKETING.
// Curated fixtures. The engine classifies from evidence only.

export const MARKETING = [
  {
    id: "mkt_red_button",
    title: "Red CTA buttons increase conversion (universally)",
    expected: "KILL",
    note: "Highly context-dependent; the universal claim fails out-of-sample.",
    evidence: { effect: 0.4, replication: 0.5, hostileSurvival: 0.4, confoundControl: 0.4,
      generalization: 0.15, power: 0.6, ciExcludesNull: false, claimRequiresGeneralization: true },
  },
  {
    id: "mkt_email_personalization",
    title: "Email personalization lifts engagement",
    expected: "GO",
    note: "Modest but well-replicated lift across many A/B tests.",
    evidence: { effect: 0.55, replication: 1.0, hostileSurvival: 0.6, confoundControl: 0.6,
      generalization: 0.6, power: 0.6, ciExcludesNull: true, claimRequiresGeneralization: false },
  },
  {
    id: "mkt_influencer_roi",
    title: "Influencer marketing has positive ROI for any brand",
    expected: "UNRESOLVED",
    note: "Highly variable; the unconditional claim lacks powered, controlled evidence.",
    evidence: { effect: 0.4, replication: 0.5, hostileSurvival: 0.4, confoundControl: 0.35,
      generalization: 0.4, power: 0.3, ciExcludesNull: true, claimRequiresGeneralization: false },
  },
  {
    id: "mkt_scarcity",
    title: "Scarcity cues increase purchase intent",
    expected: "UNRESOLVED",
    note: "Effect is real but often confounded with price/quality signals.",
    evidence: { effect: 0.5, replication: 0.5, hostileSurvival: 0.45, confoundControl: 0.3,
      generalization: 0.4, power: 0.4, ciExcludesNull: true, claimRequiresGeneralization: false },
  },
];
