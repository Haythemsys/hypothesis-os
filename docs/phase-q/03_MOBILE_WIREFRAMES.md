# Phase Q — Mobile Wireframes (390px primary)

**Date:** 2026-06-19
**Status:** Pre-implementation, pending approval
**Base width:** 390px (iPhone 14/15). All ASCII frames are 1 char ≈ ~9px. Zero horizontal scroll at any width.

---

## Global — Bottom Dock (all app surfaces)

```
┌─────────────────────────────────────┐
│                                     │  ← content scrolls
│                                     │
├─────────────────────────────────────┤
│  ◈      ⚡      ⚖      ⇄      ⌘     │  ← dock, 64px, safe-area pad
│ Mission  Work  Analyze Compare  More │  ← labels 10px
└─────────────────────────────────────┘
     ▲ active = amber underline + ivory icon; inactive = steel
```
Thumb arc: dock sits in the bottom reach zone. Active tab has 2px amber top-border + filled icon.

---

## Landing — Hero (390px)

```
┌─────────────────────────────────────┐
│  ◇ HypothesisOS            [ Run › ] │ ← sticky top, 52px, blur
├─────────────────────────────────────┤
│                                     │
│   STOP BAD DECISIONS                │ ← 34px bold ivory
│   BEFORE THEY COST                  │
│   YOU MONEY                         │ ← amber on "COST YOU MONEY"
│                                     │
│   HypothesisOS analyzes evidence,   │ ← 16px steel, 1.6 line-height
│   finds hidden failure signals,     │
│   and tells you whether to move     │
│   forward, stop, or wait.           │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   Run your first decision  →  │ │ ← primary, 56px, amber fill
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │   See how it works            │ │ ← ghost, scrolls to §3
│  └───────────────────────────────┘ │
│                                     │
│   ▸ 0 false-GO on 106-case study   │ ← proof chip, 12px
│   ▸ Deterministic · reproducible   │
│                                     │
└─────────────────────────────────────┘
```

---

## Landing — Live Demo (§4, the activation moment)

```
┌─────────────────────────────────────┐
│  LIVE DECISION ENGINE               │ ← section label, amber
│  Move the evidence. Watch it decide.│
│                                     │
│  ┌───────────────────────────────┐ │
│  │  VERDICT                       │ │ ← verdict card, border = verdict color
│  │                                │ │
│  │      ◆ UNRESOLVED              │ │ ← 28px, animated on change
│  │      support 0.58              │ │ ← monospace, counter animation
│  │                                │ │
│  │  Replication below threshold.  │ │ ← 1-line reason
│  └───────────────────────────────┘ │
│                                     │
│  Effect          ▓▓▓▓▓▓▓░░░  0.70  │ ← slider + value
│  Replication     ▓▓▓░░░░░░░  0.30  │ ← drag this → verdict flips
│  Hostile surv.   ▓▓▓▓▓▓░░░░  0.60  │
│  Confound ctrl   ▓▓▓▓▓░░░░░  0.50  │
│  Power           ▓▓▓▓░░░░░░  0.40  │
│  CI excl. null   [  YES  ]         │ ← toggle pill
│                                     │
│  ↓ as you raise Replication →      │
│    watch UNRESOLVED become GO      │
└─────────────────────────────────────┘
```
Runs `@/lib/core` client-side. No network. The single most important screen for conversion.

---

## App — Mission Control / Dashboard (390px)

```
┌─────────────────────────────────────┐
│  Mission Control          ◇         │ ← 52px header
├─────────────────────────────────────┤
│  DECISION HEALTH                    │
│  ┌───────────────────────────────┐ │
│  │  ▓▓▓▓▓▓▓▓░░  72%              │ │ ← health ring/bar, amber
│  │  3 GO · 2 KILL · 4 UNRESOLVED │ │
│  └───────────────────────────────┘ │
│                                     │
│  RISK DISTRIBUTION                  │
│  ┌───────────────────────────────┐ │
│  │ LOW ▓▓▓▓  MED ▓▓  HIGH ▓  CRIT │ │ ← stacked bar
│  └───────────────────────────────┘ │
│                                     │
│  EVIDENCE DEBT                      │
│  ┌───────────────────────────────┐ │
│  │  avg 41% · 2 near GO          │ │
│  └───────────────────────────────┘ │
│                                     │
│  ACTIVE HYPOTHESES                  │
│  ┌───────────────────────────────┐ │
│  │ ◆ GO   Context dominance  0.89 │ │ ← tappable row
│  │ ◇ UNR  Within-context     0.53 │ │
│  │ ✕ KILL Identity static    0.22 │ │
│  └───────────────────────────────┘ │
│                                     │
│  RECENT DECISIONS                   │
│  ┌───────────────────────────────┐ │
│  │ 2d ago · Adaptation → UNR     │ │
│  └───────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐  │
│ │     + New decision            │  │ ← sticky action, 56px
│ └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  ◈    ⚡    ⚖    ⇄    ⌘            │ ← dock
└─────────────────────────────────────┘
```
On 390px, panels stack vertically (single column). On 768px+ they form a 2×2 grid.

---

## App — Workflow / Evidence Encoding (390px)

```
┌─────────────────────────────────────┐
│  ← Workflow            step 3/5     │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐ │
│  │  ◆ VERDICT: UNRESOLVED        │ │ ← always-visible verdict, top
│  │  support 0.58   debt 34%      │ │
│  │  ▸ Why?                       │ │ ← expands kill gates
│  └───────────────────────────────┘ │
│                                     │
│  ENCODE EVIDENCE                    │
│  Effect size                  0.70  │
│  ▓▓▓▓▓▓▓░░░  ●                      │ ← 36px-tall slider track
│  Replication                  0.30  │
│  ▓▓▓░░░░░░░  ●                      │
│  ... (6 dimensions) ...             │
│                                     │
│  Interval excludes null   [ YES ]   │
│                                     │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐  │
│ │   Record & classify       →   │  │ ← sticky primary
│ └───────────────────────────────┘  │
├─────────────────────────────────────┤
│  ◈    ⚡    ⚖    ⇄    ⌘            │
└─────────────────────────────────────┘
```

---

## App — Command Palette (⌘K overlay, mobile)

```
┌─────────────────────────────────────┐
│ ░░░░░░░░░░░ backdrop blur ░░░░░░░░░ │
│  ┌───────────────────────────────┐ │
│  │ 🔍 Type a command or search…  │ │ ← autofocus, 48px
│  ├───────────────────────────────┤ │
│  │ + New decision                │ │
│  │ ◈ Mission Control             │ │
│  │ ⇄ Compare hypotheses          │ │
│  │ ─ Recent ───────────────────  │ │
│  │ ◆ Context dominance      GO   │ │
│  │ ◇ Within-context        UNR   │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Responsive Behavior Across Breakpoints

| Width | Dashboard | Workflow | Nav |
|-------|-----------|----------|-----|
| 390 | 1-col stack | full-width, sticky action | bottom dock |
| 430 | 1-col stack, larger type | same | bottom dock |
| 768 | 2×2 panel grid | content max-w-2xl centered | bottom dock OR top tabs |
| 1024 | 3-col mission grid | sidebar + content | left sidebar |
| 1440 | 3-col + right context panel | sidebar + content + context | left sidebar |

**Invariant:** zero horizontal scroll at every width. `overflow-x: hidden` on root + `max-w-full` on all cards (already added in Phase O, will be hardened).
