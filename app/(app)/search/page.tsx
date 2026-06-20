"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type EnrichedDecision = {
  id: string; title: string; verdict: string; support: number; debt: number; risk: number; createdAt: string;
};

const VERDICT_CLS: Record<string, string> = { GO: "text-go", KILL: "text-kill", UNRESOLVED: "text-unresolved" };
const VERDICT_BG: Record<string, string> = { GO: "bg-go/15 border-go/20", KILL: "bg-kill/15 border-kill/20", UNRESOLVED: "bg-amber/15 border-amber/20" };

const RISK_LABELS = [
  { label: "All Risk Levels", min: 0, max: 100 },
  { label: "Low Risk (0–40)", min: 0, max: 40 },
  { label: "Medium Risk (40–70)", min: 40, max: 70 },
  { label: "High Risk (70–100)", min: 70, max: 100 },
];
const DEBT_LABELS = [
  { label: "All Debt Levels", min: 0, max: 100 },
  { label: "Low Debt (0–30)", min: 0, max: 30 },
  { label: "Medium Debt (30–60)", min: 30, max: 60 },
  { label: "High Debt (60–100)", min: 60, max: 100 },
];

export default function Search() {
  const [decisions, setDecisions] = useState<EnrichedDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [verdict, setVerdict] = useState<string>("ALL");
  const [riskIdx, setRiskIdx] = useState(0);
  const [debtIdx, setDebtIdx] = useState(0);
  const [sortBy, setSortBy] = useState<"date" | "support" | "debt" | "risk">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    api<{ decisions: EnrichedDecision[] }>("/api/search")
      .then(r => setDecisions(r.decisions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const riskRange = RISK_LABELS[riskIdx];
    const debtRange = DEBT_LABELS[debtIdx];
    let list = decisions.filter(d => {
      if (query && !d.title.toLowerCase().includes(query.toLowerCase())) return false;
      if (verdict !== "ALL" && d.verdict !== verdict) return false;
      if (d.risk < riskRange.min || d.risk > riskRange.max) return false;
      if (d.debt < debtRange.min || d.debt > debtRange.max) return false;
      if (dateFrom && d.createdAt < dateFrom) return false;
      if (dateTo && d.createdAt > dateTo + "T23:59:59") return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      let v = 0;
      if (sortBy === "date") v = a.createdAt < b.createdAt ? -1 : 1;
      else if (sortBy === "support") v = a.support - b.support;
      else if (sortBy === "debt") v = a.debt - b.debt;
      else if (sortBy === "risk") v = a.risk - b.risk;
      return sortDir === "desc" ? -v : v;
    });

    return list;
  }, [decisions, query, verdict, riskIdx, debtIdx, sortBy, sortDir, dateFrom, dateTo]);

  function toggleSort(field: typeof sortBy) {
    if (sortBy === field) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortBy(field); setSortDir("desc"); }
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="label">Decision Search Engine</div>
        <h1 className="text-2xl font-bold tracking-tight">Search Decisions</h1>
        <p className="mt-1 text-sm text-slate">Search and filter across your entire decision portfolio.</p>
      </div>

      {/* Search bar */}
      <div className="card space-y-3">
        <input
          className="input text-base"
          placeholder="Search by title…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {/* Verdict filter */}
          <div className="space-y-1">
            <div className="label">Verdict</div>
            <div className="flex gap-1 flex-wrap">
              {["ALL", "GO", "KILL", "UNRESOLVED"].map(v => (
                <button key={v} onClick={() => setVerdict(v)}
                  className={`pill text-xs transition-colors ${verdict === v ? "bg-amber text-obsidian" : "bg-white/8 text-slate hover:text-ivory"}`}>{v}</button>
              ))}
            </div>
          </div>

          {/* Risk filter */}
          <div className="space-y-1">
            <div className="label">Risk Level</div>
            <select className="input text-sm py-2" value={riskIdx} onChange={e => setRiskIdx(Number(e.target.value))}>
              {RISK_LABELS.map((l, i) => <option key={i} value={i}>{l.label}</option>)}
            </select>
          </div>

          {/* Debt filter */}
          <div className="space-y-1">
            <div className="label">Evidence Debt</div>
            <select className="input text-sm py-2" value={debtIdx} onChange={e => setDebtIdx(Number(e.target.value))}>
              {DEBT_LABELS.map((l, i) => <option key={i} value={i}>{l.label}</option>)}
            </select>
          </div>

          {/* Date from */}
          <div className="space-y-1">
            <div className="label">Date From</div>
            <input type="date" className="input text-sm py-2" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>

          {/* Date to */}
          <div className="space-y-1">
            <div className="label">Date To</div>
            <input type="date" className="input text-sm py-2" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate">{filtered.length} result{filtered.length !== 1 ? "s" : ""} {loading ? "(loading…)" : ""}</span>
          <button onClick={() => { setQuery(""); setVerdict("ALL"); setRiskIdx(0); setDebtIdx(0); setDateFrom(""); setDateTo(""); }} className="text-xs text-slate hover:text-ivory">Clear filters</button>
        </div>
      </div>

      {/* Sort controls */}
      <div className="flex gap-1.5 flex-wrap">
        <span className="text-xs text-slate self-center">Sort:</span>
        {(["date", "support", "debt", "risk"] as const).map(f => (
          <button key={f} onClick={() => toggleSort(f)}
            className={`pill text-xs capitalize transition-colors ${sortBy === f ? "bg-white/15 text-ivory" : "bg-white/8 text-slate hover:text-ivory"}`}>
            {f} {sortBy === f ? (sortDir === "desc" ? "↓" : "↑") : ""}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="card h-16 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-6">
          <p className="text-sm text-slate">{decisions.length === 0 ? "No decisions yet." : "No decisions match your filters."}</p>
          {decisions.length === 0 && <Link href="/workflow" className="btn-primary text-sm mt-2 inline-block">Create First Decision →</Link>}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(d => (
            <Link key={d.id} href={`/report/${d.id}`}
              className={`card block border transition-colors hover:border-amber/30 hover:bg-white/3 ${VERDICT_BG[d.verdict] || "border-border-hair"}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`pill text-[10px] ${VERDICT_BG[d.verdict]}`}>{d.verdict}</span>
                    <h3 className={`text-sm font-semibold ${VERDICT_CLS[d.verdict]}`}>{d.title}</h3>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate">
                    <span>Support <span className="data">{(d.support * 100).toFixed(0)}%</span></span>
                    <span>Debt <span className={`data ${d.debt > 60 ? "text-kill" : d.debt > 35 ? "text-amber" : "text-go"}`}>{d.debt}%</span></span>
                    <span>Risk <span className={`data ${d.risk > 60 ? "text-kill" : d.risk > 40 ? "text-amber" : "text-go"}`}>{d.risk}%</span></span>
                    <span className="data">{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className="text-slate text-sm shrink-0">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
