# Could HypothesisOS have reached BAPA's conclusions earlier?

This is the honest, no-rescue retrospective the mission asked for. The answer is **partly yes** —
and the part it would *not* have shortcut is itself informative.

## What the engine keys on

The two kill-gates that matter for BAPA are `confoundControl` and `generalization` (when the
claim asserts generality). The identity hypothesis is, by construction, a generality claim:
"writing identifies the person *across contexts*." So `claimRequiresGeneralization = true`, and
the generalization gate is live from day one.

## Timeline, replayed

**Phase 0–1 (apparent separation found).** Early BAPA saw author separation and read it as
identity. At that moment the *evidence* was: decent `effect`, but `confoundControl ≈ 0.1`
(author was collinear with genre) and `generalization` untested. Feed that to the engine:

- `confoundControl 0.10 < 0.20` → **KILL gate fires.**

The engine would **not** have called identity GO. It would have refused to confirm and flagged
the confound as the blocker — at the moment the effect was first seen, not phases later.

**Phase 2 (domain-shift demolition).** Once the S2 cross-domain test destroyed separation
(`hostileSurvival ≈ 0.10`, `generalization ≈ 0.05`), the verdict is over-determined: three gates
fire at once. The engine reaches **KILL** the instant that one hostile test exists.

So: the *cheap* hostile test (strip topic, test out-of-domain) is the whole ballgame, and the
Experiment Engine puts that test in **tier 1 (CHEAP KILL)** for any identity-class claim. The
engine's bias is to run the claim-ending test first.

## What it would **not** have done

It would not have *pre-killed* identity before any evidence existed. With `confoundControl`
simply unmeasured (not low), the verdict is **UNRESOLVED — confound not controlled**, not KILL.
That's correct: the failure of identity-in-text is an empirical result, not an armchair one. The
engine shortens the path to the test; it does not skip the test.

## The mirror image: what it correctly kept alive

The same gates that kill identity **confirm** the findings that actually survived:

- **context_dominance** → GO (support 0.89): high effect, replicated, survives hostile tests,
  generalizes to unseen authors.
- **temporal_stability** → GO (support 0.78): the claim is *within-context*, so the
  generalization gate is off — it is not punished for a cross-context test it never claimed.

A naive "kill anything identity-adjacent" heuristic would have wrongly killed these. The engine
keeps them because the evidence, not the topic, decides.

## Verdict on the verdict

| Hypothesis | Earliest point engine could KILL | BAPA's actual kill point | Saved |
|---|---|---|---|
| identity_static | first confounded measurement | Phase 2 | ~1–2 phases |
| cognitive_fingerprint | with identity (depends on it) | Phase 2 | ~1–2 phases |
| model_fingerprint | first dynamics−lexical Δ with CI∋0 | R11 (RAID) | the wasted build |
| portable_register | first cross-context re-ID at chance | R18/R20 | — (test was the point) |

**Conclusion:** HypothesisOS would have moved the kill decisions *earlier by forcing the
confound/generalization test to the front* — but it would not have manufactured the conclusion
ahead of the evidence. That is the design goal: fail fast on cheap evidence, never on hindsight.
