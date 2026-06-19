# Phase Q — Implementation Plan

**Date:** 2026-06-19
**Status:** Pre-implementation, pending approval

Sequenced milestones. **After every milestone: build → test (benchmark + structural) → fix → commit → push.** No milestone is complete until pushed. Engine/API/lib logic frozen throughout.

---

## Milestone 0 — Foundation (tokens, fonts, primitives)
**Scope:** Tailwind tokens (obsidian/graphite/amber/ivory/steel/slate), `next/font` Geist + Geist Mono, retune verdict hex centrally in globals.css, build Layer-1 primitives (Card, Button, Slider, Pill, Meter, Counter, Ring, restyle Verdict/Bar).
**Done when:** primitives render in isolation; existing pages still build (old tokens intact); benchmark 8/8.
**Commit:** `feat: Phase Q M0 — design tokens, fonts, UI primitives`

## Milestone 1 — Logo & identity
**Scope:** Signal Vertex `Mark.tsx`, `Logo.tsx`, `app/icon.svg`, app icon. Wire into metadata.
**Done when:** favicon + logo render at all sizes; build clean.
**Commit:** `feat: Phase Q M1 — Signal Vertex logo system`

## Milestone 2 — App shell
**Scope:** `app/(app)/layout.tsx` route group, `Sidebar`, `TopBar` (live verdict + debt meter), `BottomDock` (replace Nav.tsx), `CommandPalette` (⌘K), section transitions. Move app pages under the group.
**Done when:** navigation works mobile + desktop, zero horizontal scroll at 390/430/768/1024/1440, ⌘K opens, old Nav removed.
**Commit:** `feat: Phase Q M2 — OS app shell (sidebar, dock, command palette)`

## Milestone 3 — Mission Control dashboard
**Scope:** Rebuild `app/dashboard` per doc 06 — health ring, risk distribution, evidence debt, active hypotheses (risk-sorted), recent log. Client aggregation over existing APIs only.
**Done when:** renders with real + empty data; responsive grid; build clean.
**Commit:** `feat: Phase Q M3 — Mission Control dashboard`

## Milestone 4 — Work surfaces (workflow + evidence)
**Scope:** Restyle workflow (two-col desktop, sticky mobile action) and evidence (verdict-first, new sliders, keep Phase O/N panels). Live slider→verdict on desktop.
**Done when:** full encode→verdict→navigate flow works at all breakpoints; benchmark/structural pass.
**Commit:** `feat: Phase Q M4 — redesigned work surfaces`

## Milestone 5 — Executive Brief report
**Scope:** Rebuild `app/report/[id]` per doc 04 — Summary/Verdict/Risk/Evidence/Navigation/Next Actions/Timeline; premium print stylesheet.
**Done when:** screen + print both clean; investor-ready single doc.
**Commit:** `feat: Phase Q M5 — Executive Brief report`

## Milestone 6 — Audit + compare + more
**Scope:** Restyle audit trail (Vercel-log timeline), compare, more to new tokens.
**Done when:** all app pages on the new identity; build clean.
**Commit:** `feat: Phase Q M6 — audit, compare, more restyle`

## Milestone 7 — Landing page
**Scope:** New `app/page.tsx` (12 sections), landing nav, all section components, lazy LiveDemo running `@/lib/core` client-side. Move current app entry to `/app`.
**Done when:** scroll-narrative works, demo interactive, anchors smooth-scroll, Lighthouse perf > 92, zero horizontal scroll.
**Commit:** `feat: Phase Q M7 — landing experience`

## Milestone 8 — Polish & performance
**Scope:** `prefers-reduced-motion`, focus rings, a11y labels, skeleton states, Lighthouse pass (>95 target), final responsive sweep at all 5 widths, design-system doc finalization.
**Done when:** Lighthouse perf+a11y green; all breakpoints verified; benchmark 8/8, structural 10/10.
**Commit:** `feat: Phase Q M8 — performance & accessibility polish`

---

## Per-Milestone Checklist (every milestone)
```
1. npm run build           → must compile
2. node scripts/run-benchmark.mjs        → 8/8, 5/5
3. node scripts/engine-structural-tests.mjs → 10/10
4. manual responsive check (390/430/768/1024/1440)
5. fix all failures
6. git add -A && git commit -m "feat: Phase Q M<n> — …"
7. git push origin master
```

---

## Guardrails (all milestones)
- No edits to engine/navigation/decision-intelligence/calibrate/critique logic.
- No new thresholds, verdict types, evidence dimensions, or scoring.
- Old Tailwind tokens stay until a component is fully migrated (no big-bang break).
- Verdict CSS classes kept; hex retuned centrally.
- Health metric is display-only, labeled as portfolio summary, never feeds engine.

---

## Sequencing Rationale
Tokens/primitives first (universal dependency) → identity → shell (everything renders inside it) → dashboard (highest-value app surface) → work surfaces (core loop) → report → remaining pages → landing (depends on primitives + demo) → polish. Each milestone is independently shippable and leaves the app in a working, pushed state.

---

## Estimated Surface
~8 milestones · ~30 new components · ~8 pages restyled · 0 engine changes · 0 API changes. Each milestone is a self-contained commit, build-verified and benchmark-verified before push.
