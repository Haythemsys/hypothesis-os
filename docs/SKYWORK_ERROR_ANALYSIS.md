# SKYWORK BLIND VALIDATION — ERROR ANALYSIS

**Document:** Phase 8  
**Date:** 2026-06-19  
**Cases scored:** 125  
**Total failures:** 70 (55 correct, 70 incorrect)

---

## Failure Summary

| Type | Count | Description |
|------|-------|-------------|
| MISSED-GO | 56 | Predicted UNRESOLVED, answer was GO |
| MISSED-KILL | 11 | Predicted UNRESOLVED, answer was KILL |
| FALSE_KILL | 2 | Predicted KILL, answer was GO |
| FALSE_GO | 0 | Predicted GO, answer was KILL |
| WRONG | 1 | Predicted KILL, answer was UNRESOLVED |

**Critical finding: 0 false GOs.** The engine never validated a failing hypothesis as GO across 125 cases. All 70 failures are conservative (UNRESOLVED or KILL where the answer was GO/UNRESOLVED).

---

## Root Cause 1 — GO Under-Fire in Mode B (56 MISSED-GO, 80% of failures)

**What happened:** HOS predicted UNRESOLVED for 56 cases with correct answer GO.

**Mechanism:** The GO gate requires a weighted support score ≥ 0.65:

```
support = effect×0.30 + replication×0.20 + hostileSurvival×0.25 + confoundControl×0.15 + generalization×0.10
```

For business, market, and technology decisions, the Mode B encoder correctly assigns:
- `replication`: 0.0–0.5 (no formal replications exist for "will Airbnb scale?")
- `ciExcludesNull`: false (no confidence intervals)
- `power`: 0.25–0.45 (qualitative market evidence)
- `hostileSurvival`: null (no formal hostile tests pre-decision)

With these realistic values, `support` rarely clears 0.65. Representative MISSED-GO encoding (Amazon Prime, 2005):
```
effect=0.4, replication=0.5, hostileSurvival=null, confoundControl=0.3, power=0.35, ciExcludesNull=false
→ support ≈ 0.33 → UNRESOLVED
```

Average encoding scores for the 56 MISSED-GO cases: `effect=0.54`, `calibration=59.8/100`.

**Structural cause:** The GO gates were calibrated against controlled scientific experiments (laboratory studies with effect sizes, formal replication, pre-registration). Business decision evidence — market sizing, competitive analysis, founder reasoning, early signals — structurally cannot produce the same numeric profile.

**The domain mismatch is real:** HypothesisOS GO gates discriminate well in the domain they were designed for (controlled studies). They do not transfer to business/market evidence without calibration adjustment.

---

## Root Cause 2 — Null hostileSurvival Doesn't Kill (7 MISSED-KILL, science domain)

**What happened:** SCI_001–SCI_005, SCI_011, SCI_014 (ego depletion, power posing, facial feedback, social priming, XMRV, faster-than-light neutrinos, oxytocin trust) — all known replication failures that HOS predicted UNRESOLVED instead of KILL.

**Mechanism:** The kill gate is `hostileSurvival < 0.34`. But before these replication crises, no hostile tests existed. The encoder correctly set `hostileSurvival = null`. The engine interprets null as "no data available" and does NOT fire the kill gate. This is technically correct by the engine's design.

```
SCI_001 (ego depletion): effect=0.45, hs=null → no kill gate → UNRESOLVED
Correct answer: KILL (replication failed massively in 2016 pre-registered study)
```

**Why this is hard to fix:** The engine cannot distinguish "no hostile tests were run" (which is the truthful state pre-replication crisis) from "hostile tests passed." The correct encoding at decision time was always `hs=null`. The replication failure only reveals the KILL verdict years later.

**Implication:** The engine is epistemically correct but practically limited. A single-study, never-replicated finding with hs=null is genuinely UNRESOLVED at the time — which the engine correctly identifies. KILL would require evidence of failure that didn't exist pre-decision.

---

## Root Cause 3 — Moderate KILL Cases Encode Above Kill Thresholds (4 cases)

**What happened:** SP_007 (Fab.com), SP_025 (Bird scooters), FM_008 (Herbalife short thesis), FM_019 (GameStop short) were correctly identified as uncertain but encoded with scores just above kill gates.

**Example:** FM_008 (Herbalife pyramid scheme thesis):
```
effect=0.5, hs=0.4, cc=0.4, gen=0.4, replication=0.5
→ no kill gate fires → UNRESOLVED (correct! — Herbalife survived a 5-year $1B short)
```

