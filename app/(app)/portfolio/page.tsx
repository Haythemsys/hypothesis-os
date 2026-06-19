"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type PortfolioItem = {
  id: string; title: string; createdAt: string;
  verdict: string | null; support: number | null; debt: number | null;
  debtBand: string | null; risk: string | null; riskScore: number | null;
  effort: string | null; evidenceCount: number; verdictCount: number;
};

type PortfolioData = {
  total: number;
  counts: Record<string, number>;
  riskCounts: Record<string, number>;
  avgDebt: number; avgRisk: number;
  healthScore: number;
  goRatio: number; killRatio: number; resolvedRatio: number;
  items: PortfolioItem[];
};

const VERDICT_BG: Record<string, string> = {
  GO: "bg-go/15 text-go border-go/20",
  KILL: "bg-kill/15 text-kill border-kill/20",
  UNRESOLVED: "bg-amber/15 text-unresolved border-amber/20",
};
const RISK_CLS: Record<string, string> = {
  LOW: "text-go", MEDIUM: "text-unresolved", HIGH: "text-kill", CRITICAL: "text-kill",
};

function healthBand(score: number) {
  if (score >= 70) return { label: "Healthy", cls: "text-go" };
  if (score >= 45) return { label: "Developing", cls: "text-unresolved" };
  return { label: "At Risk", cls: "text-kill" };
}

