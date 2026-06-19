import type { NextRequest } from "next/server";
import { ok, bad, readJson } from "@/lib/server/http";
import { getIdentity } from "@/lib/server/identity";
import { store, newId } from "@/lib/server/store";
import type { WorkspaceMember, WorkspaceRole } from "@/lib/models";

export const dynamic = "force-dynamic";

// GET /api/workspace — list members of current org workspace
export async function GET(req: NextRequest) {
  const ident = getIdentity(req);
  const members = store.listMembers(ident.orgId);
  // Auto-join as owner if this is a fresh workspace
  const selfMember = members.find((m) => m.userId === ident.ownerId);
  return ok({
    workspaceId: ident.orgId,
    members,
    self: selfMember ?? null,
  });
}

// POST /api/workspace { action: "join"|"invite"|"set_role"|"leave", userId?, role?, displayName? }
export async function POST(req: NextRequest) {
  const ident = getIdentity(req);
  const body = await readJson<{ action?: string; userId?: string; role?: WorkspaceRole; displayName?: string }>(req);
  if (!body?.action) return bad("action required");

  const now = new Date().toISOString();

  if (body.action === "join") {
    const member: WorkspaceMember = {
      id: newId("mem"),
      workspaceId: ident.orgId,
      userId: ident.ownerId,
      role: (body.role as WorkspaceRole) || "researcher",
      displayName: body.displayName?.trim() || "Member",
      joinedAt: now,
    };
    store.upsertMember(member);
    return ok({ member });
  }

  if (body.action === "invite") {
    if (!body.userId) return bad("userId required for invite");
    const member: WorkspaceMember = {
      id: newId("mem"),
      workspaceId: ident.orgId,
      userId: body.userId,
      role: (body.role as WorkspaceRole) || "viewer",
      displayName: body.displayName?.trim() || body.userId,
      invitedBy: ident.ownerId,
      joinedAt: now,
    };
    store.upsertMember(member);
    return ok({ member });
  }

  if (body.action === "set_role") {
    if (!body.userId || !body.role) return bad("userId and role required");
    const existing = store.getMember(ident.orgId, body.userId);
    if (!existing) return bad("member not found");
    store.upsertMember({ ...existing, role: body.role });
    return ok({ success: true });
  }

  if (body.action === "leave") {
    store.removeMember(ident.orgId, ident.ownerId);
    return ok({ success: true });
  }

  return bad(`Unknown action: ${body.action}`);
}
