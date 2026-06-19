import type { NextRequest } from "next/server";
import { ok } from "@/lib/server/http";
import { getIdentity } from "@/lib/server/identity";
import { store } from "@/lib/server/store";
import {
  selfCritique, navigate, evidenceDebt, decisionRisk, decisionEffort, calibrate,
  type Evidence,
} from "@/lib/core";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = getIdentity(req);
  const hypotheses = store.listHypotheses(id);

  const portfolioItems = hypotheses.map((h) => {
    const evidenceList = store.listEvidence(id, h.id);
    const verdicts = store.listVerdicts(id, h.id);
    const ev = evidenceList[evidenceList.length - 1]?.evidence as Evidence | undefined;
    const latestVerdict = verdicts[verdicts.length - 1];

    if (!ev) return { id: h.id, title: h.title, createdAt: h.createdAt, verdict: null, support: null, debt: null, risk: null };

    try {
      const crit = selfCritique(ev);
      const nav = navigate(ev, crit.finalVerdict);
      const debt = evidenceDebt(ev, nav);
      const cal = calibrate(ev);
      const risk = decisionRisk(debt, nav, cal.score);
      const eff = decisionEffort(nav);

      return {
        id: h.id,
        title: h.title,
        createdAt: h.createdAt,
        verdict: crit.finalVerdict,
        support: nav.currentSupport,
        debt: debt.pct,
        debtBand: debt.band,
        risk: risk.level,
        riskScore: risk.score,
        effort: eff.level,
        evidenceCount: evidenceList.length,
        verdictCount: verdicts.length,
      };
    } catch {
      return { id: h.id, title: h.title, createdAt: h.createdAt, verdict: null, support: null, debt: null, risk: null };
    }
  });

  const withData = portfolioItems.filter((p) => p.verdict !== null);
  const total = portfolioItems.length;
  const counts: Record<string, number> = { GO: 0, KILL: 0, UNRESOLVED: 0 };
  const riskCounts: Record<string, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
  let totalDebt = 0, totalRisk = 0, debtItems = 0, riskItems = 0;

  for (const p of withData) {
    if (p.verdict) counts[p.verdict] = (counts[p.verdict] || 0) + 1;
    if (p.debt !== null && p.debt !== undefined) { totalDebt += p.debt; debtItems++; }
    if (p.riskScore !== undefined) { totalRisk += p.riskScore; riskItems++; }
    if (p.risk) riskCounts[p.risk] = (riskCounts[p.risk] || 0) + 1;
  }

  const avgDebt = debtItems > 0 ? totalDebt / debtItems : 0;
  const avgRisk = riskItems > 0 ? totalRisk / riskItems : 0;
  const goRatio = total > 0 ? (counts.GO || 0) / total : 0;
  const killRatio = total > 0 ? (counts.KILL || 0) / total : 0;
  const resolvedRatio = total > 0 ? ((counts.GO || 0) + (counts.KILL || 0)) / total : 0;

  // Portfolio Health Score: 0-100
  // GO decisions are positive signals, resolved decisions show completion,
  // low debt = strong evidence base, low risk = well-evidenced portfolio
  const healthScore = Math.round(
    (goRatio * 35) +
    (resolvedRatio * 30) +
    (Math.max(0, 1 - avgDebt / 100) * 20) +
    (Math.max(0, 1 - avgRisk / 100) * 15)
  );

  return ok({
    total,
    counts,
    riskCounts,
    avgDebt: Math.round(avgDebt),
    avgRisk: Math.round(avgRisk),
    healthScore,
    goRatio: Math.round(goRatio * 100),
    killRatio: Math.round(killRatio * 100),
    resolvedRatio: Math.round(resolvedRatio * 100),
    items: portfolioItems,
  });
}
