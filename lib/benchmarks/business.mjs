// Multi-domain benchmark — BUSINESS / ECONOMICS.
// Includes a deliberate HARD contradiction pair (law of demand vs Veblen goods) so the
// Contradiction Engine has a both-GO opposing case to surface.

export const BUSINESS = [
  {
    id: "biz_first_mover",
    title: "First-mover advantage is universal",
    expected: "KILL",
    note: "Frequently overturned by fast-followers; does not generalize.",
    evidence: { effect: 0.4, replication: 0.5, hostileSurvival: 0.4, confoundControl: 0.4,
      generalization: 0.1, power: 0.5, ciExcludesNull: false, claimRequiresGeneralization: true },
  },
  {
    id: "biz_law_of_demand",
    title: "Raising price reduces quantity demanded (law of demand)",
    expected: "GO",
    note: "Robust across most goods and markets.",
    implications: [{ var: "demand_response_to_price", sign: -1 }],
    evidence: { effect: 0.6, replication: 1.0, hostileSurvival: 0.7, confoundControl: 0.7,
      generalization: 0.7, power: 0.7, ciExcludesNull: true, claimRequiresGeneralization: false },
  },
  {
    id: "biz_veblen_goods",
    title: "For luxury goods, raising price increases demand (Veblen effect)",
    expected: "GO",
    note: "Real for status goods — directly opposes the law of demand on the same variable.",
    implications: [{ var: "demand_response_to_price", sign: +1 }],
    evidence: { effect: 0.7, replication: 0.6, hostileSurvival: 0.7, confoundControl: 0.7,
      generalization: 0.5, power: 0.5, ciExcludesNull: true, claimRequiresGeneralization: false },
  },
  {
    id: "biz_four_day_week",
    title: "A 4-day week maintains output",
    expected: "UNRESOLVED",
    note: "Promising pilots, limited independent replication and power.",
    evidence: { effect: 0.5, replication: 0.5, hostileSurvival: 0.5, confoundControl: 0.4,
      generalization: 0.4, power: 0.3, ciExcludesNull: true, claimRequiresGeneralization: false },
  },
  {
    id: "biz_layoffs_perform",
    title: "Layoffs improve long-term firm performance",
    expected: "KILL",
    note: "Most longitudinal studies find no gain or harm.",
    evidence: { effect: 0.12, replication: 0.5, hostileSurvival: 0.3, confoundControl: 0.4,
      generalization: 0.2, power: 0.5, ciExcludesNull: false, claimRequiresGeneralization: false },
  },
];
