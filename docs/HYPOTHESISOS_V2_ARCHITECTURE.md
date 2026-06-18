# HypothesisOS v2 — Architecture

v1 answered *what* (GO / KILL / UNRESOLVED). v2 must answer *why*, say *how sure*, and
*attack its own answer* before committing. The goal is the shift from "interesting" to
"trustworthy": **evidence first, calibration first, transparency first.**

## Layered model

```
  UI (Next.js 15, mobile-first, 9 routes)
    │  Home · Lab · Tests · Evidence(trust center) · Graph · Memory · Archive · Bench
    ▼
  lib/core.ts                      ← single typed bridge
    ▼
  PURE ENGINE (dependency-free .mjs, runs in Node + browser)
    engine.mjs      classify(evidence) → verdict           (v2: absence ≠ refutation)
    explain.mjs     Phase A  why: for / against / missing / rejected-alternatives
    calibrate.mjs   Phase B  0–100 confidence, HIGH/MED/LOW
    critique.mjs    Phase H  hostile self-review, downgrades premature GO
    contradict.mjs  Phase D  auto-detect opposing claims on a shared variable
    memory.mjs      Phase C  versioned, traceable hypothesis history
    benchmarks/*    Phase E  Science · Psychology · Business · Marketing · AI
    ▼
  scripts/run-all-benchmarks.mjs   ← 0-dep self-validation (BAPA + 24 multi-domain)
```

The `.mjs` engine remains the **single source of truth** — same code validates in Node and
runs in the browser, so the product and its proof can never diverge.

## The v2 correctness fix — absence of evidence

v1 returned a *confident KILL (0.95)* for a hypothesis with no evidence at all, because the
kill-gates fired on `?? 0`. v2 distinguishes **measured** (a number) from **unmeasured**
(null/undefined): a kill-gate fires only on a measured value below its floor. An untested
hypothesis is now **UNRESOLVED at LOW calibration**, never a confident KILL. This is the
single most important trust fix in the release.

## Verdict pipeline (v2)

```
evidence ─▶ classify ──▶ base verdict + reasons
        ├─▶ explain  ──▶ for / against / missing / assumptions / confounds / why-not-X
        ├─▶ calibrate ─▶ 0–100 score + band + limiting factor
        └─▶ critique ──▶ attacks(hypothesis, evidence, verdict)
                          │
                          ▼
                 final verdict  (GO downgraded to UNRESOLVED if a hostile
                                 attack lands; LOW-calibration verdicts flagged)
```

A verdict is only "final" after surviving the self-critique. Nothing reaches the user
without a justification attached.

## Routes

| Route | Phase(s) | What it shows |
|-------|----------|---------------|
| `/` | — | verdict counts, self-validation score |
| `/lab` | generate | decompose a claim |
| `/experiments` | generate | cheap / strong / hostile test plan |
| `/evidence` | A·B·H | **trust center**: verdict + explanation + calibration + self-critique |
| `/graph` | D | dependencies + auto-detected contradictions |
| `/memory` | C | versioned hypothesis history (localStorage) |
| `/archive` | — | indexed local research |
| `/benchmark` | E | BAPA + 24 multi-domain, scored |

## Validation status

`node scripts/run-all-benchmarks.mjs`: BAPA 8/8 (5/5 major), multi-domain 24/24,
contradictions surfaced (1 hard, 3 soft). Production build: 11 static routes.
