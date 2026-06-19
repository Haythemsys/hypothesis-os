import type { NextRequest } from "next/server";
import { ok, bad, notFound, readJson } from "@/lib/server/http";
import { getIdentity } from "@/lib/server/identity";
import { store, newId } from "@/lib/server/store";
import type { Comment, CommentStatus } from "@/lib/models";

export const dynamic = "force-dynamic";

// GET /api/hypotheses/:id/comments
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ident = getIdentity(req);
  const { id } = await ctx.params;
  const h = store.getHypothesis(ident, id);
  if (!h) return notFound("hypothesis");
  const comments = store.listComments(ident.orgId, id);
  return ok({ comments });
}

// POST /api/hypotheses/:id/comments { text, authorName?, parentId? }
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ident = getIdentity(req);
  const { id } = await ctx.params;
  const h = store.getHypothesis(ident, id);
  if (!h) return notFound("hypothesis");

  const body = await readJson<{ text?: string; authorName?: string; parentId?: string; status?: CommentStatus }>(req);
  if (!body?.text?.trim()) return bad("text is required");

  const comment: Comment = {
    id: newId("cmt"),
    orgId: ident.orgId,
    hypothesisId: id,
    authorId: ident.ownerId,
    authorName: body.authorName?.trim() || "Member",
    text: body.text.trim(),
    status: "open",
    parentId: body.parentId,
    createdAt: new Date().toISOString(),
  };
  store.createComment(comment);
  return ok({ comment }, 201);
}

// PATCH /api/hypotheses/:id/comments { commentId, status }
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ident = getIdentity(req);
  const { id: hypId } = await ctx.params;
  const body = await readJson<{ commentId?: string; status?: CommentStatus }>(req);
  if (!body?.commentId || !body?.status) return bad("commentId and status are required");
  store.resolveComment(ident.orgId, body.commentId, body.status);
  return ok({ success: true });
}