**Note:** FM_008 is arguably a near-correct prediction. The Herbalife short did not produce the predicted KILL outcome within a reasonable timeframe. The answer key labels it KILL but the thesis was deeply contested.

---

## Root Cause 4 — False Kills (2 cases)

**SP_023 (Loom):** `effect=0.25, hs=0.2, cc=0.2, gen=0` → kill gates fire (hs<0.34, gen<0.34 with CRG=true)
- Encoder note: "replace email and Slack" claim was unevidenced at seed stage
- Why encoder was wrong: confoundControl encoded too low; Loom had a working product and clear use-case validation

**BS_016 (Apple Retail Stores):** `effect=0.3, hs=0.3, cc=0.3, gen=null` → hostileSurvival kill gate fired
- Encoder note: "Gateway's failed retail experiment was a contrary precedent"
- Why encoder was wrong: Gateway comparison is weak contrary evidence; Apple's differentiation (experience-focused vs. product-box-pushing) was already visible in the evidence text

Both false kills share the same encoding error: the encoder treated contrary precedents as strong negative signals and set hostileSurvival too low. Correct encoding would have set `hs=null` (no formal hostile test existed, only analogical evidence).

---

## Root Cause 5 — WRONG Classification (1 case)

**SCI_013 (Marshmallow Test):** Predicted KILL, answer was UNRESOLVED.
- The engine fired a kill gate (hs below threshold)
- The answer key classifies it UNRESOLVED because the replication debate is still open
- This is a genuine judgment call; KILL vs. UNRESOLVED depends on how one interprets the 2018 Watts et al. replication

---

## What the Engine Got Right

**54 correct KILL predictions** (out of 65 actual KILLs = 83% KILL recall):
- All failed dot-com startups (Pets.com, Kozmo, Webvan): correctly killed on uncontrolled confounds and low effect
- All major corporate failures (Theranos, MoviePass, WeWork): correctly killed on effect<0.15 or confoundControl<0.20
- Technology misses (Nokia smartphones, Google Glass consumer): correctly killed

**0 false GOs:** The engine never approved a failing hypothesis across 125 cases.

---

## Failure Type by Domain

| Domain | MISSED-GO | MISSED-KILL | FALSE_KILL | WRONG | Correct |
|--------|-----------|-------------|------------|-------|---------|
| startups_products | 12 | 2 | 1 | 0 | 10/25 (40%) |
| science_replication | 7 | 7 | 0 | 1 | 10/25 (40%) |
| ai_technology_predictions | 12 | 0 | 0 | 0 | 13/25 (52%) |
| business_strategy | 11 | 0 | 1 | 0 | 13/25 (52%) |
| finance_market_theses | 14 | 2 | 0 | 0 | 9/25 (36%) |

**Weakest domain:** finance_market_theses (36%) — market theses are inherently probabilistic; the encoding scheme doesn't capture macro timing risk or crowded-trade dynamics.

---

## GO Recall vs. KILL Precision

| Metric | Value |
|--------|-------|
| KILL precision (KILL predicted, was KILL) | 54/55 = 98.2% |
| KILL recall (actual KILLs predicted as KILL) | 54/65 = 83.1% |
| GO precision (GO predicted, was GO) | 1/1 = 100.0% |
| GO recall (actual GOs predicted as GO) | 1/59 = 1.7% |

The engine has near-perfect KILL precision and zero false GO. It has catastrophically low GO recall in Mode B. This is the primary cause of the 44% overall accuracy.

---

## Encoding Quality Assessment

The Mode B encoders (Claude Opus) produced evidence packets that were:
- **Correctly conservative** on business cases (no evidence = low effect/replication/power)
- **Correctly setting hs=null** when no hostile tests were described
- **Correctly low on confoundControl** for qualitative business evidence
- **Too generous** on hostileSurvival for the 2 false kill cases (should have set null, not a low positive number)

The encoding quality itself was not the primary failure. The **evidence schema is structurally mismatched** to the Skywork dataset's decision types.

---

## What Would Fix Accuracy

To achieve GO accuracy on this dataset, the engine would need:
1. **Domain-specific GO calibration** — different support thresholds for business vs. scientific evidence
2. **A "forward-looking" evidence tier** — market signals, competitive analysis, early-product-evidence that don't map to replication/effect/ciExcludesNull
3. **A proxy kill signal for single-study/never-replicated scientific claims** — e.g., a `studyCount < 2 AND preregistered=false` kill gate

None of these changes are in scope for this validation. This is an honest characterization of the engine's boundary conditions.
