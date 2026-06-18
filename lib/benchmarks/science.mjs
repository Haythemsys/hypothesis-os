// Multi-domain benchmark — SCIENCE.
// Curated fixtures: each evidence profile reflects the established replication/consensus
// record for the claim. `expected` is the scientific verdict; the engine classifies from
// `evidence` only. These are teaching fixtures, not new experimental data.

export const SCIENCE = [
  {
    id: "sci_smoking_lung_cancer",
    title: "Smoking causes lung cancer",
    expected: "GO",
    note: "Large dose-responsive effect, replicated for decades, confounds controlled.",
    evidence: { effect: 0.9, replication: 1.0, hostileSurvival: 0.9, confoundControl: 0.85,
      generalization: 0.9, power: 0.9, ciExcludesNull: true, claimRequiresGeneralization: true },
  },
  {
    id: "sci_homeopathy",
    title: "Homeopathy has efficacy beyond placebo",
    expected: "KILL",
    note: "Systematic reviews find no effect beyond placebo.",
    evidence: { effect: 0.05, replication: 1.0, hostileSurvival: 0.1, confoundControl: 0.6,
      generalization: 0.05, power: 0.8, ciExcludesNull: false, claimRequiresGeneralization: false },
  },
  {
    id: "sci_vaccines_autism",
    title: "Vaccines cause autism",
    expected: "KILL",
    note: "No effect; foundational study retracted for fraud.",
    evidence: { effect: 0.03, replication: 1.0, hostileSurvival: 0.05, confoundControl: 0.7,
      generalization: 0.03, power: 0.9, ciExcludesNull: false, claimRequiresGeneralization: false },
  },
  {
    id: "sci_plate_tectonics",
    title: "Continental plates move (plate tectonics)",
    expected: "GO",
    note: "Independent lines of evidence (seafloor spreading, GPS, paleomagnetism).",
    evidence: { effect: 0.85, replication: 1.0, hostileSurvival: 0.9, confoundControl: 0.8,
      generalization: 0.9, power: 0.8, ciExcludesNull: true, claimRequiresGeneralization: true },
  },
  {
    id: "sci_cold_fusion",
    title: "Cold fusion produces net energy at room temperature (1989)",
    expected: "KILL",
    note: "Effect did not replicate; measurement artifacts.",
    evidence: { effect: 0.1, replication: 0.0, hostileSurvival: 0.1, confoundControl: 0.3,
      generalization: 0.1, power: 0.4, ciExcludesNull: false, claimRequiresGeneralization: true },
  },
];
