// HypothesisOS — identity resolution (Phase 5).
// HONEST STATUS: this is account-READY structure, NOT authenticated auth. Identity is read
// from request headers (x-user-id / x-org-id). In production these would be set by an auth
// middleware (session/JWT) — the rest of the system already scopes every query by this
// identity, so swapping in real auth does not touch the data layer.

import type { NextRequest } from "next/server";
import type { Scope } from "../models";

export const DEFAULT_USER = "local-user";

export interface Identity { ownerId: string; orgId: string }

// A user with NO explicit org gets a PERSONAL org derived from their id, so two distinct users
// are isolated by default. Sharing only happens when callers explicitly send the SAME x-org-id
// (team / organization mode). This is what enforces "User A must never see User B data".
export function getIdentity(req: NextRequest): Identity {
  const ownerId = req.headers.get("x-user-id")?.trim() || DEFAULT_USER;
  const orgId = req.headers.get("x-org-id")?.trim() || `org:${ownerId}`;
  return { ownerId, orgId };
}

export function scopeOf(id: Identity): Scope {
  return { ownerId: id.ownerId, orgId: id.orgId };
}

// Visibility rule: an entity is visible if the caller owns it OR shares its org.
// (Solo users have a unique org, so org-sharing collapses to owner-only — true isolation.)
export function canSee(id: Identity, e: Scope): boolean {
  return e.ownerId === id.ownerId || e.orgId === id.orgId;
}
