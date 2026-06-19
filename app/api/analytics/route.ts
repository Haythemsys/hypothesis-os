import type { NextRequest } from "next/server";
import { ok } from "@/lib/server/http";
import { getIdentity } from "@/lib/server/identity";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

// GET /api/analytics — internal product analytics for the current user
export async function GET(req: NextRequest) {
  const id = getIdentity(req);
  const hypotheses = store.listHypotheses(id);
  const allReports = store.listReports(id);

  let totalEvidence = 0, totalVerdicts = 0;
  const verdictCounts: Record<string, number> = { GO: 0, KILL: 0, UNRESOLVED: 0 };
  const weeklyDecisions: Record<string, number> = {};
  const weeklyVerdicts: Record<string, number> = {};

  for (const h of hypotheses) {
    const ev = store.listEvidence(id, h.id);
    const vd = store.listVerdicts(id, h.id);
    totalEvidence += ev.length;
    totalVerdicts += vd.length;

    // Count by week (ISO week key: YYYY-WW)
    const week = isoWeek(h.createdAt);
    weeklyDecisions[week] = (weeklyDecisions[week] || 0) + 1;

    for (const v of vd) {
      verdictCounts[v.finalVerdict] = (verdictCounts[v.finalVerdict] || 0) + 1;
      const vWeek = isoWeek(v.createdAt);
      weeklyVerdicts[vWeek] = (weeklyVerdicts[vWeek] || 0) + 1;
    }
  }

  // Build weekly activity for past 8 weeks
  const weeks: { week: string; decisions: number; verdicts: number; reports: number }[] = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const key = isoWeek(d.toISOString());
    weeks.push({ week: key, decisions: weeklyDecisions[key] || 0, verdicts: weeklyVerdicts[key] || 0, reports: 0 });
  }

  // Reports by week
  for (const r of allReports) {
    const w = isoWeek(r.createdAt);
    const entry = weeks.find((x) => x.week === w);
    if (entry) entry.reports++;
  }

  // Funnel: hypotheses → evidence → verdict → report
  const withEvidence = hypotheses.filter((h) => store.listEvidence(id, h.id).length > 0).length;
  const withVerdict = hypotheses.filter((h) => store.listVerdicts(id, h.id).length > 0).length;
  const withReport = new Set(allReports.map((r) => r.hypothesisId)).size;

  return ok({
    totals: {
      decisions: hypotheses.length,
      evidenceRecords: totalEvidence,
      verdicts: totalVerdicts,
      reports: allReports.length,
    },
    verdictCounts,
    funnel: {
      created: hypotheses.length,
      withEvidence,
      withVerdict,
      withReport,
    },
    weekly: weeks,
    completionRate: hypotheses.length > 0 ? Math.round((withVerdict / hypotheses.length) * 100) : 0,
    reportRate: hypotheses.length > 0 ? Math.round((withReport / hypotheses.length) * 100) : 0,
  });
}

function isoWeek(iso: string): string {
  const d = new Date(iso);
  const year = d.getUTCFullYear();
  const start = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((d.getTime() - start.getTime()) / 86400000 + start.getUTCDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}
