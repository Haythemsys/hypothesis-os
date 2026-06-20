# HypothesisOS — Authentication Architecture Plan
**Phase X5 — Auth Design (not yet implemented)**  
**Date:** 2026-06-20

---

## Current State (Beta)

HypothesisOS uses a **pseudo-identity system** stored in the browser:

- **Client identity:** `localStorage["hypothesisos.identity.v1"]` → `{ userId, orgId }`
- **Server identity:** `x-user-id` + `x-org-id` headers, read by `lib/server/identity.ts`
- **All queries** are scoped to `(ownerId, orgId)` — structural isolation exists but no authentication

This is secure enough for private beta where testers self-identify. It is NOT secure for production.

---

## Data Models

```typescript
// Users (one per account)
interface User {
  id: string;           // uuid
  email: string;        // unique, verified
  handle: string;       // display name
  orgId: string;        // primary org
  role: "owner" | "member" | "admin";
  emailVerifiedAt?: string;
  createdAt: string;
}

// Organizations (team scope)
interface Organization {
  id: string;           // uuid
  name: string;
  plan: "solo" | "team" | "enterprise";
  ownerId: string;      // user who created it
  createdAt: string;
}

// Sessions (server-side, replaces localStorage)
interface Session {
  id: string;           // session token (stored as httpOnly cookie)
  userId: string;
  orgId: string;
  expiresAt: string;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

// Workspace roles (already in models.ts)
type WorkspaceRole = "owner" | "executive" | "researcher" | "reviewer" | "viewer";
```

---

## Route Protection Map

| Route pattern | Current | Auth required | Minimum role |
|---|---|---|---|
| `/` | Public | No | — |
| `/demo` | Public | No | — |
| `/onboarding` | Public | No | — |
| `/beta` | Public | No | — |
| `/pricing` | Public | No | — |
| `/trust` | Public | No | — |
| `/docs` | Public | No | — |
| `/workflow` | Pseudo-auth | Yes | `viewer` |
| `/dashboard` | Pseudo-auth | Yes | `viewer` |
| `/library` | Pseudo-auth | Yes | `viewer` |
| `/evidence` | Pseudo-auth | Yes | `researcher` |
| `/executive` | Pseudo-auth | Yes | `executive` |
| `/report/[id]` | Pseudo-auth | Link-access | — |
| `/admin/*` | None | Yes | `admin` |
| `/api/beta-signup` | Public | No | — |
| `/api/events` | Public/pseudo | No | — |
| `/api/hypotheses` | Pseudo-auth | Yes | `viewer` |
| `/api/admin/*` | None | Yes | `admin` |

---

## Auth Provider Plan

### Phase 1: Email Magic Link (recommended first)
- User enters email → receives 6-digit code → session created
- Simple, no OAuth complexity, works for private beta invitees
- No password to forget, no OAuth app registration

**Libraries:** `nodemailer` + `@sendgrid/mail` or Resend SDK  
**Tokens:** 6-digit OTP, 15-minute expiry, single-use

### Phase 2: Google OAuth
- Standard OAuth 2.0 flow via `/api/auth/google`
- Redirect → Google consent → callback → session created
- `CLIENT_ID` + `CLIENT_SECRET` environment variables

**Libraries:** Next.js Route Handlers + `google-auth-library`

### Phase 3: GitHub OAuth
- Same pattern as Google
- Useful for technical/developer users

### Phase 4: SSO / SAML (Enterprise)
- Handled via a dedicated IdP provider (e.g., WorkOS, Auth0)
- Out of scope until Enterprise tier launches

---

## Implementation Steps (when ready)

1. Add `users`, `organizations`, `sessions` tables to `sqlite-store.ts`
2. Create `lib/server/auth.ts` — `getSession(req)` from httpOnly cookie
3. Replace `getIdentity(req)` with `requireAuth(req)` in all protected API routes
4. Create `/api/auth/magic-link` — POST email → send OTP
5. Create `/api/auth/verify` — POST code → create session → set cookie
6. Create `/api/auth/logout` — DELETE session + clear cookie
7. Add middleware (`middleware.ts`) to redirect unauthenticated requests to `/login`
8. Build `/login` page — email input → OTP input → redirect to `/dashboard`
9. Migrate identity from `localStorage` to session cookie on first login

---

## Security Requirements

- Sessions use `httpOnly; Secure; SameSite=Strict` cookies
- Session token is a 32-byte random hex (not JWT) — stored hashed in DB
- Admin routes require `ADMIN_SECRET` env var header check until RBAC is implemented
- Rate limit: 5 magic link requests per email per hour
- Rate limit: 10 OTP attempts per session

---

## What NOT to Do

- Do NOT implement fake auth (hardcoded passwords, shared credentials)
- Do NOT store session tokens in `localStorage` (XSS risk)
- Do NOT use JWT without expiry and rotation
- Do NOT share ADMIN_SECRET in client bundles

---

*This plan is documentation only. No auth code is implemented in this phase.*  
*Implementation is Phase Y scope.*
