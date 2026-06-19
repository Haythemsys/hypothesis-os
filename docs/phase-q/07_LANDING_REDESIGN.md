# Phase Q — Landing Redesign Proposal

**Date:** 2026-06-19
**Status:** Pre-implementation, pending approval

Single page, 12 sections, scroll-driven. All nav buttons scroll to anchors (no route change). Pure server components except the Live Demo (lazy client component). Goal: a visitor understands what/who/why-different in 10 seconds, then is pulled through a narrative to the CTA.

---

## Section-by-Section Spec

### §1 Hero `#top`
- **Headline:** STOP BAD DECISIONS / BEFORE THEY COST YOU MONEY (amber on the cost line)
- **Sub:** "HypothesisOS analyzes evidence, finds hidden failure signals, and tells you whether a hypothesis should move forward, stop, or remain unresolved."
- **Actions:** `Run your first decision →` (primary, → /app) · `See how it works` (ghost, scroll to §3)
- **Proof chips:** "0 false-GO across a 106-case study" · "Deterministic · reproducible"
- No hero illustration. Type + a single faint signal-path motif in the background (CSS).

### §2 Problem `#problem`
- **Frame:** "Most bad decisions aren't made with bad evidence. They're made with good evidence interpreted charitably."
- Three failure cards: *Replication of one* · *Untested under hostile conditions* · *Generalized without proof* — each with a one-line real consequence (drawn from USE_CASE_LIBRARY).
- Emotional target: the reader recognizes their own past false-GO.

### §3 How It Works `#how`
Three numbered steps, horizontal on desktop / stacked mobile:
1. **Encode** — translate your evidence into 8 measured dimensions
2. **Falsify** — kill gates fire on fatal weaknesses before support is even computed
3. **Navigate** — get a verdict + the exact path to GO (or an honest unresolved)

### §4 Live Decision Example `#demo` ⭐ (activation)
- Interactive engine running `@/lib/core` client-side.
- Sliders for the 6 evidence dimensions + CI toggle.
- Verdict card updates live (animated counter, glyph, kill-gate badges).
- Guided hint: "Raise Replication above 0.50 and watch UNRESOLVED become GO."
- This is the conversion moment — it proves the product is real, deterministic, and instant.

### §5 Navigation Engine `#navigation`
- Explains the distinguishing feature: HypothesisOS doesn't just judge, it routes.
- Visual: a path-to-GO list with dimension gains (from real `navigate()` output).
- Copy: "Every UNRESOLVED comes with the cheapest set of evidence moves that would change the verdict."

### §6 Audit Trail `#audit`
- Vercel-log-style timeline mock: hypothesis → evidence → verdict → report.
- Copy: "Every verdict is reproducible and traceable. Defend any decision with its full evidence history."

### §7 Evidence Debt `#debt`
- The debt meter visual + bands (Near GO → Major deficit).
- Copy: "Know exactly how far your evidence is from a defensible GO — as a single number."

### §8 Risk Analysis `#risk`
- The four risk levels (LOW/MED/HIGH/CRITICAL) + investor view (YES/NO/NOT YET).
- Copy: "Translate evidence gaps into decision risk and a clear invest / don't-invest signal."

### §9 Comparison vs AI `#vs-ai`
A two-column table — the P9 "hardest question" made visual:
| | ChatGPT / Claude | HypothesisOS |
|-|------------------|--------------|
| Same evidence, same answer | ✗ varies | ✓ deterministic |
| Kill gates | ✗ averages weak away | ✓ unconditional |
| Tells you what's missing | ✗ | ✓ calibration |
| Path to a better verdict | ✗ | ✓ navigation |
| Can be talked into a yes | ✓ sycophantic | ✗ structural |
- Honest footer: "Use Claude to explore. Use HypothesisOS to decide."

### §10 Pricing `#pricing`
Four tiers from WTP model (Individual $39 · Team $149 · Studio $399 · Enterprise custom). Most-popular = Team. Each with 3–4 feature lines. Honest "no credit card to try" note.

### §11 FAQ `#faq`
Accordion, drawn from real objections (P7): "Isn't this just a scoring rubric?" · "What if my evidence doesn't fit 8 dimensions?" · "Does AI make the decision?" (no — deterministic) · "Is my data private?" · "Can I export?"

### §12 CTA `#start`
- Repeat the hero promise, single button: `Run your first decision →`
- Footer: logo, links to /app, docs, governance.

---

## Navigation (landing)

- Sticky top bar (52px, backdrop-blur): logo left, anchor links center (desktop only), `Run →` button right.
- Mobile: logo + `Run →` only; anchors reached by scroll. Optional hamburger → anchor list.
- All anchor links use smooth scroll (`scroll-behavior: smooth`, respects reduced-motion).

---

## Performance

- Sections §1–3, §5–12 are **server components**, zero client JS.
- §4 Live Demo is a `dynamic(() => …, { ssr: false })` client component, lazy-loaded when scrolled near.
- Background motifs are CSS-only (no canvas/WebGL).
- Target: Lighthouse Performance > 95, FCP < 1.2s, CLS < 0.05.
- Fonts: `next/font` self-hosted Geist + Geist Mono, `display: swap`.

---

## Tone Guardrails

- No "revolutionary", "AI-powered", "game-changing", "🚀".
- No fake testimonials or logo bars for customers that don't exist.
- Proof claims must be real and sourced (the 106-case study, the benchmark) — overstating kills trust with the exact audience this product needs.
- Serious, declarative, confident. The copy should read like a strategic brief, not an ad.
