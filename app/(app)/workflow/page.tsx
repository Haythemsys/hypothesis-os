"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api, getProviderConfig } from "@/lib/client";
import { VerdictPill, Bar } from "@/components/Verdict";
import { NavigationPanel } from "@/components/NavigationPanel";
import { ExecutiveSummaryCard, GoBlockersPanel, PathToGoPanel } from "@/components/DecisionIntelligence";
import { Slider } from "@/components/ui/Slider";
import type { Evidence } from "@/lib/core";

type Step = 1 | 2 | 3 | 4 | 5;
const FIELDS: { k: keyof Evidence; label: string }[] = [
  { k: "effect", label: "Effect size" }, { k: "replication", label: "Replication" },
  { k: "hostileSurvival", label: "Hostile survival" }, { k: "confoundControl", label: "Confound control" },
  { k: "generalization", label: "Generalization" }, { k: "power", label: "Power" },
];
const DRAFT_KEY = "hypothesisos.workflow.draft.v1";
const DEFAULT_EV: Evidence = {
  effect: 0.5, replication: 0.5, hostileSurvival: 0.5, confoundControl: 0.5,
  generalization: 0.5, power: 0.5, ciExcludesNull: true, claimRequiresGeneralization: true,
};

export default function Workflow() {
  const [project, setProject] = useState("My research");
  const [title, setTitle] = useState("");
  const [hyp, setHyp] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [ev, setEv] = useState<Evidence>(DEFAULT_EV);
  const [result, setResult] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const step: Step = report ? 5 : result ? 4 : plan ? 3 : hyp ? 2 : 1;

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.hyp) { setHyp(d.hyp); setTitle(d.title || ""); setProject(d.project || "My research"); }
      if (d.plan) setPlan(d.plan);
      if (d.ev) setEv(d.ev);
      if (d.result) setResult(d.result);
      if (d.report) setReport(d.report);
    } catch {}
  }, []);

  // Persist draft on every state change
  useEffect(() => {
    if (!hyp) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, project, hyp, plan, ev, result, report }));
    } catch {}
  }, [title, project, hyp, plan, ev, result, report]);

  // Editing project or title after hypothesis was created resets step 1
  // so the form re-activates and "Create & decompose" becomes available again.
  const changeProject = (v: string) => {
    setProject(v);
    if (hyp) { setHyp(null); setPlan(null); setResult(null); setReport(null); }
  };
  const changeTitle = (v: string) => {
    setTitle(v);
    if (hyp) { setHyp(null); setPlan(null); setResult(null); setReport(null); }
  };

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setErr("");
    try { await fn(); } catch (e: any) { setErr(e.message || String(e)); } finally { setBusy(false); }
  };

  const create = () => run(async () => {
    const r = await api("/api/hypotheses", { method: "POST", body: { title, projectId: project } });
    setHyp(r.hypothesis); setEv((p) => ({ ...p, claimRequiresGeneralization: r.hypothesis.requiresGeneralization }));
  });
  const design = () => run(async () => {
    const r = await api("/api/experiments/design", { method: "POST", body: { title: hyp.title, hypothesisId: hyp.id } });
    setPlan(r);
  });
  const addAndClassify = () => run(async () => {
    await api(`/api/hypotheses/${hyp.id}/evidence`, { method: "POST", body: { label: "workflow evidence", evidence: ev } });
    const r = await api(`/api/hypotheses/${hyp.id}/classify`, { method: "POST" });
    setResult(r);
  });
  const genReport = () => run(async () => {
    const provider = getProviderConfig() || undefined;
    const r = await api("/api/reports/generate", { method: "POST", body: { hypothesisId: hyp.id, provider } });
    setReport(r.report);
  });
  const reset = () => {
    setHyp(null); setPlan(null); setResult(null); setReport(null); setTitle(""); setEv(DEFAULT_EV);
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
  };

  return (
    <div className="space-y-4">
      <section className="card">
        <div className="flex items-center justify-between">
          <div>
            <div className="label">Workflow</div>
            <h1 className="text-2xl font-bold tracking-tight">Decision pipeline</h1>
          </div>
          <span className="data text-sm text-slate">step {step}/5</span>
        </div>
        <p className="mt-1 text-sm text-steel">Hypothesis → decompose → evidence → engine verdict → report. End to end.</p>
        <div className="mt-3 flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? "bg-amber" : "bg-white/10"}`} />)}
        </div>
      </section>

      {err && <p className="card border-kill text-sm text-kill">{err}</p>}

      {/* Step 1 */}
      <section className="card space-y-2">
        <div className="label">1 · Project & hypothesis</div>
        <input className="input" value={project} onChange={(e) => changeProject(e.target.value)} placeholder="project name" />
        <textarea className="input min-h-[72px]" value={title}
          placeholder="State your hypothesis…" onChange={(e) => changeTitle(e.target.value)} />
        {!hyp ? (
          <button className="btn-primary" onClick={create} disabled={busy || !title.trim()}>{busy ? "…" : "Create & decompose"}</button>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {hyp.kinds.map((k: string) => <span key={k} className="pill bg-white/10">{k}</span>)}
              <span className={`pill ${hyp.requiresGeneralization ? "verdict-UNRESOLVED" : "bg-white/10"}`}>
                {hyp.requiresGeneralization ? "needs generalization" : "scoped"}
              </span>
            </div>
            <Detail label="Assumptions" items={hyp.assumptions} />
            <Detail label="Confounds" items={hyp.confounds} />
          </div>
        )}
      </section>

      {/* Step 2 */}
      {hyp && (
        <section className="card space-y-2">
          <div className="label">2 · Experiments</div>
          {!plan ? <button className="btn-primary" onClick={design} disabled={busy}>Design tests</button> :
            plan.tiers.map((t: any) => (
              <div key={t.tier} className="rounded-xl bg-obsidian p-2 text-sm">
                <div className="font-semibold">{t.tier} <span className="font-normal text-slate">· {t.cost}</span></div>
                <ul className="mt-1 list-disc pl-5 text-steel">{t.steps.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
              </div>
            ))}
        </section>
      )}

      {/* Step 3 */}
      {plan && (
        <section className="card space-y-2">
          <div className="label">3 · Enter evidence</div>
          {FIELDS.map((f) => (
            <Slider key={f.k} label={f.label}
              value={ev[f.k] as number} onChange={(val) => setEv((p) => ({ ...p, [f.k]: val }))} />
          ))}
          <label className="flex min-h-11 items-center justify-between rounded-btn border border-border-hair px-3 py-2 text-sm">
            Interval excludes the null
            <button onClick={() => setEv((p) => ({ ...p, ciExcludesNull: !p.ciExcludesNull }))}
              className={`pill ${ev.ciExcludesNull ? "verdict-GO" : "bg-white/10 text-slate"}`}>{ev.ciExcludesNull ? "YES" : "NO"}</button>
          </label>
          <button className="btn-primary w-full sm:w-auto" onClick={addAndClassify} disabled={busy}>{busy ? "…" : "Record evidence & classify"}</button>
        </section>
      )}

      {/* Step 4 */}
      {result && (
        <>
          {result.navigation && (
            <ExecutiveSummaryCard
              summary={{
                verdict: result.verdict.finalVerdict,
                reason: (result.navigation.unmetGoCriteria?.length
                  ? `${(result.navigation.unmetGoCriteria as string[]).slice(0,2).join(" and ")} remain${result.navigation.unmetGoCriteria.length === 1 ? "s" : ""} below acceptance thresholds.`
                  : result.verdict.finalVerdict === "GO" ? "All evidence criteria are satisfied." : "Evidence is positive but criteria status indeterminate."),
                fastestRoute: result.navigation.navigable ? (result.navigation.highestLeverageLabel ?? null) : null,
                effort: result.navigation.navigable
                  ? (result.navigation.distanceToGo === "1 evidence move" ? "LOW" : result.navigation.distanceToGo === "3+ evidence moves" ? "HIGH" : "MEDIUM")
                  : "HIGH",
                studyCycles: null,
                debtPct: null,
                debtBand: null,
              }}
              verdict={result.verdict.finalVerdict}
            />
          )}
          <section className={`card border-2 verdict-${result.verdict.finalVerdict} space-y-2`}>
            <div className="label">4 · Engine verdict <span className="text-slate">· judge: {result.judge}</span></div>
            <div className="flex flex-wrap items-center gap-2">
              <VerdictPill verdict={result.verdict.finalVerdict} />
              <span className="text-sm text-steel">support {result.verdict.support} · {result.verdict.band} {result.verdict.calibration}/100</span>
            </div>
            {result.critique.downgrade && <p className="text-xs text-unresolved">{result.critique.downgrade}</p>}
            <Detail label="Evidence for"     items={result.explanation.supporting} />
            <Detail label="Evidence against" items={result.explanation.against} />
            <Detail label="Missing"          items={result.explanation.missing} />
            <button className="btn w-full sm:w-auto" onClick={genReport} disabled={busy}>{busy ? "…" : "Generate report"}</button>
          </section>
          {result.navigation && result.verdict.finalVerdict === "UNRESOLVED" && (
            <GoBlockersPanel nav={result.navigation} />
          )}
          {result.navigation && result.verdict.finalVerdict !== "GO" && (
            <NavigationPanel nav={result.navigation} />
          )}
          {result.navigation && result.navigation.navigable && (
            <PathToGoPanel steps={
              (result.navigation.dimensionGains ?? [])
                .filter((g: any) => g.maxGain > 0.005)
                .slice(0, 3)
                .map((g: any) => ({ dimension: g.dimension, label: g.label, action: `Increase ${g.label.toLowerCase()}.`, maxGain: g.maxGain }))
            } />
          )}
        </>
      )}

      {/* Step 5 */}
      {report && (
        <section className="card space-y-2">
          <div className="label">5 · Report {report.aiAssisted ? "· AI-assisted summary included" : "· deterministic"}</div>
          <pre className="table-scroll whitespace-pre-wrap rounded-xl bg-black/40 p-3 text-xs text-steel">{report.markdown}</pre>
          <div className="flex gap-2">
            <button className="btn flex-1" onClick={reset}>Start another</button>
            {hyp && (
              <Link href={`/audit/${hyp.id}`} className="btn flex-1 text-center bg-white/5 text-sm">
                View audit trail
              </Link>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function Detail({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold text-steel">{label}</div>
      <ul className="mt-0.5 list-disc space-y-0.5 pl-5 text-sm text-steel">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  );
}
