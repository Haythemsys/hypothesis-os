import type { NextRequest } from "next/server";
import { ok, bad, readJson } from "@/lib/server/http";
import { getIdentity, scopeOf } from "@/lib/server/identity";
import { store, newId } from "@/lib/server/store";
import { decompose } from "@/lib/core";
import type { Hypothesis } from "@/lib/models";

export const dynamic = "force-dynamic";

// GET /api/hypotheses?projectId=...   — list (scoped to caller)
export async function GET(req: NextRequest) {
  const id = getIdentity(req);
  const projectId = req.nextUrl.searchParams.get("projectId") || undefined;
  return ok({ hypotheses: store.listHypotheses(id, projectId) });
}

// POST /api/hypotheses { projectId, title }  — create + auto-decompose (deterministic)
export async function POST(req: NextRequest) {
  const id = getIdentity(req);
  const body = await readJson<{ projectId?: string; title?: string }>(req);
  if (!body?.title?.trim()) return bad("title is required");

  const d = decompose(body.title);
  const now = new Date().toISOString();
  const h: Hypothesis = {
    id: newId("hyp"), ...scopeOf(id),
    projectId: body.projectId || "default",
    title: body.title.trim(),
    kinds: d.kinds, requiresGeneralization: d.requiresGeneralization,
    assumptions: d.assumptions, confounds: d.confounds,
    createdAt: now, updatedAt: now,
  };
  store.createHypothesis(h);
  return ok({ hypothesis: h }, 201);
}
