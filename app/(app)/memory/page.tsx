"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import {
  selfCritique, navigate, evidenceDebt, calibrate,
  type Evidence,
} from "@/lib/core";
import { VerdictPill } from "@/components/Verdict";

type HypSummary = { id: string; title: string; createdAt: string };
type EvidenceRecord = { id: string; evidence: Evidence; label: string; createdAt: string };
type VerdictRecord = { id: string; finalVerdict: string; support: number; calibration: number; band: string; createdAt: string };
type HypDetail = { hypothesis: HypSummary; evidence: EvidenceRecord[]; verdicts: VerdictRecord[] };

type TimelinePoint = {
  at: string;
  label: string;
  verdict: string;
  support: number;
  calibration: number;
  debt: number;
  rev: number;
};

function computeTimeline(detail: HypDetail): TimelinePoint[] {
  const points: TimelinePoint[] = [];
  const sorted = [...detail.evidence].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
  const verdictsSorted = [...detail.verdicts].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));

  sorted.forEach((ev, i) => {
    try {
      const crit = selfCritique(ev.evidence);
      const nav = navigate(ev.evidence, crit.finalVerdict);
      const debt = evidenceDebt(ev.evidence, nav);
      // Match with nearest verdict
      const matchedVerdict = verdictsSorted[i] ?? verdictsSorted[verdictsSorted.length - 1];
      points.push({
        at: ev.createdAt,
        label: ev.label || `Evidence ${i + 1}`,
        verdict: matchedVerdict?.finalVerdict ?? crit.finalVerdict,
        support: nav.currentSupport,
        calibration: matchedVerdict?.calibration ?? crit.calibration.score,
        debt: debt.pct,
        rev: i + 1,
      });
    } catch { /* skip bad evidence */ }
  });
  return points;
}

const VERDICT_COLORS: Record<string, string> = {
  GO: "#3FB67A", KILL: "#E5544B", UNRESOLVED: "#E8A23D",
};
const VERDICT_BG: Record<string, string> = {
  GO: "bg-go/15 text-go", KILL: "bg-kill/15 text-kill", UNRESOLVED: "bg-amber/15 text-unresolved",
};

