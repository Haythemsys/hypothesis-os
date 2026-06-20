import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/server/sqlite-store";
import { getIdentity } from "@/lib/server/identity";
import { selfCritique, navigate, evidenceDebt, decisionRisk, calibrate } from "@/lib/core";

function keywordOverlap(a: string, b: string): number {
  const stopWords = new Set(["the", "a", "an", "is", "are", "will", "our", "this", "that", "with", "for", "and", "or", "to", "of", "in", "on", "at"]);
  const tokA = new Set(a.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !stopWords.has(w)));
  const tokB = new Set(b.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !stopWords.has(w)));
  const intersection = [...tokA].filter(w => tokB.has(w)).length;
  const union = new Set([...tokA, ...tokB]).size;
  return union === 0 ? 0 : intersection / union;
}

export async function GET(req: NextRequest) {
  try {
    const ident = getIdentity(req);
    const hypotheses = store.listHypotheses(ident);

    type HypData = {
      id: string; title: string; verdict: string; support: number; debt: number; risk: number; createdAt: string;
      gaps: string[]; dimensions: Record<string, number>;
    };

    const hypData: HypData[] = [];
    for (const h of hypotheses) {
      const evRecs = store.listEvidence(ident, h.id);
      if (evRecs.length === 0) { hypData.push({ id: h.id, title: h.title, verdict: "UNRESOLVED", support: 0, debt: 100, risk: 50, createdAt: h.createdAt, gaps: [], dimensions: {} }); continue; }
      const ev = evRecs[evRecs.length - 1].evidence;
      const crit = selfCritique(ev);
      const nav = navigate(ev, crit.finalVerdict);
      const debt = evidenceDebt(ev, nav);
      const cal = calibrate(ev);
      const risk = decisionRisk(debt, nav, cal.score);

      // Find evidence gaps (dimensions with 0 or very low values)
      const dims = ev as unknown as Record<string, number>;
      const gaps = Object.entries(dims).filter(([, v]) => typeof v === "number" && v === 0).map(([k]) => k);

      hypData.push({ id: h.id, title: h.title, verdict: crit.finalVerdict, support: nav.currentSupport, debt: debt.pct, risk: risk.score, createdAt: h.createdAt, gaps, dimensions: dims });
    }

    // Find similar decisions (Jaccard similarity on title keywords)
    const similarities: { aId: string; aTitle: string; bId: string; bTitle: string; overlap: number }[] = [];
    for (let i = 0; i < hypData.length; i++) {
      for (let j = i + 1; j < hypData.length; j++) {
        const score = keywordOverlap(hypData[i].title, hypData[j].title);
        if (score >= 0.15) {
          similarities.push({ aId: hypData[i].id, aTitle: hypData[i].title, bId: hypData[j].id, bTitle: hypData[j].title, overlap: Math.round(score * 100) });
        }
      }
    }

    // Recurring evidence gaps
    const gapFrequency: Record<string, number> = {};
    for (const h of hypData) for (const g of h.gaps) gapFrequency[g] = (gapFrequency[g] || 0) + 1;
    const recurringGaps = Object.entries(gapFrequency)
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .map(([dim, count]) => ({ dimension: dim, occurrences: count }));

    // Recurring risk patterns
    const highRisk = hypData.filter(h => h.risk > 60);
    const highDebt = hypData.filter(h => h.debt > 70);
    const prematureGO = hypData.filter(h => h.verdict === "GO" && h.debt > 50);

    // Lessons learned (from decisions with verdicts)
    const lessons = hypData
      .filter(h => h.verdict !== "UNRESOLVED")
      .map(h => ({
        id: h.id,
        title: h.title,
        verdict: h.verdict,
        support: h.support,
        lesson: h.verdict === "GO"
          ? h.debt < 30 ? "Strong evidence base drove GO verdict — evidence quality paid off" : "GO reached despite evidence gaps — monitor closely"
          : "KILL verdict — examine which dimensions blocked progress",
      }));

    return NextResponse.json({
      decisions: hypData,
      similarities: similarities.sort((a, b) => b.overlap - a.overlap).slice(0, 10),
      recurringGaps,
      patterns: {
        highRisk: highRisk.length,
        highDebt: highDebt.length,
        prematureGO: prematureGO.length,
        totalResolved: hypData.filter(h => h.verdict !== "UNRESOLVED").length,
      },
      lessons: lessons.slice(0, 10),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
