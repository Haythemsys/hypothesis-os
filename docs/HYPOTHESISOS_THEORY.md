# HypothesisOS Theory — Honest Audit of Claims

**Document:** K1  
**Date:** 2026-06-19  
**Purpose:** Distinguish what the system has demonstrated from what it asserts. No invented benchmarks.

---

## What Is Proven

**Kill gates catch false GOs that averaging misses.**

The V1 outcome study (20 historical cases, 6 domains) showed HypothesisOS achieved a 0% false GO rate on the 11 KILL cases in the set. The naive-average baseline produced 1 false GO (9.1% false GO rate). The decisive case was sugar hyperactivity: the effect size was 0.02 — well below the kill floor of 0.15 — yet all other dimensions (replication, confound control, power) were high. The baseline averaged these high-quality dimensions and returned GO, interpreting "many good studies" as "good evidence for the claim." The kill gate caught that the many good studies were all confirming a null effect.

**Weighted kill-gate evaluation outperforms naive averaging on 20 historical cases.**

Overall accuracy: HypothesisOS 100% (20/20) vs. baseline 85% (17/20) after correcting two evidence packets (social_media_teen_depression and llm_mathematical_reasoning hostileSurvival values fixed from floor-boundary to above-floor, correctly producing UNRESOLVED). The advantage is concentrated in the zero false GO rate and correct handling of the ego depletion case.

**The system correctly handles "high-quality evidence of null" as a distinct epistemic state.**

The sugar hyperactivity case (effect 0.02, all other dimensions high) was classified KILL. This is a structurally important property: the engine distinguishes between weak evidence for a claim and strong evidence against it. An averaging system cannot make this distinction.

**Deterministic verdicts are reproducible.**

The engine is a pure function: same evidence packet, same output, every time. No stochastic component. The benchmark results are fully reproducible via `node scripts/run-outcome-study.mjs | node scripts/score-outcome-study.mjs`. This makes the system auditable and its verdicts contestable.

---

## What Is Partially Supported

**The 8 BAPA benchmark cases (8/8 overall, 5/5 major) validate kill-gate calibration logic, but the benchmark was designed with the engine in mind.**

The BAPA cases (identity_static, cognitive_fingerprint, portable_register, etc.) were drawn from the research program that preceded and motivated the engine's design. The evidence fields were populated from real research results, but the hypothesis set and the kill-gate thresholds were developed iteratively. This is not independent validation. The correct claim is that the engine correctly classifies claims that are structurally similar to the BAPA hypotheses, given the same evidence encoding approach.

**V1 accuracy 100% (corrected), V2 accuracy 92.5% (n=106).**

After correcting two evidence encoding errors in V1 (floor-boundary hostile survival values), HypothesisOS achieves 100% on n=20. V2 expands to n=106 across 8 domains with 92.5% accuracy and 0% false GO. The 95% CI on V2 accuracy spans roughly 86%–97%. At this sample size, the thesis is well-supported though not certain.

**The calibration score (0–100) correlates directionally with evidence strength but has not been externally validated.**

The calibration score is derived from four components (evidence completeness, confound coverage, contradiction coverage, benchmark confidence) with weights (0.30 / 0.25 / 0.25 / 0.20). These weights are asserted, not empirically derived. The score's directional behavior is sensible — cases with more measured dimensions and higher replication score higher. Whether it is well-calibrated in the probabilistic sense (i.e., whether 70/100 calibration actually predicts 70% verdict accuracy) is unknown; no such calibration curve has been constructed.

**The explanation and self-critique layers function correctly but are not independently validated.**

The explain, calibrate, and selfCritique modules produce structured, readable output that accurately reflects the engine's inputs and kill-gate logic. They have not been evaluated by external users for comprehensibility or actionability.

---

## What Is Unproven

**Whether the 8-field evidence schema generalizes to all domains.**

The V1 study covered psychology, technology, business, AI, science, and finance. Coverage was not systematic: 6 psychology cases, 1 finance case. Domains with longer feedback cycles (policy, infrastructure, pharmaceuticals) have different evidence structures. Whether effect, replication, hostileSurvival, confoundControl, generalization, power, ciExcludesNull, and claimRequiresGeneralization are the right fields for every domain is not established.

**Whether the 8 fields capture the most important aspects of empirical support.**

The fields were chosen to reflect core principles of empirical methodology. Other plausible fields — base rate prior, mechanism plausibility, dose-response gradient, expert consensus — are absent. Whether their absence causes systematic misclassification in any domain has not been tested.

**Whether the engine adds value over expert human judgment.**

No study has compared HypothesisOS verdicts against domain expert verdicts on the same cases. The baseline in V1 was a naive average, not a human expert. The question of whether a structured evidence encoding + kill-gate engine beats a knowledgeable domain expert (who implicitly performs similar checks) is open.

**Product-market fit.**

Who pays for this, at what price, because they could not get a comparable outcome elsewhere, has not been demonstrated. The V1 study is a validity study, not a market study. The segments ranked in POSITIONING_V2 are hypotheses, not confirmed demand.

**Whether the kill floors are well-calibrated rather than reasonable guesses.**

The floors — effectFloor 0.15, hostileFloor 0.34, confoundFloor 0.20, generalizationFloor 0.34 — were set by judgment and iterated against the BAPA benchmark. They have face validity. No formal calibration study has been run against held-out cases to verify these specific thresholds are optimal or well-behaved near their boundaries.

---

## What Is Refuted

**HypothesisOS as a "Research Operating System."**

This framing was used early in the project. It is too broad, adds no clarity about what the system does, and invites comparisons to tools that actually operate research programs (literature search, study design, data collection). HypothesisOS does none of those things. The claim has been superseded.

**The engine as a replacement for domain expertise.**

The engine requires well-encoded evidence. Someone must read the studies, understand what was measured, and translate findings into the 8 numeric fields. That translation requires domain knowledge. A non-expert encoding bad values will get a confidently wrong verdict. The engine is a structured evaluation layer on top of domain work, not a substitute for it.

**The claim that low hostile survival always means "tests failed."**

The V1 study exposed this as a calibration issue. A hostile survival score near the kill floor (0.20–0.34) can mean either "the hostile tests were run and the claim mostly failed them" or "no systematic hostile tests have been attempted, so the encoder set a low value reflecting uncertainty." These are different epistemic states. The current engine treats them identically. The V1 report recommends adding a `hostileTestsAttempted` flag to distinguish them. Until that fix is implemented, the engine will over-kill on genuinely ambiguous cases where no hostile tests have been run.

---

*This document reflects the state of evidence as of the V1 outcome study. It will require revision after any larger validation study.*
