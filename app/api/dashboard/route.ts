import type { NextRequest } from "next/server";
import { ok } from "@/lib/server/http";
import { getIdentity } from "@/lib/server/identity";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

// GET /api/dashboard — user-scoped stats for the homepage
export async function GET(req: NextRequest) {
  const id = getIdentity(req);
  const hypotheses = store.listHypotheses(id);
  const allVerdicts = hypotheses.flatMap((h) => store.listVerdicts(id, h.id));

  const counts = allVerdicts.reduce<Record<string, number>>((a, v) => {
    a[v.finalVerdict] = (a[v.finalVerdict] || 0) + 1; return a;
  }, {});

  const recent = allVerdicts.slice(0, 5).map((v) => {
    const h = hypotheses.find((x) => x.id === v.hypothesisId);
    return { title: h?.title || v.hypothesisId, verdict: v.finalVerdict, createdAt: v.createdAt };
  });

  return ok({
    totalHypotheses: hypotheses.length,
    counts,
    recent,
  });
}
