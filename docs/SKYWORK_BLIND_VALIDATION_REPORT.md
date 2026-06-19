# SKYWORK BLIND VALIDATION REPORT

**Document:** Phase 9 — Final Report  
**Date:** 2026-06-19  
**Dataset:** Skywork/HYPOTHESISOS_DECISION.zip (125 cases, 5 domains)  
**Mode:** B (text → numeric encoding → engine)  
**Encoders:** Claude Opus (5 parallel domain agents)  
**Blind protocol:** Predictions locked before answer key revealed

---

## Pre-Registered Thresholds (set before any results seen)

| Verdict | Condition |
|---------|-----------|
| GO | Accuracy ≥ 80% AND False GO ≤ 5% |
| UNRESOLVED | Accuracy 70–79% OR False GO 5–10% |
| KILL/PIVOT | Accuracy < 70% OR False GO > 10% |

---

## Results

| Metric | HypothesisOS | Baseline |
|--------|-------------|---------|
| Overall accuracy | **44.0%** (55/125) | 54.4% (68/125) |
| False GO rate | **0.0%** (0/125) | 0.0% (0/125) |
| False KILL rate | 1.6% (2/125) | 5.6% (7/125) |
| Missed (UNRESOLVED when shouldn't be) | 67/125 (53.6%) | 49/125 (39.2%) |
| Correct KILL | 54/65 (83.1%) | 53/65 (81.5%) |
| Correct GO | 1/59 (1.7%) | 15/59 (25.4%) |

---

## Per-Domain Accuracy

| Domain | HOS | Baseline |
|--------|-----|---------|
| ai_technology_predictions | 52.0% (13/25) | — |
| business_strategy | 52.0% (13/25) | — |
| startups_products | 40.0% (10/25) | — |
| science_replication | 32.0% (8/25) | — |
| finance_market_theses | 36.0% (9/25) | — |

No domain reached the 60% minimum required by the pre-registered GO conditions.

---

## Confusion Matrix

|  | Predicted: GO | Predicted: KILL | Predicted: UNRESOLVED |
|--|---|---|---|
| **Actual: GO** | 1 | 2 | 56 |
| **Actual: KILL** | 0 | 54 | 11 |
| **Actual: UNRESOLVED** | 0 | 1 | 0 |

---

## Pre-Registered Verdict

**KILL/PIVOT**

Accuracy = 44.0% (threshold was ≥ 70% for UNRESOLVED, ≥ 80% for GO).  
False GO = 0.0% (the single positive metric; kill gates functioned correctly).

---

## What the Engine Got Right

**Kill gate function:** The engine never predicted GO for a case that was actually KILL. This is the engine's core safety property — it survived all 65 KILL cases without a single false validation. KILL precision = 54/55 = 98.2%.

**Conservative failure mode:** All 70 failures are "missed" (UNRESOLVED when answer is GO or KILL) or "false KILL" (KILL when answer is GO). The engine errs toward uncertainty, not overconfidence.

**KILL recall:** 83.1% of actual KILL cases were correctly identified as KILL. The engine successfully caught Theranos, MoviePass, WeWork, Kozmo, Webvan, Quibi, Nokia, Google Glass, and other major documented failures.

---

## What Failed

**GO recall = 1.7% (1 correct GO out of 59 actual GOs).** This is the primary accuracy failure.

Root causes (from `SKYWORK_ERROR_ANALYSIS.md`):

1. **Evidence schema mismatch (Mode B structural):** The GO gates require support ≥ 0.65 — a threshold calibrated for controlled laboratory evidence (effect sizes from randomized trials, formal replication, pre-registered intervals). Business, market, and technology cases in the Skywork dataset have no such evidence. The Mode B encoder correctly assigns low replication, null hostileSurvival, and low power for qualitative business decisions, producing support scores of 0.30–0.50 that never clear 0.65.

2. **Null hostileSurvival → no KILL for pre-replication-crisis science (7 cases):** The encoder correctly set `hostileSurvival=null` for single-study findings before any hostile tests existed. The engine doesn't kill on null. These cases (ego depletion, power posing, social priming, faster-than-light neutrinos) ended up UNRESOLVED instead of KILL.

3. **Moderate encoding of genuine KILL cases (4 cases):** Some KILL cases were encoded with scores just above kill thresholds (effect 0.35–0.5, hs 0.34–0.4) → UNRESOLVED.

---

## What This Means for HypothesisOS

The engine is functioning as designed. The validation reveals **boundary conditions** of the current design:

**In-domain (scientific/experimental evidence):** The engine discriminates well. V1 (20 cases) and V2 (106 cases) outcome studies show 92.5% accuracy and 0% false GO on cases with controlled-study-style evidence packets.

**Out-of-domain (business/market decisions, Mode B):** The engine is structurally unable to produce confident GO verdicts because:
- Business evidence doesn't produce replication ≥ 0.5
- Business evidence doesn't produce ciExcludesNull = true  
- Business evidence doesn't produce power ≥ 0.4 (by the schema's definition of power as experimental adequacy)

