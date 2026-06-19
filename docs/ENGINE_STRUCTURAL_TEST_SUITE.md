# ENGINE STRUCTURAL TEST SUITE

**Document type:** Reproducible experiment record  
**Date:** 2026-06-19  
**Runner:** `node scripts/engine-structural-tests.mjs`  
**Engine version:** `lib/engine.mjs` v2  
**Self-critique version:** `lib/critique.mjs` (post-fix)  
**Status:** 10/10 PASS (EXP-10 failed before the fix; passed after)

---

## Scope and Hard Limitation

All 10 experiments operate entirely within the **closed evidence-vector space**: they pass hand-crafted numeric evidence packets directly to `classify()` and `selfCritique()`. They verify that the engine's internal logic—kill gates, GO gates, the weighted support formula, and self-critique annotations—behaves as specified.

**What these tests do NOT validate:**

> The translation from real-world text evidence to numeric fields (Mode B: raw text → evidence_packet) is not tested here. A user or LLM encoding the same hypothesis may produce very different numeric values. These tests can confirm the engine is internally consistent; they cannot confirm the encoding is accurate.

All structural claims in this document are about the engine's logic layer, not about the engine's validity as a real-world decision tool.

---

## Engine Constants Under Test

```
effectFloor        = 0.15   (kill gate threshold)
hostileFloor       = 0.34   (kill gate threshold)
confoundFloor      = 0.20   (kill gate threshold)
generalizationFloor = 0.34  (kill gate threshold, only when CRG=true)
goSupport          = 0.65   (GO gate: weighted support score)
goReplication      = 0.50   (GO gate: independent replications)
goPower            = 0.40   (GO gate: statistical power / data adequacy)

Support weights: effect×0.30 + replication×0.20 + hostileSurvival×0.25
              + confoundControl×0.15 + generalization×0.10 (or 0.5×0.10 when CRG=false)
```

---

## Experiments

---

### EXP-01 — Effect Kill Gate Below Floor

**Pre-registered kill criterion:** `classify()` must return `KILL` when `effect < effectFloor`.

| Field | Value |
|-------|-------|
| effect | **0.14** |
| replication | 0.80 |
| hostileSurvival | 0.80 |
| confoundControl | 0.80 |
| generalization | 0.80 |
| power | 0.80 |
| ciExcludesNull | true |
| claimRequiresGeneralization | false |

**Actual result:** `verdict=KILL`, `reasons=["no measurable effect (effect 0.14 < 0.15)"]`  
**Status: PASS**

---

### EXP-02 — Effect Kill Gate Exactly at Floor (Boundary)

**Pre-registered kill criterion:** `classify()` must NOT return `KILL` when `effect = effectFloor` (gate is strict `<`, not `≤`).

| Field | Value |
|-------|-------|
| effect | **0.15** |
| (all others) | 0.80 / true / false |

**Actual result:** `verdict=UNRESOLVED` (support=0.58, below goSupport=0.65; no kill gate fires)  
**Status: PASS**

**Note:** At exactly 0.15, the effect kill gate does not fire. The hypothesis lands in UNRESOLVED because effect=0.15 produces a low contribution to the support score (0.15×0.30=0.045) and total support doesn't reach 0.65. This is the expected behavior: a floor value is the first value that does not kill, not the last value that does.

---

### EXP-03 — Absence of Evidence Does Not Kill (hostileSurvival=null)

**Pre-registered kill criterion:** `classify()` must NOT return `KILL` when `hostileSurvival=null`. v2 principle: only measured values can trigger kill gates.

| Field | Value |
|-------|-------|
| effect | 0.70 |
| hostileSurvival | **null** |
| (others) | 0.80 / true / false |

**Actual result:** `verdict=UNRESOLVED` (support=0.54 — hostileSurvival=null contributes 0×0.25=0 to support, reducing it below 0.65)  
**Status: PASS**

**Note:** null does not kill, but it does depress the support score (unmeasured fields contribute 0). The result is UNRESOLVED, which is correct: without hostile test data, the engine withholds both GO and KILL.

---

### EXP-04 — Hostile Survival Kill Gate Below Floor

**Pre-registered kill criterion:** `classify()` must return `KILL` when `hostileSurvival < hostileFloor` (0.33 < 0.34).

| Field | Value |
|-------|-------|
| effect | 0.70 |
| hostileSurvival | **0.33** |
| (others) | 0.80 / true / false |

**Actual result:** `verdict=KILL`, `reasons=["fails hostile/confound tests (survival 0.33 < 0.34)"]`  
**Status: PASS**

---

### EXP-05 — Confound Control Kill Gate Below Floor

**Pre-registered kill criterion:** `classify()` must return `KILL` when `confoundControl < confoundFloor` (0.19 < 0.20).

| Field | Value |
|-------|-------|
| confoundControl | **0.19** |
| (others) | 0.70–0.80 / true / false |

