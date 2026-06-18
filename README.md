# HypothesisOS

A research **operating system** for evaluating hypotheses. Not a chat.

**Input:** a hypothesis. **Output:** `GO` / `KILL` / `UNRESOLVED`, with the evidence, the
reason, a calibration score, and a self-critique it had to survive.

Every feature exists to answer one question: *does this improve hypothesis evaluation?* If it doesn't, it isn't here.

## v2 — trustworthy, not just interesting

A verdict never appears without justification. v2 adds:

- **Verdict Explanation** — evidence for / against / missing, assumptions, confounds, and why the other verdicts were rejected.
- **Calibration (0–100, HIGH/MED/LOW)** — the system knows when it is uncertain; a verdict can be correct *and* low-confidence.
- **Self-critique** — before finalizing, the engine attacks its own hypothesis, evidence, and verdict; a premature GO is downgraded.
- **Contradiction Engine** — auto-detects when two hypotheses make opposing claims about the same variable.
- **Research Memory** — versioned, traceable hypothesis history ("git for research").
- **Multi-domain benchmarks** — 24 fixtures across Science / Psychology / Business / Marketing / AI, plus the founding BAPA set.

> v2 correctness fix: a hypothesis with **no evidence** is now `UNRESOLVED / LOW`, not a confident `KILL`. Absence of evidence is not evidence of absence.

## Why it exists

It was built — and validated — against a real research program (BAPA, R1–R20) whose
outcomes are already known. HypothesisOS reproduces those verdicts **from evidence
attributes alone**, never from the historical label. See the BAPA Benchmark page.

## The engine

`lib/engine.mjs` is a pure, dependency-free function: `classify(evidence) → {verdict, confidence, support, reasons}`.

It runs three steps with **pre-registered thresholds** (`THRESHOLDS`):

1. **KILL gates** — no effect, fails hostile/confound tests, explained by a confound, or
   the claim asserts generality but doesn't generalize.
2. **GO** — weighted support ≥ 0.65, replicated, interval excludes the null, adequate power.
3. Otherwise **UNRESOLVED**, naming what's missing.

The same `.mjs` powers both the Node benchmark and the Next.js app — one implementation, no drift.

## The 7 surfaces

| Page | Purpose |
|------|---------|
| Dashboard | Verdict counts + self-validation score |
| Hypothesis Lab | Decompose a claim → assumptions, confounds, variables |
| Experiment Engine | Generate cheap / strong / hostile tests |
| Evidence Engine | Score evidence → live GO / KILL / UNRESOLVED |
| Knowledge Graph | Dependencies, support, contradictions between hypotheses |
| Research Archive | Index of indexed local research (218 files) |
| BAPA Benchmark | Self-validation against known outcomes |

## Run

```bash
npm install
npm run dev        # the app (mobile-first)
npm run benchmark  # node scripts/run-benchmark.mjs — prints the 8/8 table, exits 0 on success
```

The benchmark needs **no dependencies** — `node scripts/run-benchmark.mjs` works on a bare checkout.

## Principles

- No fabricated data. No simulated results. No invented evidence.
- Thresholds are pre-registered and visible; verdicts are reproducible.
- The engine classifies from evidence, never from hindsight.