export default function DecisionMemory() {
  const [hypotheses, setHypotheses] = useState<HypSummary[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [detail, setDetail] = useState<HypDetail | null>(null);
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    api<{ hypotheses: HypSummary[] }>("/api/hypotheses")
      .then((r) => {
        setHypotheses(r.hypotheses || []);
        if (r.hypotheses?.length > 0) setSelected(r.hypotheses[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setDetailLoading(true);
    api<HypDetail>(`/api/hypotheses/${selected}`)
      .then((r) => {
        setDetail(r);
        setTimeline(computeTimeline(r));
      })
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  }, [selected]);

  const firstVerdict = timeline[0]?.verdict;
  const lastVerdict = timeline[timeline.length - 1]?.verdict;
  const flipped = timeline.length > 1 && firstVerdict !== lastVerdict;
  const maxSupport = Math.max(...timeline.map((p) => p.support), 1);

  return (
    <div className="space-y-5">
      <div>
        <div className="label">Decision Memory</div>
        <h1 className="text-2xl font-bold tracking-tight">Evolution Timeline</h1>
        <p className="mt-1 text-sm text-slate">Track how each decision evolved — verdict, support, and evidence debt over time.</p>
      </div>

      {/* Selector */}
      <div className="card space-y-3">
        <div className="label">Select Decision</div>
        {loading ? (
          <div className="h-10 animate-pulse rounded-btn bg-white/5" />
        ) : hypotheses.length === 0 ? (
          <p className="text-sm text-slate">No decisions yet. <Link href="/workflow" className="text-amber hover:underline">Create one →</Link></p>
        ) : (
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input">
            {hypotheses.map((h) => (
              <option key={h.id} value={h.id}>{h.title}</option>
            ))}
          </select>
        )}
      </div>

      {/* Summary badges */}
      {timeline.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Revisions" value={String(timeline.length)} />
          <StatCard label="Current Verdict" value={lastVerdict ?? "—"} cls={VERDICT_BG[lastVerdict ?? ""] ?? ""} />
          <StatCard label="Current Support" value={`${((timeline[timeline.length - 1]?.support ?? 0) * 100).toFixed(1)}%`} />
          <StatCard label="Verdict Flipped" value={flipped ? "YES" : "NO"} cls={flipped ? "text-unresolved" : "text-go"} />
        </div>
      )}

      {detailLoading && (
        <div className="card animate-pulse h-48 bg-white/3" />
      )}

      {/* Timeline chart */}
      {!detailLoading && timeline.length > 0 && (
        <div className="card space-y-5">
          <div className="label">Verdict History</div>

          {/* Visual timeline */}
          <div className="relative">
            {/* Axis */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[9px] text-slate pb-6">
              <span>100%</span>
              <span>50%</span>
              <span>0%</span>
            </div>

            {/* Chart area */}
            <div className="ml-8 space-y-0">
              <div className="relative h-48 w-full overflow-hidden rounded-inner bg-white/3">
                {/* Grid lines */}
                {[25, 50, 75].map((pct) => (
                  <div key={pct} className="absolute w-full border-t border-white/5" style={{ bottom: `${pct}%` }} />
                ))}
                {/* GO threshold line */}
                <div
                  className="absolute w-full border-t border-go/30 border-dashed"
                  style={{ bottom: "70%" }}
                  title="GO threshold"
                />
                <span className="absolute right-2 text-[9px] text-go/60" style={{ bottom: "71%" }}>GO</span>

                {/* Support bars */}
                <div className="absolute inset-0 flex items-end gap-1 px-2 pb-0">
                  {timeline.map((pt, i) => {
                    const height = Math.round(pt.support * 100);
                    const color = VERDICT_COLORS[pt.verdict] ?? "#6b7280";
                    return (
                      <div
                        key={i}
                        className="relative flex-1 rounded-t transition-all"
                        style={{ height: `${height}%`, backgroundColor: color, opacity: 0.8 }}
                        title={`Rev ${pt.rev}: ${pt.verdict} · ${(pt.support * 100).toFixed(1)}% support`}
                      >
                        {timeline.length <= 8 && (
                          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] text-slate">{pt.rev}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Evidence debt trend */}
          {timeline.length > 1 && (
            <div>
              <div className="label mb-2">Evidence Debt Trend</div>
              <div className="flex items-end gap-1 h-16">
                {timeline.map((pt, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-kill/40"
                      style={{ height: `${Math.round(pt.debt)}%`, minHeight: 2 }}
                      title={`Rev ${pt.rev}: ${pt.debt.toFixed(1)}% debt`}
                    />
                    <span className="text-[9px] text-slate">{Math.round(pt.debt)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Revision log */}
      {!detailLoading && timeline.length > 0 && (
        <div className="card space-y-3">
          <div className="label">Revision Log</div>
          <ol className="space-y-2">
            {timeline.map((pt, i) => (
              <li key={i} className="flex items-start gap-3 rounded-inner bg-white/3 px-3 py-2.5">
                <div className="flex flex-col items-center shrink-0 mt-0.5">
                  <span className="data text-[10px] text-slate">r{pt.rev}</span>
                  {i < timeline.length - 1 && (
                    <div className="w-px flex-1 bg-border-hair mt-1" style={{ minHeight: 16 }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`pill text-[10px] ${VERDICT_BG[pt.verdict] ?? "bg-white/10 text-steel"}`}>
                      {pt.verdict}
                    </span>
                    <span className="text-xs text-steel">support {(pt.support * 100).toFixed(1)}%</span>
                    <span className="text-xs text-slate">cal {Math.round(pt.calibration)}/100</span>
                    <span className="text-xs text-slate">debt {pt.debt.toFixed(0)}%</span>
                  </div>
                  <div className="mt-1 text-xs text-steel truncate">{pt.label}</div>
                  <div className="text-[10px] text-slate">{new Date(pt.at).toLocaleDateString()}</div>
                </div>
                {/* Delta arrow */}
                {i > 0 && (() => {
                  const prev = timeline[i - 1];
                  const delta = pt.support - prev.support;
                  return (
                    <span className={`shrink-0 text-xs font-bold ${delta > 0 ? "text-go" : delta < 0 ? "text-kill" : "text-slate"}`}>
                      {delta > 0 ? "▲" : delta < 0 ? "▼" : "—"} {Math.abs(delta * 100).toFixed(1)}%
                    </span>
                  );
                })()}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Flip alert */}
      {flipped && (
        <div className="rounded-card border border-unresolved/30 bg-amber/5 px-4 py-3">
          <div className="font-semibold text-unresolved text-sm">Verdict Flipped</div>
          <p className="mt-1 text-xs text-steel">
            This decision changed from <span className="font-bold text-ivory">{firstVerdict}</span> to{" "}
            <span className="font-bold text-ivory">{lastVerdict}</span> across {timeline.length} revisions.
            Flip events indicate significant new evidence.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!detailLoading && timeline.length === 0 && detail && (
        <div className="card text-center space-y-2">
          <div className="text-3xl text-slate">⏱</div>
          <p className="text-sm text-steel">No evidence revisions yet.</p>
          <Link href={`/workflow`} className="btn-primary text-sm inline-flex">Run the workflow →</Link>
        </div>
      )}

      {/* Quick links */}
      {selected && (
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href={`/report/${selected}`} className="text-steel hover:text-ivory">Full Report →</Link>
          <Link href={`/audit/${selected}`} className="text-steel hover:text-ivory">Audit Trail →</Link>
          <Link href={`/premortem/${selected}`} className="text-steel hover:text-ivory">Premortem →</Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="card-flat rounded-inner bg-white/3 px-3 py-3">
      <div className="text-[10px] uppercase tracking-wide text-slate">{label}</div>
      <div className={`data mt-1 text-lg font-bold ${cls ?? "text-ivory"}`}>{value}</div>
    </div>
  );
}
