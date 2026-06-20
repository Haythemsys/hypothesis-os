"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type Portfolio = {
  total: number; goCount: number; killCount: number; unresolvedCount: number;
  nearGoCount: number; readyCount: number; cautionCount: number; highRiskCount: number; healthScore: number;
  narrative: { headline: string; primaryAction: string; riskAlert: string };
  priorityActions: { decision: string; id: string; action: string; urgency: "IMMEDIATE" | "THIS_WEEK" | "THIS_MONTH" }[];
};
type DecisionItem = { id: string; title: string; verdict: string; support: number; debt: number; risk: number; signal: string; interpretation: string; confidence: string };

const URGENCY_STYLE: Record<string, string> = {
  IMMEDIATE: "bg-kill/20 text-kill",
  THIS_WEEK: "bg-amber/20 text-amber",
  THIS_MONTH: "bg-white/10 text-slate",
};
const SIGNAL_LABEL: Record<string, string> = {
  READY_TO_EXECUTE: "Execute",
  GO_WITH_CAUTION: "GO w/ Caution",
  NEAR_GO: "Near GO",
  REALLOCATE: "Reallocate",
  NEEDS_EVIDENCE: "Collect Evidence",
  MONITOR: "Monitor",
};
const SIGNAL_PILL: Record<string, string> = {
  READY_TO_EXECUTE: "bg-go/20 text-go",
  GO_WITH_CAUTION: "bg-go/10 text-go",
  NEAR_GO: "bg-amber/20 text-amber",
  REALLOCATE: "bg-kill/15 text-kill",
  NEEDS_EVIDENCE: "bg-white/10 text-slate",
  MONITOR: "bg-white/8 text-steel",
};

