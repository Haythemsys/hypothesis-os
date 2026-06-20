"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type Bias = { type: string; severity: "critical" | "warning" | "info"; description: string; evidence: string; recommendation: string };
type Strength = { observation: string; implication: string };
type VelocityPoint = { month: string; count: number };
type Report = {
  total: number; goRate: number; killRate: number; unresolvedRate: number;
  avgDebt: number; avgRisk: number; avgSupport: number;
  biases: Bias[]; strengths: Strength[]; velocity: VelocityPoint[];
};

export default function Learning() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ report: Report | null }>("/api/learning")
      .then(r => setReport(r.report))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const maxVelocity = report ? Math.max(...report.velocity.map(v => v.count), 1) : 1;

  return (
    <div className="space-y-4">
      <div>
        <div className="label">Organizational Learning Engine</div>
        <h1 className="text-2xl font-bold tracking-tight">Learning Engine</h1>
        <p className="mt-1 text-sm text-slate">Analyze decision patterns across your organization. Detect biases and systemic weaknesses.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : !report ? (
        <div className="card text-center py-6 space-y-2">
          <p className="text-sm text-slate">No decisions to analyze yet.</p>
          <Link href="/workflow" className="btn-primary text-sm inline-block">Create First Decision →</Link>
        </div>
      ) : (
        <>
          {/* Overview metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: "Total Decisions", value: report.total, color: "text-ivory" },
              { label: "GO Rate", value: `${report.goRate}%`, color: "text-go" },
              { label: "KILL Rate", value: `${report.killRate}%`, color: "text-kill" },
              { label: "Avg Support", value: `${report.avgSupport}%`, color: "text-amber" },
              { label: "Avg Debt", value: `${report.avgDebt}%`, color: report.avgDebt > 50 ? "text-kill" : report.avgDebt > 35 ? "text-amber" : "text-go" },
              { label: "Avg Risk", value: `${report.avgRisk}%`, color: report.avgRisk > 60 ? "text-kill" : report.avgRisk > 40 ? "text-amber" : "text-go" },
            ].map(m => (
              <div key={m.label} className="card text-center">
                <div className={`data text-xl font-bold ${m.color}`}>{m.value}</div>
                <div className="label mt-1">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Biases */}
          {report.biases.length > 0 && (
            <div className="card space-y-3">
              <div className="flex items-center gap-2">
                <div className="label">Detected Biases</div>
                <span className={`pill text-[10px] ${report.biases.some(b => b.severity === "critical") ? "bg-kill/20 text-kill" : "bg-amber/20 text-amber"}`}>
                  {report.biases.length} found
                </span>
              </div>
              {report.biases.map((bias, i) => (
                <div key={i} className={`rounded-inner border p-3 space-y-2 ${bias.severity === "critical" ? "bg-kill/8 border-kill/20" : bias.severity === "warning" ? "bg-amber/8 border-amber/20" : "bg-white/3 border-border-hair"}`}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`pill text-[10px] ${bias.severity === "critical" ? "bg-kill/20 text-kill" : bias.severity === "warning" ? "bg-amber/20 text-amber" : "bg-white/10 text-slate"}`}>{bias.severity}</span>
                    <span className="text-sm font-semibold">{bias.type}</span>
                  </div>
                  <p className="text-sm text-steel">{bias.description}</p>
                  <div className="text-xs text-slate bg-obsidian/30 rounded px-2 py-1">Evidence: {bias.evidence}</div>
                  <div className="text-xs text-amber">→ {bias.recommendation}</div>
                </div>
              ))}
            </div>
          )}

          {/* Strengths */}
          {report.strengths.length > 0 && (
            <div className="card space-y-2">
              <div className="label">Organizational Strengths</div>
              {report.strengths.map((s, i) => (
                <div key={i} className="rounded-inner bg-go/8 border border-go/20 p-3">
                  <div className="text-sm font-semibold text-go">{s.observation}</div>
                  <p className="mt-0.5 text-xs text-slate">{s.implication}</p>
                </div>
              ))}
            </div>
          )}

          {/* No biases */}
          {report.biases.length === 0 && report.total > 0 && (
            <div className="card bg-go/8 border border-go/20">
              <div className="text-go font-semibold text-sm">✓ No systematic biases detected</div>
              <p className="mt-1 text-xs text-slate">Decision quality appears consistent across your portfolio. Continue monitoring as you scale.</p>
            </div>
          )}

          {/* Decision velocity */}
          <div className="card space-y-3">
            <div className="label">Decision Velocity (6 months)</div>
            <div className="flex items-end gap-1.5 h-20">
              {report.velocity.map(v => (
                <div key={v.month} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full rounded-sm bg-amber/60 transition-all" style={{ height: `${(v.count / maxVelocity) * 64}px`, minHeight: v.count > 0 ? 4 : 0 }} />
                  <span className="data text-[9px] text-slate">{v.month.slice(5)}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate">{report.velocity.reduce((s, v) => s + v.count, 0)} decisions in the last 6 months · avg {(report.velocity.reduce((s, v) => s + v.count, 0) / 6).toFixed(1)}/month</p>
          </div>

          {/* Verdict distribution */}
          <div className="card space-y-3">
            <div className="label">Verdict Distribution</div>
            <div className="space-y-2">
              {[
                { label: "GO", rate: report.goRate, color: "#3FB67A" },
                { label: "KILL", rate: report.killRate, color: "#E5544B" },
                { label: "UNRESOLVED", rate: report.unresolvedRate, color: "#E8A23D" },
              ].map(v => (
                <div key={v.label} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">{v.label}</span>
                    <span className="data text-xs" style={{ color: v.color }}>{v.rate}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{ width: `${v.rate}%`, backgroundColor: v.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-white/2 border-border-hair">
            <p className="text-xs text-slate"><span className="font-semibold text-steel">About this tool: </span>The Learning Engine uses deterministic analysis — no LLM, no guesswork. Biases are detected by comparing your organization's patterns to evidence-based benchmarks. Engine verdicts are never modified.</p>
          </div>
        </>
      )}
    </div>
  );
}
