"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type WeekEntry = { week: string; decisions: number; verdicts: number; reports: number };
type AnalyticsData = {
  totals: { decisions: number; evidenceRecords: number; verdicts: number; reports: number };
  verdictCounts: Record<string, number>;
  funnel: { created: number; withEvidence: number; withVerdict: number; withReport: number };
  weekly: WeekEntry[];
  completionRate: number;
  reportRate: number;
};

const VERDICT_CLS: Record<string, string> = {
  GO: "text-go", KILL: "text-kill", UNRESOLVED: "text-unresolved",
};
const VERDICT_BAR: Record<string, string> = {
  GO: "bg-go", KILL: "bg-kill", UNRESOLVED: "bg-amber",
};

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AnalyticsData>("/api/analytics")
      .catch(() => null)
      .then((r) => { if (r) setData(r); })
      .finally(() => setLoading(false));
  }, []);

  // Find max for weekly chart scaling
  const weeklyMax = data ? Math.max(...data.weekly.map((w) => w.decisions + w.verdicts + w.reports), 1) : 1;

  return (
    <div className="space-y-5">
      <div>
        <div className="label">Internal Analytics</div>
        <h1 className="text-2xl font-bold tracking-tight">Product Usage</h1>
        <p className="mt-1 text-sm text-slate">Decision intelligence activity — decisions created, classified, and reported.</p>
      </div>

      {loading && <div className="card animate-pulse h-48 bg-white/3" />}

      {data && (
        <>
          {/* Total metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard label="Decisions" value={String(data.totals.decisions)} />
            <MetricCard label="Evidence Records" value={String(data.totals.evidenceRecords)} />
            <MetricCard label="Verdicts" value={String(data.totals.verdicts)} />
            <MetricCard label="Reports" value={String(data.totals.reports)} />
          </div>

          {/* Completion funnel */}
          <div className="card space-y-4">
            <div className="label">Decision Funnel</div>
            <div className="space-y-3">
              {[
                { label: "Hypotheses Created", count: data.funnel.created, pct: 100 },
                { label: "With Evidence", count: data.funnel.withEvidence, pct: data.funnel.created > 0 ? Math.round((data.funnel.withEvidence / data.funnel.created) * 100) : 0 },
                { label: "Classified (Verdict)", count: data.funnel.withVerdict, pct: data.funnel.created > 0 ? Math.round((data.funnel.withVerdict / data.funnel.created) * 100) : 0 },
                { label: "Report Generated", count: data.funnel.withReport, pct: data.funnel.created > 0 ? Math.round((data.funnel.withReport / data.funnel.created) * 100) : 0 },
              ].map((step, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-steel">{step.label}</span>
                    <span className="data text-slate">{step.count} · {step.pct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-amber/70 transition-all"
                      style={{ width: `${step.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 text-xs text-slate">
              <span>Completion rate: <span className="text-ivory font-semibold">{data.completionRate}%</span></span>
              <span>Report rate: <span className="text-ivory font-semibold">{data.reportRate}%</span></span>
            </div>
          </div>

          {/* Verdict distribution */}
          <div className="card space-y-3">
            <div className="label">Verdict Distribution</div>
            {(["GO", "UNRESOLVED", "KILL"] as const).map((v) => {
              const count = data.verdictCounts[v] ?? 0;
              const total = Object.values(data.verdictCounts).reduce((a, b) => a + b, 0);
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={v} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={VERDICT_CLS[v]}>{v}</span>
                    <span className="data text-slate">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/8">
                    <div className={`h-full rounded-full ${VERDICT_BAR[v]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Weekly activity chart */}
          <div className="card space-y-4">
            <div className="label">Weekly Activity (last 8 weeks)</div>
            <div className="flex items-end gap-1.5 h-32">
              {data.weekly.map((w, i) => {
                const total = w.decisions + w.verdicts + w.reports;
                const heightPct = weeklyMax > 0 ? (total / weeklyMax) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-amber/50 hover:bg-amber/70 transition-colors cursor-default"
                      style={{ height: `${heightPct}%`, minHeight: total > 0 ? 4 : 0 }}
                      title={`${w.week}: ${w.decisions} decisions, ${w.verdicts} verdicts, ${w.reports} reports`}
                    />
                    <span className="text-[8px] text-slate whitespace-nowrap overflow-hidden" style={{ maxWidth: "100%" }}>
                      {w.week.slice(-3)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 text-xs text-slate">
              <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-amber/50" />Activity (decisions + verdicts + reports)</span>
            </div>
          </div>

          {/* Health summary */}
          <div className="card space-y-2">
            <div className="label">Platform Health</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-inner bg-white/3 px-3 py-2">
                <div className="text-[10px] text-slate">Evidence per Decision</div>
                <div className="data text-xl font-bold text-ivory mt-0.5">
                  {data.totals.decisions > 0 ? (data.totals.evidenceRecords / data.totals.decisions).toFixed(1) : "0"}
                </div>
              </div>
              <div className="rounded-inner bg-white/3 px-3 py-2">
                <div className="text-[10px] text-slate">Verdict Coverage</div>
                <div className={`data text-xl font-bold mt-0.5 ${data.completionRate >= 70 ? "text-go" : data.completionRate >= 40 ? "text-unresolved" : "text-kill"}`}>
                  {data.completionRate}%
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && !data && (
        <div className="card text-center py-8 space-y-2">
          <p className="text-sm text-steel">No data yet.</p>
          <Link href="/workflow" className="btn-primary text-sm inline-flex">Create first decision →</Link>
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/portfolio" className="text-steel hover:text-ivory">Portfolio View →</Link>
        <Link href="/dashboard" className="text-steel hover:text-ivory">Dashboard →</Link>
      </div>
    </div>
  );
}

function MetricCard({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="rounded-inner border border-border-hair bg-white/3 px-3 py-3">
      <div className="text-[10px] uppercase tracking-wide text-slate">{label}</div>
      <div className={`data mt-1 text-2xl font-bold ${cls ?? "text-ivory"}`}>{value}</div>
    </div>
  );
}
