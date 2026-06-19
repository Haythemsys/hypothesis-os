"use client";
import { useState } from "react";
import CASES from "@/data/outcome-study/cases.json";
import RESULTS from "@/data/outcome-study/results.json";

type Result = typeof RESULTS[number];
type Case   = typeof CASES[number];

const VERDICT_CLASS: Record<string, string> = {
  GO: "verdict-GO", KILL: "verdict-KILL", UNRESOLVED: "verdict-UNRESOLVED",
};

function scoreLabel(got: string, expected: string) {
  if (got === expected) return { text: "✓ CORRECT", cls: "text-go" };
  if (got === "GO" && expected === "KILL")        return { text: "⚠ FALSE GO", cls: "text-kill font-bold" };
  if (got === "KILL" && expected === "GO")        return { text: "✗ FALSE KILL", cls: "text-kill" };
  if (got === "KILL" && expected === "UNRESOLVED") return { text: "✗ OVER-KILLED", cls: "text-unresolved" };
  if (got === "GO"   && expected === "UNRESOLVED") return { text: "⚠ OVER-GO", cls: "text-unresolved" };
  return { text: "- MISSED", cls: "text-gray-400" };
}

function count(r: Result[], key: "hypothesisos" | "baseline", type: string) {
  return r.filter(x => {
    const got = x[key].verdict, exp = x.expected;
    if (type === "correct") return got === exp;
    if (type === "falseGo") return got === "GO" && exp === "KILL";
    if (type === "overKill") return got === "KILL" && exp === "UNRESOLVED";
    if (type === "missed") return got === "UNRESOLVED" && exp !== "UNRESOLVED";
    return false;
  }).length;
}

export default function OutcomeStudy() {
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [showAll, setShowAll] = useState(false);

  const toggle = (id: string) => setReveal(p => ({ ...p, [id]: !p[id] }));

  const total = RESULTS.length;
  const hosAcc = count(RESULTS, "hypothesisos", "correct");
  const blAcc  = count(RESULTS, "baseline", "correct");

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="card">
        <h1 className="text-xl font-bold">Outcome Study V1</h1>
        <p className="mt-1 text-sm text-gray-400">
          20 historical hypotheses with known outcomes. Both evaluators receive identical
          evidence packets. Expected verdicts are hidden until revealed.
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Evaluator A: HypothesisOS deterministic engine (kill gates + calibration + self-critique).
          Evaluator B: Naive-average baseline (unweighted mean, no kill gates, no conjunction requirements).
        </p>
      </section>

      {/* Summary stats */}
      <section className="card grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Overall accuracy" hos={`${hosAcc}/${total}`} bl={`${blAcc}/${total}`} />
        <Stat label="False GO rate" hos={`${count(RESULTS, "hypothesisos", "falseGo")}/11`} bl={`${count(RESULTS, "baseline", "falseGo")}/11`} highlight />
        <Stat label="Over-kill (UNRESOLVED→KILL)" hos={`${count(RESULTS, "hypothesisos", "overKill")}/5`} bl={`${count(RESULTS, "baseline", "overKill")}/5`} />
        <Stat label="Missed (UNRESOLVED when wrong)" hos={`${count(RESULTS, "hypothesisos", "missed")}/15`} bl={`${count(RESULTS, "baseline", "missed")}/15`} />
      </section>

      {/* Controls */}
      <div className="flex gap-2">
        <button className="btn" onClick={() => setShowAll(p => !p)}>
          {showAll ? "Collapse all" : "Expand all"}
        </button>
        <button className="btn bg-white/10" onClick={() => setReveal(Object.fromEntries(RESULTS.map(r => [r.id, true])))}>
          Reveal all outcomes
        </button>
        <button className="btn bg-white/10" onClick={() => setReveal({})}>
          Hide all outcomes
        </button>
      </div>

      {/* Case cards */}
      {RESULTS.map((r, i) => {
        const c = CASES[i] as Case;
        const hosScore = scoreLabel(r.hypothesisos.verdict, r.expected);
        const blScore  = scoreLabel(r.baseline.verdict, r.expected);
        const isOpen   = showAll || reveal[r.id];

        return (
          <section key={r.id} className="card space-y-2">
            {/* Card header */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="label">{r.domain}</span>
                <p className="mt-0.5 text-sm font-semibold leading-snug">{r.hypothesis}</p>
                <p className="text-xs text-gray-500">Decision date: {r.decision_date}</p>
              </div>
              <button className="btn shrink-0 text-xs" onClick={() => toggle(r.id)}>
                {reveal[r.id] ? "Hide outcome" : "Reveal outcome"}
              </button>
            </div>

            {/* Verdicts */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-black/30 p-2">
                <div className="label mb-1">HypothesisOS</div>
                <span className={`pill ${VERDICT_CLASS[r.hypothesisos.verdict]}`}>{r.hypothesisos.verdict}</span>
                <span className={`ml-2 text-xs ${hosScore.cls}`}>{hosScore.text}</span>
                <p className="mt-1 text-xs text-gray-500">
                  support {r.hypothesisos.support} · cal {r.hypothesisos.calibration}/100 · {r.hypothesisos.band.replace(" CONFIDENCE","")}
                </p>
                {r.hypothesisos.downgrade && (
                  <p className="mt-0.5 text-xs text-unresolved">{r.hypothesisos.downgrade}</p>
                )}
              </div>
              <div className="rounded-xl bg-black/30 p-2">
                <div className="label mb-1">Baseline (naive average)</div>
                <span className={`pill ${VERDICT_CLASS[r.baseline.verdict]}`}>{r.baseline.verdict}</span>
                <span className={`ml-2 text-xs ${blScore.cls}`}>{blScore.text}</span>
                <p className="mt-1 text-xs text-gray-500">{r.baseline.reasoning}</p>
              </div>
            </div>

            {/* Expandable detail */}
            {isOpen && (
              <div className="space-y-2 border-t border-line pt-2 text-sm">
                <div>
                  <div className="label">Evidence available at decision date</div>
                  <p className="text-xs text-gray-300">{c.evidence_available}</p>
                </div>
                <div className="rounded-xl border border-go/30 bg-go/5 p-2">
                  <div className="label text-go">Known outcome</div>
                  <p className="text-xs text-gray-300">{c.known_outcome}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="label">Expected verdict:</span>
                    <span className={`pill ${VERDICT_CLASS[r.expected]}`}>{r.expected}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{c.ground_truth_notes}</p>
                </div>
                {r.hypothesisos.reasons.length > 0 && (
                  <div>
                    <div className="label">Engine reasons</div>
                    <ul className="list-disc pl-4 text-xs text-gray-400">
                      {r.hypothesisos.reasons.map((x: string, j: number) => <li key={j}>{x}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Stat({ label, hos, bl, highlight }: { label: string; hos: string; bl: string; highlight?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-sm font-bold ${highlight ? "text-go" : ""}`}>HOS: {hos}</div>
      <div className="text-sm text-gray-400">BL: {bl}</div>
    </div>
  );
}
