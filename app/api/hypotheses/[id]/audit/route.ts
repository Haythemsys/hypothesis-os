import type { NextRequest } from "next/server";
import { ok, notFound } from "@/lib/server/http";
import { getIdentity } from "@/lib/server/identity";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

// GET /api/hypotheses/:id/audit — full decision audit trail in chronological order.
// Returns every traceable event: hypothesis creation, experiments, evidence records,
// verdicts, and reports — assembled as an ordered timeline.
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ident = getIdentity(req);
  const { id } = await ctx.params;

  const hypothesis = store.getHypothesis(ident, id);
  if (!hypothesis) return notFound("hypothesis");

  const project = hypothesis.projectId ? store.getProject(ident, hypothesis.projectId) : null;
  const experiments = store.listExperiments(ident, id);
  const evidenceList = store.listEvidence(ident, id);
  const verdicts = store.listVerdicts(ident, id);
  const reports = store.listReports(ident, id);

  // Build a unified chronological timeline of events
  type AuditEvent =
    | { type: "hypothesis_created"; at: string; data: typeof hypothesis }
    | { type: "experiments_designed"; at: string; data: typeof experiments }
    | { type: "evidence_recorded"; at: string; data: (typeof evidenceList)[0] }
    | { type: "verdict_rendered"; at: string; data: (typeof verdicts)[0] }
    | { type: "report_generated"; at: string; data: (typeof reports)[0] };

  const events: AuditEvent[] = [];

  events.push({ type: "hypothesis_created", at: hypothesis.createdAt, data: hypothesis });

  // Group experiments by their earliest createdAt (they're designed as a batch)
  if (experiments.length > 0) {
    const earliest = experiments.reduce((a, b) => (a.createdAt < b.createdAt ? a : b));
    events.push({ type: "experiments_designed", at: earliest.createdAt, data: experiments });
  }

  for (const ev of evidenceList) {
    events.push({ type: "evidence_recorded", at: ev.createdAt, data: ev });
  }

  for (const v of verdicts) {
    events.push({ type: "verdict_rendered", at: v.createdAt, data: v });
  }

  for (const r of reports) {
    events.push({ type: "report_generated", at: r.createdAt, data: r });
  }

  events.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));

  // Summary state: latest verdict
  const latestVerdict = verdicts[0] ?? null;

  return ok({
    hypothesis,
    project,
    latestVerdict,
    eventCount: events.length,
    timeline: events,
  });
}
