import { NextRequest, NextResponse } from "next/server";
import { store, newId } from "@/lib/server/sqlite-store";
import { getIdentity } from "@/lib/server/identity";

// Extract claims (sentences with claim indicators)
function extractClaims(text: string): string[] {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
  const claimWords = /\b(shows?|indicates?|demonstrates?|proves?|confirms?|suggests?|reveals?|found|found that|evidence|data|results?|study|research|survey|report)\b/i;
  return sentences.filter(s => claimWords.test(s)).slice(0, 20);
}

// Extract numeric metrics
function extractMetrics(text: string): string[] {
  const metricPattern = /[\d,]+\.?\d*\s*(%|percent|x|×|\$|USD|EUR|users?|customers?|months?|days?|weeks?|years?|points?|bps?|k|M|B)/gi;
  const matches = text.match(metricPattern) || [];
  return [...new Set(matches)].slice(0, 20);
}

// Extract dates
function extractDates(text: string): string[] {
  const datePattern = /\b(\d{4}[-/]\d{2}[-/]\d{2}|Q[1-4]\s*\d{4}|\d{4}|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*\d{0,4}\b/gi;
  const matches = text.match(datePattern) || [];
  return [...new Set(matches)].slice(0, 10);
}

// Extract entities (capitalized multi-word phrases)
function extractEntities(text: string): string[] {
  const entityPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;
  const matches = text.match(entityPattern) || [];
  return [...new Set(matches)].slice(0, 15);
}

// Generate a summary (first meaningful paragraph or first 3 sentences)
function generateSummary(text: string): string {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
  return sentences.slice(0, 3).join(". ").slice(0, 500);
}

export async function GET(req: NextRequest) {
  try {
    const ident = getIdentity(req);
    const docs = store.listDocuments(ident.orgId);
    return NextResponse.json({ documents: docs });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ident = getIdentity(req);
    const body = await req.json();
    const { name, type, size, content } = body;
    if (!name || !content) return NextResponse.json({ error: "name and content required" }, { status: 400 });

    const claims = extractClaims(content);
    const metrics = extractMetrics(content);
    const dates = extractDates(content);
    const entities = extractEntities(content);
    const summary = generateSummary(content);

    const doc = store.createDocument({
      id: newId("doc"),
      orgId: ident.orgId,
      ownerId: ident.ownerId,
      name: String(name).slice(0, 200),
      type: String(type || "txt").slice(0, 10),
      size: Number(size) || content.length,
      content: content.slice(0, 50000),
      claims,
      metrics,
      dates,
      entities,
      summary,
      uploadedAt: new Date().toISOString(),
    });

    return NextResponse.json({ document: doc });
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
    store.deleteDocument(ident.orgId, id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
