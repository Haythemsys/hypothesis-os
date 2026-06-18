# HypothesisOS — Phase NEXT Report (v2)

**Objective:** turn HypothesisOS from *interesting* into *trustworthy*. A verdict must never
appear without justification, calibration, and a surviving self-critique.

**Outcome: delivered.** Every phase A–H is implemented and validated; the production build
ships 11 static routes; all benchmarks pass.

## A correctness bug found and fixed (evidence-first)

Running v1 on a fresh hypothesis with **no evidence** returned `KILL` at **0.95 confidence** —
the kill-gates fired on absent (`?? 0`) values. v2 separates **measured** from **unmeasured**:
a kill-gate fires only on a number below its floor. An untested hypothesis is now
**UNRESOLVED / LOW CONFIDENCE**, never a confident KILL. BAPA still scores 8/8 because every
BAPA value is a real measurement.

## Phase-by-phase

| Phase | Deliverable | Module | Status |
|-------|-------------|--------|:------:|
| A | Verdict Explanation Layer — for / against / missing / assumptions / confounds / confidence / why-not-X | `lib/explain.mjs` | ✅ |
| B | Calibration Engine — 0–100, HIGH/MED/LOW, limiting factor | `lib/calibrate.mjs` | ✅ |
| C | Research Memory — versioned, traceable, "git for research" | `lib/memory.mjs` + `/memory` | ✅ |
| D | Contradiction Engine — auto-detect opposing claims | `lib/contradict.mjs` + `/graph` | ✅ |
| E | Multi-domain benchmarks — 24 hypotheses across 5 domains | `lib/benchmarks/*` | ✅ |
| F | Marketplace architecture (design only) | `docs/MARKETPLACE_ARCHITECTURE.md` | ✅ |
| G | Mobile excellence — safe-area, thumb targets, touch, no-scrollbar nav | `globals.css`, `Nav.tsx`, `layout.tsx` | ✅ |
| H | Autonomous self-critique — attack hypothesis/evidence/verdict, downgrade premature GO | `lib/critique.mjs` | ✅ |

## Validation (reproducible)

`node scripts/run-all-benchmarks.mjs`:

```
BAPA: 8/8        BAPA major: 5/5
Science 5/5 · Psychology 5/5 · Business 5/5 · Marketing 4/4 · AI 5/5  → 24/24
Contradictions: 1 hard (Veblen ↔ law of demand), 3 soft (BAPA identity cluster)
ALL BENCHMARKS PASS ✓
```

Production build: 11 routes, all prerendered static, ~102–114 kB First Load JS.

## Multi-domain benchmark coverage (Phase E)

24 curated fixtures whose evidence profiles reflect the established replication/consensus
record — e.g. smoking→GO, homeopathy→KILL, power-posing→KILL, ego-depletion→KILL,
spacing-effect→GO, scaling-laws→GO, "longer context always better"→KILL,
growth-mindset(large/universal)→UNRESOLVED. These are teaching fixtures, **not** new
experimental data.

## Trust pipeline

Every verdict now flows: `classify → explain → calibrate → self-critique → final`. A GO that
fails a hostile attack is downgraded to UNRESOLVED; any LOW-calibration verdict is flagged.

## What is NOT done (honest scope)

- Marketplace is **design only** (Phase F) — no code, no server.
- Research Memory persists to **localStorage** (per-device); no sync/backend.
- Multi-domain evidence values are **curated fixtures**, not freshly collected datasets.

## Principles held

No fabricated data, no simulated results, no invented evidence. Thresholds remain
pre-registered and visible. The engine — not popularity, not hindsight — issues verdicts.
