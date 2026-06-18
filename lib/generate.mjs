// Hypothesis decomposition + experiment generation (heuristic, dependency-free).
// Powers the Hypothesis Lab and Experiment Engine. Deterministic; no AI calls.

const KW = {
  identity: ["who", "identify", "identity", "fingerprint", "author", "person"],
  causal: ["cause", "because", "leads to", "drives", "improves", "increases", "reduces"],
  stability: ["stable", "consistent", "over time", "persist", "remain"],
  group: ["differ", "between", "group", "type", "vs", "versus", "role"],
  generalize: ["any", "all", "across", "general", "portable", "transfer", "universal"],
};
const has = (t, ks) => ks.some((k) => t.includes(k));

export function decompose(hypothesisText) {
  const t = (hypothesisText || "").toLowerCase();
  const kinds = [];
  if (has(t, KW.identity)) kinds.push("identity/attribution");
  if (has(t, KW.causal)) kinds.push("causal");
  if (has(t, KW.stability)) kinds.push("stability/reliability");
  if (has(t, KW.group)) kinds.push("between-group difference");
  if (!kinds.length) kinds.push("association");
  const requiresGeneralization = has(t, KW.generalize) || kinds.includes("identity/attribution");

  const assumptions = [
    "The measurement actually captures the construct named in the hypothesis.",
    "The sample is representative of the population the claim is about.",
    "Observations are independent enough for the planned statistics.",
    requiresGeneralization
      ? "The effect is claimed to hold ACROSS contexts (must be tested out-of-sample)."
      : "The claim is scoped to a fixed context (no cross-context promise).",
  ];
  const confounds = [
    "Context / topic / domain (does the 'signal' just track the situation?)",
    "Group/role membership collinear with the unit of interest",
    "Measurement artifacts (formatting, length, instrument duplication)",
    "Selection / sampling bias in who/what was collected",
    kinds.includes("stability/reliability")
      ? "State vs trait (is 'stability' just a held-constant context?)"
      : "Reverse causation / common cause",
  ];
  const variables = {
    independent: kinds.includes("causal") ? "the manipulated/contrasted factor" : "the predictor(s)",
    dependent: "the measured outcome / signal",
    controls: ["context", "length", "time", "instrument version"],
    unitOfAnalysis: kinds.includes("identity/attribution") ? "person (nested in context)" : "observation",
  };
  return { kinds, requiresGeneralization, assumptions, confounds, variables };
}

export function experiments(hypothesisText) {
  const d = decompose(hypothesisText);
  const cheap = {
    tier: "CHEAP KILL",
    cost: "≈ hours, existing/public data",
    purpose: "Try to refute the claim for almost nothing before investing.",
    steps: [
      "Find any existing data touching the variables; compute the effect once.",
      "If the effect is absent or trivially explained by the top confound → KILL now.",
      "Add a permutation/label-shuffle null as the floor.",
    ],
  };
  const strong = {
    tier: "STRONG TEST",
    cost: "days–weeks, controlled collection",
    purpose: "Estimate the effect with the main confound controlled.",
    steps: [
      `Hold the top confound constant or measure it (${d.confounds[0]}).`,
      "Use the right unit of analysis: " + d.variables.unitOfAnalysis + ".",
      "Report an effect size with a confidence interval, not just p.",
      d.requiresGeneralization ? "Include an OUT-OF-CONTEXT hold-out split." : "Pre-register the scope.",
    ],
  };
  const hostile = {
    tier: "HOSTILE TEST",
    cost: "the decider",
    purpose: "Assume the result is an artifact and try to prove it.",
    steps: [
      "Strip the easy cue (lexis/topic/format) and re-run; must survive.",
      d.requiresGeneralization ? "Leave-one-context-out: must generalize." : "Test-retest across time.",
      "Beat a dumb baseline (lexical / chance) by a margin whose CI excludes 0.",
      "Adversarial reviewer: name the single most likely innocent explanation and rule it out.",
    ],
  };
  return { decomposition: d, tiers: [cheap, strong, hostile] };
}

// A blank evidence template the Evidence Engine fills in from experiment results.
export function blankEvidence(requiresGeneralization = true) {
  return {
    effect: 0, replication: 0, hostileSurvival: 0, confoundControl: 0,
    generalization: 0, power: 0, ciExcludesNull: false,
    claimRequiresGeneralization: requiresGeneralization,
  };
}
