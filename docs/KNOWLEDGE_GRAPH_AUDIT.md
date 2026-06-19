# Knowledge Graph — Honest Audit

**Document:** K8  
**Date:** 2026-06-19  
**Files audited:** `lib/graph.mjs`, `lib/contradict.mjs`, `app/graph/page.tsx`

---

## What the Graph Feature Does

The Knowledge Graph page (`/graph`) presents two distinct features under one roof:

**Feature A — Static edge graph (lib/graph.mjs)**

A hand-authored list of 8 edges connecting BAPA hypothesis nodes. Each edge has a direction (from → to), a relationship type (contradicted-by, depends-on, supports, builds-on, analogous-to, bounds), and a note explaining the relationship. The nodes are the 8 BAPA hypotheses. No visual graph rendering exists: the page renders a flat list of edges and nodes with verdict pills and color coding by relationship type.

**Feature B — Automatic contradiction detection (lib/contradict.mjs)**

A deterministic algorithm that detects when two hypotheses in a set make opposing claims about the same variable. Each hypothesis can carry an `implications` array: `[{ var: "style_is_personal", sign: +1 }]` or `[{ var: "style_is_personal", sign: -1 }]`. When two hypotheses share a variable and have opposite signs, they are flagged as contradictions. Severity is "hard" if both have verdict GO (both are confirmed yet they oppose — at least one must be wrong), "soft" if one or both has verdict KILL or UNRESOLVED (the data already adjudicated it or the conflict is pending).

---

## Are the Relationships Real or Generated?

**The static edges (Feature A) are human-authored, not LLM-generated.**

The 8 edges in `lib/graph.mjs` were written by hand. They reflect substantive research conclusions from the BAPA investigation:

- `identity_static → context_dominance (contradicted-by)`: This relationship is real. The BAPA research showed that what looked like author-level stylistic identity was actually context (community/genre). Controlling context collapsed the apparent personal signal.
- `portable_register → context_dominance (contradicted-by)`: Real. Cross-context re-identification fell to chance (0.88×, p=1.0 in R20).
- `cognitive_fingerprint → identity_static (depends-on)`: Real logical dependency. A stable multi-dimensional personal signature presupposes identity-in-text; both claims rest on the same refuted assumption.
- `temporal_stability → context_dominance (supports)`: Correctly stated. Temporal stability within context is consistent with context-as-driver: the register is stable because the context is held constant.
- `within_context_person → portable_register (bounds)`: Accurate characterization of R17's finding — a weak personal signal exists within a fixed context but does not survive context change.
- `adaptation_layer → context_dominance (builds-on)`: A reframe, not a research finding. This edge reflects the project's pivot hypothesis: if context drives register, an AI that adapts to context-as-proxy may enable personalization.
- `model_fingerprint → identity_static (analogous-to)`: An analogy, not a causal claim. Both hypotheses fail for similar structural reasons (dynamics add nothing over a lexical baseline).

The relationships are grounded in real research findings. They are not LLM-inferred.

**The contradiction detection (Feature B) is algorithmic, not LLM-generated.**

`detectContradictions` is a deterministic O(n²) pairwise scan. It reads `implications` arrays that were hand-authored alongside each hypothesis. The algorithm itself infers nothing — it matches variable names and compares signs. The `resolution` field text is generated from a template, not from an LLM.

The quality of the contradiction detection depends on whether the `implications` arrays are accurate and complete. They are sparse: most benchmark hypotheses in `lib/benchmarks/` do not carry `implications` entries. The BAPA hypotheses carry `{ var: "style_is_personal", sign: +1/-1 }` on the hypotheses where the sign is clear. The contradiction detection therefore covers only the hypotheses where a human explicitly added an implications entry.

---

## Risk Assessment

**Low risk from Feature B (contradiction detection).**

The algorithm is transparent. It flags pairs with opposite signs on a shared variable, labels the severity, and provides a template resolution. A hard contradiction (both GO) is a genuine red flag that warrants re-examination. A soft contradiction is correctly labeled as "adjudicated by evidence." The main limitation — sparse implications arrays — reduces the feature's coverage but does not produce false or misleading output.

**Low-to-medium risk from Feature A (static edges), with one caveat.**

The BAPA-specific edges are grounded in real research results and are accurate characterizations of those results. The risk is that a user viewing the graph page might mistake the BAPA-specific graph for a general feature of the system — as if HypothesisOS automatically infers relationships between any hypotheses entered by users. It does not. The edges are hard-coded for the BAPA benchmark set only.

**The `adaptation_layer → context_dominance (builds-on)` edge is a pivot hypothesis, not an established finding.** It is labeled `builds-on` which correctly signals it is forward-looking, but the note ("Reframe: if context drives register, an AI adaptation layer is the live hypothesis") could be read as a confirmed relationship rather than a proposition being investigated.

**No LLM relationship inference is present.** This is the most important finding for this audit. There is no code path in which an LLM examines two hypotheses and infers that they are related. The relationships are human-coded or algorithmically matched. The misinformation risk common to LLM-generated knowledge graphs — where plausible-sounding relationships are hallucinated from co-occurrence in training data — does not apply here.

---

## Structural Limitation

The graph page does not visualize a graph. It renders two flat lists (nodes, edges) and a contradiction table. Calling it a "Knowledge Graph" implies a visual relational structure that does not exist. This is a labeling issue, not a data integrity issue.

The feature is also strictly BAPA-scoped. User-entered hypotheses in the main workflow are not added to the graph. There is no mechanism for the graph to grow beyond the 8 hard-coded BAPA nodes.

---

## Recommendation

**Keep Feature B (contradiction detection) as-is.** The algorithm is correct, transparent, and genuinely useful when implications are populated. The sparse coverage is an honest reflection of the fact that most benchmark hypotheses were not given implications arrays.

**Keep Feature A (static edges) with a scope disclaimer.** Add a visible note on the graph page that:
1. The edges shown are specific to the BAPA research program and were hand-authored from real research findings.
2. User-entered hypotheses are not included in this graph.
3. HypothesisOS does not automatically infer relationships between hypotheses.

The disclaimer text that already exists on the page ("Dependencies, support, and contradictions — the contradictions are detected automatically from each hypothesis's implications.") covers Feature B but does not clarify that the edges in Feature A are static and BAPA-specific.

**Do not expand the feature to LLM-inferred relationships without marking them clearly as inferred.** If a future version adds LLM-generated relationship suggestions, those must be visually distinguished from evidence-derived relationships and the full Layer separation rules from EVIDENCE_ARCHITECTURE.md must apply.

**Rename the page to "Hypothesis Map" or "Dependency Graph (BAPA)" to reduce the implied scope of "Knowledge Graph."** The current name implies a live, growing, general-purpose knowledge structure. It is a static reference for one research program.

---

## Summary

| Question | Finding |
|----------|---------|
| What does the graph do? | Shows 8 hand-authored edges between BAPA hypotheses + algorithmic contradiction detection across hypotheses with implications arrays |
| Are edges LLM-generated? | No. Hand-authored from real research results. |
| Are relationships real or inferred? | Real (derived from research findings). One edge is a pivot hypothesis labeled as such. |
| Risk of misleading users? | Low. Main risk is scope confusion: the graph is BAPA-only, not a general feature. |
| Recommendation | Keep as-is. Add scope disclaimer on the page. Rename to reduce implied generality. |
