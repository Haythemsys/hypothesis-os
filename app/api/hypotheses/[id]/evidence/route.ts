import type { NextRequest } from "next/server";
import { ok, bad, notFound, readJson } from "@/lib/server/http";
import { getIdentity, scopeOf } from "@/lib/server/identity";
import { store, newId } from "@/lib/server/store";
import type { EvidenceRecord } from "@/lib/models";
import type { Evidence } from "@/lib/core";

export const dynamic = "force-dynamic";

// POST /api/hypotheses/:id/evidence { label, evidence }
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ident = getIdentity(req);
  const { id } = await ctx.params;
  const h = store.getHypothesis(ident, id);
  if (!h) return notFound("hypothesis");

  const body = await readJson<{ label?: string; evidence?: Partial<Evidence> }>(req);
  if (!body?.evidence) return bad("evidence object is required");

  const e = body.evidence;
  const rec: EvidenceRecord = {
    id: newId("ev"), ...scopeOf(ident), hypothesisId: id,
    label: body.label?.trim() || "evidence",
    evidence: {
      effect: num(e.effect), replication: num(e.replication), hostileSurvival: num(e.hostileSurvival),
      confoundControl: num(e.confoundControl), generalization: num(e.generalization), power: num(e.power),
      ciExcludesNull: !!e.ciExcludesNull,
      claimRequiresGeneralization: e.claimRequiresGeneralization ?? h.requiresGeneralization,
    },
    createdAt: new Date().toISOString(),
  };
  store.createEvidence(rec);
  return ok({ evidence: rec }, 201);
}

function num(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(1, n)) : 0;
}
