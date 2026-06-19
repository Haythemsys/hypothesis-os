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
import { Mark } from "@/components/logo/Mark";

type HypDetail = {
  hypothesis: any;
  evidence: { id: string; evidence: Evidence; label: string; createdAt: string }[];
  verdicts: any[];
  experiments: any[];
  reports: any[];
};

const RISK_CLS: Record<string, string> = { LOW: "text-go", MEDIUM: "text-unresolved", HIGH: "text-kill", CRITICAL: "text-kill" };
const VERDICT_BG: Record<string, string> = { GO: "bg-go/10 text-go", KILL: "bg-kill/10 text-kill", UNRESOLVED: "bg-amber/10 text-unresolved" };

export default function ExecutiveReport({ params }: { params: Promise<{ id: string }> }) {
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

  const cal   = useMemo(() => ev ? calibrate(ev)                          : null, [ev]);
  const crit  = useMemo(() => ev ? selfCritique(ev)                       : null, [ev]);
  const nav   = useMemo(() => ev && crit ? navigate(ev, crit.finalVerdict): null, [ev, crit]);
  const debt  = useMemo(() => ev && nav  ? evidenceDebt(ev, nav)          : null, [ev, nav]);
  const eff   = useMemo(() => nav        ? decisionEffort(nav)            : null, [nav]);
  const path  = useMemo(() => nav        ? pathToGo(nav)                  : null, [nav]);
  const conf  = useMemo(() => ev && cal  ? confidenceBreakdown(ev, cal.score) : null, [ev, cal]);
  const exec_ = useMemo(() => crit && nav && debt && eff ? executiveSummary(crit.finalVerdict, nav, debt, eff) : null, [crit, nav, debt, eff]);
  const risk  = useMemo(() => debt && nav && cal  ? decisionRisk(debt, nav, cal.score)   : null, [debt, nav, cal]);
  const tline = useMemo(() => nav        ? resolutionTimeline(nav)        : null, [nav]);
  const cost  = useMemo(() => eff && nav ? costToResolve(eff, nav)        : null, [eff, nav]);
  const inv   = useMemo(() => debt && risk && nav ? investorView(debt, risk, nav) : null, [debt, risk, nav]);

  if (loading) return <p className="card text-sm text-steel">Generating executive report…</p>;
  if (err)     return <p className="card text-sm text-kill">{err}</p>;
  if (!data || !ev) return <p className="card text-sm text-steel">No evidence recorded for this hypothesis yet.</p>;

  const { hypothesis } = data;
  const verdict = crit?.finalVerdict ?? "UNRESOLVED";
  const evCount = data.evidence.length;
  const reportDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const latestEv = data.evidence[data.evidence.length - 1];

  // Debt component breakdown for §05
  const debtComponents = debt ? [
    { label: "Effect deficit", value: Math.max(0, 1 - ev.effect), pct: Math.round(Math.max(0, 1 - ev.effect) * 100) },
    { label: "Replication gap", value: Math.max(0, 1 - ev.replication), pct: Math.round(Math.max(0, 1 - ev.replication) * 100) },
    { label: "Hostile gap", value: Math.max(0, 1 - ev.hostileSurvival), pct: Math.round(Math.max(0, 1 - ev.hostileSurvival) * 100) },
    { label: "Confound gap", value: Math.max(0, 1 - ev.confoundControl), pct: Math.round(Math.max(0, 1 - ev.confoundControl) * 100) },
    { label: "Generalization gap", value: Math.max(0, 1 - ev.generalization), pct: Math.round(Math.max(0, 1 - ev.generalization) * 100) },
  ].sort((a, b) => b.pct - a.pct) : [];

  // Effort levels
  const effortStars = eff ? (eff.level === "LOW" ? 1 : eff.level === "MEDIUM" ? 2 : 3) : 0;

  // Audit trail from evidence + verdicts + reports
  type AuditRow = { icon: string; label: string; at: string; meta?: string };
  const auditRows: AuditRow[] = [];
  auditRows.push({ icon: "◈", label: `Hypothesis created: "${hypothesis.title}"`, at: hypothesis.createdAt });
  for (const e of data.evidence) {
    auditRows.push({ icon: "⊕", label: `Evidence recorded: ${e.label || "unlabelled"}`, at: e.createdAt });
  }
  for (const v of data.verdicts) {
    auditRows.push({ icon: "⚖", label: `Verdict rendered: ${v.finalVerdict}`, at: v.createdAt, meta: `support ${v.support?.toFixed(3)} · ${v.band}` });
  }
  for (const r of data.reports) {
    auditRows.push({ icon: "▤", label: `Report generated${r.aiAssisted ? " (AI-assisted)" : ""}`, at: r.createdAt });
  }
  auditRows.sort((a, b) => (a.at < b.at ? -1 : 1));

  return (
    <div className="mx-auto max-w-3xl space-y-0">
      {/* Print / controls bar */}
      <div className="mb-5 flex items-center justify-between print:hidden">
        <div className="label">Executive Intelligence Report</div>
        <button
          onClick={() => window.print()}
          className="btn-ghost text-sm"
        >
          Print / Save PDF
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          COVER PAGE
      ══════════════════════════════════════════════════════════════════ */}
      <section className="mb-6 rounded-card border border-border-hair bg-graphite p-6 sm:p-8 print:mb-0 print:min-h-[60vh] print:flex print:flex-col print:justify-between">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Mark size={28} />
            <div>
              <span className="text-base font-bold tracking-tight text-ivory">Signal<span className="text-amber">Vertex</span></span>
              <div className="text-[10px] uppercase tracking-widest text-slate">· Intelligence Report</div>
            </div>
          </div>
          <div className={`rounded-inner px-3 py-1.5 text-sm font-bold ${VERDICT_BG[verdict] || "bg-white/8 text-steel"}`}>
            {verdict}
          </div>
        </div>

        <div className="mt-8 sm:mt-12">
          <div className="label mb-2">Decision Under Evaluation</div>
          <h1 className="text-2xl font-bold leading-snug text-ivory sm:text-3xl">{hypothesis.title}</h1>
          {(hypothesis.kinds || []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(hypothesis.kinds as string[]).map((k) => (
                <span key={k} className="pill bg-white/8 text-steel text-xs">{k}</span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border-hair pt-6 sm:grid-cols-4">
          <CoverMeta label="Date" value={reportDate} />
          <CoverMeta label="Evidence Records" value={String(evCount)} />
          <CoverMeta label="Calibration" value={`${cal?.score ?? "—"}/100`} />
          <CoverMeta label="Confidence" value={cal?.band ?? "—"} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          §01  EXECUTIVE SUMMARY
      ══════════════════════════════════════════════════════════════════ */}
      <Section n="01" title="Executive Summary">
        <p className="text-sm leading-relaxed text-steel">{exec_?.reason}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Support Score" value={nav?.currentSupport.toFixed(3) ?? "—"} />
          <Stat label="GO Threshold" value={String(nav?.goThreshold ?? "—")} />
          <Stat label="Evidence Debt" value={`${debt?.pct ?? "—"}%`} tone={debt && debt.pct > 40 ? "kill" : debt && debt.pct <= 15 ? "go" : undefined} />
          <Stat label="Calibration" value={`${cal?.score ?? "—"}/100`} />
        </div>
        {exec_?.fastestRoute && (
          <div className="mt-4 rounded-inner border border-border-hair bg-obsidian/50 px-4 py-3">
            <span className="label mr-2">Fastest Route</span>
            <span className="text-sm text-steel">{exec_.fastestRoute}</span>
          </div>
        )}
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          §02  FINAL VERDICT
      ══════════════════════════════════════════════════════════════════ */}
      <Section n="02" title="Final Verdict">
        <div className="flex flex-wrap items-center gap-3">
          <VerdictPill verdict={verdict} size="md" />
          <div className="text-sm text-steel">
            support <span className="data text-ivory font-semibold">{nav?.currentSupport.toFixed(3)}</span>
            {" "}vs threshold <span className="data">{nav?.goThreshold}</span>
          </div>
        </div>

        {crit?.downgrade && (
          <div className="mt-3 flex items-start gap-2 rounded-inner border border-amber-dim/30 bg-amber/5 px-3 py-2">
            <span className="text-xs text-amber">⚠</span>
            <p className="text-xs text-steel"><span className="font-semibold text-amber">Self-critique downgrade:</span> {crit.downgrade}</p>
          </div>
        )}

        {(nav?.unmetGoCriteriaDetail?.length ?? 0) > 0 && (
          <div className="mt-4 space-y-1.5">
            <div className="label mb-2">Unmet GO Criteria</div>
            {nav!.unmetGoCriteriaDetail!.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-inner bg-white/3 px-3 py-2 text-sm">
                <span className="text-steel">{c.criterion}</span>
                <span className="data shrink-0 text-xs text-slate">{String(c.current)} → need {String(c.required)}</span>
              </div>
            ))}
          </div>
        )}

        {nav?.killedBy && nav.killedBy.length > 0 && (
          <div className="mt-4">
            <div className="label mb-2">Active Kill Gates</div>
            <ul className="space-y-1">
              {nav.killedBy.map((g: any, i: number) => (
                <li key={i} className="flex items-center gap-2 text-sm text-steel">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-kill" />
                  {g.gate}: {g.action}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          §03  RISK ANALYSIS
      ══════════════════════════════════════════════════════════════════ */}
      <Section n="03" title="Risk Analysis">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Decision Risk" value={risk?.level ?? "—"} cls={RISK_CLS[risk?.level ?? ""]} />
          <Stat label="Invest More?" value={inv?.verdict ?? "—"}
            cls={inv?.verdict === "YES" ? "text-go" : inv?.verdict === "NO" ? "text-kill" : "text-unresolved"} />
          <Stat label="Cost to Resolve" value={cost?.level ?? "—"}
            cls={cost?.level === "LOW" ? "text-go" : cost?.level === "HIGH" ? "text-kill" : "text-unresolved"} />
        </div>

        {risk && (
          <div className="mt-4 space-y-1.5 text-sm text-steel">
            <p>{risk.reason}</p>
            {inv && <p className="mt-2 text-slate">{inv.reason}</p>}
          </div>
        )}

        {/* Risk score bar */}
        {risk && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-slate">
              <span>Risk Score</span>
              <span className="data">{risk.score?.toFixed(2) ?? "—"}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
              <div
                className={`h-full rounded-full transition-all ${
                  risk.level === "LOW" ? "bg-go" : risk.level === "MEDIUM" ? "bg-amber" : "bg-kill"
                }`}
                style={{ width: `${Math.min(100, (risk.score ?? 0) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          §04  EVIDENCE BREAKDOWN
      ══════════════════════════════════════════════════════════════════ */}
      <Section n="04" title="Evidence Breakdown">
        {latestEv && (
          <p className="mb-3 text-xs text-slate">
            Latest record: <span className="text-steel">{latestEv.label || "unlabelled"}</span>
            {" · "}{new Date(latestEv.createdAt).toLocaleDateString()}
          </p>
        )}
        <div className="space-y-3">
          {([
            ["Effect size",       ev.effect,           "Strength of the measured effect"],
            ["Replication",       ev.replication,       "0 = none · 0.5 = one · 1 = multiple"],
            ["Hostile survival",  ev.hostileSurvival,   "Fraction of adversarial tests survived"],
            ["Confound control",  ev.confoundControl,   "0 = confounded · 1 = ruled out"],
            ["Generalization",    ev.generalization,    "Holds out-of-sample / cross-context"],
            ["Power",             ev.power,             "Data sufficiency / n / CI width"],
          ] as [string, number, string][]).map(([label, val, hint]) => (
            <div key={label}>
              <div className="flex justify-between text-xs">
                <span className="text-steel" title={hint}>{label}</span>
                <span className={`data font-semibold ${val >= 0.7 ? "text-go" : val >= 0.4 ? "text-unresolved" : "text-kill"}`}>
                  {val.toFixed(2)}
                </span>
              </div>
              <Bar value={val} />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate">
          <span>CI excludes null:</span>
          <span className={`font-semibold ${ev.ciExcludesNull ? "text-go" : "text-kill"}`}>
            {ev.ciExcludesNull ? "YES" : "NO"}
          </span>
        </div>

        {/* All evidence records count */}
        {evCount > 1 && (
          <p className="mt-3 text-xs text-slate">{evCount} total evidence records · showing latest</p>
        )}
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          §05  EVIDENCE DEBT
      ══════════════════════════════════════════════════════════════════ */}
      <Section n="05" title="Evidence Debt">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat
            label="Debt Percentage"
            value={`${debt?.pct ?? "—"}%`}
            tone={debt && debt.pct > 50 ? "kill" : debt && debt.pct <= 15 ? "go" : undefined}
          />
          <Stat label="Gap to GO" value={nav?.distanceToGo ? `${nav.distanceToGo}` : "Resolved"} />
          <Stat label="Navigable?" value={nav?.navigable ? "YES" : "NO"} cls={nav?.navigable ? "text-go" : "text-kill"} />
        </div>

        {debt && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-slate">
              <span>Evidence coverage</span>
              <span className="data">{100 - (debt.pct ?? 0)}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/8">
              <div className="h-full rounded-full bg-go" style={{ width: `${Math.max(0, 100 - debt.pct)}%` }} />
            </div>
          </div>
        )}

        {debtComponents.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="label mb-2">Largest Gaps</div>
            {debtComponents.slice(0, 3).map((c) => (
              <div key={c.label} className="flex items-center gap-3 text-xs">
                <span className="w-36 shrink-0 text-slate">{c.label}</span>
                <div className="flex-1 overflow-hidden rounded-full bg-white/8 h-1.5">
                  <div className="h-full rounded-full bg-kill" style={{ width: `${c.pct}%` }} />
                </div>
                <span className="data w-8 text-right text-kill">{c.pct}%</span>
              </div>
            ))}
          </div>
        )}

        {debt?.band && <p className="mt-3 text-xs text-slate">Band: <span className="text-steel">{debt.band}</span></p>}
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          §06  NAVIGATION PATH
      ══════════════════════════════════════════════════════════════════ */}
      <Section n="06" title="Navigation Path">
        <p className="text-sm text-steel">{nav?.explanation}</p>

        {nav?.highestLeverageLabel && (
          <div className="mt-3 rounded-inner border border-amber-dim/30 bg-amber/5 px-4 py-3">
            <span className="label mr-2 text-amber">Highest leverage</span>
            <span className="text-sm text-steel">{nav.highestLeverageLabel}</span>
          </div>
        )}

        {path && path.length > 0 && (
          <ol className="mt-4 space-y-3">
            {path.map((step: any, i: number) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber/15 text-[10px] font-bold text-amber">
                  {i + 1}
                </span>
                <div>
                  <span className="font-semibold text-ivory">{step.label}</span>
                  {step.maxGain != null && (
                    <span className="data ml-2 text-xs text-amber">+{step.maxGain.toFixed(2)}</span>
                  )}
                  <p className="mt-0.5 text-xs text-slate">{step.action}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          §07  DECISION EFFORT
      ══════════════════════════════════════════════════════════════════ */}
      <Section n="07" title="Decision Effort">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat
            label="Effort Level"
            value={eff?.level ?? "—"}
            cls={eff?.level === "LOW" ? "text-go" : eff?.level === "MEDIUM" ? "text-unresolved" : "text-kill"}
          />
          <Stat label="Study Cycles" value={eff?.studyCycles != null ? String(eff.studyCycles) : "—"} />
          <Stat label="Navigable?" value={nav?.navigable ? "YES" : "NO"} cls={nav?.navigable ? "text-go" : "text-kill"} />
        </div>

        {effortStars > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            <span className="text-xs text-slate">Effort intensity</span>
            <div className="flex gap-0.5">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`h-2 w-5 rounded-full ${s <= effortStars ? "bg-amber" : "bg-white/8"}`} />
              ))}
            </div>
          </div>
        )}

        {nav?.recommendedAction && (
          <div className="mt-3 rounded-inner border border-border-hair bg-obsidian/50 px-4 py-3">
            <span className="label mr-2">Recommended Action</span>
            <span className="text-sm text-steel">{nav.recommendedAction}</span>
          </div>
        )}

        {(nav?.unmetGoCriteria ?? []).length > 0 && (
          <div className="mt-3">
            <div className="label mb-1.5">Effort Blockers</div>
            <ul className="space-y-1">
              {nav!.unmetGoCriteria!.map((b: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs text-steel">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* ══════════════════════════════════════════════════════════════════
          §08  TIMELINE
      ══════════════════════════════════════════════════════════════════ */}
      {tline && (
        <Section n="08" title="Resolution Timeline">
          <div className="space-y-2">
            {tline.items.map((item: any) => (
              <div key={item.dimension} className="flex items-center justify-between gap-3">
                <span className="text-sm text-steel">{item.label}</span>
                <div className="flex items-center gap-3">
                  <div className="hidden w-24 overflow-hidden rounded-full bg-white/8 h-1.5 sm:block">
                    <div
                      className="h-full rounded-full bg-amber/60"
                      style={{ width: `${Math.min(100, (item.maxWeeks / (tline.totalMax || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="data w-20 text-right text-xs text-slate">
                    {item.minWeeks}–{item.maxWeeks} wks
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border-hair pt-3">
            <span className="font-semibold text-ivory">Total estimate</span>
            <span className="data text-lg font-bold text-amber">
              {tline.totalMin}–{tline.totalMax} weeks
            </span>
          </div>
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          §09  AUDIT TRAIL
      ══════════════════════════════════════════════════════════════════ */}
      {auditRows.length > 0 && (
        <Section n="09" title="Audit Trail">
          <div className="relative space-y-0">
            {auditRows.map((row, i) => (
              <div key={i} className="flex items-start gap-3 border-b border-border-hair py-3 last:border-0">
                <span className="mt-0.5 shrink-0 text-base text-amber">{row.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-steel">{row.label}</p>
                  {row.meta && <p className="data mt-0.5 text-xs text-slate">{row.meta}</p>}
                </div>
                <time className="data shrink-0 text-xs text-slate" dateTime={row.at}>
                  {new Date(row.at).toLocaleDateString()}
                </time>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          §10  APPENDIX — RAW DATA
      ══════════════════════════════════════════════════════════════════ */}
      <Section n="10" title="Appendix">
        <div className="space-y-4">
          {/* Raw evidence vector */}
          <div>
            <div className="label mb-2">Raw Evidence Vector</div>
            <div className="overflow-x-auto rounded-inner bg-obsidian px-4 py-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border-hair">
                    {["Field", "Value", "Type"].map((h) => (
                      <th key={h} className="pb-2 pr-4 text-left font-semibold text-slate">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-hair">
                  {Object.entries(ev).map(([k, v]) => (
                    <tr key={k}>
                      <td className="data py-1.5 pr-4 text-steel">{k}</td>
                      <td className={`data py-1.5 pr-4 font-semibold ${
                        typeof v === "number" ? (v >= 0.7 ? "text-go" : v >= 0.4 ? "text-unresolved" : "text-kill")
                          : v ? "text-go" : "text-kill"
                      }`}>
                        {typeof v === "number" ? v.toFixed(4) : String(v)}
                      </td>
                      <td className="py-1.5 text-slate">{typeof v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confidence breakdown */}
          {conf && (
            <div>
              <div className="label mb-2">Confidence Breakdown</div>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {(conf.contributors || []).length > 0 && (
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wide text-go">Contributors</div>
                    <ul className="space-y-0.5">
                      {conf.contributors.map((c: string, i: number) => (
                        <li key={i} className="text-xs text-steel">+ {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(conf.penalties || []).length > 0 && (
                  <div>
                    <div className="mb-1 text-[10px] uppercase tracking-wide text-kill">Penalties</div>
                    <ul className="space-y-0.5">
                      {conf.penalties.map((p: string, i: number) => (
                        <li key={i} className="text-xs text-steel">− {p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hypothesis metadata */}
          <div>
            <div className="label mb-2">Hypothesis Metadata</div>
            <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
              <Row label="ID" value={hypothesis.id} mono />
              <Row label="Created" value={new Date(hypothesis.createdAt).toLocaleString()} />
              <Row label="Updated" value={new Date(hypothesis.updatedAt).toLocaleString()} />
              <Row label="Requires Generalization" value={hypothesis.requiresGeneralization ? "YES" : "NO"} />
              {(hypothesis.assumptions || []).length > 0 && (
                <Row label="Assumptions" value={(hypothesis.assumptions as string[]).join("; ")} />
              )}
              {(hypothesis.confounds || []).length > 0 && (
                <Row label="Confounds" value={(hypothesis.confounds as string[]).join("; ")} />
              )}
            </dl>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="mt-6 border-t border-border-hair pt-5 text-center text-xs text-slate print:mt-12">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Mark size={14} variant="mono" />
          <span className="font-semibold text-ivory">SignalVertex</span>
          <span>·</span>
          <span>Decision Falsification Platform</span>
        </div>
        <p>Deterministic engine verdict · {reportDate} · {evCount} evidence record{evCount !== 1 ? "s" : ""}</p>
        <p className="mt-1 text-slate-dim">Verdicts are engine-computed and cannot be overridden by AI assistants.</p>
      </footer>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="card mb-4">
      <div className="mb-4 flex items-baseline gap-3 border-b border-border-hair pb-3">
        <span className="data text-xs font-bold text-amber">§{n}</span>
        <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-slate">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, cls, tone }: { label: string; value: string; cls?: string; tone?: "go" | "kill" }) {
  const colorCls = tone === "go" ? "text-go" : tone === "kill" ? "text-kill" : cls || "text-ivory";
  return (
    <div className="rounded-inner bg-white/3 px-3 py-3">
      <div className="text-[10px] uppercase tracking-wide text-slate">{label}</div>
      <div className={`data mt-1 text-xl font-bold ${colorCls}`}>{value}</div>
    </div>
  );
}

function CoverMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate">{label}</div>
      <div className="data mt-0.5 text-sm font-semibold text-ivory">{value}</div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-slate">{label}</dt>
      <dd className={`text-steel ${mono ? "data break-all" : ""}`}>{value}</dd>
    </div>
  );
}