export default function Portfolio() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "GO" | "KILL" | "UNRESOLVED">("ALL");
  const [sort, setSort] = useState<"newest" | "risk" | "debt" | "support">("newest");

  useEffect(() => {
    api<PortfolioData>("/api/portfolio")
      .catch(() => null)
      .then((r) => { if (r) setData(r); })
      .finally(() => setLoading(false));
  }, []);

  const items = (data?.items ?? [])
    .filter((p) => filter === "ALL" || p.verdict === filter)
    .sort((a, b) => {
      if (sort === "newest") return (a.createdAt > b.createdAt ? -1 : 1);
      if (sort === "risk") return (b.riskScore ?? 0) - (a.riskScore ?? 0);
      if (sort === "debt") return (b.debt ?? 0) - (a.debt ?? 0);
      if (sort === "support") return (b.support ?? 0) - (a.support ?? 0);
      return 0;
    });

  const hb = data ? healthBand(data.healthScore) : null;

  return (
    <div className="space-y-5">
      <div>
        <div className="label">Decision Portfolio</div>
        <h1 className="text-2xl font-bold tracking-tight">Portfolio Overview</h1>
        <p className="mt-1 text-sm text-slate">Your complete decision intelligence portfolio — risk exposure, evidence quality, and outcome distribution.</p>
      </div>

      {loading && <div className="card animate-pulse h-32 bg-white/3" />}

      {data && (
        <>
          {/* Portfolio Health Score */}
          <div className="card-accent space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="label">Portfolio Health Score</div>
                <div className={`data mt-1 text-5xl font-bold ${hb?.cls}`}>{data.healthScore}</div>
                <div className={`mt-1 text-sm font-semibold ${hb?.cls}`}>{hb?.label}</div>
              </div>
              <div className="space-y-2 text-right">
                <p className="text-xs text-slate">Based on: outcome distribution,<br/>resolution rate, evidence depth,<br/>and risk exposure.</p>
              </div>
            </div>
            {/* Health bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
              <div
                className={`h-full rounded-full transition-all ${data.healthScore >= 70 ? "bg-go" : data.healthScore >= 45 ? "bg-amber" : "bg-kill"}`}
                style={{ width: `${data.healthScore}%` }}
              />
            </div>
          </div>

          {/* Metric grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="Total Decisions" value={String(data.total)} />
            <MetricCard label="GO" value={String(data.counts.GO ?? 0)} cls="text-go" />
            <MetricCard label="KILL" value={String(data.counts.KILL ?? 0)} cls="text-kill" />
            <MetricCard label="UNRESOLVED" value={String(data.counts.UNRESOLVED ?? 0)} cls="text-unresolved" />
            <MetricCard label="Resolution Rate" value={`${data.resolvedRatio}%`} />
            <MetricCard label="Avg Evidence Debt" value={`${data.avgDebt}%`} cls={data.avgDebt > 50 ? "text-kill" : data.avgDebt > 25 ? "text-unresolved" : "text-go"} />
            <MetricCard label="Avg Risk Score" value={String(data.avgRisk)} cls={data.avgRisk > 65 ? "text-kill" : data.avgRisk > 40 ? "text-unresolved" : "text-go"} />
            <MetricCard label="GO Rate" value={`${data.goRatio}%`} cls={data.goRatio > 50 ? "text-go" : "text-slate"} />
          </div>

          {/* Distribution charts */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Verdict distribution */}
            <div className="card space-y-3">
              <div className="label">Verdict Distribution</div>
              {(["GO", "UNRESOLVED", "KILL"] as const).map((v) => {
                const count = data.counts[v] ?? 0;
                const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0;
                return (
                  <div key={v} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={RISK_CLS[v === "GO" ? "LOW" : v === "KILL" ? "HIGH" : "MEDIUM"]}>{v}</span>
                      <span className="text-slate">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/8">
                      <div
                        className={`h-full rounded-full ${v === "GO" ? "bg-go" : v === "KILL" ? "bg-kill" : "bg-amber"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Risk distribution */}
            <div className="card space-y-3">
              <div className="label">Risk Distribution</div>
              {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((r) => {
                const count = data.riskCounts[r] ?? 0;
                const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0;
                return (
                  <div key={r} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={RISK_CLS[r]}>{r}</span>
                      <span className="text-slate">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/8">
                      <div
                        className={`h-full rounded-full ${r === "LOW" ? "bg-go" : r === "MEDIUM" ? "bg-amber" : "bg-kill"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decision list */}
          <div className="card space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="label">All Decisions</div>
              <div className="flex flex-wrap gap-2">
                {/* Filter */}
                <div className="flex rounded-btn border border-border-hair overflow-hidden">
                  {(["ALL", "GO", "KILL", "UNRESOLVED"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${filter === f ? "bg-amber text-obsidian" : "text-slate hover:text-ivory"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                {/* Sort */}
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as typeof sort)}
                  className="rounded-btn border border-border-hair bg-obsidian px-2 py-1 text-xs text-steel"
                >
                  <option value="newest">Newest</option>
                  <option value="risk">Highest Risk</option>
                  <option value="debt">Highest Debt</option>
                  <option value="support">Highest Support</option>
                </select>
              </div>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-slate text-center py-4">No decisions match this filter.</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-inner border border-border-hair px-3 py-2.5 hover:bg-white/3 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {item.verdict && (
                          <span className={`pill text-[10px] border ${VERDICT_BG[item.verdict] ?? "bg-white/10 text-steel"}`}>
                            {item.verdict}
                          </span>
                        )}
                        <span className="font-medium text-sm text-ivory truncate">{item.title}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-slate">
                        {item.support !== null && <span>support {((item.support ?? 0) * 100).toFixed(0)}%</span>}
                        {item.debt !== null && <span>debt {item.debt?.toFixed(0)}%</span>}
                        {item.risk && <span className={RISK_CLS[item.risk] ?? ""}>{item.risk} risk</span>}
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <Link href={`/report/${item.id}`} className="btn-ghost py-1 px-2 text-xs">Report</Link>
                      <Link href={`/premortem/${item.id}`} className="btn-quiet py-1 px-2 text-xs">Premortem</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!loading && !data && (
        <div className="card text-center space-y-3 py-8">
          <div className="text-3xl text-slate">◈</div>
          <p className="text-sm text-steel">No decisions in portfolio yet.</p>
          <Link href="/workflow" className="btn-primary text-sm inline-flex">Run first decision →</Link>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="rounded-inner border border-border-hair bg-white/3 px-3 py-3">
      <div className="text-[10px] uppercase tracking-wide text-slate">{label}</div>
      <div className={`data mt-1 text-xl font-bold ${cls ?? "text-ivory"}`}>{value}</div>
    </div>
  );
}
