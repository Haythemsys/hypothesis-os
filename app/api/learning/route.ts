import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/server/sqlite-store";
import { getIdentity } from "@/lib/server/identity";
import { selfCritique, navigate, evidenceDebt, decisionRisk, calibrate, decisionEffort } from "@/lib/core";

export async function GET(req: NextRequest) {
  try {
    const ident = getIdentity(req);
    const hypotheses = store.listHypotheses(ident);
    if (hypotheses.length === 0) return NextResponse.json({ report: null, decisions: [] });

    type HypStats = { id: string; title: string; verdict: string; support: number; debt: number; risk: number; effort: string; createdAt: string };
    const stats: HypStats[] = [];

    for (const h of hypotheses) {
      const evRecs = store.listEvidence(ident, h.id);
      if (evRecs.length === 0) {
        stats.push({ id: h.id, title: h.title, verdict: "UNRESOLVED", support: 0, debt: 100, risk: 50, effort: "LOW", createdAt: h.createdAt });
        continue;
      }
      const ev = evRecs[evRecs.length - 1].evidence;
      const crit = selfCritique(ev);
      const nav = navigate(ev, crit.finalVerdict);
      const debt = evidenceDebt(ev, nav);
      const cal = calibrate(ev);
      const risk = decisionRisk(debt, nav, cal.score);
      const effort = decisionEffort(nav);
      stats.push({ id: h.id, title: h.title, verdict: crit.finalVerdict, support: nav.currentSupport, debt: debt.pct, risk: risk.score, effort: effort.level, createdAt: h.createdAt });
    }

    const total = stats.length;
    const resolved = stats.filter(s => s.verdict !== "UNRESOLVED");
    const goDecisions = stats.filter(s => s.verdict === "GO");
    const killDecisions = stats.filter(s => s.verdict === "KILL");
    const unresolved = stats.filter(s => s.verdict === "UNRESOLVED");

    const avgDebt = stats.reduce((s, d) => s + d.debt, 0) / total;
    const avgRisk = stats.reduce((s, d) => s + d.risk, 0) / total;
    const avgSupport = stats.reduce((s, d) => s + d.support, 0) / total;
    const goRate = total > 0 ? goDecisions.length / total : 0;
    const killRate = total > 0 ? killDecisions.length / total : 0;
    const unresolvedRate = total > 0 ? unresolved.length / total : 0;

    // Detect biases
    const biases: { type: string; severity: "critical" | "warning" | "info"; description: string; evidence: string; recommendation: string }[] = [];

    if (avgDebt > 65) {
      biases.push({ type: "Systematic Under-Testing", severity: "critical", description: "Your organization consistently operates with high evidence debt before making decisions.", evidence: `Average evidence debt is ${avgDebt.toFixed(0)}% across all decisions.`, recommendation: "Require minimum evidence collection before any GO verdict. Set evidence debt threshold at 40%." });
    }

    if (avgRisk > 60) {
      biases.push({ type: "Risk Underestimation", severity: "critical", description: "Decisions consistently carry high risk scores. Risk may be structurally underestimated.", evidence: `Average risk score is ${avgRisk.toFixed(0)}% across all decisions.`, recommendation: "Mandate a premortem analysis for every decision before final verdict." });
    }

    if (goRate > 0.7 && total >= 3) {
      biases.push({ type: "GO Bias (Overconfidence)", severity: "warning", description: "Your organization approves GO decisions at an unusually high rate, potentially due to confirmation bias.", evidence: `${(goRate * 100).toFixed(0)}% GO rate (${goDecisions.length}/${total}). Industry benchmark: 30–50%.`, recommendation: "Introduce a mandatory devil's advocate review for all GO decisions." });
    }

    if (killRate > 0.6 && total >= 3) {
      biases.push({ type: "Excessive KILL Rate", severity: "warning", description: "High KILL rate may indicate overly conservative evidence thresholds or risk aversion.", evidence: `${(killRate * 100).toFixed(0)}% KILL rate (${killDecisions.length}/${total}).`, recommendation: "Review evidence requirements — are they proportionate to the decision's stakes?" });
    }

    if (unresolvedRate > 0.5 && total >= 3) {
      biases.push({ type: "Decision Paralysis", severity: "warning", description: "More than half of decisions remain unresolved. Organizational indecision carries its own cost.", evidence: `${(unresolvedRate * 100).toFixed(0)}% unresolved decisions (${unresolved.length}/${total}).`, recommendation: "Set time-boxed decision windows. UNRESOLVED beyond 90 days should force a KILL or GO." });
    }

    const highRiskGO = stats.filter(s => s.verdict === "GO" && s.risk > 65);
    if (highRiskGO.length >= 2) {
      biases.push({ type: "Risk-Blind GO Decisions", severity: "critical", description: "Multiple GO decisions were approved despite high risk scores.", evidence: `${highRiskGO.length} GO decisions with risk score > 65.`, recommendation: "GO decisions with risk > 50 should require executive sign-off and a mitigation plan." });
    }

    const highDebtGO = stats.filter(s => s.verdict === "GO" && s.debt > 60);
    if (highDebtGO.length >= 2) {
      biases.push({ type: "Premature GO Pattern", severity: "critical", description: "Multiple GO decisions were reached with insufficient evidence, creating hidden execution risk.", evidence: `${highDebtGO.length} GO decisions with evidence debt > 60%.`, recommendation: "Block GO verdicts when evidence debt exceeds 50%. Require evidence roadmap before execution." });
    }

    // Insights (positive patterns)
    const strengths: { observation: string; implication: string }[] = [];
    if (avgDebt < 35) strengths.push({ observation: "Excellent evidence discipline — average debt below 35%", implication: "Decisions are well-supported before GO. Lower execution risk." });
    if (avgRisk < 40) strengths.push({ observation: "Low average risk profile across decisions", implication: "Risk management is disciplined. Consider whether decisions could be taken on slightly higher-risk opportunities." });
    if (resolved.length > 0 && biases.length === 0) strengths.push({ observation: "No systematic biases detected", implication: "Decision quality is consistent. Focus on increasing volume and velocity." });

    // Monthly velocity (decisions per month)
    const now = new Date();
    const monthsBack = 6;
    const velocity: { month: string; count: number }[] = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const count = stats.filter(s => s.createdAt.startsWith(key)).length;
      velocity.push({ month: key, count });
    }

    return NextResponse.json({
      report: {
        total,
        goRate: Math.round(goRate * 100),
        killRate: Math.round(killRate * 100),
        unresolvedRate: Math.round(unresolvedRate * 100),
        avgDebt: Math.round(avgDebt),
        avgRisk: Math.round(avgRisk),
        avgSupport: Math.round(avgSupport * 100),
        biases,
        strengths,
        velocity,
      },
      decisions: stats,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
