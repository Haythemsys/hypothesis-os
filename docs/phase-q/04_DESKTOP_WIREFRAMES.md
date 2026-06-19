# Phase Q — Desktop Wireframes (1024px / 1440px)

**Date:** 2026-06-19
**Status:** Pre-implementation, pending approval

Desktop is secondary but must feel like a command center, not a stretched mobile view. The defining element is the **persistent left sidebar** (Linear/Arc) and a **top status bar** carrying the live verdict + debt meter (Bloomberg).

---

## App Shell (1440px)

```
┌────┬──────────────────────────────────────────────────────────────┬──────────┐
│ ◇  │  Context dominance          ◆ GO 0.89   debt ▓▓░░ 18%   ⌘K  │          │
│    ├──────────────────────────────────────────────────────────────┤  CONTEXT │
│ ◈  │                                                              │  PANEL    │
│ ⚡ │   MAIN WORK SURFACE                                          │ (collaps.)│
│ ⚖ │                                                              │          │
│ ⇄ │   verdict-first content renders here                         │  · related│
│ ⌗ │                                                              │  · history│
│ ⋯  │                                                              │  · debt   │
│    │                                                              │          │
│ ─  │                                                              │          │
│ ⚙  │                                                              │          │
└────┴──────────────────────────────────────────────────────────────┴──────────┘
  64px        flexible main (≈ 1100px)                                  280px
```

