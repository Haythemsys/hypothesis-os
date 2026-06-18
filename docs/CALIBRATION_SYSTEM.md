# Calibration System (Phase B)

A correct verdict is not enough — the system must know **when it is uncertain**. Calibration
is computed independently of the verdict direction: a GO and a KILL can both be LOW confidence
if the evidence behind them is thin. `lib/calibrate.mjs`.

## Score: 0–100

A weighted blend of four components, each 0..1:

| Component | Weight | Measures | Source |
|-----------|:------:|----------|--------|
| Evidence completeness | 0.30 | fraction of decision dimensions actually **measured** (not their values) | how many of effect/replication/hostile/confound/power(/generalization)/CI are present |
| Confound coverage | 0.25 | were confounds addressed at all | `confoundControl` |
| Contradiction coverage | 0.25 | did the claim face hostile/adversarial tests | `hostileSurvival` |
| Benchmark/statistical confidence | 0.20 | replication + power + interval | `0.4·replication + 0.4·power + 0.2·ciExcludesNull` |

`score = round(100 · Σ component·weight)`.

## Bands

- **HIGH CONFIDENCE** — score ≥ 70
- **MEDIUM CONFIDENCE** — 40–69
- **LOW CONFIDENCE** — < 40

## Completeness vs. strength — the key distinction

Completeness asks *did you measure it*, not *did it pass*. A hypothesis with all dimensions
measured but several failing can still be HIGH calibration — we are **confident it should be
KILLED**. Conversely, an untested claim scores ~0 and lands in LOW regardless of verdict. This
is exactly what stops the engine from a confident verdict on absent data.

## Limiting factor

Calibration reports its weakest component and a concrete next step
(e.g. *"To raise calibration, run hostile / adversarial tests."*) so the user knows what would
make the verdict more trustworthy.

## Where it shows

- **Evidence Engine** (`/evidence`): band + score + a bar per component + recommendation.
- **Self-critique**: a verdict in the LOW band is flagged even when no hostile attack lands.
- **Research Memory**: each revision stores its calibration, so trust is traceable over time.
