# Phase Q — Component Map

**Date:** 2026-06-19
**Status:** Pre-implementation, pending approval

Inventory of what is built, what gets restyled, and what is new. **Engine, lib, and API layers are untouched.** This is a presentation-layer redesign only.

---

## Layer 0 — Untouched (hard freeze)

```
lib/engine.mjs          lib/navigation.mjs        lib/decision-intelligence.mjs
lib/calibrate.mjs       lib/critique.mjs          lib/core.ts (types only, no logic)
app/api/**              lib/server/**             all thresholds, verdicts, gates
```
No edits. Phase P froze features; Phase Q is skin + shell only.

---

## Layer 1 — Design Primitives (new)

| Component | Purpose |
|-----------|---------|
| `components/ui/Verdict.tsx` | Verdict badge (glyph + color + label), 3 sizes. **Restyle existing** |
| `components/ui/Bar.tsx` | Evidence/progress bar. **Restyle existing** |
| `components/ui/Card.tsx` | Surface primitive (base/elevated/accent variants) — new |
| `components/ui/Button.tsx` | Button hierarchy (primary/ghost/danger) — new |
| `components/ui/Slider.tsx` | Touch-optimized evidence slider (36px track, live value) — new |
| `components/ui/Pill.tsx` | Status/toggle pill — new |
| `components/ui/Meter.tsx` | Debt/health meter (gradient, animated) — new |
| `components/ui/Counter.tsx` | Animated number counter for verdict/support — new |
| `components/ui/Ring.tsx` | SVG health ring (arc fill) — new |

---

## Layer 2 — Shell (new)

| Component | Surface | Replaces |
|-----------|---------|----------|
| `app/(app)/layout.tsx` | App route-group shell | wraps existing app pages |
| `components/shell/Sidebar.tsx` | Desktop left nav (64→220px) | — |
| `components/shell/TopBar.tsx` | Desktop top bar (verdict + debt meter) | — |
| `components/shell/BottomDock.tsx` | Mobile dock | **replaces** `components/Nav.tsx` |
| `components/shell/CommandPalette.tsx` | ⌘K overlay | — |
| `components/shell/ContextPanel.tsx` | Right panel (1440px+) | — |
| `components/shell/SectionTransition.tsx` | View-transition wrapper | — |

---

## Layer 3 — Identity (new)

| Component | Purpose |
|-----------|---------|
| `components/logo/Mark.tsx` | Signal Vertex icon (color/mono) |
| `components/logo/Logo.tsx` | Mark + wordmark |
| `app/icon.svg` | Favicon (Next metadata route) |
| `app/apple-icon.png` | Maskable app icon |

---

## Layer 4 — Landing (new)

```
app/page.tsx                         → orchestrates 12 sections (server)
components/landing/Hero.tsx          §1   server
components/landing/Problem.tsx       §2   server
components/landing/HowItWorks.tsx    §3   server
components/landing/LiveDemo.tsx      §4   CLIENT (lazy, runs @/lib/core)
components/landing/NavigationEngine.tsx §5 server
components/landing/AuditTrail.tsx    §6   server
components/landing/EvidenceDebt.tsx  §7   server
components/landing/RiskAnalysis.tsx  §8   server
components/landing/CompareVsAI.tsx   §9   server
components/landing/Pricing.tsx       §10  server
components/landing/FAQ.tsx           §11  server (CSS accordion)
components/landing/FinalCTA.tsx      §12  server
components/landing/LandingNav.tsx    sticky top bar w/ anchor links
```

---

## Layer 5 — App Pages (restyle in place)

| Page | Action |
|------|--------|
| `app/dashboard/page.tsx` | **Rebuild** as Mission Control (06 spec) |
| `app/workflow/page.tsx` | Restyle: two-col on desktop, sticky action mobile |
| `app/evidence/page.tsx` | Restyle: verdict-first, new sliders, Phase O panels kept |
| `app/compare/page.tsx` | Restyle to new tokens |
| `app/report/[id]/page.tsx` | **Rebuild** as Executive Brief (08 report spec) |
| `app/audit/[id]/page.tsx` | Restyle timeline to Vercel-log aesthetic |
| `app/more/page.tsx` | Restyle to new tokens |

---

## Layer 6 — Existing (restyle only, no logic change)

```
components/DecisionIntelligence.tsx   → new tokens
components/CommercialIntelligence.tsx → new tokens
components/NavigationPanel.tsx        → new tokens
components/UserDashboard.tsx          → folded into Mission Control or restyled
components/Verdict.tsx                → becomes ui/Verdict.tsx
```

---

## Dependency Graph (build order)

```
tailwind.config + globals.css (tokens, fonts)
   └─> Layer 1 primitives
         └─> Layer 3 logo
         └─> Layer 2 shell ──> Layer 5 app pages
         └─> Layer 4 landing
```
Primitives and tokens first (everything depends on them), then shell + logo, then pages and landing in parallel.

---

## Risk / Compatibility Notes

- `Nav.tsx` → `BottomDock.tsx`: keep `Nav.tsx` until dock is verified, then swap import in root layout, then delete.
- Verdict CSS classes (`verdict-GO/KILL/UNRESOLVED`, `text-go/kill/unresolved`) are used across many files — **keep them**, retune their hex values centrally in globals.css so all consumers update at once.
- Phase O components already mobile-hardened — restyle is token swap, not rebuild.
- New color tokens are **added** to Tailwind; old tokens (`ink/panel/line`) remain so nothing breaks mid-migration.
