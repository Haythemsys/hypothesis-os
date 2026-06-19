import type { NextRequest } from "next/server";
import { ok, bad, readJson } from "@/lib/server/http";
import { getIdentity, scopeOf } from "@/lib/server/identity";
import { store, newId } from "@/lib/server/store";
import { experiments as genExperiments } from "@/lib/core";
import type { Experiment } from "@/lib/models";

export const dynamic = "force-dynamic";

// POST /api/experiments/design { title, hypothesisId? }
// Deterministic generator (cheap/strong/hostile). LLM may LATER enrich steps, but the tiers
// and their intent come from the engine — the AI never invents the test structure silently.
export async function POST(req: NextRequest) {
  const ident = getIdentity(req);
  const body = await readJson<{ title?: string; hypothesisId?: string }>(req);
  if (!body?.title?.trim()) return bad("title is required");

  const plan = genExperiments(body.title);
  const now = new Date().toISOString();
  const created: Experiment[] = [];

  if (body.hypothesisId && store.getHypothesis(ident, body.hypothesisId)) {
    for (const tier of plan.tiers) {
      const e: Experiment = {
        id: newId("exp"), ...scopeOf(ident), hypothesisId: body.hypothesisId,
        tier: tier.tier, purpose: tier.purpose, cost: tier.cost, steps: tier.steps,
        source: "engine", createdAt: now,
      };
      store.createExperiment(e);
      created.push(e);
    }
  }
  return ok({ decomposition: plan.decomposition, tiers: plan.tiers, saved: created.length });
}
