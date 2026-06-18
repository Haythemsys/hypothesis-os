# Hypothesis Marketplace — Architecture (Phase F, design only)

**Status: design only. Not built, not public.** This documents the architecture so the trust
guarantees of HypothesisOS survive contact with shared, user-generated content.

## What users would share

- **Hypotheses** — a claim + its domain + declared `implications`.
- **Experiments** — the cheap/strong/hostile plans that test it.
- **Evidence chains** — an ordered set of evidence snapshots, each producing a verdict +
  calibration (i.e. an exported Research-Memory history).

## Core principle: share the chain, not just the verdict

A marketplace that shares only "GO/KILL" badges would launder unsupported claims. So the unit
of sharing is the **evidence chain**: every shared verdict travels with the evidence that
produced it, its calibration score, and its self-critique log. A consumer re-runs the
**same pure engine** locally and must reproduce the verdict — trust is verified, not asserted.

## Data contract (proposed)

```ts
interface SharedHypothesis {
  id: string; title: string; domain: string;
  implications: { var: string; sign: 1 | -1 }[];
  chain: Revision[];               // exported from Research Memory (Phase C)
  finalVerdict: Verdict;
  calibration: number;             // 0–100 at the latest revision
  author: { handle: string; pubkey: string };
  signature: string;              // signs (chain ⊕ finalVerdict) — tamper-evident
  engineVersion: string;          // which THRESHOLDS produced the verdict
}
```

## Integrity model

1. **Reproducibility gate** — on import, recompute `classify`/`calibrate` over `chain`. If the
   local verdict ≠ shared `finalVerdict`, mark **DISPUTED** and show both.
2. **Engine-version pinning** — verdicts are only comparable under the same `THRESHOLDS`;
   `engineVersion` is part of the contract.
3. **Signatures** — author keypair signs the chain; edits break the signature.
4. **Contradiction federation** — run the Phase-D engine across imported hypotheses to flag
   marketplace-wide HARD contradictions (two popular, opposing, both-GO claims).
5. **Calibration-weighted ranking** — never rank by popularity alone; weight by calibration so
   well-evidenced hypotheses surface above confident-but-thin ones.

## Phased rollout (when built)

- **P1 Local export/import** — JSON of a Research-Memory record; manual sharing. No server.
- **P2 Read-only registry** — static, signed, content-addressed; reproducibility gate on fetch.
- **P3 Social layer** — handles, following, calibration-weighted feeds, dispute threads.

## Non-goals (for now)

No central authority deciding truth; no editable verdicts; no popularity-only ranking. The
engine, not the crowd, issues verdicts.
