# Phase Q — Dashboard Redesign Proposal (Mission Control)

**Date:** 2026-06-19
**Status:** Pre-implementation, pending approval

The current `/dashboard` (Phase O) is a vertical stack of KPI tiles — functional but traditional. Redesign target: a **Mission Control** surface where a decision-maker reads the operational state of all their hypotheses at a glance.

---

## Layout Regions (per the brief)

```
TOP:          Decision Health        (the headline state)
TOP-RIGHT:    Risk Distribution      (where the danger is)
RIGHT:        Evidence Debt          (how far from resolved)
MIDDLE:       Active Hypotheses      (the working set)
BOTTOM:       Recent Decisions       (the log)
```

Desktop = 3-column grid. Mobile = single-column priority stack (Health → Risk → Debt → Active → Recent).

---

## Region 1 — Decision Health (top, hero metric)

**What it is:** A single composite read of portfolio health. Not a new engine — a derived display over existing verdict counts.

**Formula (display-only, no thresholds):**
```
health = (GO_count * 1.0 + UNRESOLVED_count * 0.4) / total_count   → 0–100%
```
This is a presentation metric, explicitly labeled as a portfolio summary, NOT a verdict. It never feeds back into any engine.

**Visual:** A 72px health ring (SVG arc, amber fill) + the count breakdown `3 GO · 2 KILL · 4 UNRESOLVED` in mono. Animates fill on load (`deliberate` 600ms).

**Honesty rule:** If there are 0 hypotheses, show "No decisions under evaluation" — never a fake 100%.

---

## Region 2 — Risk Distribution (top-right)

A horizontal stacked bar of `decisionRisk()` levels across all active hypotheses:
```
LOW ▓▓▓▓▓  MEDIUM ▓▓▓  HIGH ▓  CRITICAL ░
```
Each segment width = proportion. Colors: go / amber / kill / kill-filled. Tapping a segment filters the Active Hypotheses list to that risk band. Reuses Phase O `decisionRisk` — no new computation.

---

## Region 3 — Evidence Debt (right)

Aggregate `evidenceDebt()` across hypotheses:
```
avg 41%   ▓▓▓▓░░░░░░
2 near GO · 1 major deficit
```
The debt meter uses the amber→kill gradient. "Near GO" = debt ≤ 10%. Pulls existing per-hypothesis debt and averages for display.

---

## Region 4 — Active Hypotheses (middle, the working set)

A dense, scannable table (Stripe-style data rows):
```
◆ GO    Context dominance        0.89   risk LOW    ›
◇ UNR   Within-context person    0.53   risk MED    ›
✕ KILL  Identity static          0.22   risk HIGH   ›
```
- Verdict glyph + color (left), title (truncate), support (mono), risk chip, chevron
- Tap → opens that hypothesis in Workflow/Evidence with state loaded
- Sort: by risk desc (most dangerous first) by default; tap header to re-sort
- Empty state: single calm prompt + "Begin a decision" CTA

---

## Region 5 — Recent Decisions (bottom, the log)

A Vercel-deploy-log-style timeline:
```
2d ago   Adaptation layer    → UNRESOLVED   0.34
4d ago   Identity static     → KILL         0.22
6d ago   Temporal stability  → GO           0.78
```
Reuses `/api/dashboard` `recent[]`. Read-only audit feel. Tap → audit trail for that hypothesis.

---

## Data Sources (all existing — no new APIs)

| Region | Source |
|--------|--------|
| Decision Health | `/api/dashboard` counts |
| Risk Distribution | `decisionRisk()` over `/api/hypotheses` + latest evidence |
| Evidence Debt | `evidenceDebt()` aggregate |
| Active Hypotheses | `/api/hypotheses` + per-item classify |
| Recent Decisions | `/api/dashboard` recent[] |

The only computation added is client-side aggregation of values the engine already produces. **No new engine, no new threshold, no new verdict type** — consistent with the feature-freeze from Phase P.

---

## Interaction

- Pull-to-refresh on mobile re-fetches dashboard
- Risk segment tap → filter active list
- Sticky "+ New decision" action bar (mobile) / inline button (desktop)
- Health ring + debt meter animate only on first load and on data change

---

## Before / After

| | Before (Phase O) | After (Mission Control) |
|-|------------------|-------------------------|
| Feel | KPI tile stack | Operational command surface |
| Hierarchy | Equal-weight tiles | Health headline → working set → log |
| Risk | Not shown | First-class distribution bar |
| Active items | Recent only | Full sortable working set, risk-ranked |
| Action | Quick links | Single primary "New decision" + drill-down |