export default function ExecutiveAI() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [decisions, setDecisions] = useState<DecisionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"overview" | "actions" | "decisions">("overview");

  useEffect(() => {
    api<{ portfolio: Portfolio | null; decisions: DecisionItem[] }>("/api/executive-ai")
      .then(r => { setPortfolio(r.portfolio); setDecisions(r.decisions || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function printBrief() { window.print(); }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="label">AI Executive Briefing</div>
          <h1 className="text-2xl font-bold tracking-tight">Executive AI</h1>
          <p className="mt-1 text-sm text-slate">Board-ready intelligence briefing. AI interprets — engine verdicts are authoritative.</p>
        </div>
        <button onClick={printBrief} className="btn-ghost text-sm shrink-0">Print Brief</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="card h-20 animate-pulse" />)}</div>
      ) : !portfolio ? (
        <div className="card text-center py-6 space-y-2">
          <p className="text-sm text-slate">No portfolio data yet.</p>
          <Link href="/workflow" className="btn-primary text-sm inline-block">Create First Decision →</Link>
        </div>
      ) : (
        <>
          {/* Health score */}
          <div className="card flex items-center gap-4 bg-white/2">
            <div>
              <div className="data text-5xl font-bold text-amber">{portfolio.healthScore}</div>
              <div className="label mt-1">Portfolio Health</div>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm text-ivory font-semibold">{portfolio.narrative.headline}</p>
              <p className="text-xs text-steel">{portfolio.narrative.primaryAction}</p>
              <p className={`text-xs ${portfolio.highRiskCount > 0 ? "text-kill" : "text-go"}`}>{portfolio.narrative.riskAlert}</p>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Total Decisions", value: portfolio.total, color: "text-ivory" },
              { label: "GO", value: portfolio.goCount, color: "text-go" },
              { label: "Near GO", value: portfolio.nearGoCount, color: "text-amber" },
              { label: "High Risk", value: portfolio.highRiskCount, color: portfolio.highRiskCount > 0 ? "text-kill" : "text-go" },
            ].map(m => (
              <div key={m.label} className="card text-center">
                <div className={`data text-2xl font-bold ${m.color}`}>{m.value}</div>
                <div className="label mt-1">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {(["overview", "actions", "decisions"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`pill text-xs capitalize transition-colors ${view === v ? "bg-amber text-obsidian" : "bg-white/8 text-slate hover:text-ivory"}`}>
                {v === "actions" ? "Priority Actions" : v === "decisions" ? "All Decisions" : "Portfolio Overview"}
              </button>
            ))}
          </div>

          {view === "overview" && (
            <div className="space-y-3">
              {/* Verdict distribution */}
              <div className="card space-y-3">
                <div className="label">Verdict Distribution</div>
                {[
                  { label: "GO", count: portfolio.goCount, color: "#3FB67A" },
                  { label: "KILL", count: portfolio.killCount, color: "#E5544B" },
                  { label: "UNRESOLVED", count: portfolio.unresolvedCount, color: "#E8A23D" },
                ].map(v => (
                  <div key={v.label} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">{v.label}</span>
                      <span className="data text-xs" style={{ color: v.color }}>{v.count} decisions ({portfolio.total > 0 ? Math.round(v.count / portfolio.total * 100) : 0}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5">
                      <div className="h-full rounded-full" style={{ width: portfolio.total > 0 ? `${(v.count / portfolio.total) * 100}%` : "0%", backgroundColor: v.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* AI signal distribution */}
              <div className="card space-y-2">
                <div className="label">AI Signal Summary</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { signal: "READY_TO_EXECUTE", count: portfolio.readyCount },
                    { signal: "GO_WITH_CAUTION", count: portfolio.cautionCount },
                    { signal: "NEAR_GO", count: portfolio.nearGoCount },
                    { signal: "REALLOCATE", count: portfolio.killCount },
                  ].map(s => (
                    <div key={s.signal} className={`rounded-inner border px-3 py-2 ${SIGNAL_PILL[s.signal].replace("text-", "border-").replace("/20", "/20").replace("/10", "/20").split(" ")[0]} bg-white/2`}>
                      <div className="data text-xl font-bold">{s.count}</div>
                      <div className={`text-[10px] font-semibold mt-0.5 ${SIGNAL_PILL[s.signal].split(" ").find(c => c.startsWith("text-"))}`}>{SIGNAL_LABEL[s.signal]}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card bg-white/2 border-border-hair">
                <p className="text-xs text-slate"><span className="font-semibold text-steel">AI Advisory Notice: </span>AI signals are generated deterministically from engine outputs. They suggest actions — they do not override verdicts. All verdicts are authoritative as computed by the deterministic engine.</p>
              </div>
            </div>
          )}

          {view === "actions" && (
            <div className="card space-y-3">
              <div className="label">Priority Actions ({portfolio.priorityActions.length})</div>
              {portfolio.priorityActions.length === 0 ? (
                <p className="text-sm text-slate">No priority actions at this time.</p>
              ) : portfolio.priorityActions.map((action, i) => (
                <div key={i} className="rounded-inner bg-white/3 border border-border-hair p-3 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`pill text-[10px] ${URGENCY_STYLE[action.urgency]}`}>{action.urgency.replace("_", " ")}</span>
                    <Link href={`/report/${action.id}`} className="text-sm font-semibold hover:underline flex-1 truncate">{action.decision}</Link>
                  </div>
                  <p className="text-xs text-steel">{action.action}</p>
                </div>
              ))}
            </div>
          )}

          {view === "decisions" && (
            <div className="card space-y-2">
              <div className="label">All Decisions ({decisions.length})</div>
              <div className="space-y-1.5">
                {decisions.map(d => (
                  <div key={d.id} className="rounded-inner bg-white/3 border border-border-hair p-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`pill text-[10px] ${SIGNAL_PILL[d.signal]}`}>{SIGNAL_LABEL[d.signal]}</span>
                      <Link href={`/report/${d.id}`} className="text-sm text-steel hover:text-ivory truncate flex-1">{d.title}</Link>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate">
                      <span>Support <span className="data">{(d.support * 100).toFixed(0)}%</span></span>
                      <span>Risk <span className="data">{d.risk}%</span></span>
                      <span>Debt <span className="data">{d.debt}%</span></span>
                    </div>
                    <p className="mt-1 text-xs text-slate">{d.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
