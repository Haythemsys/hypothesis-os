"use client";
import { useState, useEffect, useMemo, use } from "react";
import { api } from "@/lib/client";
import {
  selfCritique, navigate, calibrate,
  evidenceDebt, decisionEffort, pathToGo, confidenceBreakdown, executiveSummary,
  decisionRisk, resolutionTimeline, costToResolve, investorView,
  type Evidence,
} from "@/lib/core";
import { VerdictPill, Bar } from "@/components/Verdict";

type HypDetail = {
  hypothesis: any;
  evidence: { evidence: Evidence; label: string; createdAt: string }[];
  verdicts: any[];
};

const RISK_CLS: Record<string, string> = { LOW: "text-go", MEDIUM: "text-unresolved", HIGH: "text-kill", CRITICAL: "text-kill" };
const INV_CLS: Record<string, string>  = { YES: "text-go", NO: "text-kill", "NOT YET": "text-unresolved" };

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<HypDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    api(`/api/hypotheses/${id}`)
      .then((r: HypDetail) => setData(r))
      .catch((e: any) => setErr(e.message || String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const ev = data?.evidence?.[data.evidence.length - 1]?.evidence ?? null;

  const cal   = useMemo(() => ev ? calibrate(ev)                     : null, [ev]);
  const crit  = useMemo(() => ev ? selfCritique(ev)                  : null, [ev]);
  const nav   = useMemo(() => ev && crit ? navigate(ev, crit.finalVerdict) : null, [ev, crit]);
  const debt  = useMemo(() => ev && nav  ? evidenceDebt(ev, nav)     : null, [ev, nav]);
  const eff   = useMemo(() => nav        ? decisionEffort(nav)       : null, [nav]);
  const path  = useMemo(() => nav        ? pathToGo(nav)             : null, [nav]);
  const conf  = useMemo(() => ev && cal  ? confidenceBreakdown(ev, cal.score) : null, [ev, cal]);
  const exec_ = useMemo(() => crit && nav && debt && eff ? executiveSummary(crit.finalVerdict, nav, debt, eff) : null, [crit, nav, debt, eff]);
  const risk  = useMemo(() => debt && nav && cal ? decisionRisk(debt, nav, cal.score) : null, [debt, nav, cal]);
  const tline = useMemo(() => nav        ? resolutionTimeline(nav)   : null, [nav]);
  const cost  = useMemo(() => eff && nav ? costToResolve(eff, nav)   : null, [eff, nav]);
  const inv   = useMemo(() => debt && risk && nav ? investorView(debt, risk, nav) : null, [debt, risk, nav]);

  if (loading) return <p className="card text-sm text-gray-400">Generating report…</p>;
  if (err)     return <p className="card text-sm text-kill">{err}</p>;
  if (!data || !ev) return <p className="card text-sm text-gray-400">No evidence recorded for this hypothesis yet.</p>;

  const { hypothesis } = data;
  const verdict = crit?.finalVerdict ?? "UNRESOLVED";

  return (
    <div className="space-y-4">
      {/* Print controls — hidden in print */}
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-xl font-bold">Executive Report</h1>
        <button onClick={() => window.print()} className="btn text-sm">Print / Save PDF</button>
      </div>

      {/* ── Section 1: Header ─────────────────────────────────────── */}
      <section className="card space-y-2">
        <div className="label">Section 1 — Hypothesis</div>
        <h2 className="text-lg font-bold leading-snug">{hypothesis.title}</h2>
        <div className="flex flex-wrap gap-1.5">
          {(hypothesis.kinds || []).map((k: string) => (
            <span key={k} className="pill bg-white/10 text-xs">{k}</span>
          ))}
        </div>
        <p className="text-xs text-gray-500">Generated {new Date().toLocaleDateString()}</p>
      </section>

      {/* ── Section 2: Verdict ──────────────────────────────────── */}
      <section className="card space-y-2">
        <div className="label">Section 2 — Decision Verdict</div>
        <div className="flex items-center gap-3 flex-wrap">
          <VerdictPill verdict={verdict as any} />
          <span className="text-sm text-gray-400">
            Support {nav?.currentSupport?.toFixed(2)} · {cal?.band} {cal?.score}/100
          </span>
        </div>
        {exec_ && <p className="text-sm text-gray-300 leading-relaxed">{exec_.reason}</p>}
        {crit?.downgrade && (
          <p className="text-xs text-unresolved">Self-critique downgrade: {crit.downgrade}</p>
        )}
      </section>

      {/* ── Section 3: Commercial Intelligence ──────────────────── */}
      <section className="card space-y-3">
        <div className="label">Section 3 — Commercial Intelligence</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {risk && (
            <div className="rounded-xl bg-black/20 p-3 space-y-1">
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">Decision Risk</div>
              <div className={`text-lg font-bold ${RISK_CLS[risk.level]}`}>{risk.level}</div>
            </div>
          )}
          {inv && (
            <div className="rounded-xl bg-black/20 p-3 space-y-1">
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">Invest More?</div>
              <div className={`text-lg font-bold ${INV_CLS[inv.verdict]}`}>{inv.verdict}</div>
            </div>
          )}
          {debt && (
            <div className="rounded-xl bg-black/20 p-3 space-y-1">
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">Evidence Debt</div>
              <div className="text-lg font-bold text-white">{debt.pct}%</div>
            </div>
          )}
          {cost && (
            <div className="rounded-xl bg-black/20 p-3 space-y-1">
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">Cost to Resolve</div>
              <div className={`text-lg font-bold ${cost.level === "LOW" ? "text-go" : cost.level === "HIGH" ? "text-kill" : "text-unresolved"}`}>
                {cost.level}
              </div>
            </div>
          )}
        </div>
        {risk && <p className="text-xs text-gray-400">{risk.reason}</p>}
        {inv  && <p className="text-xs text-gray-400">{inv.reason}</p>}
      </section>

      {/* ── Section 4: Evidence Summary ─────────────────────────── */}
      <section className="card space-y-3">
        <div className="label">Section 4 — Evidence Summary</div>
        <div className="space-y-2">
          {([
            ["Effect size",     ev.effect],
            ["Replication",     ev.replication],
            ["Hostile survival",ev.hostileSurvival],
            ["Confound control",ev.confoundControl],
            ["Generalization",  ev.generalization],
            ["Power",           ev.power],
          ] as [string, number][]).map(([label, val]) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                <span>{label}</span>
                <span className="tabular-nums">{val.toFixed(2)}</span>
              </div>
              <Bar value={val} label={label} />
            </div>
          ))}
          <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
            <span>CI excludes null:</span>
            <span className={ev.ciExcludesNull ? "text-go font-semibold" : "text-kill font-semibold"}>
              {ev.ciExcludesNull ? "YES" : "NO"}
            </span>
          </div>
        </div>
      </section>

      {/* ── Section 5: Confidence breakdown ─────────────────────── */}
      {conf && (
        <section className="card space-y-3">
          <div className="label">Section 5 — Confidence Breakdown</div>
          {conf.contributors.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-go mb-1">Positive contributors</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {conf.contributors.map((c, i) => <li key={i} className="text-xs text-gray-300">{c}</li>)}
              </ul>
            </div>
          )}
          {conf.penalties.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-kill mb-1">Penalties</p>
              <ul className="list-disc pl-4 space-y-0.5">
                {conf.penalties.map((p, i) => <li key={i} className="text-xs text-gray-300">{p}</li>)}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* ── Section 6: Path to GO ──────────────────────────────── */}
      {path && path.length > 0 && (
        <section className="card space-y-3">
          <div className="label">Section 6 — Path to GO</div>
          <ol className="space-y-2">
            {path.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                <div>
                  <span className="font-semibold text-white">{step.label}</span>
                  {step.maxGain != null && (
                    <span className="ml-2 text-xs text-gray-400">+{step.maxGain.toFixed(2)} support</span>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">{step.action}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── Section 7: Resolution Timeline ───────────────────────── */}
      {tline && (
        <section className="card space-y-3">
          <div className="label">Section 7 — Resolution Timeline</div>
          <div className="space-y-2">
            {tline.items.map((item) => (
              <div key={item.dimension} className="flex justify-between text-sm">
                <span className="text-gray-300">{item.label}</span>
                <span className="text-gray-400 tabular-nums">{item.minWeeks}–{item.maxWeeks} wks</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-semibold border-t border-line pt-2">
              <span>Overall estimate</span>
              <span>{tline.totalMin}–{tline.totalMax} weeks</span>
            </div>
          </div>
        </section>
      )}

      {/* Print footer */}
      <div className="hidden print:block text-center text-xs text-gray-500 pt-4">
        HypothesisOS · Decision Intelligence Engine · {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
