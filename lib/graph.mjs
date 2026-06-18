// Knowledge graph over the BAPA hypotheses: how the claims depend on, support, or
// contradict each other. Derived from the BAPA research record (R1–R20).

export const EDGES = [
  { from: "identity_static", to: "context_dominance", rel: "contradicted-by",
    note: "Apparent identity separation was the context confound; controlling context kills identity." },
  { from: "cognitive_fingerprint", to: "identity_static", rel: "depends-on",
    note: "A stable fingerprint presupposes identity-in-text; both fall together." },
  { from: "portable_register", to: "context_dominance", rel: "contradicted-by",
    note: "Cross-context re-ID at chance — register is portable to the context, not the person." },
  { from: "model_fingerprint", to: "identity_static", rel: "analogous-to",
    note: "Same failure mode for models: dynamics add nothing over a lexical baseline." },
  { from: "temporal_stability", to: "context_dominance", rel: "supports",
    note: "Register is stable over time WITHIN a held context — consistent with context-as-driver." },
  { from: "within_context_person", to: "portable_register", rel: "bounds",
    note: "A weak personal signal exists within context but does NOT survive cross-context." },
  { from: "within_context_person", to: "temporal_stability", rel: "depends-on",
    note: "Within-context personal signal only meaningful given within-context stability." },
  { from: "adaptation_layer", to: "context_dominance", rel: "builds-on",
    note: "Reframe: if context drives register, an AI adaptation layer is the live hypothesis." },
];

export const REL_STYLE = {
  "contradicted-by": "text-kill",
  "supports": "text-go",
  "builds-on": "text-go",
  "depends-on": "text-gray-300",
  "analogous-to": "text-gray-300",
  "bounds": "text-unresolved",
};
