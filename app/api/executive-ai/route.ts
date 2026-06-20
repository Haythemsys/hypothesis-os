import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/server/sqlite-store";
import { getIdentity } from "@/lib/server/identity";
import {
  selfCritique, navigate, evidenceDebt, decisionRisk, calibrate,
  decisionEffort, executiveSummary, resolutionTimeline, costToResolve,
} from "@/lib/core";

function generateAISignal(verdict: string, support: number, debt: number, risk: number): { signal: string; interpretation: string; confidence: "HIGH" | "MEDIUM" | "LOW" } {
  if (verdict === "GO" && debt < 30 && risk < 40) {
    return { signal: "READY_TO_EXECUTE", interpretation: "Strong evidence base with low risk. Execution risk is manageable. Prioritize resource allocation.", confidence: "HIGH" };
  }
  if (verdict === "GO" && debt > 50) {
    return { signal: "GO_WITH_CAUTION", interpretation: "GO verdict reached but evidence gaps remain. Implement monitoring checkpoints. Re-validate key assumptions at 30 and 60 days.", confidence: "MEDIUM" };
  }
  if (verdict === "KILL") {
    return { signal: "REALLOCATE", interpretation: "Evidence does not support continuation. Capture learnings and reallocate resources to stronger opportunities.", confidence: "HIGH" };
  }
  if (verdict === "UNRESOLVED" && support > 0.5) {
    return { signal: "NEAR_GO", interpretation: "Near the GO threshold. Targeted evidence in lowest-scoring dimensions will likely resolve this. Define a 30-day evidence sprint.", confidence: "MEDIUM" };
  }
  if (verdict === "UNRESOLVED" && support < 0.3) {
    return { signal: "NEEDS_EVIDENCE", interpretation: "Substantial evidence gaps. Consider running a cheap kill test before investing in full evidence collection.", confidence: "LOW" };
  }
  return { signal: "MONITOR", interpretation: "Decision is progressing. Continue evidence collection to reach verdict threshold.", confidence: "MEDIUM" };
}

export async function GET(req: NextRequest) {
  try {
    const ident = getIdentity(req);
    const hypotheses = store.listHypotheses(ident);
    if (hypotheses.length === 0) return NextResponse.json({ portfolio: null });

    type DecisionItem = {
      id: string; title: string; verdict: string; support: number; debt: number; risk: number;
      signal: string; interpretation: string; confidence: string;
      exec_: any; timeline: any; cost: any;
    };

    const items: DecisionItem[] = [];

    for (const h of hypotheses) {
      const evRecs = store.listEvidence(ident, h.id);
      if (evRecs.length === 0) continue;
      const ev = evRecs[evRecs.length - 1].evidence;
      const crit = selfCritique(ev);
      const nav = navigate(ev, crit.finalVerdict);
      const debt = evidenceDebt(ev, nav);
      const cal = calibrate(ev);
      const risk = decisionRisk(debt, nav, cal.score);
      const eff = decisionEffort(nav);
      const exec_ = executiveSummary(crit.finalVerdict, nav, debt, eff);
      const timeline = resolutionTimeline(nav);
      const cost = costToResolve(eff, nav);
      const aiSignal = generateAISignal(crit.finalVerdict, nav.currentSupport, debt.pct, risk.score);

      items.push({
        id: h.id, title: h.title, verdict: crit.finalVerdict,
        support: nav.currentSupport, debt: debt.pct, risk: risk.score,
        signal: aiSignal.signal, interpretation: aiSignal.interpretation, confidence: aiSignal.confidence,
        exec_, timeline, cost,
      });
    }

    const goItems = items.filter(i => i.verdict === "GO");
    const killItems = items.filter(i => i.verdict === "KILL");
    const unresolvedItems = items.filter(i => i.verdict === "UNRESOLVED");
    const nearGo = unresolvedItems.filter(i => i.support > 0.5);
    const readyToExecute = items.filter(i => i.signal === "READY_TO_EXECUTE");
    const caution = items.filter(i => i.signal === "GO_WITH_CAUTION");
    const highRisk = items.filter(i => i.risk > 65);

    const total = items.length;
    const health = total > 0 ? Math.round(
      (goItems.length / total * 35) +
      (items.filter(i => i.verdict !== "UNRESOLVED").length / total * 30) +
      ((1 - items.reduce((s, i) => s + i.debt, 0) / total / 100) * 20) +
      ((1 - items.reduce((s, i) => s + i.risk, 0) / total / 100) * 15)
    ) : 0;

    const narrative = {
      headline: total === 0 ? "No decisions in portfolio."
        : goItems.length >= total * 0.5 ? `Portfolio in strong execution mode: ${goItems.length} of ${total} decisions cleared for GO.`
        : unresolvedItems.length >= total * 0.5 ? `Portfolio requires evidence investment: ${unresolvedItems.length} of ${total} decisions remain unresolved.`
        : `Balanced portfolio with ${goItems.length} GO, ${killItems.length} KILL, and ${unresolvedItems.length} UNRESOLVED decisions.`,
      primaryAction: readyToExecute.length > 0
        ? `Execute ${readyToExecute.length} decision${readyToExecute.length > 1 ? "s" : ""} with strong evidence backing.`
        : nearGo.length > 0
        ? `${nearGo.length} decision${nearGo.length > 1 ? "s" : ""} are near GO — 30-day evidence sprint recommended.`
        : "Focus on evidence collection across unresolved decisions.",
      riskAlert: highRisk.length > 0
        ? `${highRisk.length} decision${highRisk.length > 1 ? "s carry" : " carries"} elevated risk (>65). Board review recommended.`
        : "Risk levels are within acceptable range.",
    };

    const priorityActions: { decision: string; id: string; action: string; urgency: "IMMEDIATE" | "THIS_WEEK" | "THIS_MONTH" }[] = [];
    for (const item of items.slice(0, 10)) {
      if (item.signal === "READY_TO_EXECUTE") priorityActions.push({ decision: item.title, id: item.id, action: "Approve for execution. Assign resources and define KPIs.", urgency: "IMMEDIATE" });
      else if (item.signal === "GO_WITH_CAUTION") priorityActions.push({ decision: item.title, id: item.id, action: "GO approved with monitoring. Set 30-day checkpoint.", urgency: "THIS_WEEK" });
      else if (item.signal === "NEAR_GO") priorityActions.push({ decision: item.title, id: item.id, action: "Define evidence sprint to close gap to GO.", urgency: "THIS_WEEK" });
      else if (item.signal === "REALLOCATE") priorityActions.push({ decision: item.title, id: item.id, action: "Close this decision. Document learnings and reallocate budget.", urgency: "THIS_MONTH" });
    }

    return NextResponse.json({
      portfolio: {
        total, goCount: goItems.length, killCount: killItems.length, unresolvedCount: unresolvedItems.length,
        nearGoCount: nearGo.length, readyCount: readyToExecute.length, cautionCount: caution.length,
        highRiskCount: highRisk.length, healthScore: health,
        narrative, priorityActions: priorityActions.slice(0, 6),
      },
      decisions: items,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
