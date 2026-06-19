# Phase Q — Product Architecture Blueprint

**Date:** 2026-06-19  
**Status:** Pre-implementation, pending approval

---

## MCP Research Synthesis

Analyzed 10 reference products before designing. Key extracted patterns:

| Product | What to borrow |
|---------|---------------|
| **Linear** | ⌘K command palette as primary nav; instant section switching; icon-only sidebar expands on hover; single accent color on monochrome |
| **Raycast** | Command-bar as entry point; list-based evidence results; keyboard-everything |
| **Palantir Gotham** | Dark operational aesthetic; multi-panel mission control; no decoration; everything serves a function |
| **Bloomberg Terminal** | Information density without clutter; data primacy; monospaced values; serious tone |
| **Stripe Dashboard** | Professional data tables; clear status indicators; excellent hierarchy (overview → detail → item) |
| **Vercel** | Status-as-content; deployment log aesthetic for audit trail; minimal chrome |
| **Superhuman** | Split-panel (list + detail); ⌘K dispatch; "done" as a clear state |
| **Arc Browser** | Space metaphor for context switching; sidebar-first on desktop |
| **Perplexity** | Answer-first (verdict top); progressive disclosure for supporting evidence |
| **Notion** | Structured but flexible; breadcrumb for deep navigation |

**Synthesis principle:** HypothesisOS is closer to Palantir/Bloomberg than to Notion/Superhuman. It is an operational tool for high-stakes decisions, not a productivity tool for note-taking. Every design decision should reinforce gravity and precision.

---

## Architecture Decision 1 — Application Shell vs. Landing

**Problem:** Currently `/` is the app dashboard. A first-time visitor lands in the product with no context.

**Decision:**
- `/` → Marketing landing page (12 sections, scroll-based, converts visitors)
- `/app` → Application shell entry (redirects to `/workflow` for new users, `/dashboard` for returning)
- Existing routes (`/workflow`, `/evidence`, `/dashboard`, etc.) remain functional, just restyled

**Rationale:** The landing page is a conversion surface. The app is a work surface. Mixing them costs both. The existing `/dashboard` (Phase O) serves as the app entry point.

---

## Architecture Decision 2 — Navigation Model

**Current:** Traditional bottom tab bar (5 tabs), full page reload on each route.

**Target:** Two-tier navigation that feels like an OS.

### Mobile (390px–767px)
- Fixed bottom dock: 5 icon zones, 64px height, amber accent on active
- Route changes use CSS `View Transition API` (slide-left/slide-right animation)
- Active section persists its scroll position across navigation (scrollRestoration)
- ⌘K / search icon → command palette overlay

### Desktop (1024px+)
- Fixed left sidebar: 64px icon strip (collapsed) → 220px (hover/pinned)
- Main content area fills remaining width: `calc(100vw - 64px)`
- Top bar: 48px, shows current hypothesis name + verdict + debt meter
- Right panel (optional, collapsible): context info for current section

### Transitions
- Section change: content fades (150ms) then slides in from right (200ms)
- Command palette: backdrop-blur overlay, appears in 80ms
- Verdict badge: animated number counter on value change

---

## Architecture Decision 3 — Route Structure

No structural routes change. Visual shell wraps all existing routes.

```
/                     → Landing (new — marketing)
/app                  → Entry redirect → /dashboard
/workflow             → App: Workflow (restyled)
/evidence             → App: Evidence Engine (restyled)
/dashboard            → App: Mission Control (restyled)
/compare              → App: Benchmark (restyled)
/report/[id]          → App: Executive Report (restyled)
/audit/[id]           → App: Audit Trail (restyled)
/more                 → App: More tools (restyled)
```

**Implementation:** A new `app/(app)/layout.tsx` route group wraps all app routes with the new sidebar + top bar shell. The landing `/` sits outside the group with its own layout.

---

## Architecture Decision 4 — State Architecture

**No changes to engine state.** Evidence, verdict, navigation, debt remain identical.

**UI state additions:**
- `sidebar-pinned`: persisted in localStorage
- `active-hypothesis-id`: persisted in sessionStorage (last worked on)
- `command-palette-open`: ephemeral component state
- `section-transition-direction`: ephemeral ("left" | "right")

---

## Architecture Decision 5 — Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| Lighthouse Performance | >92 | Server components for static sections; lazy load commercial intelligence panels |
| First Contentful Paint | <1.2s | Static landing; no JS blocking |
| Time to Interactive | <2.5s | Minimal client JS on landing |
| Layout Shift (CLS) | <0.05 | Fixed shell dimensions, skeleton placeholders |
| Bundle size (app) | <130KB JS | Current is ~102KB shared; headroom exists |

**Landing page strategy:** Pure server components + CSS-only animations where possible. No JavaScript required to read the landing page. Interactive demo (Section 4) is a client component lazy-loaded below the fold.

---

## Architecture Decision 6 — CSS Strategy

**Current:** Tailwind with custom tokens (go/kill/unresolved/ink/panel/line).

**Phase Q additions:**
- Extend Tailwind config with new color tokens (obsidian, graphite, amber-accent, ivory, steel, mist)
- Keep existing tokens (go/kill/unresolved) — these are functional/semantic colors
- Rename ink→obsidian, panel→graphite, line→border-default in new components (old names remain for backward compat)
- Add CSS custom properties for animation timing and spacing scale
- Add `@layer utilities` for new interaction patterns (command palette, verdict animation, sidebar transition)

**No breaking changes** to existing component CSS — new components use new tokens; existing components continue with current tokens until restyled.

---

## Architecture Decision 7 — Component Strategy

Existing components are **restyled, not replaced**. The engines and data flows are untouched.

New components added:
- `components/shell/Sidebar.tsx` — Desktop sidebar
- `components/shell/TopBar.tsx` — Desktop top bar with debt meter
- `components/shell/CommandPalette.tsx` — ⌘K overlay
- `components/shell/BottomDock.tsx` — Mobile dock (replaces Nav.tsx)
- `components/landing/` — All landing sections as separate files
- `components/logo/Logo.tsx` — SVG logo component

---

## Architecture Decision 8 — Landing Demo

The live demo (Section 4 of landing) must work without a backend call. It runs the engine client-side using the existing `@/lib/core` functions. No API call needed. This makes it fast, offline-capable, and impossible to fail due to a server error.

The demo runs `classify()`, `navigate()`, `evidenceDebt()`, `decisionRisk()` directly in the browser — same code that powers the app.
