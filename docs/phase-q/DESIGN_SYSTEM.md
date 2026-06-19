# HypothesisOS Design System (as implemented)

**Date:** 2026-06-19
**Status:** Shipped — Phase Q M0–M8. This documents what is actually in the codebase.

The identity reads as intelligence analysis / mission planning: an obsidian field, a scarce amber-gold signal, ivory/steel/slate text, and monospace for every measured value.

---

## Tokens (tailwind.config.ts)

### Color
| Token | Hex | Role |
|-------|-----|------|
| `obsidian` | `#0A0C10` | App + landing background |
| `graphite` | `#13161C` | Card surface |
| `graphite-2` | `#1A1E26` | Elevated surface / overlay |
| `border-hair` | `#262B35` | Hairline borders |
| `border-soft` | `#323845` | Stronger dividers |
| `amber` / `amber-bright` / `amber-dim` | `#E8A23D` / `#F4B860` / `#8A6326` | Signal accent |
| `ivory` / `steel` / `slate` / `slate-dim` | `#F2EFE9` / `#A4ADBC` / `#6B7382` / `#454C58` | Text tiers |
| `go` / `kill` / `unresolved` | `#3FB67A` / `#E5544B` / `#E8A23D` | Verdict semantics |

Back-compat aliases `ink`/`panel`/`line` map to obsidian/graphite/border-hair so legacy classes never break.

### Type
- `--font-sans`: system sans stack · `--font-mono`: system mono stack (no network dependency).
- Mono (`.data`, `font-mono`) is used for **all measured values** — support, debt, weeks, scores. This is the core "engineered, not estimated" cue.

### Radius / motion
- `rounded-card` 16 · `rounded-btn` 12 · `rounded-inner` 8 · pill 999.
- Easing `ease-signal` = cubic-bezier(.2,.8,.2,1). Animations: `fade-up`, `slide-in`, `scale-in`. Counter ease-out cubic over 400ms.

---

## Component classes (globals.css `@layer components`)

| Class | Purpose |
|-------|---------|
| `.card` / `.card-flat` / `.card-raised` / `.card-accent` | Surfaces (base / no-border / elevated / amber-washed) |
| `.btn-primary` / `.btn-ghost` / `.btn-quiet` / `.btn-danger` | Button hierarchy |
| `.pill` · `.label` · `.data` · `.input` | Status pill · section label · mono data · form input |
| `.verdict-GO/KILL/UNRESOLVED` · `.text-go/kill/unresolved` | Verdict color (single source of truth) |
| `.skip-link` | Keyboard skip-to-content |

---

## Primitives (components/ui/)

`Card`/`CardLabel` · `Button`/`ButtonLink` · `Meter` (debt gradient) · `Counter` (animated, reduced-motion aware) · `Ring` (SVG health arc) · `Slider`+`Toggle` (touch-optimized, mono value) · `Pill`+`RiskPill`. Verdict + `Bar` live in `components/Verdict.tsx`.

---

## Status system

Verdict is communicated by **three redundant channels** — color + glyph + label:
`GO ◆ (green)` · `UNRESOLVED ◇ (amber)` · `KILL ✕ (red)`. Never color alone.
Risk: LOW(go) · MEDIUM(amber) · HIGH/CRITICAL(kill). Debt meter: green→amber→red by %.

---

## Shell (components/shell/)

- **Desktop:** 64px `Sidebar` (hover-expand to 220px), 48px `TopBar` (⌘K + `#topbar-slot`).
- **Mobile:** `BottomDock` (5 thumb-reachable zones, amber active marker, safe-area pad).
- **Everywhere:** `CommandPalette` (⌘K/Ctrl+K, fuzzy nav + hypothesis search, keyboard-driven).
- `AppShell` composes them and is mounted by the `app/(app)` route-group layout. Landing (`/`) sits outside the group with its own `LandingNav`.

---

## Responsiveness

Mobile-first, 390px base. `overflow-x: hidden` + `max-w-full` cards guarantee zero horizontal scroll. Breakpoints verified: 390 / 430 / 768 / 1024 / 1440. Dashboard: 1-col → 3-col grid. Work surfaces: stacked → two-column. Touch targets ≥ 44px; primary actions ≥ 56px.

---

## Accessibility

- Keyboard focus: amber `:focus-visible` ring (2px, offset). Skip-to-content link.
- Verdict never color-only (glyph + label always present); `aria-label` on verdict pills and sliders.
- `prefers-reduced-motion`: all animation/transition collapsed to ~0ms, smooth-scroll off.
- Body contrast: ivory on obsidian ≈ 15:1; steel on obsidian ≈ 7:1.

---

## Dark / Print

Dark is the only mode (obsidian field). Print stylesheet (Executive Brief): white bg, black text, hidden shell/nav (`[data-shell]`, `.print:hidden`), verdict colors darkened for paper. Triggered by the brief's Print / Save PDF button.

---

## Performance

- Landing is static-rendered server components; LiveDemo is the only client JS, lazy-loaded (`next/dynamic`).
- System fonts → zero font network cost, no FOUT.
- Shared JS ~102KB; landing first-load ~120KB. CSS-only background motifs (no canvas/WebGL). Skeleton states on async surfaces keep CLS minimal.
