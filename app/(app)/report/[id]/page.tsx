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
  evidence: { evidence: Evidence; label: string; createdAt: string }[];
  verdicts: any[];
};

const RISK_CLS: Record<string, string> = { LOW: "text-go", MEDIUM: "text-unresolved", HIGH: "text-kill", CRITICAL: "text-kill" };
const INV_CLS: Record<string, string>  = { YES: "text-go", NO: "text-kill", "NOT YET": "text-unresolved" };
const COST_CLS: Record<string, string> = { LOW: "text-go", MEDIUM: "text-unresolved", HIGH: "text-kill" };

export default function ExecutiveBrief({ params }: { params: Promise<{ id: string }> }) {
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

  if (loading) return <p className="card text-sm text-steel">Generating brief…</p>;
  if (err)     return <p className="card text-sm text-kill">{err}</p>;
  if (!data || !ev) return <p className="card text-sm text-steel">No evidence recorded for this hypothesis yet.</p>;

  const { hypothesis } = data;
  const verdict = crit?.finalVerdict ?? "UNRESOLVED";
  const evCount = data.evidence.length;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Controls — hidden in print */}
      <div className="flex items-center justify-between print:hidden">
        <div className="label">Executive Brief</div>
        <button onClick={() => window.print()} className="btn-ghost text-sm">Print / Save PDF</button>
      </div>

      {/* Letterhead */}
      <header className="flex items-start justify-between gap-4 border-b border-border-soft pb-4">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <Mark size={20} />
            <span className="text-sm font-bold tracking-tight text-ivory">Hypothesis<span className="text-amber">OS</span></span>
            <span className="label">· Decision Brief</span>
          </div>
          <h1 className="text-xl font-bold leading-snug text-ivory">{hypothesis.title}</h1>
          <p className="mt-1 text-xs text-slate">
            Generated {new Date().toLocaleDateString()} · {evCount} evidence record{evCount !== 1 ? "s" : ""}
            {(hypothesis.kinds || []).length ? ` · ${(hypothesis.kinds || []).join(", ")}` : ""}
          </p>
        </div>
        <VerdictPill verdict={verdict} size="md" />
      </header>

      {/* §1 Summary */}
      <Section n="01" title="Summary">
        <p className="text-sm leading-relaxed text-steel">{exec_?.reason}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Support" value={nav?.currentSupport.toFixed(2) ?? "—"} />
          <Stat label="Calibration" value={`${cal?.score}/100`} />
          <Stat label="Evidence Debt" value={`${debt?.pct}%`} />
          <Stat label="Confidence" value={cal?.band ?? "—"} />
        </div>
      </Section>

      {/* §2 Verdict */}
      <Section n="02" title="Verdict">
        <div className="flex flex-wrap items-center gap-3">
          <VerdictPill verdict={verdict} size="md" />
          <span className="text-sm text-steel">
            support <span className="data text-ivory">{nav?.currentSupport.toFixed(2)}</span> vs threshold{" "}
            <span className="data">{nav?.goThreshold}</span>
          </span>
        </div>
        {crit?.downgrade && <p className="mt-2 text-xs text-unresolved">Self-critique downgrade: {crit.downgrade}</p>}
        {(nav?.unmetGoCriteriaDetail?.length ?? 0) > 0 && (
          <ul className="mt-3 space-y-1 text-sm">
            {nav!.unmetGoCriteriaDetail!.map((c, i) => (
              <li key={i} className="flex justify-between gap-2 text-steel">
                <span>{c.criterion}</span>
                <span className="data text-slate">{String(c.current)} → need {String(c.required)}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* §3 Risk */}
      <Section n="03" title="Risk">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Decision Risk" value={risk?.level ?? "—"} cls={RISK_CLS[risk?.level ?? ""]} />
          <Stat label="Invest More?" value={inv?.verdict ?? "—"} cls={INV_CLS[inv?.verdict ?? ""]} />
          <Stat label="Cost to Resolve" value={cost?.level ?? "—"} cls={COST_CLS[cost?.level ?? ""]} />
        </div>
        {risk && <p className="mt-3 text-sm text-steel">{risk.reason}</p>}
        {inv && <p className="mt-1 text-sm text-steel">{inv.reason}</p>}
      </Section>

      {/* §4 Evidence */}
      <Section n="04" title="Evidence">
        <div className="space-y-2">
          {([
            ["Effect size", ev.effect], ["Replication", ev.replication],
            ["Hostile survival", ev.hostileSurvival], ["Confound control", ev.confoundControl],
            ["Generalization", ev.generalization], ["Power", ev.power],
          ] as [string, number][]).map(([label, val]) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-steel">
                <span>{label}</span><span className="data">{val.toFixed(2)}</span>
              </div>
              <Bar value={val} />
            </div>
          ))}
          <p className="pt-1 text-xs text-slate">
            CI excludes null: <span className={ev.ciExcludesNull ? "text-go" : "text-kill"}>{ev.ciExcludesNull ? "YES" : "NO"}</span>
          </p>
        </div>
      </Section>

      {/* §5 Navigation */}
      <Section n="05" title="Navigation">
        <p className="text-sm text-steel">{nav?.explanation}</p>
        {nav?.navigable && nav.distanceToGo && (
          <p className="mt-2 text-sm">
            <span className="label">Distance to GO</span>{" "}
            <span className="data text-ivory">{nav.distanceToGo}</span>
          </p>
        )}
      </Section>

      {/* §6 Next Actions */}
      {path && path.length > 0 && (
        <Section n="06" title="Next Actions">
          <ol className="space-y-2.5">
            {path.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber/15 text-xs font-bold text-amber">{i + 1}</span>
                <div>
                  <span className="font-semibold text-ivory">{step.label}</span>
                  {step.maxGain != null && <span className="data ml-2 text-xs text-amber">+{step.maxGain.toFixed(2)}</span>}
                  <p className="mt-0.5 text-xs text-steel">{step.action}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* §7 Timeline */}
      {tline && (
        <Section n="07" title="Timeline">
          <div className="space-y-1.5">
            {tline.items.map((item) => (
              <div key={item.dimension} className="flex justify-between text-sm">
                <span className="text-steel">{item.label}</span>
                <span className="data text-slate">{item.minWeeks}–{item.maxWeeks} wks</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border-hair pt-2 text-sm font-semibold">
              <span className="text-ivory">Overall estimate</span>
              <span className="data text-ivory">{tline.totalMin}–{tline.totalMax} weeks</span>
            </div>
          </div>
        </Section>
      )}

      <footer className="border-t border-border-hair pt-4 text-center text-xs text-slate">
        HypothesisOS · Decision Falsification Platform · Deterministic verdict · {new Date().toLocaleDateString()}
      </footer>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="card">
      <div className="mb-3 flex items-baseline gap-2">
        <span className="data text-xs text-amber">{n}</span>
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Stat({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate">{label}</div>
      <div className={`data text-lg font-semibold ${cls || "text-ivory"}`}>{value}</div>
    </div>
  );
}
