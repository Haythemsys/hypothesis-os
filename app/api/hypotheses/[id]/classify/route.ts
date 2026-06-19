import type { NextRequest } from "next/server";
import { ok, bad, notFound, readJson } from "@/lib/server/http";
import { getIdentity, scopeOf } from "@/lib/server/identity";
import { store, newId } from "@/lib/server/store";
import { selfCritique, explain, navigate } from "@/lib/core";
import type { VerdictRecord } from "@/lib/models";

export const dynamic = "force-dynamic";

// POST /api/hypotheses/:id/classify { evidenceId? }
// The DETERMINISTIC engine is the constitutional judge. No LLM is consulted here.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ident = getIdentity(req);
  const { id } = await ctx.params;
  const h = store.getHypothesis(ident, id);
  if (!h) return notFound("hypothesis");

  const body = await readJson<{ evidenceId?: string }>(req);
  const list = store.listEvidence(ident, id);
  if (list.length === 0) return bad("no evidence recorded for this hypothesis");
  const rec = body?.evidenceId ? store.getEvidence(ident, body.evidenceId) : list[0];
  if (!rec) return notFound("evidence");

  const crit = selfCritique(rec.evidence);
  const ex = explain(rec.evidence, h.title);
  const nav = navigate(rec.evidence, crit.finalVerdict);
  const v: VerdictRecord = {
    id: newId("vrd"), ...scopeOf(ident), hypothesisId: id, evidenceId: rec.id,
    verdict: crit.baseVerdict, finalVerdict: crit.finalVerdict,
    support: ex.support, calibration: crit.calibration.score, band: crit.calibration.band,
    reasons: crit.reasons, createdAt: new Date().toISOString(),
  };
  store.createVerdict(v);
  return ok({ verdict: v, explanation: ex, critique: crit, navigation: nav, judge: "deterministic-engine" });
}
