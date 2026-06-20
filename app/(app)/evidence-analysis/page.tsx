"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type ParsedDoc = {
  id: string; name: string; type: string; summary: string;
  claims: string[]; metrics: string[]; dates: string[]; entities: string[];
};

type Consensus = { claim: string; sources: number };
type Contradiction = { topic: string; docA: string; docB: string; claimA: string; claimB: string };
type MissingEvidence = { area: string; reason: string; priority: "HIGH" | "MEDIUM" };

function analyzeDocuments(docs: ParsedDoc[]): {
  consensus: Consensus[];
  contradictions: Contradiction[];
  missing: MissingEvidence[];
  sourceRanking: { id: string; name: string; score: number; reason: string }[];
  confidenceMap: { dimension: string; coverage: number }[];
} {
  // Extract all claims, find common themes
  const allMetrics = docs.flatMap(d => d.metrics.map(m => ({ val: m.toLowerCase(), doc: d.name })));
  const allClaims = docs.flatMap(d => d.claims.map(c => ({ text: c, doc: d.name, docId: d.id })));

  // Simple consensus: claims shared by multiple docs (keyword overlap)
  const consensus: Consensus[] = [];
  const keywordMap = new Map<string, number>();
  const COMMON_TOPICS = ["market", "revenue", "users", "growth", "cost", "risk", "team", "product", "adoption", "conversion", "retention", "customer", "competition"];
  for (const topic of COMMON_TOPICS) {
    const count = docs.filter(d =>
      d.claims.some(c => c.toLowerCase().includes(topic)) ||
      d.summary.toLowerCase().includes(topic)
    ).length;
    if (count >= 2) {
      consensus.push({ claim: `Evidence of "${topic}" patterns found`, sources: count });
    }
  }

  // Contradictions: look for conflicting numeric signals in same topic
  const contradictions: Contradiction[] = [];
  const metricDocs: Record<string, { doc: string; docId: string; metrics: string[] }[]> = {};
  for (const doc of docs) {
    for (const m of doc.metrics) {
      const pct = m.match(/(\d+\.?\d*)%/);
      if (pct) {
        const val = parseFloat(pct[1]);
        const key = val > 50 ? "high_pct" : "low_pct";
        if (!metricDocs[key]) metricDocs[key] = [];
        metricDocs[key].push({ doc: doc.name, docId: doc.id, metrics: doc.metrics });
      }
    }
  }

  // Find docs with conflicting % ranges
  const highPcts = metricDocs["high_pct"] || [];
  const lowPcts = metricDocs["low_pct"] || [];
  if (highPcts.length > 0 && lowPcts.length > 0 && highPcts[0].docId !== lowPcts[0].docId) {
    contradictions.push({
      topic: "Success Rate Estimates",
      docA: highPcts[0].doc,
      docB: lowPcts[0].doc,
      claimA: `High percentages: ${highPcts[0].metrics.filter(m => m.includes("%")).slice(0, 2).join(", ")}`,
      claimB: `Low percentages: ${lowPcts[0].metrics.filter(m => m.includes("%")).slice(0, 2).join(", ")}`,
    });
  }

  // Missing evidence detection
  const missing: MissingEvidence[] = [];
  const allText = docs.map(d => d.summary + " " + d.claims.join(" ")).join(" ").toLowerCase();
  if (!allText.includes("competitor") && !allText.includes("competition") && !allText.includes("market share"))
    missing.push({ area: "Competitive Analysis", reason: "No competitive benchmarks found across uploaded documents", priority: "HIGH" });
  if (!allText.includes("customer") && !allText.includes("user") && !allText.includes("interview") && !allText.includes("survey"))
    missing.push({ area: "Customer Validation", reason: "No primary customer research detected", priority: "HIGH" });
  if (!allText.includes("financial") && !allText.includes("revenue") && !allText.includes("cost") && !allText.includes("roi"))
    missing.push({ area: "Financial Modeling", reason: "No financial projections or unit economics found", priority: "HIGH" });
  if (!allText.includes("risk") && !allText.includes("barrier") && !allText.includes("challenge"))
    missing.push({ area: "Risk Assessment", reason: "No risk factors or barriers identified in documents", priority: "MEDIUM" });
  if (!allText.includes("timeline") && !allText.includes("milestone") && !allText.includes("deadline") && !allText.includes("q1") && !allText.includes("q2"))
    missing.push({ area: "Implementation Timeline", reason: "No timelines or milestones found", priority: "MEDIUM" });

  // Source ranking: more claims + metrics + entities = higher quality
  const sourceRanking = docs.map(doc => {
    const score = Math.min(100, doc.claims.length * 5 + doc.metrics.length * 8 + doc.entities.length * 3 + (doc.summary.length > 100 ? 10 : 0));
    const reason = doc.claims.length > 3
      ? `High claim density (${doc.claims.length} claims, ${doc.metrics.length} metrics)`
      : doc.metrics.length > 3
      ? `Strong metric coverage (${doc.metrics.length} data points)`
      : `Low evidence density — consider supplementing`;
    return { id: doc.id, name: doc.name, score, reason };
  }).sort((a, b) => b.score - a.score);

  // Confidence map across key dimensions
  const confidenceMap = [
    { dimension: "Market Evidence", coverage: Math.min(100, docs.filter(d => /market|segment|size|tam|customer/i.test(d.summary + d.claims.join(" "))).length * 25) },
    { dimension: "Financial Data", coverage: Math.min(100, docs.filter(d => /revenue|cost|profit|roi|\$/i.test(d.metrics.join(" "))).length * 30) },
    { dimension: "Technical Feasibility", coverage: Math.min(100, docs.filter(d => /technical|engineer|build|deploy|infrastructure/i.test(d.summary)).length * 30) },
    { dimension: "Risk Factors", coverage: Math.min(100, docs.filter(d => /risk|barrier|challenge|threat|concern/i.test(d.summary + d.claims.join(" "))).length * 30) },
    { dimension: "Competitive Intel", coverage: Math.min(100, docs.filter(d => /competitor|competition|market share|alternative/i.test(d.summary + d.claims.join(" "))).length * 30) },
  ];

  return { consensus, contradictions, missing, sourceRanking, confidenceMap };
}

