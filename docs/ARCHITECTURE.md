# HypothesisOS — Architecture

## Principle

One decision: does the evidence force a verdict? The whole system is organized around making
that decision **transparent, reproducible, and resistant to hindsight**.

## Layers

```
            ┌─────────────────────────────────────────────┐
   UI       │  Next.js 15 app (app/) — 7 mobile-first pages │
            └───────────────┬─────────────────────────────┘
                            │ imports
            ┌───────────────▼─────────────────────────────┐
  Typed     │  lib/core.ts — typed bridge (single source)  │
  bridge    └───────────────┬─────────────────────────────┘
                            │ re-exports
            ┌───────────────▼─────────────────────────────┐
  Engine    │  lib/*.mjs — pure, dependency-free ESM       │
  (truth)   │   engine.mjs · generate.mjs · graph.mjs      │
            │   bapa-benchmark.mjs                         │
            └───────────────┬─────────────────────────────┘
                            │ same modules
            ┌───────────────▼─────────────────────────────┐
  Validation│  scripts/run-benchmark.mjs (Node, 0 deps)    │
            └─────────────────────────────────────────────┘
```

The `.mjs` engine is the **source of truth**. It runs unchanged in Node (the benchmark) and
in the browser (the app), so there is no second implementation to drift.

## Data model — Evidence

`classify()` consumes one object. Every field is evidence *about* a claim, never the claim's label:

| field | type | meaning |
|-------|------|---------|
| `effect` | 0..1 | strength of the measured effect |
| `replication` | 0..1 | 0 none · .5 one · 1 multiple independent |
| `hostileSurvival` | 0..1 | fraction of adversarial / confound-removal tests survived |
| `confoundControl` | 0..1 | 0 fully confounded · 1 major confounds ruled out |
| `generalization` | 0..1 | holds out-of-sample (scored only if the claim needs it) |
| `power` | 0..1 | data sufficiency / n / CI width |
| `ciExcludesNull` | bool | does the interval exclude the null? |
| `claimRequiresGeneralization` | bool | does the claim assert it holds across contexts? |

## Decision procedure

1. **KILL gates** (fail any → KILL): `effect < 0.15`, `hostileSurvival < 0.34`,
   `confoundControl < 0.20`, or (`claimRequiresGeneralization` and `generalization < 0.34`).
2. **GO** (all required): `support ≥ 0.65`, `replication ≥ 0.5`, `ciExcludesNull`, `power ≥ 0.4`.
3. **UNRESOLVED** otherwise, listing the failed GO checks.

`support` is a fixed weighted mean: effect .30, hostileSurvival .25, replication .20,
confoundControl .15, generalization/neutral .10.

## Why this shape

- **KILL gates run first.** A confounded or non-generalizing claim cannot be rescued by a large
  effect — exactly the failure mode that kept the BAPA identity hypothesis alive too long.
- **Thresholds are pre-registered** in `THRESHOLDS` and rendered on the Benchmark page, so a
  verdict can't be reverse-engineered by tuning after seeing the answer.
- **Generalization is conditional.** A within-context claim is not punished for failing a
  cross-context test it never made; a portability claim is.

## Generation (heuristic, not AI)

`lib/generate.mjs` decomposes a hypothesis string by keyword class (identity, causal, stability,
group, association), then emits assumptions, the likely confounds, the variable structure, and a
three-tier test plan (cheap kill → strong estimate → hostile). Deterministic; no model calls.
