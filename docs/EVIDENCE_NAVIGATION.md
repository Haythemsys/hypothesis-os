# EVIDENCE NAVIGATION

**Module:** `lib/navigation.mjs`  
**Date:** 2026-06-19  
**Status:** Implemented, tested, UI-integrated

---

## Purpose

When HypothesisOS returns UNRESOLVED, the verdict is correct but incomplete: it says "the evidence doesn't settle this yet" without saying what to collect next. Evidence Navigation fills that gap.

Given an evidence vector and its verdict, `navigate()` returns:
- How far the current support is from the GO threshold
- Which evidence dimension has the highest leverage
- What to collect next
- Whether GO is realistically reachable (navigable) or whether UNRESOLVED is the honest final answer

**What this is not:** Navigation does not relax thresholds, doesn't generate fake GO verdicts, and doesn't allow inflating evidence scores to force a different outcome. It is a read-only analysis of what additional evidence could change the verdict legitimately.

---

## Function Signature

```javascript
import { navigate } from './lib/navigation.mjs';

const nav = navigate(evidenceVector, verdict);
// evidenceVector: the 8-field evidence packet
// verdict: 'GO' | 'KILL' | 'UNRESOLVED' (from selfCritique().finalVerdict)
```

### Return Object

```javascript
{
  verdict,                    // same as input verdict
  currentSupport,             // current weighted support score (0–1)
  goThreshold,                // THRESHOLDS.goSupport = 0.65
  supportGap,                 // max(0, goThreshold - currentSupport)
  navigable,                  // bool: is GO realistically achievable?
  distanceToGo,               // "1 evidence move" / "2 evidence moves" / "2-3" / "3+" / null
  highestLeverageDimension,   // "effect" | "replication" | "hostileSurvival" | "confoundControl" | "generalization"
  highestLeverageLabel,       // human-readable dimension name
  highestLeverageGain,        // max support gain if this dimension is maximized
  unmetGoCriteria,            // ["support", "replication", "ciExcludesNull", "power"] — unmet subset
  recommendedAction,          // text: what evidence to collect next
  explanation,                // text: which GO criteria are met/missing
  impossibleReason,           // text: why UNRESOLVED is the honest final answer (if !navigable)
  dimensionGains,             // full list [{dimension, current, weight, maxGain}] sorted by maxGain
  killedBy,                   // (KILL only) [{gate, value, floor, action}]
}
```

---

## Navigability Criteria

A case is **not navigable** if any of these conditions hold:

| Condition | Threshold | Reason |
|-----------|-----------|--------|
| `effect` is measured AND low | `< 0.20` | Near the kill-gate floor; evidence actively suggests no meaningful signal. Improving other dimensions cannot substitute for a weak effect. |
| `support` near-absent | `< 0.20` | Evidence is essentially missing across all dimensions. This is "not yet tested," not "tested but unclear." |
| All 4 GO criteria unmet AND large gap | `gap > 0.45` | Would require wholesale evidence reconstruction, not incremental improvement. |

**A navigable verdict does NOT mean GO is likely.** It means: if you collected sufficient evidence and that evidence supported the hypothesis, you could reach GO. The evidence itself might still confirm KILL if the hypothesis is wrong.

---

## Navigation Status Labels

The UI distinguishes four states based on `navigable` and `distanceToGo`:

### Recommended next evidence
`distanceToGo` ∈ `"1 evidence move"` | `"2 evidence moves"` | `"2–3 evidence moves"`

The support gap is closeable in 1–3 study cycles. The highest-leverage dimension is identified and an action is provided. Collecting that evidence is the clear next step.

### Requires substantial evidence
`distanceToGo = "3+ evidence moves"`

The case is structurally navigable (no kill gate fired, signal is not absent) but closing the support gap requires rebuilding evidence across multiple dimensions. The case is not urgently actionable; it needs a substantial new evidence program.

### Honest unresolved
`navigable = false`

One of the non-navigable conditions is met: the measured effect is near the kill-gate floor, or overall support is near-zero, or all four GO criteria are unmet with a large gap. In these cases UNRESOLVED is the correct final state with available evidence. Additional evidence *could* resolve it, but the hypothesis has not yet produced a positive enough signal to treat as actionable.

### (GO — navigation complete)
`verdict = GO`

`navigate()` returns immediately. No panel is shown.

---

### Soft vs Hard Navigable (Design Rationale)

The internal navigability check (`navigable = true/false`) is a **soft** structural gate: it fires on near-absent or near-kill evidence. It does not guarantee that GO is reachable in a small number of studies.

The UI label system adds a **hard** overlay: even among structurally navigable cases, those requiring 3+ study cycles are presented differently. On the Skywork blind validation dataset (67 UNRESOLVED cases), the split was:

| UI label | Count | % |
|---|---|---|
| Recommended next evidence (≤ 3 moves) | 47 | 70% |
| Requires substantial evidence (3+ moves) | 20 | 30% |
| Honest unresolved (not navigable) | 0 | 0% |

The 0% honest-unresolved in Skywork reflects the dataset selection: Skywork cases all had measurable positive signals. In production use, "Honest unresolved" will appear when users enter hypotheses with weak or near-absent evidence.

---

## Highest Leverage Dimension

The dimension with the most potential support gain is:

```
maxGain(dimension) = weight(dimension) × (1.0 - current_value)
```

