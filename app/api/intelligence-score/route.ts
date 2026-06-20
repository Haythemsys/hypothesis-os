import { NextRequest, NextResponse } from "next/server";
import { store, newId } from "@/lib/server/sqlite-store";
import { getIdentity } from "@/lib/server/identity";
import { selfCritique, navigate, evidenceDebt, decisionRisk, calibrate } from "@/lib/core";

function computeScore(ident: { ownerId: string; orgId: string }) {
  const hypotheses = store.listHypotheses(ident);
  const total = hypotheses.length;
  if (total === 0) return null;

  const stats: { verdict: string; support: number; debt: number; risk: number; createdAt: string }[] = [];

  for (const h of hypotheses) {
    const evRecs = store.listEvidence(ident, h.id);
    if (evRecs.length === 0) { stats.push({ verdict: "UNRESOLVED", support: 0, debt: 100, risk: 50, createdAt: h.createdAt }); continue; }
    const ev = evRecs[evRecs.length - 1].evidence;
    const crit = selfCritique(ev);
    const nav = navigate(ev, crit.finalVerdict);
    const debt = evidenceDebt(ev, nav);
    const cal = calibrate(ev);
      const risk = decisionRisk(debt, nav, cal.score);
    stats.push({ verdict: crit.finalVerdict, support: nav.currentSupport, debt: debt.pct, risk: risk.score, createdAt: h.createdAt });
  }

  const resolved = stats.filter(s => s.verdict !== "UNRESOLVED").length;
  const avgDebt = stats.reduce((s, d) => s + d.debt, 0) / total;
  const avgRisk = stats.reduce((s, d) => s + d.risk, 0) / total;

  // Decision Quality: what fraction reached a verdict (GO or KILL)
  const decisionQuality = Math.round((resolved / total) * 100);

  // Evidence Quality: inverse of average evidence debt
  const evidenceQuality = Math.round(Math.max(0, 100 - avgDebt));

  // Risk Discipline: inverse of average risk
  const riskDiscipline = Math.round(Math.max(0, 100 - avgRisk));

  // Learning Velocity: based on monthly decision cadence (decisions in last 3 months / 3 * 20)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const recentDecisions = stats.filter(s => new Date(s.createdAt) > threeMonthsAgo).length;
  const learningVelocity = Math.min(100, Math.round(recentDecisions * 10));

  // Consistency: low variance in support scores → high consistency
  const avgSupport = stats.reduce((s, d) => s + d.support, 0) / total;
  const variance = stats.reduce((s, d) => s + Math.pow(d.support - avgSupport, 2), 0) / total;
  const stdDev = Math.sqrt(variance);
  const consistency = Math.round(Math.max(0, 100 - stdDev * 200));

  // Weighted total
  const total_score = Math.round(
    decisionQuality * 0.25 +
    evidenceQuality * 0.30 +
    riskDiscipline * 0.20 +
    learningVelocity * 0.10 +
    consistency * 0.15
  );

  return { decisionQuality, evidenceQuality, riskDiscipline, learningVelocity, consistency, total: total_score };
}

export async function GET(req: NextRequest) {
  try {
    const ident = getIdentity(req);
    const score = computeScore(ident);
    const snapshots = store.listSnapshots(ident.orgId);
    return NextResponse.json({ score, snapshots });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ident = getIdentity(req);
    const score = computeScore(ident);
    if (!score) return NextResponse.json({ error: "No decisions to score" }, { status: 400 });

    const snap = store.createSnapshot({
      id: newId("snap"),
      orgId: ident.orgId,
      ...score,
      recordedAt: new Date().toISOString(),
    });
    return NextResponse.json({ snapshot: snap });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
