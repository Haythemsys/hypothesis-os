# Phase Q — UX Blueprint

**Date:** 2026-06-19
**Status:** Pre-implementation, pending approval

---

## Design Philosophy

The product is a **decision instrument**, not an app. The closest mental model is a cockpit instrument or a Bloomberg Terminal panel — the user trusts it because it is precise, consistent, and never theatrical. Every interaction reinforces one feeling: *this tool will tell me the truth even when I don't want to hear it.*

Three UX laws govern every screen:

1. **Verdict-first.** The answer (GO / KILL / UNRESOLVED) is always the most prominent element. Supporting evidence is progressive disclosure beneath it. (borrowed from Perplexity answer-first)
2. **No decoration without function.** No gradient that doesn't encode data. No icon that doesn't aid recognition. No animation that doesn't communicate state change. (borrowed from Palantir/Bloomberg)
3. **One primary action per surface.** Each screen has exactly one obvious next step, rendered as a sticky action bar on mobile. (borrowed from Superhuman's "one clear state")

---

## The Two Surfaces

### Surface A — Landing (conversion)
First-time visitor. Goal: understand in 10 seconds, scroll through the narrative, reach pricing/CTA. Single page, 12 sections, scroll-driven. No app chrome.

### Surface B — Application (work)
Returning user with a real decision. Goal: encode evidence, get a verdict, navigate to GO. App shell with sidebar (desktop) / dock (mobile). This is where the engine lives.

The bridge: landing CTA → `/app` → app shell.

---

## User Journeys

### Journey 1 — First-time visitor → activated user
```
Land on / (Hero: "Stop bad decisions before they cost you money")
  → scroll: Problem (recognize their own false-GO pain)
  → scroll: How it works (3 steps)
  → reach: Live Demo (move sliders, watch verdict flip in real time) ← activation moment
  → scroll: Comparison vs AI (understand differentiation)
  → reach: Pricing
  → CTA "Run your first decision" → /app
```
The **Live Demo is the activation event.** A visitor who moves the evidence sliders and watches a GO flip to KILL has understood the product viscerally. Everything before it sets up that moment; everything after it justifies paying.

### Journey 2 — Returning user → decision
```
/app → /dashboard (Mission Control: decision health, active hypotheses)
  → tap a hypothesis OR "New decision"
  → Workflow: state hypothesis → encode evidence (sticky slider panel)
  → Verdict renders (animated counter, kill-gate badges)
  → Navigation: path to GO OR honest-unresolved
  → "Generate Executive Brief" → /report/[id]
```

### Journey 3 — Power user → command dispatch
```
Anywhere → ⌘K (or tap search in dock)
  → Command palette: "New decision", "Open [hypothesis name]", "Compare", "Dashboard"
  → instant section switch with slide transition
```

---

## Interaction Patterns

| Pattern | Where | Behavior |
|---------|-------|----------|
| **Verdict counter** | Every verdict render | Support number animates 0.00→final over 400ms; kill-gate badges stagger-fade in |
| **Slider → live verdict** | Evidence encoding, Live Demo | Verdict recomputes on `input` (debounced 60ms); badge color transitions 200ms |
| **Sticky action bar** | Mobile, all work surfaces | Bottom-anchored above dock; one primary button; shadow on scroll |
| **Progressive disclosure** | Verdict supporting data | Verdict + 1-line reason always visible; "Why?" expands kill gates, evidence-for/against |
| **Section transition** | App navigation | View Transition API slide; direction by nav order |
| **Command palette** | ⌘K / search tap | Backdrop blur, fuzzy search over hypotheses + actions |
| **Debt meter** | Top bar (desktop), dashboard | Horizontal bar, amber→red gradient by debt %, animates on change |
| **Skeleton load** | Async data | Graphite shimmer placeholders matching final layout (zero CLS) |

---

## Information Hierarchy (every work surface)

```
Tier 1 (largest, top)   — THE VERDICT + support score
Tier 2                  — one-sentence reason (why this verdict)
Tier 3 (expandable)     — kill gates fired / GO criteria met
Tier 4 (expandable)     — evidence for / against / missing
Tier 5 (panels below)   — navigation, debt, risk, timeline
Tier 6 (sticky bottom)  — primary action
```

---

## Accessibility & One-Handed Use

- All touch targets ≥ 44×44px (Apple HIG); primary actions ≥ 56px tall
- Bottom dock + sticky actions live in the thumb arc (bottom 1/3 of screen)
- Text contrast ≥ 7:1 on body (obsidian bg / ivory text); ≥ 4.5:1 minimum anywhere
- Verdict never communicated by color alone — always paired with text label + icon shape
- `prefers-reduced-motion` disables all transitions, keeps instant state changes
- Focus rings: amber 2px, visible on keyboard nav
- Semantic HTML: `<main>`, `<nav>`, `<section aria-label>`, live region for verdict changes

---

## Empty & Error States

| State | Treatment |
|-------|-----------|
| No hypotheses yet | Dashboard shows a single calm prompt: "No decisions under evaluation. Begin one." + primary CTA |
| Evidence incomplete | Verdict shows UNRESOLVED with calibration LOW; never blocks, always honest |
| API error | Inline graphite card, plain language, retry button — never a stack trace |
| KILL verdict | Never styled as failure/alarm — styled as *signal received*. Followed immediately by "what would change this" |

The KILL state design is critical: a KILL is the product working correctly, not an error. It must feel like valuable intelligence, not bad news.
