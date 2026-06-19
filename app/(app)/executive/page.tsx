"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import {
  selfCritique, navigate, evidenceDebt, decisionEffort, decisionRisk,
  executiveSummary, resolutionTimeline, calibrate,
  type Evidence,
} from "@/lib/core";
import { Mark } from "@/components/logo/Mark";

type HypSummary = { id: string; title: string; createdAt: string };
type HypDetail = {
  hypothesis: HypSummary;
  evidence: { id: string; evidence: Evidence; createdAt: string }[];
  verdicts: { id: string; finalVerdict: string; support: number; calibration: number; band: string }[];
};

const VERDICT_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  GO:         { bg: "bg-go/10",   text: "text-go",         border: "border-go/30" },
  KILL:       { bg: "bg-kill/10", text: "text-kill",       border: "border-kill/30" },
  UNRESOLVED: { bg: "bg-amber/10",text: "text-unresolved", border: "border-amber/30" },
};
const RISK_CLS: Record<string, string> = {
  LOW: "text-go", MEDIUM: "text-unresolved", HIGH: "text-kill", CRITICAL: "text-kill",
};

export default function Executive() {
  const [hypotheses, setHypotheses] = useState<HypSummary[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [detail, setDetail] = useState<HypDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    api<{ hypotheses: HypSummary[] }>("/api/hypotheses")
      .then((r) => {
        const list = r.hypotheses || [];
        setHypotheses(list);
        if (list.length > 0) setSelected(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setDetailLoading(true);
    setDetail(null);
    api<HypDetail>(`/api/hypotheses/${selected}`)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  }, [selected]);

  const ev = detail?.evidence?.[detail.evidence.length - 1]?.evidence ?? null;
  const crit  = useMemo(() => ev ? selfCritique(ev) : null, [ev]);
  const nav   = useMemo(() => ev && crit ? navigate(ev, crit.finalVerdict) : null, [ev, crit]);
  const debt  = useMemo(() => ev && nav  ? evidenceDebt(ev, nav) : null, [ev, nav]);
  const eff   = useMemo(() => nav ? decisionEffort(nav) : null, [nav]);
  const cal   = useMemo(() => ev ? calibrate(ev) : null, [ev]);
  const risk  = useMemo(() => debt && nav && cal ? decisionRisk(debt, nav, cal.score) : null, [debt, nav, cal]);
  const exec_ = useMemo(() => crit && nav && debt && eff ? executiveSummary(crit.finalVerdict, nav, debt, eff) : null, [crit, nav, debt, eff]);
  const tline = useMemo(() => nav ? resolutionTimeline(nav) : null, [nav]);

  const verdict = crit?.finalVerdict ?? "UNRESOLVED";
  const vs = VERDICT_STYLES[verdict] ?? VERDICT_STYLES.UNRESOLVED;

  return (
    <div className="min-h-screen space-y-0">
      {/* Executive header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="label">Board View</div>
          <h1 className="text-2xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate mt-0.5">{today}</p>
        </div>
        <div className="flex items-center gap-2 opacity-60">
          <Mark size={18} variant="mono" />
          <span className="text-xs text-slate font-semibold uppercase tracking-widest">HypothesisOS</span>
        </div>
      </div>

      {/* Decision selector */}
      {loading ? (
        <div className="h-10 animate-pulse rounded-btn bg-white/5" />
      ) : hypotheses.length === 0 ? (
        <div className="card text-center py-8 space-y-2">
          <p className="text-sm text-steel">No decisions yet.</p>
          <Link href="/workflow" className="btn-primary text-sm inline-flex">Create first decision →</Link>
        </div>
      ) : (
        <div className="mb-6">
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className="input max-w-lg">
            {hypotheses.map((h) => (
              <option key={h.id} value={h.id}>{h.title}</option>
            ))}
          </select>
        </div>
      )}

      {detailLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1,2,3,4].map((i) => <div key={i} className="card animate-pulse h-32 bg-white/3" />)}
        </div>
      )}

      {!detailLoading && detail && ev && (
        <div className="space-y-4">
          {/* VERDICT — the most important panel */}
          <div className={`rounded-card border-2 p-6 ${vs.bg} ${vs.border}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="label mb-2">Final Verdict</div>
                <div className={`data text-6xl font-black tracking-tight ${vs.text}`}>{verdict}</div>
                {exec_?.reason && (
                  <p className="mt-2 max-w-lg text-sm text-steel">{exec_.reason}</p>
                )}
              </div>
              <div className="text-right space-y-1">
                <div className="data text-2xl font-bold text-ivory">{((nav?.currentSupport ?? 0) * 100).toFixed(0)}%</div>
                <div className="text-xs text-slate">support score</div>
                <div className={`data text-lg font-bold ${RISK_CLS[risk?.level ?? "MEDIUM"]}`}>
                  {risk?.level ?? "—"}
                </div>
                <div className="text-xs text-slate">risk level</div>
              </div>
            </div>
          </div>

          {/* 4-panel intelligence grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <ExecPanel label="Calibration" value={`${Math.round(cal?.score ?? 0)}/100`} sublabel={cal?.band ?? "—"} />
            <ExecPanel label="Evidence Debt" value={`${debt?.pct?.toFixed(0) ?? 0}%`} sublabel={debt?.band ?? "—"} cls={
              (debt?.pct ?? 0) > 50 ? "text-kill" : (debt?.pct ?? 0) > 25 ? "text-unresolved" : "text-go"
            } />
            <ExecPanel label="Decision Effort" value={eff?.level ?? "—"} sublabel={eff?.studyCycles ? `${eff.studyCycles} cycles` : "—"} />
            <ExecPanel label="Risk Score" value={String(risk?.score ?? "—")} sublabel={risk?.reason?.slice(0, 30) ?? "—"} cls={RISK_CLS[risk?.level ?? "MEDIUM"]} />
          </div>

          {/* Recommendation */}
          {nav?.recommendedAction && (
            <div className="card border-amber/20 bg-amber/5">
              <div className="label mb-1">Recommendation</div>
              <p className="font-semibold text-ivory">{nav.recommendedAction}</p>
              {exec_?.fastestRoute && (
                <p className="mt-1 text-sm text-steel">Fastest route: {exec_.fastestRoute}</p>
              )}
            </div>
          )}

          {/* Resolution Timeline */}
          {tline && tline.items.length > 0 && (
            <div className="card space-y-3">
              <div className="label">Resolution Timeline</div>
              <div className="flex items-baseline gap-2">
                <span className="data text-3xl font-bold text-ivory">{tline.totalMin}–{tline.totalMax}</span>
                <span className="text-sm text-slate">weeks to resolution</span>
              </div>
              <div className="space-y-2">
                {tline.items.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-ivory truncate">{item.label}</div>
                      <div className="text-xs text-slate">{item.minWeeks}–{item.maxWeeks} weeks</div>
                    </div>
                    <div className="h-1 w-16 rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-amber/60"
                        style={{ width: `${Math.min(100, (item.maxWeeks / (tline.totalMax || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GO blockers */}
          {nav && nav.unmetGoCriteria && nav.unmetGoCriteria.length > 0 && verdict !== "GO" && (
            <div className="card space-y-2">
              <div className="label text-kill">GO Blockers</div>
              <ul className="space-y-1">
                {nav.unmetGoCriteria.slice(0, 5).map((c: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-kill shrink-0 mt-0.5">✕</span>
                    <span className="text-steel">{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href={`/report/${selected}`} className="btn-primary text-sm">Full Report ↗</Link>
            <Link href={`/premortem/${selected}`} className="btn-ghost text-sm">Premortem</Link>
            <Link href={`/export?id=${selected}`} className="btn-ghost text-sm">Export</Link>
            <button onClick={() => window.print()} className="btn-quiet text-sm print:hidden">Print Brief</button>
          </div>

          {/* Hypothesis */}
          <div className="border-t border-border-hair pt-4 text-xs text-slate">
            <span className="font-semibold text-steel">{detail.hypothesis.title}</span>
            <span className="mx-2">·</span>
            <span>Created {new Date(detail.hypothesis.createdAt).toLocaleDateString()}</span>
            <span className="mx-2">·</span>
            <Link href={`/audit/${selected}`} className="text-amber hover:underline">Audit trail</Link>
          </div>
        </div>
      )}

      {!detailLoading && detail && !ev && (
        <div className="card text-center space-y-2 py-8">
          <p className="text-sm text-steel">No evidence recorded for this decision.</p>
          <Link href="/workflow" className="btn-primary text-sm inline-flex">Add evidence →</Link>
        </div>
      )}
    </div>
  );
}

function ExecPanel({ label, value, sublabel, cls }: { label: string; value: string; sublabel: string; cls?: string }) {
  return (
    <div className="card space-y-1">
      <div className="label">{label}</div>
      <div className={`data text-2xl font-bold ${cls ?? "text-ivory"}`}>{value}</div>
      <div className="text-[10px] text-slate truncate">{sublabel}</div>
    </div>
  );
}
