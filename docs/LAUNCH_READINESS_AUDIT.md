# HypothesisOS — Launch Readiness Audit
**Date:** 2026-06-20  
**Status:** READY FOR PRIVATE BETA (with noted limitations)  
**Build:** 51 routes · 0 TypeScript errors · 8/8 benchmark pass

---

## Summary

| Priority | Count | Status |
|----------|-------|--------|
| Critical | 3 | Documented / accepted for beta |
| High | 5 | Partially addressed in Phase X |
| Medium | 8 | Backlog |
| Low | 6 | Backlog |

---

## Critical Issues

### C1 — No real authentication
**Risk:** Any user can access any route. Identity is stored in `localStorage` (`hypothesisos.identity.v1`) and sent via HTTP headers — no server-side session validation, no password, no OAuth.  
**Status:** Documented in `/trust` and `docs/AUTH_PLAN.md`. Acceptable for private beta with known participants. NOT acceptable for public launch.  
**Mitigation:** Block public beta to invite-only via `/beta` waitlist. Do not store confidential decisions.  
**Fix target:** Auth system (Phase Y).

### C2 — No input sanitization on free-text fields
**Risk:** Hypothesis titles and labels accept arbitrary text. No XSS protection beyond React's default escaping (which is sufficient for React renders, but output in Markdown exports is unescaped).  
**Status:** React escaping prevents DOM XSS. Markdown exports render raw content — users downloading their own data is acceptable risk.  
**Fix target:** Add DOMPurify to Markdown export renderer in Phase Y.

### C3 — SQLite path not guaranteed on stateless deployments
**Risk:** If deployed on serverless or containers without a persistent volume, `.data/hypothesisos.db` is recreated empty on each cold start, wiping all decisions.  
**Status:** Documented. HYPOS_DB env var exists for persistent volume path (e.g., Railway `/data/`).  
**Fix target:** Set HYPOS_DB before any private beta invitations.

---

## High Priority Issues

### H1 — No rate limiting on API endpoints
**Risk:** `/api/beta-signup`, `/api/events`, and `/api/hypotheses` have no rate limiting. An automated flood could fill the database.  
**Status:** Acceptable for small private beta. Add rate limiting (e.g., `@upstash/ratelimit`) before public launch.

### H2 — Admin pages have no access control
**Risk:** `/admin/beta` and `/admin/analytics` are publicly accessible. Any user can view beta signups.  
**Status:** Acceptable while server is non-public. Add admin token check before public deployment.  
**Quick fix:** Add `ADMIN_SECRET` env check in admin API routes.

### H3 — No error boundaries in most pages
**Risk:** A JavaScript error in a component crashes the entire page with no user-visible fallback.  
**Status:** Next.js shows default error UI. Add `error.tsx` files in critical route groups.

### H4 — Shared report links have no access control
**Risk:** `/report/[id]` is accessible to anyone with the link — including decisions marked as private.  
**Status:** Acceptable for beta (share link = intentional sharing). Must add org-scope check for teams.

### H5 — Landing page does not track `landing_view` event
**Risk:** The analytics funnel starts blind — no data on how many people land vs. convert.  
**Status:** Fix: add `landing_view` event fire on page load in the landing page.  
**Fix:** Applied in Phase X landing page update.

---

## Medium Priority Issues

### M1 — No 404 page for broken report links
Report `/report/[id]` with a non-existent ID shows a blank loading state, not a 404.

### M2 — Search has no debounce
`/search` fires a full API call on every keystroke. Add 300ms debounce.

### M3 — Export Center does not auto-select from `?id` param on mobile
The `useSearchParams` hook works but mobile layout clips the dropdown.

### M4 — Evidence Upload max file size not communicated to user
The 50,000 char content limit is enforced silently. Add a visible size warning.

### M5 — No og:image for social sharing
Landing page has no `og:image`. Social shares show a blank preview.

### M6 — No loading skeleton on Dashboard
Dashboard shows blank while loading hypotheses. Add skeleton UI.

### M7 — Duplicate icons in nav-items.ts
Several sidebar items share icons (◆ for both Knowledge and Intel Score, ⊕ for both Integrations and Workspace, etc.). Cosmetic, but confusing.

### M8 — Weekly Report page has no real data source
`/reports/weekly` generates a report from mock data, not from the user's actual decisions. This was intentional for Phase V but should be noted.

---

## Low Priority Issues

### L1 — No favicon variant for dark mode
Single SVG favicon works, but dark-mode browser tabs may show it poorly.

### L2 — `BAPA` references in old docs
Several docs reference `BAPA` (old project name). Not user-facing, but confusing for new contributors.

### L3 — Integrations page has no real OAuth
`/integrations` shows connector cards with "Connect" buttons — none actually authenticate. This is documented in the UI but could confuse users.

### L4 — Templates page uses `applyTemplate` (renamed from useTemplate) — correct but could be cleaner
Technical debt from ESLint hook-naming fix. Works correctly.

### L5 — No canonical URL / sitemap
No `sitemap.xml` or `robots.txt`. Not critical for private beta.

### L6 — Mobile dock "More" page is sparse
`/more` lists additional tools but has no search or categorization.

---

## What is Launch-Ready (Private Beta)

- ✅ Deterministic engine: all 8/8 benchmark cases pass
- ✅ 51 routes, 0 TypeScript errors, 0 build warnings
- ✅ Evidence workflow (create → evidence → verdict → report → export)
- ✅ Decision library, search, portfolio, executive dashboard
- ✅ Export: PDF (print), JSON, CSV, Markdown — all functional
- ✅ Share links (`/report/[id]`)
- ✅ Beta signup (`/beta`) and admin view (`/admin/beta`, `/admin/analytics`)
- ✅ Onboarding wizard (`/onboarding`) — first result in <3 minutes
- ✅ Public demos (`/demo`) — 3 pre-filled scenarios, no login
- ✅ Trust & transparency page (`/trust`)
- ✅ Documentation (`/docs`) — non-technical user guide
- ✅ Pricing page (`/pricing`) with interest tracking
- ✅ Analytics events tracked: 10 event types
- ✅ Auth plan documented (`docs/AUTH_PLAN.md`)

---

## Verdict

**READY FOR PRIVATE BETA** — with the following pre-launch requirements:

1. Set `HYPOS_DB` to a persistent volume path on your deployment platform.
2. Share `/beta` link only to known testers.
3. Do not process confidential decisions until real auth is implemented.
4. Review `/admin/beta` only from a trusted network until admin auth is added.

---

*Generated by HypothesisOS Phase X Launch Readiness Audit.*