**Actual result:** `verdict=KILL`, `reasons=["explained by an uncontrolled confound (control 0.19 < 0.2)"]`  
**Status: PASS**

---

### EXP-06 — Generalization Gate Fires with CRG=true

**Pre-registered kill criterion:** `classify()` must return `KILL` when `generalization < generalizationFloor AND claimRequiresGeneralization=true`.

| Field | Value |
|-------|-------|
| generalization | **0.33** |
| claimRequiresGeneralization | **true** |
| (others) | 0.70–0.80 / true |

**Actual result:** `verdict=KILL`, `reasons=["claim asserts generality but it does not generalize (gen 0.33 < 0.34)"]`  
**Status: PASS**

---

### EXP-07 — Generalization Gate Silent with CRG=false

**Pre-registered kill criterion:** `classify()` must NOT return `KILL` from a low generalization score when `claimRequiresGeneralization=false`. Identical evidence to EXP-06 except CRG flipped.

| Field | Value |
|-------|-------|
| generalization | 0.33 (same as EXP-06) |
| claimRequiresGeneralization | **false** |

**Actual result:** `verdict=GO` (no kill gate fires; CRG=false means generalization is neutralized to 0.5 in support score, yielding support=0.74 ≥ 0.65)  
**Status: PASS**

**Note:** This experiment confirms that EXP-06 and EXP-07 differ only on `claimRequiresGeneralization`, producing KILL vs. GO from identical numeric evidence. The gate is correctly conditional on claim scope, not on the numeric value alone.

---

### EXP-08 — All GO Criteria Met

**Pre-registered kill criterion:** `classify()` must return `GO` when all four criteria are satisfied simultaneously.

GO criteria: `support ≥ 0.65` AND `replication ≥ 0.50` AND `ciExcludesNull = true` AND `power ≥ 0.40`

| Field | Value |
|-------|-------|
| effect | 0.75 |
| replication | 0.80 |
| hostileSurvival | 0.80 |
| confoundControl | 0.80 |
| generalization | 0.80 |
| power | 0.80 |
| ciExcludesNull | true |
| claimRequiresGeneralization | false |

Computed support: 0.75×0.30 + 0.80×0.20 + 0.80×0.25 + 0.80×0.15 + 0.50×0.10 = 0.76

**Actual result:** `verdict=GO`, `reasons=["support 0.76 >= 0.65", "replicated (0.80 >= 0.5)", "interval excludes the null", "adequate power (0.80 >= 0.4)"]`  
**Status: PASS**

---

### EXP-09 — Self-Critique Downgrades GO When Hostile Test Unmeasured

**Pre-registered criterion:** When `classify()` returns GO but `hostileSurvival=null`, the self-critique "hostile test" attack lands and `finalVerdict` must be `UNRESOLVED`.

Design: set all fields to maximum to clear the GO gate with `hostileSurvival=null` (support = 0.30+0.20+0+0.15+0.05 = 0.70 ≥ 0.65).

| Field | Value |
|-------|-------|
| effect | 1.0 |
| replication | 1.0 |
| hostileSurvival | **null** |
| confoundControl | 1.0 |
| generalization | null |
| power | 1.0 |
| ciExcludesNull | true |
| claimRequiresGeneralization | false |

**Actual result:**
```
classify verdict:   GO (support=0.70)
finalVerdict:       UNRESOLVED
downgrade:          "GO downgraded to UNRESOLVED: 1 hostile attack(s) landed on the evidence/verdict."
attack landed:      "Does the effect survive removing the easy cue (hostile test)?"
```

**Status: PASS**

**Implication for evidential path:** The shortest path to a GO verdict requires a non-null `hostileSurvival ≥ 0.34`. A hypothesis with every other field perfect but no hostile test data will always be downgraded. The minimum evidence packet for GO to survive self-critique is:
```
effect ≥ 0.15, replication ≥ 0.5, hostileSurvival ≥ 0.34, confoundControl ≥ 0.20,
power ≥ 0.4, ciExcludesNull = true
+ support (weighted) ≥ 0.65
```

---

### EXP-10 — Self-Critique KILL Annotation Bug (Pre-Registered Failure Before Fix)

**Pre-registered criterion:** When `classify()` returns KILL via the hostile survival gate (`hostileSurvival=0.20 < hostileFloor=0.34`), the self-critique attack "Is KILL based on a MEASURED failure?" must report `survives=true` (confirming the kill is evidence-based).

**Bug discovered before fix:**

`critique.mjs` line 64–65 used a generic key construction to look up kill thresholds:

```javascript
// BEFORE FIX (line 64-65):
survives: ["effect", "hostileSurvival", "confoundControl", "generalization"]
  .some((k) => isNum(e[k]) && e[k] < (THRESHOLDS[k + "Floor"] ?? THRESHOLDS.effectFloor)),
```

