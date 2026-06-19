import type { NextRequest } from "next/server";
import { ok, bad, notFound, readJson } from "@/lib/server/http";
import { getIdentity } from "@/lib/server/identity";
import { store, newId } from "@/lib/server/store";
import type { Approval, ApprovalStatus } from "@/lib/models";

export const dynamic = "force-dynamic";

// GET /api/hypotheses/:id/approval
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ident = getIdentity(req);
  const { id } = await ctx.params;
  const h = store.getHypothesis(ident, id);
  if (!h) return notFound("hypothesis");
  const approval = store.getApproval(ident.orgId, id);
  return ok({ approval });
}

// POST /api/hypotheses/:id/approval { action, notes?, reviewerId?, executiveId? }
// action: submit | review_approve | review_reject | exec_approve | exec_reject | archive | reopen
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ident = getIdentity(req);
  const { id } = await ctx.params;
  const h = store.getHypothesis(ident, id);
  if (!h) return notFound("hypothesis");

  const body = await readJson<{ action?: string; notes?: string; reviewerId?: string; executiveId?: string }>(req);
  if (!body?.action) return bad("action is required");

  const now = new Date().toISOString();
  let current = store.getApproval(ident.orgId, id);

  const transitions: Record<string, Partial<Approval>> = {
    submit:          { status: "under_review", submittedAt: now },
    review_approve:  { status: "approved", reviewedAt: now, reviewerNotes: body.notes, reviewerId: body.reviewerId || ident.ownerId },
    review_reject:   { status: "rejected", reviewedAt: now, reviewerNotes: body.notes, reviewerId: body.reviewerId || ident.ownerId },
    exec_approve:    { status: "approved", executiveAt: now, executiveNotes: body.notes, executiveId: body.executiveId || ident.ownerId },
    exec_reject:     { status: "rejected", executiveAt: now, executiveNotes: body.notes, executiveId: body.executiveId || ident.ownerId },
    archive:         { status: "archived" },
    reopen:          { status: "draft", reviewerNotes: undefined, executiveNotes: undefined },
  };

  const patch = transitions[body.action];
  if (!patch) return bad(`Unknown action: ${body.action}`);

  const next: Approval = {
    id: current?.id ?? newId("apr"),
    orgId: ident.orgId,
    hypothesisId: id,
    status: "draft",
    submittedBy: current?.submittedBy ?? ident.ownerId,
    createdAt: current?.createdAt ?? now,
    ...current,
    ...patch,
  };

  store.upsertApproval(next);
  return ok({ approval: next });
}
