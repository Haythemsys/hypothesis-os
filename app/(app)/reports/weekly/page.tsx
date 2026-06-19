"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { Mark } from "@/components/logo/Mark";

type WeekEntry = { week: string; decisions: number; verdicts: number; reports: number };

type AnalyticsData = {
  totals: { decisions: number; evidenceRecords: number; verdicts: number; reports: number };
  verdictCounts: Record<string, number>;
  funnel: { created: number; withEvidence: number; withVerdict: number; withReport: number };
  weekly: WeekEntry[];
  completionRate: number;
  reportRate: number;
};

type PortfolioData = {
  total: number;
  counts: Record<string, number>;
  avgDebt: number; avgRisk: number; healthScore: number;
  items: { id: string; title: string; verdict: string | null; support: number | null; debt: number | null; risk: string | null; createdAt: string }[];
};

function downloadMD(analytics: AnalyticsData, portfolio: PortfolioData) {
  const now = new Date();
  const weekStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  const latestWeek = analytics.weekly[analytics.weekly.length - 1];
  const prevWeek = analytics.weekly[analytics.weekly.length - 2];
  const decisionDelta = latestWeek && prevWeek ? latestWeek.decisions - prevWeek.decisions : 0;

  const md = [
    `# HypothesisOS Weekly Intelligence Report`,
    `**Period:** ${weekStr}`,
    ``,
    `## Portfolio Health`,
    `- Health Score: ${portfolio.healthScore}/100`,
    `- Total Decisions: ${portfolio.total}`,
    `- GO: ${portfolio.counts.GO ?? 0} | KILL: ${portfolio.counts.KILL ?? 0} | UNRESOLVED: ${portfolio.counts.UNRESOLVED ?? 0}`,
    `- Average Evidence Debt: ${portfolio.avgDebt}%`,
    ``,
    `## Decision Velocity`,
    `- New Decisions This Week: ${latestWeek?.decisions ?? 0} (${decisionDelta >= 0 ? "+" : ""}${decisionDelta} vs previous)`,
    `- New Verdicts: ${latestWeek?.verdicts ?? 0}`,
    `- New Reports: ${latestWeek?.reports ?? 0}`,
    ``,
    `## Evidence Funnel`,
    `- Hypotheses Created: ${analytics.funnel.created}`,
    `- With Evidence: ${analytics.funnel.withEvidence}`,
    `- Classified (Verdict): ${analytics.funnel.withVerdict}`,
    `- Report Generated: ${analytics.funnel.withReport}`,
    `- Completion Rate: ${analytics.completionRate}%`,
    ``,
    `## Verdict Distribution`,
    `- GO: ${analytics.verdictCounts.GO ?? 0}`,
    `- UNRESOLVED: ${analytics.verdictCounts.UNRESOLVED ?? 0}`,
    `- KILL: ${analytics.verdictCounts.KILL ?? 0}`,
    ``,
    `---`,
    `*HypothesisOS Weekly Intelligence Report — Deterministic Engine*`,
  ].join("\n");

  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "weekly-report.md"; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function WeeklyReport() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<AnalyticsData>("/api/analytics").catch(() => null),
      api<PortfolioData>("/api/portfolio").catch(() => null),
    ]).then(([a, p]) => {
      if (a) setAnalytics(a);
      if (p) setPortfolio(p);
    }).finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const latestWeek = analytics?.weekly?.[analytics.weekly.length - 1];
  const prevWeek = analytics?.weekly?.[analytics.weekly.length - 2];

  const verdictDelta = (v: "GO" | "KILL" | "UNRESOLVED") => {
    // Can't easily compute week-over-week from the data we have, so we show totals
    return analytics?.verdictCounts?.[v] ?? 0;
  };

  const hb = portfolio ? (portfolio.healthScore >= 70 ? { label: "Healthy", cls: "text-go" } : portfolio.healthScore >= 45 ? { label: "Developing", cls: "text-unresolved" } : { label: "At Risk", cls: "text-kill" }) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-0">
      {/* Controls */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="label">Weekly Intelligence Report</div>
        {analytics && portfolio && (
          <div className="flex gap-2">
            <button onClick={() => downloadMD(analytics, portfolio)} className="btn-ghost text-sm">↓ Markdown</button>
            <button onClick={() => window.print()} className="btn-primary text-sm">Print / PDF</button>
          </div>
        )}
      </div>

      {loading && <div className="card animate-pulse h-48 bg-white/3" />}

      {!loading && analytics && portfolio && (
        <>
          {/* Cover */}
          <div className="card mb-4">
            <div className="flex items-center gap-3 mb-4">
              <Mark size={24} variant="mono" />
              <div>
                <div className="font-bold text-ivory">HypothesisOS</div>
                <div className="text-xs text-slate">Weekly Intelligence Report</div>
              </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Decision Portfolio Intelligence</h1>
            <p className="mt-1 text-sm text-slate">{today}</p>
            {hb && (
              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                  <div
                    className={`h-full rounded-full ${portfolio.healthScore >= 70 ? "bg-go" : portfolio.healthScore >= 45 ? "bg-amber" : "bg-kill"}`}
                    style={{ width: `${portfolio.healthScore}%` }}
                  />
                </div>
                <div className={`data font-bold ${hb.cls}`}>Health {portfolio.healthScore}/100 · {hb.label}</div>
              </div>
            )}
          </div>

          {/* Portfolio Health */}
          <div className="card mb-4">
            <div className="mb-4 flex items-baseline gap-3 border-b border-border-hair pb-3">
              <span className="data text-xs font-bold text-amber">§01</span>
              <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-slate">Portfolio Health</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Total", value: String(portfolio.total) },
                { label: "GO", value: String(portfolio.counts.GO ?? 0), cls: "text-go" },
                { label: "UNRESOLVED", value: String(portfolio.counts.UNRESOLVED ?? 0), cls: "text-unresolved" },
                { label: "KILL", value: String(portfolio.counts.KILL ?? 0), cls: "text-kill" },
                { label: "Avg Debt", value: `${portfolio.avgDebt}%`, cls: portfolio.avgDebt > 50 ? "text-kill" : portfolio.avgDebt > 25 ? "text-unresolved" : "text-go" },
                { label: "Avg Risk", value: String(portfolio.avgRisk) },
              ].map((m) => (
                <div key={m.label} className="rounded-inner bg-white/3 px-3 py-2.5">
                  <div className="text-[10px] text-slate">{m.label}</div>
                  <div className={`data mt-0.5 text-xl font-bold ${m.cls ?? "text-ivory"}`}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Velocity */}
          <div className="card mb-4">
            <div className="mb-4 flex items-baseline gap-3 border-b border-border-hair pb-3">
              <span className="data text-xs font-bold text-amber">§02</span>
              <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-slate">Decision Velocity (8 Weeks)</h2>
            </div>
            <div className="flex items-end gap-1 h-24">
              {analytics.weekly.map((w, i) => {
                const total = w.decisions + w.verdicts + w.reports;
                const max = Math.max(...analytics.weekly.map((x) => x.decisions + x.verdicts + x.reports), 1);
                const heightPct = (total / max) * 100;
                const isLatest = i === analytics.weekly.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                    <div
                      className={`w-full rounded-t transition-colors ${isLatest ? "bg-amber" : "bg-amber/30"}`}
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                      title={`${w.week}: ${w.decisions}d, ${w.verdicts}v, ${w.reports}r`}
                    />
                    <span className="text-[8px] text-slate">{w.week.slice(-3)}</span>
                  </div>
                );
              })}
            </div>
            {latestWeek && prevWeek && (
              <div className="mt-3 flex gap-4 text-xs text-slate">
                <span>This week: <span className="text-ivory">{latestWeek.decisions + latestWeek.verdicts + latestWeek.reports}</span> events</span>
                <span>vs last week: <span className="text-ivory">{prevWeek.decisions + prevWeek.verdicts + prevWeek.reports}</span></span>
              </div>
            )}
          </div>

          {/* Evidence Debt Trend */}
          <div className="card mb-4">
            <div className="mb-4 flex items-baseline gap-3 border-b border-border-hair pb-3">
              <span className="data text-xs font-bold text-amber">§03</span>
              <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-slate">Evidence Debt</h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-steel">Portfolio Average Debt</span>
                <span className={`data font-bold ${portfolio.avgDebt > 50 ? "text-kill" : portfolio.avgDebt > 25 ? "text-unresolved" : "text-go"}`}>{portfolio.avgDebt}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-white/8">
                <div
                  className={`h-full rounded-full ${portfolio.avgDebt > 50 ? "bg-kill" : portfolio.avgDebt > 25 ? "bg-amber" : "bg-go"}`}
                  style={{ width: `${portfolio.avgDebt}%` }}
                />
              </div>
              <p className="text-xs text-slate">
                {portfolio.avgDebt > 50
                  ? "High debt signals insufficient evidence across the portfolio. Prioritize evidence collection."
                  : portfolio.avgDebt > 25
                  ? "Moderate evidence debt. Targeted evidence collection on high-priority decisions recommended."
                  : "Low portfolio debt. Evidence base is solid."}
              </p>
            </div>
          </div>

          {/* Verdict Distribution */}
          <div className="card mb-4">
            <div className="mb-4 flex items-baseline gap-3 border-b border-border-hair pb-3">
              <span className="data text-xs font-bold text-amber">§04</span>
              <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-slate">Verdict Distribution</h2>
            </div>
            <div className="space-y-2">
              {(["GO", "UNRESOLVED", "KILL"] as const).map((v) => {
                const count = verdictDelta(v);
                const total = Object.values(analytics.verdictCounts).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                const barCls = v === "GO" ? "bg-go" : v === "KILL" ? "bg-kill" : "bg-amber";
                const txtCls = v === "GO" ? "text-go" : v === "KILL" ? "text-kill" : "text-unresolved";
                return (
                  <div key={v} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={txtCls}>{v}</span>
                      <span className="data text-slate">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/8">
                      <div className={`h-full rounded-full ${barCls}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GO Progress */}
          <div className="card mb-4">
            <div className="mb-4 flex items-baseline gap-3 border-b border-border-hair pb-3">
              <span className="data text-xs font-bold text-amber">§05</span>
              <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-slate">GO Progress</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-inner bg-white/3 px-3 py-2.5">
                <div className="text-[10px] text-slate">Completion Rate</div>
                <div className={`data mt-0.5 text-xl font-bold ${analytics.completionRate >= 70 ? "text-go" : analytics.completionRate >= 40 ? "text-unresolved" : "text-kill"}`}>{analytics.completionRate}%</div>
              </div>
              <div className="rounded-inner bg-white/3 px-3 py-2.5">
                <div className="text-[10px] text-slate">Report Rate</div>
                <div className="data mt-0.5 text-xl font-bold text-ivory">{analytics.reportRate}%</div>
              </div>
              <div className="rounded-inner bg-white/3 px-3 py-2.5">
                <div className="text-[10px] text-slate">Verdicts</div>
                <div className="data mt-0.5 text-xl font-bold text-ivory">{analytics.totals.verdicts}</div>
              </div>
              <div className="rounded-inner bg-white/3 px-3 py-2.5">
                <div className="text-[10px] text-slate">Reports</div>
                <div className="data mt-0.5 text-xl font-bold text-ivory">{analytics.totals.reports}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-6 border-t border-border-hair pt-5 text-center text-xs text-slate print:mt-12">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Mark size={14} variant="mono" />
              <span className="font-semibold text-ivory">HypothesisOS</span>
              <span>·</span>
              <span>Weekly Intelligence Report</span>
            </div>
            <p>Deterministic engine analysis · {today}</p>
          </footer>
        </>
      )}
    </div>
  );
}
