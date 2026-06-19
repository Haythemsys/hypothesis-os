import type { NextRequest } from "next/server";
import { ok, notFound } from "@/lib/server/http";
import { getIdentity } from "@/lib/server/identity";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

// GET /api/hypotheses/:id — full record with evidence, experiments, verdicts (scoped)
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ident = getIdentity(req);
  const { id } = await ctx.params;
  const hypothesis = store.getHypothesis(ident, id);
  if (!hypothesis) return notFound("hypothesis");
  return ok({
    hypothesis,
    evidence: store.listEvidence(ident, id),
    experiments: store.listExperiments(ident, id),
    verdicts: store.listVerdicts(ident, id),
    reports: store.listReports(ident, id),
  });
}