Key lookup failures:
- `"hostileSurvival" + "Floor"` → `THRESHOLDS.hostileSurvivalFloor` → `undefined` → fallback to `effectFloor = 0.15`
- `"confoundControl" + "Floor"` → `THRESHOLDS.confoundControlFloor` → `undefined` → fallback to `effectFloor = 0.15`

Correct threshold keys are `hostileFloor` (0.34) and `confoundFloor` (0.20).

**Effect of bug:** When a KILL fires via `hostileSurvival=0.20` (correctly < 0.34), the annotation checks `0.20 < 0.15` → false → reports `survives=false`, meaning "this KILL is NOT based on measured evidence." This is the opposite of true. The KILL is correctly evidence-based.

**Fix applied (critique.mjs):**
```javascript
// AFTER FIX:
survives: (isNum(e.effect) && e.effect < THRESHOLDS.effectFloor) ||
          (isNum(e.hostileSurvival) && e.hostileSurvival < THRESHOLDS.hostileFloor) ||
          (isNum(e.confoundControl) && e.confoundControl < THRESHOLDS.confoundFloor) ||
          (isNum(e.generalization) && e.generalization < THRESHOLDS.generalizationFloor),
```

**Actual result before fix:** `killAttackSurvives=false` (BUG)  
**Actual result after fix:** `killAttackSurvives=true` (CORRECT)  
**Status: PASS (after fix)**

---

## Summary

| Experiment | Gate / Feature | Pre-registered outcome | Result |
|-----------|----------------|----------------------|--------|
| EXP-01 | Effect kill gate (below floor) | KILL | PASS |
| EXP-02 | Effect kill gate (at boundary) | NOT KILL (UNRESOLVED) | PASS |
| EXP-03 | Null field does not kill | NOT KILL (UNRESOLVED) | PASS |
| EXP-04 | Hostile survival kill gate | KILL | PASS |
| EXP-05 | Confound control kill gate | KILL | PASS |
| EXP-06 | Generalization gate with CRG=true | KILL | PASS |
| EXP-07 | Generalization gate with CRG=false | GO (gate silent) | PASS |
| EXP-08 | All GO criteria met | GO | PASS |
| EXP-09 | Self-critique downgrades borderline GO | UNRESOLVED | PASS |
| EXP-10 | Self-critique KILL annotation (bug fix) | `killAttackSurvives=true` | FAIL → PASS |

**9/10 passed before fix. 10/10 pass after.**

---

## Discovered Self-Critique Weakness

The bug in EXP-10 reveals a structural weakness in the self-critique layer: the KILL verdict annotation ("Is this kill based on measured evidence or absent data?") was silently broken for two of the four kill gates.

**Scope of the bug:** Annotation only. The verdict from `classify()` was correct in all cases — the engine correctly KILLed on measured low hostileSurvival and confoundControl. The bug only affected the `attacks` metadata that informs users whether the KILL was evidence-based. A KILL on `hostileSurvival=0.20` would be annotated as "possibly based on absent data," which is wrong: 0.20 is a measured value below 0.34.

**Why it matters:** The self-critique layer is the transparency interface. Users reading `attacks` to understand why a verdict was issued would see incorrect guidance. A kill that was genuinely evidence-based would be flagged as uncertain, potentially causing users to distrust a correct verdict.

---

## Implication for Shortest Evidential Path

From EXP-09: a GO verdict from `classify()` is always downgraded by `selfCritique()` if `hostileSurvival=null`. This means the shortest evidential path to a surviving GO requires:

1. `hostileSurvival` must be non-null and ≥ 0.34 (to avoid both the kill gate and the self-critique hostile-test attack)
2. `ciExcludesNull = true` (required by GO gate directly)
3. `replication ≥ 0.50` (required by GO gate)
4. `power ≥ 0.40` (required by GO gate)
5. Weighted support ≥ 0.65 (requires combination of effect, replication, hostileSurvival, confoundControl meeting their respective contributions)
6. `confoundControl ≥ 0.20` (kill gate), but also ≥ 0.50 avoids the self-critique confound attack

This analysis was not built in this session. It follows directly from EXP-09 and the support weight formula.

---

## Hard Limitation

All 10 experiments probe the **closed evidence-vector space**: hand-crafted numeric packets → engine → verdict. The tests confirm internal consistency but say nothing about:

1. **Encoding accuracy** — whether a human or LLM converting real-world text evidence to numeric fields produces correct values
2. **Calibration to real outcomes** — whether the thresholds (effectFloor=0.15, goSupport=0.65, etc.) correspond to real-world KILL/GO frequencies
3. **Domain generalization** — whether the GO gates, calibrated for scientific evidence, transfer to business decisions, market theses, or policy questions
4. **Adversarial encoding** — whether a motivated encoder could produce high scores on weak evidence to force a GO verdict

The Skywork blind validation (see `docs/SKYWORK_BLIND_VALIDATION_REPORT.md`) addresses points 1 and 3 and found significant limits in out-of-domain Mode B application.
