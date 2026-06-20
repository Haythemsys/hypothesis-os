import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/server/sqlite-store";
import { getIdentity } from "@/lib/server/identity";
import { selfCritique, navigate, evidenceDebt, decisionRisk, calibrate } from "@/lib/core";

export async function GET(req: NextRequest) {
  try {
    const ident = getIdentity(req);
    const hypotheses = store.listHypotheses(ident);

    const results = hypotheses.map(h => {
      const evRecs = store.listEvidence(ident, h.id);
      if (evRecs.length === 0) {
        return { id: h.id, title: h.title, verdict: "UNRESOLVED", support: 0, debt: 100, risk: 50, createdAt: h.createdAt };
      }
      const ev = evRecs[evRecs.length - 1].evidence;
      const crit = selfCritique(ev);
      const nav = navigate(ev, crit.finalVerdict);
      const debt = evidenceDebt(ev, nav);
      const cal = calibrate(ev);
      const risk = decisionRisk(debt, nav, cal.score);
      return { id: h.id, title: h.title, verdict: crit.finalVerdict, support: nav.currentSupport, debt: debt.pct, risk: risk.score, createdAt: h.createdAt };
    });

    return NextResponse.json({ decisions: results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
