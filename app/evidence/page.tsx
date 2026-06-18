"use client";
import { useMemo, useState } from "react";
import { explain, calibrate, selfCritique, type Evidence } from "@/lib/core";
import { VerdictPill, Bar } from "@/components/Verdict";

const FIELDS: { key: keyof Evidence; label: string; hint: string }[] = [
  { key: "effect", label: "Effect size", hint: "strength of the measured effect" },
  { key: "replication", label: "Replication", hint: "0 none · .5 one · 1 multiple" },
  { key: "hostileSurvival", label: "Hostile survival", hint: "fraction of adversarial tests survived" },
  { key: "confoundControl", label: "Confound control", hint: "0 confounded · 1 ruled out" },
  { key: "generalization", label: "Generalization", hint: "holds out-of-sample / cross-context" },
  { key: "power", label: "Power", hint: "data sufficiency / n / CI width" },
];

export default function EvidenceEngine() {
  const [hypothesis, setHypothesis] = useState("");
  const [e, setE] = useState<Evidence>({
    effect: 0.5, replication: 0.5, hostileSurvival: 0.5, confoundControl: 0.5,
    generalization: 0.5, power: 0.5, ciExcludesNull: true, claimRequiresGeneralization: true,
  });
  const set = (k: keyof Evidence, v: number | boolean) => setE((p) => ({ ...p, [k]: v }));

  const ex = useMemo(() => explain(e, hypothesis), [e, hypothesis]);
  const cal = useMemo(() => calibrate(e), [e]);
  const crit = useMemo(() => selfCritique(e), [e]);
  const calCls = cal.band.startsWith("HIGH") ? "verdict-GO" : cal.band.startsWith("MEDIUM") ? "verdict-UNRESOLVED" : "verdict-KILL";

  return (
    <div className="space-y-4">
      <section className={`card border-2 verdict-${crit.finalVerdict}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Evidence Engine</h1>
          <VerdictPill verdict={crit.finalVerdict} />
        </div>
        {crit.downgrade && <p className="mt-2 rounded-lg bg-black/30 p-2 text-xs text-unresolved">{crit.downgrade}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-300">
          <span>support <b>{ex.support}</b></span>
          <span>confidence <b>{ex.confidence}</b></span>
          <span className={`pill ${calCls}`}>{cal.band} · {cal.score}/100</span>
        </div>
        <p className="mt-2 text-xs text-gray-400">{ex.confidenceExplanation}</p>
      </section>

      <section className="card">
        <label className="label">Hypothesis (optional — enables assumptions & confounds)</label>
        <textarea className="input mt-1 min-h-[60px]" value={hypothesis}
          placeholder="State the claim…" onChange={(ev) => setHypothesis(ev.target.value)} />
      </section>

      <section className="card space-y-4">
        <div className="label">Evidence</div>
        {FIELDS.map((f) => (
          <div key={f.key}>
            <Bar value={e[f.key] as number} label={`${f.label} — ${f.hint}`} />
            <input type="range" min={0} max={1} step={0.01} className="mt-1 h-6 w-full accent-white"
              value={e[f.key] as number} onChange={(ev) => set(f.key, parseFloat(ev.target.value))} />
          </div>
        ))}
        <div className="flex flex-col gap-2 pt-1">
          <Toggle on={e.ciExcludesNull} label="Interval excludes the null" onClick={() => set("ciExcludesNull", !e.ciExcludesNull)} />
          <Toggle on={e.claimRequiresGeneralization} label="Claim asserts it holds across contexts" onClick={() => set("claimRequiresGeneralization", !e.claimRequiresGeneralization)} />
        </div>
      </section>

      <Panel title="Why this verdict" tone="neutral">
        <Group label="Evidence FOR" items={ex.supporting} cls="text-go" />
        <Group label="Evidence AGAINST" items={ex.against} cls="text-kill" />
        <Group label="Missing evidence" items={ex.missing} cls="text-unresolved" />
      </Panel>

      <Panel title="Why alternatives were rejected" tone="neutral">
        <ul className="space-y-1 text-sm">
          {ex.rejectedAlternatives.map((a) => (
            <li key={a.verdict}><span className="font-semibold">not {a.verdict}:</span> <span className="text-gray-400">{a.why}</span></li>
          ))}
        </ul>
      </Panel>

      <Panel title={`Self-critique — ${crit.survived}/${crit.attacks.length} attacks survived`} tone="hostile">
        <ul className="space-y-2 text-sm">
          {crit.attacks.map((a, i) => (
            <li key={i} className="flex gap-2">
              <span className={`pill ${a.survives ? "verdict-GO" : "verdict-KILL"} shrink-0`}>{a.survives ? "held" : "LANDED"}</span>
              <span><span className="text-gray-300">[{a.target}] {a.attack}</span> <span className="text-gray-500">— {a.note}</span></span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title={`Calibration — ${cal.score}/100`} tone="neutral">
        <div className="space-y-2">
          <Bar value={cal.components.evidenceCompleteness} label="Evidence completeness" />
          <Bar value={cal.components.confoundCoverage} label="Confound coverage" />
          <Bar value={cal.components.contradictionCoverage} label="Contradiction coverage" />
          <Bar value={cal.components.benchmarkConfidence} label="Benchmark / statistical confidence" />
          <p className="pt-1 text-xs text-gray-400">{cal.recommendation}</p>
        </div>
      </Panel>

      {(ex.assumptions[0] && !ex.assumptions[0].startsWith("(")) && (
        <Panel title="Key assumptions & confounds" tone="neutral">
          <Group label="Assumptions" items={ex.assumptions} cls="text-gray-300" />
          <Group label="Confounds" items={ex.confounds} cls="text-gray-300" />
        </Panel>
      )}
    </div>
  );
}

function Toggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex min-h-11 items-center justify-between rounded-xl border border-line px-3 py-2 text-sm active:bg-white/5">
      <span>{label}</span>
      <span className={`pill ${on ? "verdict-GO" : "bg-white/10"}`}>{on ? "YES" : "NO"}</span>
    </button>
  );
}
function Panel({ title, children, tone }: { title: string; children: React.ReactNode; tone: "neutral" | "hostile" }) {
  return (
    <section className={`card ${tone === "hostile" ? "border-kill/30" : ""}`}>
      <div className="label mb-2">{title}</div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
function Group({ label, items, cls }: { label: string; items: string[]; cls: string }) {
  return (
    <div>
      <div className={`text-xs font-semibold ${cls}`}>{label}</div>
      <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-gray-300">
        {items.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    </div>
  );
}
