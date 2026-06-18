# Contradiction Engine (Phase D)

Automatically detect when two hypotheses make **opposing claims about the same variable**, so
the contradiction surfaces on the dashboard instead of hiding in a researcher's head.
`lib/contradict.mjs`.

## Model

Each hypothesis may declare `implications`: a list of `{ var, sign }` where `sign` is `+1`
(increases) or `-1` (decreases).

```js
{ id: "biz_law_of_demand",  implications: [{ var: "demand_response_to_price", sign: -1 }] }
{ id: "biz_veblen_goods",   implications: [{ var: "demand_response_to_price", sign: +1 }] }
```

`detectContradictions(hypotheses)` compares every pair: same `var`, opposite `sign` → a
contradiction. Each hypothesis is first classified, so the engine knows each side's verdict.

## Severity

- **HARD** — both hypotheses are **GO** yet they oppose. At least one confirmed verdict is
  wrong (or silently context-bounded); this demands human review.
- **SOFT** — the evidence already adjudicated it (e.g. one GO, one KILL). Reported for
  transparency, with the resolution shown.

## Worked examples (live in the app)

| Pair | Variable | Severity | Resolution |
|------|----------|:--------:|------------|
| `biz_law_of_demand` ↔ `biz_veblen_goods` | demand_response_to_price | **HARD** | both GO and opposite — at least one is context-bounded; re-examine scope |
| `identity_static` ↔ `context_dominance` | style_is_personal | soft | adjudicated: identity=KILL, context=GO |
| `cognitive_fingerprint` ↔ `context_dominance` | style_is_personal | soft | adjudicated by evidence |
| `portable_register` ↔ `context_dominance` | style_is_personal | soft | adjudicated by evidence |

The BAPA cluster is the headline result: three identity-style hypotheses all imply
*style is personal*; `context_dominance` implies the opposite — and the engine confirms the
latter while killing the former, exactly matching the research record.

## Where it shows

`/graph` renders a Contradiction Engine panel (hard first), each row naming the two claims,
the shared variable, and the resolution. The detector runs over BAPA **and** the 24
multi-domain benchmarks together.