Where current_value = 0 for null/unmeasured fields.

Weights (from engine.mjs):
- effect: 0.30
- replication: 0.20
- hostileSurvival: 0.25
- confoundControl: 0.15
- generalization: 0.10 (only when `claimRequiresGeneralization=true`)

A null field has current_value=0 and thus maxGain=weight (full potential). This is why unmeasured `hostileSurvival` (weight=0.25) often appears as the highest-leverage dimension — it contributes 0 now but could contribute up to 0.25.

---

## Example Output

```
Verdict: UNRESOLVED

Current support: 0.44
GO threshold:    0.65
Gap:             0.21

Highest leverage dimension:
  Effect strength (+0.17 max gain)

Recommended next action:
  Collect stronger direct evidence of effect size — a pre-registered study,
  dose-response data, or an A/B test with a clear outcome metric.

Unmet GO criteria: support, replication, ciExcludesNull

Navigation status:
  Navigable in 2–3 evidence moves.
```

---

## Integration Points

### 1. Evidence Engine page (`/evidence`)
Shows the NavigationPanel live as users adjust sliders. Updates in real-time whenever the verdict is not GO.

### 2. Workflow page (`/workflow`) — Step 4
After "Record evidence & classify," if the verdict is UNRESOLVED or KILL, the NavigationPanel appears below the verdict card.

### 3. API response (`POST /api/hypotheses/:id/classify`)
The classify API now includes a `navigation` field in its response:
```json
{
  "verdict": { ... },
  "explanation": { ... },
  "critique": { ... },
  "navigation": { ... }
}
```

---

## Skywork Blind Validation — Navigation Report

Ran `navigate()` on all 67 UNRESOLVED predictions from the Skywork blind validation.

### Results

| Metric | Count |
|--------|-------|
| Total UNRESOLVED predictions | 67 |
| Navigable | 67 (100%) |
| Not navigable | 0 (0%) |

### By Domain

| Domain | Navigable / Total |
|--------|-------------------|
| startups_products | 14/14 |
| science_replication | 16/16 |
| ai_technology_predictions | 12/12 |
| business_strategy | 11/11 |
| finance_market_theses | 14/14 |

### Top Leverage Dimensions (navigable cases)

| Dimension | Cases | % |
|-----------|-------|---|
| effect | 37 | 55% |
| hostileSurvival | 16 | 24% |
| replication | 14 | 21% |

### Average Support

- Navigable cases: 0.451 (avg)
- GO threshold: 0.65
- Avg gap: ~0.20

### Comparison to Prior Analysis

The prior analysis estimated "34 navigable, 33 not navigable (51%/49%)." The actual result is 67/0 (100%/0%).

**Why they differ — this is an honest finding, not a calibration error:**

All 67 Skywork UNRESOLVED cases had `effect >= 0.20` and `support >= 0.20`. They were UNRESOLVED precisely because they showed a measurable positive signal that didn't reach the GO threshold — not because evidence was absent. The "not navigable" criteria (effect < 0.20 OR support < 0.20) catch a different situation: cases where evidence actively undermines the hypothesis or is near-absent.

In the Skywork dataset, both navigable and non-navigable cases would look like:
- **Navigable (all 67):** "There is a real positive signal here that could be strengthened." — Correct; these are historical cases where something real was happening (Airbnb, Stripe, Zoom, etc.) or where a hypothesis had genuine initial evidence (ego depletion pre-replication-crisis).
- **Non-navigable (0 found):** "There's essentially no positive signal to build upon." — None of the Skywork encodings reached this threshold; every case had at least some measurable positive evidence.

**Implication:** The non-navigable zone (effect < 0.20, support < 0.20) is not populated by Skywork cases because the Skywork dataset intentionally selected cases with meaningful evidence — the dataset isn't full of "complete blanks." Non-navigable UNRESOLVED verdicts would appear in practice when a user enters a hypothesis with very weak or essentially absent evidence.

### What "Navigable" Means for These Cases

For the 11 MISSED-KILL cases (true answer: KILL, engine said: UNRESOLVED):
- navigate() correctly says "navigable" — because at the time of the decision, there WAS positive evidence
- The verdict "navigable" means: collecting hostile tests and replication would resolve this
- That collection would reveal a KILL — navigate() doesn't know this, and shouldn't: it works from evidence at the time

For the 56 MISSED-GO cases (true answer: GO, engine said: UNRESOLVED):
- navigate() says "navigable" — correct; more evidence would confirm GO
- The recommended action (usually: stronger effect evidence or independent replication) is what actually happened historically to confirm these cases

---

## Design Invariants (Must Not Be Violated)

1. **Engine thresholds are read-only.** `navigate()` reads `THRESHOLDS.*` but never modifies them.
2. **navigate() never produces a GO verdict.** It returns the input verdict unchanged.
3. **navigable=true does not imply GO is likely.** It means GO is achievable IF evidence is sufficient.
4. **KILL is not navigable to GO.** Only to UNRESOLVED (by addressing the gate).
5. **False GO protection is unchanged.** `navigate()` has no path that bypasses `classify()` or `selfCritique()`.
6. **Null ≠ 0 for navigability.** A null field contributes 0 to current support but represents "not yet tested" — it doesn't trigger the "not navigable" condition (only measured low values do).
