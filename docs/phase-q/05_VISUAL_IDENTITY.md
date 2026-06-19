# Phase Q — Visual Identity System

**Date:** 2026-06-19
**Status:** Pre-implementation, pending approval

The identity must read as **intelligence analysis / mission planning**, distinct from the current BAPA-derived blue-ink palette. Direction: obsidian field, amber-gold signal, ivory/steel/slate support. The feeling is a strategic command surface at night.

---

## Color System

### Foundation (the field)
| Token | Hex | Use |
|-------|-----|-----|
| `obsidian` | `#0A0C10` | App background (darker, warmer-black than current `#0b0f17`) |
| `graphite` | `#13161C` | Panel / card surface |
| `graphite-2` | `#1A1E26` | Elevated surface, hover |
| `border-hair` | `#262B35` | Hairline borders (replaces `line`) |
| `border-soft` | `#323845` | Stronger dividers |

### Signal (the accent — amber-gold)
| Token | Hex | Use |
|-------|-----|-----|
| `amber` | `#E8A23D` | Primary accent, CTAs, active nav, focus |
| `amber-bright` | `#F4B860` | Hover state of amber |
| `amber-dim` | `#8A6326` | Amber on dark surfaces, subtle |
| `amber-glow` | `rgba(232,162,61,0.12)` | Accent background wash |

Amber is used sparingly — it is *signal*, not decoration. If everything is amber, nothing is.

### Text (ivory / steel / slate)
| Token | Hex | Use |
|-------|-----|-----|
| `ivory` | `#F2EFE9` | Primary text, headlines |
| `steel` | `#A4ADBC` | Secondary text, descriptions |
| `slate` | `#6B7382` | Tertiary, captions, labels |
| `slate-dim` | `#454C58` | Disabled, placeholder |

### Verdict semantics (kept — these are functional, not aesthetic)
| Token | Hex | Meaning |
|-------|-----|---------|
| `go` | `#3FB67A` | GO (shifted slightly cooler/calmer than current `#16a34a` to fit palette) |
| `kill` | `#E5544B` | KILL (warmer red, less alarm-fire than `#dc2626`) |
| `unresolved` | `#E8A23D` | UNRESOLVED = amber (unifies with accent: unresolved IS the "needs signal" state) |

Rationale: making UNRESOLVED the amber accent is intentional — the product's core value is surfacing the unresolved. The palette centers on it.

---

## Typography Scale

**Display / headings:** a grotesk with engineering character. Primary: **Geist** (already common in Next.js ecosystem, ships well) or system fallback. Headlines tight-tracked.

**Data / values:** **Geist Mono** / `ui-monospace`. All support scores, debt %, evidence values render monospace — this is the Bloomberg cue that signals "measured, not estimated."

| Step | Size / line | Weight | Tracking | Use |
|------|------------|--------|----------|-----|
| `display` | 40/44 (mobile 32/36) | 700 | -0.02em | Hero |
| `h1` | 28/34 | 700 | -0.01em | Section titles |
| `h2` | 22/28 | 600 | -0.01em | Card titles |
| `h3` | 18/24 | 600 | 0 | Sub-headers |
| `body` | 16/26 | 400 | 0 | Paragraphs |
| `body-sm` | 14/22 | 400 | 0 | Secondary |
| `label` | 12/16 | 600 | 0.08em UPPER | Section labels (amber/slate) |
| `caption` | 11/14 | 500 | 0.02em | Timestamps |
| `data` | 16/20 mono | 500 | 0 | Verdict/support/debt values |
| `data-lg` | 32/36 mono | 600 | -0.01em | Hero verdict number |

Base font-size 16px (never below — prevents iOS zoom-on-focus).

---

## Spacing System (4px base)

`0.5=2 · 1=4 · 2=8 · 3=12 · 4=16 · 5=20 · 6=24 · 8=32 · 10=40 · 12=48 · 16=64`

- Card padding: 16 (mobile) / 24 (desktop)
- Section vertical rhythm: 48 (mobile) / 64 (desktop)
- Element gap within card: 12
- Touch target min: 44; primary action: 56

---

## Elevation & Surface

Dark UI uses **borders + subtle fills**, not drop shadows (shadows read as cheap on dark).

| Level | Treatment |
|-------|-----------|
| Base | `obsidian` |
| Card | `graphite` + 1px `border-hair` |
| Elevated | `graphite-2` + 1px `border-soft` |
| Accent surface | `graphite` + 1px `amber-dim` border + `amber-glow` wash |
| Overlay (palette/modal) | `graphite-2` + backdrop-blur(12px) + `border-soft` |

Radius: `card 16px · button 12px · pill 999px · input 12px · inner 8px`.

---

## Status System (verdict expression)

Every verdict is communicated by **three redundant channels** (never color alone):

| Verdict | Color | Glyph | Label |
|---------|-------|-------|-------|
| GO | `go` green | ◆ (filled diamond) | GO |
| UNRESOLVED | `amber` | ◇ (open diamond) | UNRESOLVED |
| KILL | `kill` red | ✕ (cross) | KILL |

Risk: LOW (go) · MEDIUM (amber) · HIGH (kill) · CRITICAL (kill + filled). Debt: amber→kill gradient by %.

---

## Motion

| Token | Duration | Easing | Use |
|-------|----------|--------|-----|
| `instant` | 80ms | ease-out | Hover, focus |
| `quick` | 150ms | ease-out | Color/badge transitions |
| `base` | 200ms | cubic-bezier(.2,.8,.2,1) | Section slide, expand |
| `counter` | 400ms | ease-out | Verdict number count-up |
| `deliberate` | 600ms | ease-in-out | Health ring fill |

All motion gated by `prefers-reduced-motion: reduce` → 0ms, instant state.

---

## Atmosphere Rules (what makes it NOT a generic SaaS)

1. **Monospace for all measured values.** Numbers are evidence; they look engineered.
2. **Amber as scarce signal.** One amber element per viewport region, max.
3. **Hairline borders, no glow/neon.** Precision over flash.
4. **No gradients except data encodings** (debt meter, health ring).
5. **Generous negative space on obsidian** — the field is calm; the signal stands out.
6. **No stock illustration, no 3D, no emoji in product chrome.** Geometric glyphs only.
7. **Verdict is the loudest thing on every screen.** Hierarchy is non-negotiable.

---

## Tailwind Token Additions (planned)

```ts
// tailwind.config.ts — extend, do not remove existing
colors: {
  // existing kept for back-compat: go, kill, unresolved, ink, panel, line
  obsidian: "#0A0C10", graphite: "#13161C", "graphite-2": "#1A1E26",
  "border-hair": "#262B35", "border-soft": "#323845",
  amber: "#E8A23D", "amber-bright": "#F4B860", "amber-dim": "#8A6326",
  ivory: "#F2EFE9", steel: "#A4ADBC", slate: "#6B7382", "slate-dim": "#454C58",
},
fontFamily: { sans: ["Geist","ui-sans-serif","system-ui"], mono: ["Geist Mono","ui-monospace"] },
```
Verdict greens/reds will be retuned (`go #3FB67A`, `kill #E5544B`) only after confirming benchmark UI screenshots still read clearly — purely cosmetic, no engine impact.
