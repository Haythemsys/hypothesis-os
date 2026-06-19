import type { NextRequest } from "next/server";
import { ok } from "@/lib/server/http";
import { getIdentity } from "@/lib/server/identity";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = getIdentity(req);
  const hypotheses = store.listHypotheses(id);
  const allVerdicts = hypotheses.flatMap((h) => store.listVerdicts(id, h.id));
  const allReports = store.listReports(id);

  const counts = allVerdicts.reduce<Record<string, number>>((a, v) => {
    a[v.finalVerdict] = (a[v.finalVerdict] || 0) + 1; return a;
  }, {});

  const recent = allVerdicts.slice(0, 5).map((v) => {
    const h = hypotheses.find((x) => x.id === v.hypothesisId);
    return { title: h?.title || v.hypothesisId, verdict: v.finalVerdict, createdAt: v.createdAt };
  });

  const recentReports = allReports.slice(0, 5).map((r) => {
    const h = hypotheses.find((x) => x.id === r.hypothesisId);
    return {
      id: r.id,
      hypothesisId: r.hypothesisId,
      title: r.title || h?.title || r.hypothesisId,
      aiAssisted: r.aiAssisted,
      createdAt: r.createdAt,
    };
  });

  type ActivityEvent = { type: string; title: string; at: string; meta?: string };
  const activity: ActivityEvent[] = [];
  for (const h of hypotheses.slice(0, 30)) {
    activity.push({ type: "hypothesis", title: h.title, at: h.createdAt });
  }
  for (const v of allVerdicts.slice(0, 30)) {
    const h = hypotheses.find((x) => x.id === v.hypothesisId);
    activity.push({ type: "verdict", title: h?.title || v.hypothesisId, at: v.createdAt, meta: v.finalVerdict });
  }
  for (const r of allReports.slice(0, 30)) {
    const h = hypotheses.find((x) => x.id === r.hypothesisId);
    activity.push({ type: "report", title: h?.title || r.hypothesisId, at: r.createdAt });
  }
  activity.sort((a, b) => (a.at > b.at ? -1 : 1));

  return ok({
    totalHypotheses: hypotheses.length,
    counts,
    recent,
    recentReports,
    activity: activity.slice(0, 15),
  });
}