- **Sidebar:** 64px icon strip. Hover → expands to 220px with labels (overlays, doesn't push content). Pinnable via localStorage.
- **Top bar:** 48px. Left = current hypothesis title. Center-right = live verdict badge + animated debt meter. Right = ⌘K hint + avatar.
- **Context panel:** 280px, collapsible. Shows related hypotheses, version history, debt breakdown for the current item. Hidden < 1280px.

---

## Mission Control / Dashboard (1440px)

```
┌────┬──────────────────────────────────────────────────────────────────────────┐
│ ◈  │  Mission Control                                              ⌘K   ◇      │
│    ├──────────────────────────────────────────────────────────────────────────┤
│ ⚡ │  ┌─────────────────────────┐ ┌──────────────┐ ┌──────────────────────┐  │
│ ⚖ │  │  DECISION HEALTH        │ │ RISK DISTRIB.│ │  EVIDENCE DEBT       │  │
│ ⇄ │  │                         │ │              │ │                      │  │
│ ⌗ │  │     ◐  72%              │ │ LOW  ▓▓▓▓▓   │ │   avg 41%            │  │
│    │  │   health ring           │ │ MED  ▓▓▓     │ │   ▓▓▓▓░░░░░░         │  │
│    │  │  3 GO 2 KILL 4 UNR      │ │ HIGH ▓       │ │   2 near GO          │  │
│    │  └─────────────────────────┘ │ CRIT ░       │ │   1 major deficit    │  │
│    │                              └──────────────┘ └──────────────────────┘  │
│    │  ┌──────────────────────────────────────┐ ┌──────────────────────────┐ │
│    │  │  ACTIVE HYPOTHESES                    │ │  RECENT DECISIONS        │ │
│    │  │  ◆ GO   Context dominance     0.89 ›  │ │  2d  Adaptation → UNR    │ │
│    │  │  ◇ UNR  Within-context person 0.53 ›  │ │  4d  Identity → KILL     │ │
│    │  │  ✕ KILL Identity static       0.22 ›  │ │  6d  Temporal → GO       │ │
│    │  │  ◇ UNR  Adaptation layer      0.34 ›  │ │                          │ │
│    │  └──────────────────────────────────────┘ └──────────────────────────┘ │
│ ─  │  ┌────────────────────────────────────────────────────────────────────┐ │
│ ⚙  │  │  + New decision                                                    │ │
│    │  └────────────────────────────────────────────────────────────────────┘ │
└────┴──────────────────────────────────────────────────────────────────────────┘
```
Matches the brief's mission-control layout: Decision Health top, Active Hypotheses middle-left, Risk Distribution top-right, Recent bottom, Evidence Debt right.

At 1024px: 3 top tiles become a single row that wraps to 2+1; Active/Recent stack to a wider single column.

---

## Workflow / Evidence (1024px)

```
┌────┬──────────────────────────────────────────────────────────────────┐
│    │  Workflow · step 3 of 5                          ◆ UNRESOLVED 0.58│
│ ⚡ ├──────────────────────────────────────────────────────────────────┤
│    │  ┌────────────────────────────┐  ┌────────────────────────────┐  │
│    │  │  ENCODE EVIDENCE           │  │  VERDICT                   │  │
│    │  │  Effect      ▓▓▓▓▓▓▓░ 0.70 │  │   ◇ UNRESOLVED            │  │
│    │  │  Replication ▓▓▓░░░░░ 0.30 │  │   support 0.58            │  │
│    │  │  Hostile     ▓▓▓▓▓▓░░ 0.60 │  │                           │  │
│    │  │  Confound    ▓▓▓▓▓░░░ 0.50 │  │  KILL GATES               │  │
│    │  │  General.    ▓▓▓▓░░░░ 0.40 │  │  ✓ effect ok              │  │
│    │  │  Power       ▓▓▓▓░░░░ 0.40 │  │  ✕ replication < 0.50     │  │
│    │  │  CI [ YES ]               │  │                           │  │
│    │  │                           │  │  PATH TO GO               │  │
│    │  │  [ Record & classify → ]  │  │  1. +1 replication        │  │
│    │  └────────────────────────────┘  └────────────────────────────┘  │
│    │  Two-column: input left, live verdict + navigation right          │
└────┴──────────────────────────────────────────────────────────────────┘
```
Desktop advantage: evidence input and live verdict are side-by-side. Moving a slider on the left updates the verdict on the right instantly — same feel as the landing demo but in the real workflow.

---

## Executive Brief / Report (1024px, also print)

```
┌──────────────────────────────────────────────────────────────────┐
│  HypothesisOS · Executive Brief                    [ Print / PDF ] │
│  ─────────────────────────────────────────────────────────────   │
│  CONTEXT DOMINANCE HYPOTHESIS                                      │
│  Generated 2026-06-19                                              │
│                                                                   │
│  ┌───────────────┐  SUMMARY                                       │
│  │  ◆ GO         │  All evidence criteria satisfied. Support      │
│  │  support 0.89 │  0.89 exceeds the 0.65 threshold with          │
│  │  HIGH conf.   │  replication and CI confirmed.                 │
│  └───────────────┘                                                │
│                                                                   │
│  RISK         LOW    ·  Invest more? YES  ·  Debt 18%             │
│  ─────────────────────────────────────────────────────────────   │
│  EVIDENCE     effect 0.85 ▓▓▓▓▓▓▓▓░  replication 0.70 ▓▓▓▓▓▓▓░    │
│  NAVIGATION   At GO. No further evidence required.               │
│  NEXT ACTIONS Proceed. Monitor generalization in new contexts.   │
│  TIMELINE     created → 3 evidence rounds → GO (6 days)           │
└──────────────────────────────────────────────────────────────────┘
```
Centered max-w-3xl column. Print stylesheet strips shell/sidebar, switches to white bg + black text, keeps verdict colors. Investor-ready single document.

---

## Breakpoint Matrix

| Element | 1024 | 1280 | 1440+ |
|---------|------|------|-------|
| Sidebar | 64px icons | 64px icons | 64px (pin → 220) |
| Context panel | hidden | hidden | 280px visible |
| Dashboard tiles | 2-col wrap | 3-col | 3-col + context |
| Workflow | 2-col 60/40 | 2-col 60/40 | 2-col + context |
| Main max-width | full | full | content caps at 1200 |

Keyboard: ⌘K palette, `g d` → dashboard, `g w` → workflow, `?` → shortcuts (Linear-style chords).
