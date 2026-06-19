# Evidence Architecture — Layer Separation for Evidence Integrity

**Document:** K7  
**Date:** 2026-06-19  
**Purpose:** Establish which components of the system may touch evidence values, and which may not.

---

## The Problem This Document Addresses

HypothesisOS is useful only if the evidence it evaluates is real. An LLM that generates plausible-sounding effect sizes, replication counts, or confidence intervals from training data memory produces output that looks like evidence but is not. A verdict engine that runs on hallucinated evidence is worse than no engine: it produces confident, structured, wrong conclusions.

This document defines three layers and specifies precisely what each layer may and may not do. Violations of these constraints should be treated as bugs, not judgment calls.

---

## The Three Layers

### Layer 1 — Evidence Layer

**Who or what populates it:** Humans, measurement instruments, or software reading actual study results. LLMs may not originate any value in this layer.

**What this layer contains:**

The 8 numeric fields of the evidence schema:

| Field | Type | What it encodes |
|-------|------|-----------------|
| `effect` | 0–1 | Strength of the measured effect supporting the claim |
| `replication` | 0–1 | 0 = none, 0.5 = one independent replication, 1 = multiple |
| `hostileSurvival` | 0–1 | Fraction of adversarial / confound-removal tests survived |
| `confoundControl` | 0–1 | 0 = fully confounded, 1 = major confounds ruled out |
| `generalization` | 0–1 | Holds out-of-sample / cross-context |
| `power` | 0–1 | Data sufficiency / statistical power |
| `ciExcludesNull` | bool | Whether the confidence interval excludes the null |
| `claimRequiresGeneralization` | bool | Whether the claim asserts cross-context validity |

**The rule:** Every numeric value must be traceable to a real observation. "Traceable" means: if asked "why is this 0.72?", the encoder can cite a study, a dataset, or a measurement that produced that figure.

**Violation examples:**
- Asking an LLM "what is the effect size for this claim?" and using its answer as `effect`
- Asking an LLM "has this been replicated?" and using its answer as `replication`
- Setting `hostileSurvival` to a round number (0.5) because no information was available, without flagging it as unmeasured
- Asking an LLM to "fill in the evidence fields" for a hypothesis

**The correct handling of unknown values:** Leave the field `null` or `undefined`. The engine treats unmeasured fields as "not measured" — they cannot trigger kill gates and they do not contribute to the support score. A measured zero is different from an unmeasured zero: 0 on `hostileSurvival` means "the claim failed every hostile test run"; `null` means "no hostile tests have been run."

---

### Layer 2 — Reasoning Layer

**Who or what operates it:** The deterministic engine (`lib/engine.mjs`), calibration (`lib/calibrate.mjs`), and self-critique (`lib/critique.mjs`). No LLM.

**What this layer does:**

Takes the evidence packet and computes:
- Kill gate evaluation: for each measured dimension, whether it falls below its floor
- Support score: weighted sum across dimensions (weights: effect 0.30, replication 0.20, hostileSurvival 0.25, confoundControl 0.15, generalization 0.10)
- Verdict: KILL (any gate fires), GO (all GO criteria met), or UNRESOLVED
- Calibration score: 4-component composite measuring evidence completeness, confound coverage, contradiction coverage, benchmark confidence
- Reasons array: which specific gates fired or which GO criteria were met

**The rule:** This layer is pure computation. It takes fixed inputs and produces deterministic outputs. There are no probabilistic components, no sampling, no LLM calls.

**Why no LLM in this layer:** An LLM in the reasoning layer could produce different verdicts on the same evidence packet depending on prompt variations, model version, or temperature settings. The kill gates exist precisely to be non-negotiable — a claim with `effect: 0.02` is KILL, full stop. An LLM might "reason around" this. The deterministic engine does not.

---

### Layer 3 — Explanation Layer

**Who or what operates it:** LLM-assisted modules (`lib/explain.mjs`, `lib/generate.mjs`) are permitted here, with constraints.

**What this layer does:**

- Generates narrative explanations of the verdict
- Lists supporting dimensions, contradicting dimensions, and missing measurements
- Suggests what evidence would change the verdict
- Generates experiment designs (cheap kill, strong test, hostile test) to fill evidence gaps
- Produces plain-language descriptions of what each kill gate means in context

**What the LLM may do in this layer:**

- Generate hypothesis language from user-provided text
- Suggest which evidence fields are relevant to a particular domain
- Summarize what was found in plain language: "The claim was killed because the measured effect (0.02) is below the minimum meaningful effect threshold (0.15)."
- Generate experiment designs: what test would raise or lower each evidence dimension
- Explain a KILL verdict in domain-specific terms (e.g., distinguish "failed hostile tests" from "no hostile tests run")

**What the LLM may never do in this layer:**

- Set any numeric evidence field value, even "as a suggestion"
- State that "studies show X" without citing a real, verifiable study
- Override or reinterpret a kill gate verdict ("even though hostile survival is 0.15, the claim is still supported because...")
- Generate confidence intervals, effect sizes, or p-values from memory
- Produce any output that a downstream step might treat as Layer 1 evidence

**Prompt constraint for explanation generation:**

Any LLM call in this layer must operate under a constraint equivalent to: "The verdict is [X] because [kill gates / GO criteria]. Explain why in plain language based only on the evidence values provided. Do not introduce evidence not in the packet."

The verdict and its reasons are fixed inputs to the explanation prompt, not outputs the LLM can affect.

---

## Implementation Status

The current implementation separates these layers cleanly:

- `lib/engine.mjs` and `lib/calibrate.mjs` are pure JS with no external calls. They are the Reasoning Layer.
- `lib/graph.mjs` and `lib/contradict.mjs` operate on pre-encoded evidence from `lib/bapa-benchmark.mjs` and `lib/benchmarks/`. No LLM.
- `lib/generate.mjs` uses keyword heuristics, not LLM calls, for hypothesis decomposition and experiment generation.
- `lib/explain.mjs` calls `classify()` and `decompose()` — both deterministic — and assembles structured text from their outputs. The verdict is fixed before explanation begins.
- The API routes in `app/api/` pass LLM-generated hypothesis text through `decompose()` for structural analysis, not for evidence values.

**Current risk:** The `lib/providers.ts` and `app/api/` infrastructure connects to LLM providers. A developer adding a new API route could inadvertently create a path where LLM output flows into evidence fields. This document establishes that such a path is a Layer 1 violation.

---

## Quick Reference

| Action | Permitted? | Layer |
|--------|-----------|-------|
| LLM generates hypothesis title from user text | Yes | 3 |
| LLM suggests which fields to fill | Yes | 3 |
| LLM explains a KILL verdict in plain language | Yes | 3 |
| LLM generates experiment designs | Yes | 3 |
| LLM sets `effect` to a number | No | — |
| LLM sets `replication` based on its knowledge | No | — |
| LLM states "3 studies replicated this" without citation | No | — |
| Engine returns different verdict on same evidence | No | — |
| Engine calls an LLM to evaluate a kill gate | No | — |
| Human reads a study and sets `hostileSurvival: 0.72` | Yes | 1 |
| Human leaves `hostileSurvival` null because no tests exist | Yes | 1 |
