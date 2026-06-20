import { NextRequest, NextResponse } from "next/server";
import { store, newId } from "@/lib/server/sqlite-store";
import { getIdentity } from "@/lib/server/identity";
import { selfCritique, navigate, evidenceDebt, decisionRisk, calibrate } from "@/lib/core";
import type { KnowledgeItemType } from "@/lib/models";

// Deterministically extract knowledge from a completed decision
function extractKnowledge(title: string, verdict: string, support: number, debt: number, risk: number, orgId: string, ownerId: string, hypothesisId: string) {
  const items: { type: KnowledgeItemType; title: string; body: string; tags: string[] }[] = [];
  const now = new Date().toISOString();

  if (verdict === "GO") {
    items.push({
      type: "lesson",
      title: `GO: ${title.slice(0, 80)}`,
      body: `This decision reached GO verdict with ${(support * 100).toFixed(0)}% support and ${debt}% evidence debt. ${debt < 30 ? "Strong evidence discipline — a model for future decisions." : "Reached GO despite evidence gaps — monitor execution closely."}`,
      tags: ["go", "lesson", debt < 30 ? "strong-evidence" : "evidence-gaps"],
    });
    if (support > 0.75) {
      items.push({
        type: "principle",
        title: "High-confidence GO requires sustained evidence investment",
        body: `Decision "${title.slice(0, 60)}" achieved ${(support * 100).toFixed(0)}% support before GO. Strong evidence coverage is correlated with high-confidence verdicts.`,
        tags: ["principle", "evidence", "go", "support"],
      });
    }
  }

  if (verdict === "KILL") {
    items.push({
      type: "lesson",
      title: `KILL: ${title.slice(0, 80)}`,
      body: `This decision was killed with ${(support * 100).toFixed(0)}% support. ${risk > 60 ? "High risk score (" + risk + "%) was a key factor." : "Evidence did not meet the GO threshold."} Recording this prevents re-testing the same hypothesis.`,
      tags: ["kill", "lesson", "negative-result"],
    });
    items.push({
      type: "checklist",
      title: `Pre-mortem checklist: ${title.slice(0, 60)}`,
      body: `Before revisiting this hypothesis:\n• Review why it was killed (support: ${(support * 100).toFixed(0)}%, risk: ${risk}%)\n• Identify what new evidence would change the verdict\n• Define the minimum support threshold for a revised attempt\n• Assess whether market conditions have changed materially`,
      tags: ["checklist", "kill", "revisit"],
    });
  }

  if (debt > 60) {
    items.push({
      type: "pattern",
      title: "Evidence debt pattern: under-tested before verdict",
      body: `"${title.slice(0, 60)}" reached ${verdict} with ${debt}% evidence debt. Pattern: high-debt decisions carry hidden execution risk. Future decisions in this domain should require evidence debt < 40% before reaching verdict.`,
      tags: ["pattern", "evidence-debt", "risk"],
    });
  }

  return items.map(item => ({
    id: newId("ki"),
    orgId,
    ownerId,
    hypothesisId,
    ...item,
    createdAt: now,
  }));
}

export async function GET(req: NextRequest) {
  try {
    const ident = getIdentity(req);
    const items = store.listKnowledgeItems(ident.orgId);
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ident = getIdentity(req);
    const body = await req.json();

    // If hypothesisId provided, auto-extract knowledge
    if (body.action === "extract" && body.hypothesisId) {
      const h = store.getHypothesis(ident, body.hypothesisId);
      if (!h) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const evRecs = store.listEvidence(ident, h.id);
      if (evRecs.length === 0) return NextResponse.json({ error: "No evidence" }, { status: 400 });
      const ev = evRecs[evRecs.length - 1].evidence;
      const crit = selfCritique(ev);
      const nav = navigate(ev, crit.finalVerdict);
      const debt = evidenceDebt(ev, nav);
      const cal = calibrate(ev);
      const risk = decisionRisk(debt, nav, cal.score);

      const newItems = extractKnowledge(h.title, crit.finalVerdict, nav.currentSupport, debt.pct, risk.score, ident.orgId, ident.ownerId, h.id);
      const saved = newItems.map(item => store.createKnowledgeItem(item));
      return NextResponse.json({ items: saved });
    }

    // Manual creation
    const { type, title, body: itemBody, tags, hypothesisId } = body;
    if (!type || !title || !itemBody) return NextResponse.json({ error: "type, title, body required" }, { status: 400 });

    const item = store.createKnowledgeItem({
      id: newId("ki"),
      orgId: ident.orgId,
      ownerId: ident.ownerId,
      hypothesisId: hypothesisId || undefined,
      type: type as KnowledgeItemType,
      title: String(title).slice(0, 200),
      body: String(itemBody).slice(0, 5000),
      tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ item });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ident = getIdentity(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    store.deleteKnowledgeItem(ident.orgId, id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
