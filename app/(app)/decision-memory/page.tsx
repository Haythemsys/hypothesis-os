"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type HypData = { id: string; title: string; verdict: string; support: number; debt: number; risk: number; createdAt: string; gaps: string[] };
type Similarity = { aId: string; aTitle: string; bId: string; bTitle: string; overlap: number };
type RecurringGap = { dimension: string; occurrences: number };
type Patterns = { highRisk: number; highDebt: number; prematureGO: number; totalResolved: number };
type Lesson = { id: string; title: string; verdict: string; support: number; lesson: string };

type MemoryData = { decisions: HypData[]; similarities: Similarity[]; recurringGaps: RecurringGap[]; patterns: Patterns; lessons: Lesson[] };

const VERDICT_CLS: Record<string, string> = { GO: "text-go", KILL: "text-kill", UNRESOLVED: "text-unresolved" };
const VERDICT_BG: Record<string, string> = { GO: "bg-go/15 border-go/20", KILL: "bg-kill/15 border-kill/20", UNRESOLVED: "bg-amber/15 border-amber/20" };

export default function DecisionMemory() {
  const [data, setData] = useState<MemoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"similar" | "gaps" | "patterns" | "lessons">("similar");

  useEffect(() => {
    api<MemoryData>("/api/decision-memory")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <div className="label">Decision Memory AI</div>
        <h1 className="text-2xl font-bold tracking-tight">Decision Memory</h1>
        <p className="mt-1 text-sm text-slate">Learn from past decisions. Detect recurring patterns, recurring gaps, and similar historical decisions.</p>
      </div>

      {loading ? (
        <div className="card h-32 animate-pulse" />
      ) : !data || data.decisions.length === 0 ? (
        <div className="card text-center py-6 space-y-2">
          <p className="text-sm text-slate">No decisions yet to analyze.</p>
          <Link href="/workflow" className="btn-primary text-sm inline-block">Create First Decision →</Link>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Total Decisions", value: data.decisions.length, color: "text-ivory" },
              { label: "Resolved", value: data.patterns.totalResolved, color: "text-go" },
              { label: "High Risk", value: data.patterns.highRisk, color: "text-kill" },
              { label: "Recurring Gaps", value: data.recurringGaps.length, color: "text-amber" },
            ].map(m => (
              <div key={m.label} className="card text-center">
                <div className={`data text-2xl font-bold ${m.color}`}>{m.value}</div>
                <div className="label mt-1">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {(["similar", "gaps", "patterns", "lessons"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`pill text-xs transition-colors ${view === v ? "bg-amber text-obsidian" : "bg-white/8 text-slate hover:text-ivory"}`}>
                {v === "similar" ? "Similar Decisions" : v === "gaps" ? "Recurring Gaps" : v === "patterns" ? "Risk Patterns" : "Lessons Learned"}
              </button>
            ))}
          </div>

          {view === "similar" && (
            <div className="card space-y-3">
              <div className="label">Similar Decisions ({data.similarities.length})</div>
              {data.similarities.length === 0 ? (
                <p className="text-sm text-slate">No similar decision pairs found. Create more decisions to detect patterns.</p>
              ) : data.similarities.map((s, i) => (
                <div key={i} className="rounded-inner bg-white/3 border border-border-hair p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="pill bg-amber/15 text-amber text-[10px] data">{s.overlap}% overlap</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Link href={`/report/${s.aId}`} className="text-xs text-steel hover:text-ivory truncate">• {s.aTitle}</Link>
                    <Link href={`/report/${s.bId}`} className="text-xs text-steel hover:text-ivory truncate">• {s.bTitle}</Link>
                  </div>
                  <p className="text-xs text-slate">High keyword overlap — review both before deciding independently.</p>
                </div>
              ))}
            </div>
          )}

          {view === "gaps" && (
            <div className="card space-y-3">
              <div className="label">Recurring Evidence Gaps</div>
              {data.recurringGaps.length === 0 ? (
                <p className="text-sm text-slate">No recurring gaps detected. Good evidence discipline.</p>
              ) : (
                <>
                  <p className="text-xs text-slate">Dimensions consistently missing across decisions — systemic evidence weaknesses.</p>
                  {data.recurringGaps.map((g, i) => (
                    <div key={i} className="rounded-inner bg-amber/8 border border-amber/20 p-3">
                      <div className="flex items-center gap-2">
                        <span className="pill bg-amber/20 text-amber text-[10px] data">{g.occurrences}× missing</span>
                        <span className="text-sm font-medium capitalize">{g.dimension.replace(/_/g, " ")}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate">This evidence dimension was zero in {g.occurrences} decision{g.occurrences > 1 ? "s" : ""}. Prioritize collecting it systematically.</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {view === "patterns" && (
            <div className="card space-y-3">
              <div className="label">Risk Patterns Detected</div>
              <div className="space-y-2">
                {[
                  { label: "High Risk Decisions", value: data.patterns.highRisk, total: data.decisions.length, msg: "decisions with risk score > 60. Consider increasing evidence requirements before GO.", color: "kill" },
                  { label: "High Evidence Debt", value: data.patterns.highDebt, total: data.decisions.length, msg: "decisions with evidence debt > 70. Systematic under-testing detected.", color: "amber" },
                  { label: "Premature GO (high debt + GO)", value: data.patterns.prematureGO, total: data.decisions.length, msg: "GO decisions with >50% evidence debt. These carry hidden execution risk.", color: "kill" },
                ].map(p => (
                  <div key={p.label} className={`rounded-inner border p-3 ${p.value > 0 ? `bg-${p.color}/8 border-${p.color}/20` : "bg-white/3 border-border-hair"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`data text-lg font-bold ${p.value > 0 ? `text-${p.color}` : "text-go"}`}>{p.value}</span>
                      <span className="text-sm font-medium">{p.label}</span>
                    </div>
                    {p.value > 0 ? (
                      <p className="mt-1 text-xs text-slate">{p.value} {p.msg}</p>
                    ) : (
                      <p className="mt-1 text-xs text-go">✓ No {p.label.toLowerCase()} detected.</p>
                    )}
                    {p.total > 0 && (
                      <div className="mt-2 h-1 rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-current opacity-40" style={{ width: `${Math.min(100, (p.value / p.total) * 100)}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "lessons" && (
            <div className="card space-y-3">
              <div className="label">Lessons Learned ({data.lessons.length})</div>
              {data.lessons.length === 0 ? (
                <p className="text-sm text-slate">Complete decisions to generate lessons.</p>
              ) : data.lessons.map(lesson => (
                <div key={lesson.id} className={`rounded-inner border p-3 space-y-1 ${VERDICT_BG[lesson.verdict] || "bg-white/3 border-border-hair"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`pill text-[10px] ${VERDICT_BG[lesson.verdict]}`}>{lesson.verdict}</span>
                    <Link href={`/report/${lesson.id}`} className={`text-sm font-medium hover:underline flex-1 truncate ${VERDICT_CLS[lesson.verdict]}`}>{lesson.title}</Link>
                    <span className="data text-xs text-slate shrink-0">{(lesson.support * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate">{lesson.lesson}</p>
                </div>
              ))}
            </div>
          )}

          {/* Decision list */}
          <div className="card space-y-2">
            <div className="label">All Decisions ({data.decisions.length})</div>
            <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar">
              {data.decisions.map(d => (
                <Link key={d.id} href={`/report/${d.id}`} className="flex items-center gap-2 rounded-inner px-2 py-1.5 hover:bg-white/3 transition-colors">
                  <span className={`w-2 h-2 shrink-0 rounded-full ${d.verdict === "GO" ? "bg-go" : d.verdict === "KILL" ? "bg-kill" : "bg-amber"}`} />
                  <span className="text-sm text-steel truncate flex-1">{d.title}</span>
                  <span className={`data text-xs shrink-0 ${VERDICT_CLS[d.verdict]}`}>{(d.support * 100).toFixed(0)}%</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
