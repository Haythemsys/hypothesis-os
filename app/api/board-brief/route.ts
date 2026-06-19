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
  const allReports = store.listReports(id);
  const allApprovals = store.listApprovals(id.orgId);

  type DecisionBrief = {
    id: string; title: string; verdict: string | null;
    support: number; debt: number; risk: string; riskScore: number;
    effort: string; daysOpen: number;
  };

  const decisions: DecisionBrief[] = [];

  for (const h of hypotheses) {
    const evidenceList = store.listEvidence(id, h.id);
    const ev = evidenceList[evidenceList.length - 1]?.evidence as Evidence | undefined;
    const daysOpen = Math.floor((Date.now() - new Date(h.createdAt).getTime()) / 86400000);

    if (!ev) {
      decisions.push({ id: h.id, title: h.title, verdict: null, support: 0, debt: 100, risk: "HIGH", riskScore: 75, effort: "HIGH", daysOpen });
      continue;
    }

    try {
      const crit = selfCritique(ev);
      const nav = navigate(ev, crit.finalVerdict);
      const debt = evidenceDebt(ev, nav);
      const cal = calibrate(ev);
      const risk = decisionRisk(debt, nav, cal.score);
      const eff = decisionEffort(nav);

      decisions.push({
        id: h.id, title: h.title,
        verdict: crit.finalVerdict,
        support: nav.currentSupport,
        debt: debt.pct,
        risk: risk.level,
        riskScore: risk.score,
        effort: eff.level,
        daysOpen,
      });
    } catch {
      decisions.push({ id: h.id, title: h.title, verdict: null, support: 0, debt: 100, risk: "HIGH", riskScore: 75, effort: "HIGH", daysOpen });
    }
  }

  const withVerdict = decisions.filter((d) => d.verdict);
  const go = withVerdict.filter((d) => d.verdict === "GO");
  const kill = withVerdict.filter((d) => d.verdict === "KILL");
  const unresolved = withVerdict.filter((d) => d.verdict === "UNRESOLVED");

  const topRisks = [...decisions].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
  const nearGo = unresolved.sort((a, b) => b.support - a.support).slice(0, 5);
  const criticalKill = kill.sort((a, b) => b.daysOpen - a.daysOpen).slice(0, 5);
  const stalled = decisions.filter((d) => d.daysOpen > 30 && d.verdict === "UNRESOLVED")
    .sort((a, b) => b.daysOpen - a.daysOpen).slice(0, 5);

  const avgDebt = decisions.length > 0
    ? Math.round(decisions.reduce((s, d) => s + d.debt, 0) / decisions.length)
    : 0;
  const avgSupport = withVerdict.length > 0
    ? withVerdict.reduce((s, d) => s + d.support, 0) / withVerdict.length
    : 0;
  const criticalRisks = decisions.filter((d) => d.risk === "CRITICAL" || d.risk === "HIGH").length;
  const pendingApprovals = allApprovals.filter((a) => a.status === "under_review").length;

  const healthScore = Math.round(
    ((go.length / Math.max(decisions.length, 1)) * 35) +
    ((withVerdict.length / Math.max(decisions.length, 1)) * 30) +
    (Math.max(0, 1 - avgDebt / 100) * 20) +
    (Math.max(0, 1 - criticalRisks / Math.max(decisions.length, 1)) * 15)
  );

  return ok({
    generatedAt: new Date().toISOString(),
    summary: {
      total: decisions.length,
      go: go.length,
      kill: kill.length,
      unresolved: unresolved.length,
      avgDebt,
      avgSupport: Math.round(avgSupport * 100),
      healthScore,
      criticalRisks,
      pendingApprovals,
      totalReports: allReports.length,
    },
    topRisks,
    nearGo,
    criticalKill,
    stalled,
    priorityActions: [
      ...topRisks.slice(0, 2).map((d) => ({ type: "risk", decision: d.title, action: `Reduce risk: ${d.risk} risk level on "${d.title}"` })),
      ...nearGo.slice(0, 2).map((d) => ({ type: "opportunity", decision: d.title, action: `Near GO: "${d.title}" at ${(d.support * 100).toFixed(0)}% support — one evidence cycle could resolve` })),
      ...stalled.slice(0, 1).map((d) => ({ type: "stalled", decision: d.title, action: `${d.daysOpen} days open: "${d.title}" needs resolution or archiving` })),
    ],
  });
}
