# Phase Q — Logo Concepts

**Date:** 2026-06-19
**Status:** Pre-implementation, pending approval

Brief constraints: symbolize Evidence / Signal / Decision / Navigation. Avoid brain, robot, chat bubble. Prefer compass, vector, signal path, decision tree, guidance beacon. Deliver icon, monochrome, full logo, favicon.

---

## Concept A — The Signal Vertex ⭐ (recommended)

A single vector that **branches at a decision point** — a path arriving, a node, two outgoing directions (one rising = GO, one falling = KILL), with the chosen path emphasized in amber.

```
        ╱  ← GO (amber, emphasized)
   ────●
        ╲  ← KILL (steel)
```
- **Meaning:** evidence flows in (the line), reaches a decision node (the vertex ●), resolves into a direction. It is literally a decision point with navigation.
- **Why it wins:** unique, abstract, scales to 16px, encodes the product's actual function (falsification → branch), uses the amber signal naturally.
- **Icon:** the vertex + three strokes in a 24×24 grid.
- **Mono:** all strokes ivory/black, node filled.
- **Favicon:** just the node ● with two short stubs — reads at 16px.

---

## Concept B — The Evidence Compass

A minimalist compass where the needle is a **plumb-straight vector** pointing to a single amber cardinal mark (the "true" decision), other marks dimmed.
```
        ·
    ·   ▲   ·
        │
   ·────●────·  (amber mark at top only)
        │
```
- **Meaning:** navigation toward the defensible decision; orientation under uncertainty.
- **Risk:** compass is a common startup motif — less differentiated than A.

---

## Concept C — The Threshold Bar

A horizontal **evidence bar crossing a threshold line**, where the segment past the line turns amber (GO) — a literal visualization of support crossing the GO threshold.
```
   ▓▓▓▓▓▓▓│▓▓▓   ← bar crosses the threshold (│)
          ↑ amber past the line
```
- **Meaning:** the support-vs-threshold mechanic, the engine's core.
- **Risk:** reads as a progress bar; could feel generic at small sizes.

---

## Recommendation

**Concept A — The Signal Vertex.** It is the only one that encodes *falsification + navigation* (the actual product) rather than a generic "decision/direction" gesture. It is abstract enough to be ownable, geometric (no illustration), and works monochrome and at favicon scale.

---

## Deliverable Set (Concept A)

| Asset | Spec | File (planned) |
|-------|------|----------------|
| Icon (color) | 24×24 SVG, amber GO stroke + steel KILL stroke + ivory node | `components/logo/Mark.tsx` |
| Icon (mono) | single-color, currentColor | `Mark.tsx` `variant="mono"` |
| Full logo | mark + "HypothesisOS" wordmark (Geist 600, -0.01em) | `components/logo/Logo.tsx` |
| Favicon | node + stubs, 32×32 + 16×16 | `app/icon.svg` (Next metadata) |
| App icon | maskable 512, obsidian bg + centered mark | `app/apple-icon.png` (generated) |

Wordmark: "Hypothesis" in ivory, "OS" in amber — ties the wordmark to the accent system. Lowercase-friendly, never all-caps in product chrome (all-caps reserved for section labels).

---

## Construction Notes

- Stroke width: 2px at 24px base (scales proportionally).
- Node: 4px filled circle, the visual anchor.
- GO ray angle: +30°; KILL ray angle: −30° — symmetric, calm, not aggressive.
- Amber only on the GO ray + as the wordmark "OS" — scarce, intentional.
- All SVG, no raster except generated app icons. Inline as React components for `currentColor` theming and zero extra requests.