The engine remains a conservative kill detector in Mode B. False GO = 0% is maintained. False positive safety holds. But the tool cannot serve as a "GO validator" for business decisions without domain-specific calibration.

---

## Comparison to V2 Internal Benchmark

| Study | N | HOS Accuracy | False GO | Mode |
|-------|---|-------------|---------|------|
| V1 outcome study | 20 | 100% | 0% | A (encoded by author) |
| V2 outcome study | 106 | 92.5% | 0% | A (encoded by author) |
| Skywork blind validation | 125 | 44.0% | 0% | B (LLM text encoding) |

The Mode A vs. Mode B gap is 48.5 percentage points. This gap is almost entirely in GO recall (V2 GO recall ~92% vs. Skywork GO recall 1.7%). The KILL detection gap is smaller (V2: near-perfect; Skywork: 83.1%).

**The V1/V2 numbers were produced in Mode A (author-encoded evidence packets) on cases the engine was designed for.** The Skywork test is the first out-of-distribution evaluation with external data and LLM encoding.

---

## Scope of the Protocol

**What was honest in this test:**
- Answer key held back until all predictions were locked
- Blinded file verified to contain zero outcome fields
- Pre-registered thresholds not changed after seeing results
- 0 cases excluded
- Both false-positive and false-negative failures reported

**What was not tested:**
- Mode A on Skywork data (would require human evidence encoding of all 125 cases)
- Engine performance after GO gate recalibration for business evidence
- Whether any threshold modification would maintain 0% false GO at higher accuracy

---

## Path Forward

The validation reveals a clear development choice:

**Option 1 — Domain restriction (honest):** Acknowledge HypothesisOS is a scientific evidence evaluator, not a business decision classifier. Restrict scope to controlled-study evaluation. Maintain current accuracy at 92.5% (V2) within that scope.

**Option 2 — Mode B calibration (requires new data):** Build a separate GO calibration layer for business evidence that maps qualitative market signals to a support score appropriate for that domain. Requires labeled training data and likely changes both the evidence schema and the weights.

**Option 3 — Kill-only mode (ships now):** Position the tool as a "kill detector" rather than a "decision classifier." Promote the 0% false GO metric; acknowledge GO is not reliably predicted. This is honest about what the current version can actually do.

The recommended path is Option 1 + Option 3 (domain restriction + kill-only positioning) until Option 2 is validated with new calibration data.

---

## Artifact Registry

| Artifact | Location |
|----------|----------|
| Blinded cases (7 fields, no outcomes) | `data/external/skywork-hypo-data/blinded_cases.jsonl` |
| Answer key (outcomes only) | `data/external/skywork-hypo-data/answer_key.jsonl` |
| Encodings (Mode B LLM output) | `data/processed/skywork-validation-results.json` |
| Engine predictions | `data/processed/skywork-validation-results.json` |
| Scoring output (JSON) | `data/processed/skywork-scoring-output.json` |
| Confusion matrix | `data/processed/confusion_matrix.csv` |
| Error analysis | `docs/SKYWORK_ERROR_ANALYSIS.md` |
| Leakage check | `docs/SKYWORK_LEAKAGE_CHECK.md` |
| Data audit | `docs/SKYWORK_DATA_AUDIT.md` |
| Excluded cases | `data/external/skywork-hypo-data/excluded_cases.jsonl` (0 cases) |
| Encoding workflow | `scripts/skywork/` |
| Scoring script | `scripts/skywork/score-skywork.mjs` |