export default function EvidenceAnalysis() {
  const [docs, setDocs] = useState<ParsedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeDocuments> | null>(null);
  const [view, setView] = useState<"consensus" | "contradictions" | "missing" | "sources" | "confidence">("consensus");

  useEffect(() => {
    api<{ documents: ParsedDoc[] }>("/api/evidence-ingest")
      .then(r => { setDocs(r.documents || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function toggleDoc(id: string) {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
    setAnalysis(null);
  }

  function selectAll() { setSelected(new Set(docs.map(d => d.id))); setAnalysis(null); }
  function clearAll() { setSelected(new Set()); setAnalysis(null); }

  function runAnalysis() {
    const selectedDocs = docs.filter(d => selected.has(d.id));
    if (selectedDocs.length < 2) return;
    setAnalysis(analyzeDocuments(selectedDocs));
    setView("consensus");
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="label">Multi-Document Analysis</div>
        <h1 className="text-2xl font-bold tracking-tight">Evidence Analysis</h1>
        <p className="mt-1 text-sm text-slate">Select 2–50 documents to generate consensus findings, contradictions, and evidence gaps.</p>
      </div>

      {loading ? (
        <div className="card h-24 animate-pulse" />
      ) : docs.length === 0 ? (
        <div className="card text-center py-6 space-y-2">
          <p className="text-sm text-slate">No documents uploaded yet.</p>
          <Link href="/evidence-upload" className="btn-primary text-sm inline-block">Upload Documents →</Link>
        </div>
      ) : (
        <>
          <div className="card space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="label">Select Documents ({selected.size}/{docs.length})</div>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-amber hover:underline">Select All</button>
                <button onClick={clearAll} className="text-xs text-slate hover:text-ivory">Clear</button>
              </div>
            </div>
            <div className="space-y-1 max-h-52 overflow-y-auto no-scrollbar">
              {docs.map(doc => (
                <label key={doc.id} className="flex items-center gap-2 cursor-pointer rounded-inner px-2 py-1.5 hover:bg-white/3">
                  <input type="checkbox" checked={selected.has(doc.id)} onChange={() => toggleDoc(doc.id)}
                    className="accent-amber w-4 h-4 shrink-0" />
                  <span className="text-sm flex-1 truncate">{doc.name}</span>
                  <span className="text-xs text-slate data shrink-0">{doc.claims.length} claims</span>
                </label>
              ))}
            </div>
            <button onClick={runAnalysis} disabled={selected.size < 2} className="btn-primary text-sm w-full sm:w-auto">
              Analyze {selected.size} Document{selected.size !== 1 ? "s" : ""} →
            </button>
          </div>

          {analysis && (
            <>
              <div className="flex gap-2 flex-wrap">
                {(["consensus", "contradictions", "missing", "sources", "confidence"] as const).map(v => (
                  <button key={v} onClick={() => setView(v)}
                    className={`pill text-xs capitalize transition-colors ${view === v ? "bg-amber text-obsidian" : "bg-white/8 text-slate hover:text-ivory"}`}>
                    {v === "missing" ? "Evidence Gaps" : v === "sources" ? "Source Ranking" : v === "confidence" ? "Confidence Map" : v === "contradictions" ? "Contradictions" : "Consensus"}
                  </button>
                ))}
              </div>

              {view === "consensus" && (
                <div className="card space-y-2">
                  <div className="label">Consensus Findings ({analysis.consensus.length})</div>
                  {analysis.consensus.length === 0 ? (
                    <p className="text-sm text-slate">No strong consensus patterns detected across selected documents.</p>
                  ) : analysis.consensus.map((c, i) => (
                    <div key={i} className="rounded-inner bg-go/8 border border-go/20 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="pill bg-go/15 text-go text-[10px]">{c.sources} sources</span>
                        <span className="text-sm">{c.claim}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {view === "contradictions" && (
                <div className="card space-y-2">
                  <div className="label">Contradictions ({analysis.contradictions.length})</div>
                  {analysis.contradictions.length === 0 ? (
                    <p className="text-sm text-slate">No direct contradictions detected. Documents appear to be consistent.</p>
                  ) : analysis.contradictions.map((c, i) => (
                    <div key={i} className="rounded-inner bg-kill/8 border border-kill/20 p-3 space-y-1">
                      <div className="font-semibold text-sm text-kill">{c.topic}</div>
                      <div className="text-xs text-slate">{c.docA}: {c.claimA}</div>
                      <div className="text-xs text-slate">{c.docB}: {c.claimB}</div>
                    </div>
                  ))}
                </div>
              )}

              {view === "missing" && (
                <div className="card space-y-2">
                  <div className="label">Evidence Gaps ({analysis.missing.length})</div>
                  {analysis.missing.length === 0 ? (
                    <p className="text-sm text-slate">Good coverage — no major evidence gaps detected.</p>
                  ) : analysis.missing.map((m, i) => (
                    <div key={i} className={`rounded-inner border p-3 ${m.priority === "HIGH" ? "bg-amber/8 border-amber/20" : "bg-white/3 border-border-hair"}`}>
                      <div className="flex items-center gap-2">
                        <span className={`pill text-[10px] ${m.priority === "HIGH" ? "bg-amber/20 text-amber" : "bg-white/10 text-slate"}`}>{m.priority}</span>
                        <span className="text-sm font-semibold">{m.area}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate">{m.reason}</p>
                    </div>
                  ))}
                </div>
              )}

              {view === "sources" && (
                <div className="card space-y-2">
                  <div className="label">Source Ranking</div>
                  {analysis.sourceRanking.map((s, i) => (
                    <div key={s.id} className="rounded-inner bg-white/3 border border-border-hair p-3">
                      <div className="flex items-center gap-2">
                        <span className="data text-xs text-slate shrink-0">#{i + 1}</span>
                        <span className="text-sm font-medium flex-1 truncate">{s.name}</span>
                        <span className={`data text-sm font-bold shrink-0 ${s.score >= 60 ? "text-go" : s.score >= 30 ? "text-amber" : "text-kill"}`}>{s.score}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate">{s.reason}</p>
                    </div>
                  ))}
                </div>
              )}

              {view === "confidence" && (
                <div className="card space-y-3">
                  <div className="label">Evidence Confidence Map</div>
                  {analysis.confidenceMap.map(c => (
                    <div key={c.dimension} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{c.dimension}</span>
                        <span className={`data text-xs ${c.coverage >= 60 ? "text-go" : c.coverage >= 30 ? "text-amber" : "text-kill"}`}>{c.coverage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5">
                        <div className="h-full rounded-full" style={{ width: `${c.coverage}%`, backgroundColor: c.coverage >= 60 ? "#3FB67A" : c.coverage >= 30 ? "#E8A23D" : "#E5544B" }} />
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-slate">Coverage is estimated from uploaded documents. Upload more targeted documents to improve specific areas.</p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
