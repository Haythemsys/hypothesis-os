"use client";
import { useEffect, useState } from "react";
import {
  newHypothesis, commitRevision, finalVerdict, verdictFlipped, STORE_KEY,
  type HypothesisRecord, type Evidence,
} from "@/lib/core";
import { VerdictPill } from "@/components/Verdict";

const DEFAULT_E: Evidence = {
  effect: 0.5, replication: 0.5, hostileSurvival: 0.5, confoundControl: 0.5,
  generalization: 0.5, power: 0.5, ciExcludesNull: true, claimRequiresGeneralization: false,
};
const FIELDS: (keyof Evidence)[] = ["effect", "replication", "hostileSurvival", "confoundControl", "generalization", "power"];

export default function Memory() {
  const [records, setRecords] = useState<HypothesisRecord[]>([]);
  const [title, setTitle] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [evidence, setEvidence] = useState<Evidence>(DEFAULT_E);
  const [note, setNote] = useState("");
  const [experiment, setExperiment] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    try { const raw = localStorage.getItem(STORE_KEY); if (raw) setRecords(JSON.parse(raw)); } catch {}
  }, []);
  const persist = (next: HypothesisRecord[]) => {
    setRecords(next);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch {}
  };

  const addHypothesis = () => {
    if (!title.trim()) return;
    persist([newHypothesis(title), ...records]);
    setTitle("");
  };
  const commit = (rec: HypothesisRecord) => {
    const updated = commitRevision(rec, { evidence, experiment, result, note });
    persist(records.map((r) => (r.id === rec.id ? updated : r)));
    setNote(""); setExperiment(""); setResult("");
  };
  const remove = (id: string) => persist(records.filter((r) => r.id !== id));

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-xl font-bold">Research Memory</h1>
        <p className="mt-1 text-sm text-gray-400">
          Versioned, traceable hypotheses — like git for research. Every revision records the
          experiment, result, evidence, and the verdict it produced. Stored on this device.
        </p>
        <div className="mt-3 flex gap-2">
          <input className="input" value={title} placeholder="New hypothesis…"
            onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addHypothesis()} />
          <button className="btn shrink-0" onClick={addHypothesis}>Add</button>
        </div>
      </section>

      {records.length === 0 && <p className="px-1 text-sm text-gray-500">No hypotheses yet. Add one above.</p>}

      {records.map((rec) => {
        const fv = finalVerdict(rec);
        const open = openId === rec.id;
        return (
          <section key={rec.id} className="card">
            <button className="flex w-full items-start gap-2 text-left" onClick={() => setOpenId(open ? null : rec.id)}>
              {fv ? <VerdictPill verdict={fv.verdict} /> : <span className="pill bg-white/10 shrink-0">new</span>}
              <span className="font-semibold">{rec.title}</span>
              <span className="ml-auto shrink-0 text-xs text-gray-500">
                {rec.versions.length} rev{verdictFlipped(rec) ? " · flipped" : ""}
              </span>
            </button>

            {fv && <div className="mt-1 text-xs text-gray-500">latest: rev {fv.rev} · calibration {fv.calibration}/100 · {fv.band}</div>}

            {open && (
              <div className="mt-3 space-y-3 border-t border-line pt-3">
                {rec.versions.length > 0 && (
                  <ol className="space-y-2">
                    {rec.versions.map((v) => (
                      <li key={v.rev} className="rounded-xl bg-black/30 p-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-500">rev {v.rev}</span>
                          <VerdictPill verdict={v.verdict} />
                          <span className="ml-auto text-xs text-gray-500">{v.calibration}/100</span>
                        </div>
                        {v.experiment && <div className="mt-1 text-gray-300"><b>test:</b> {v.experiment}</div>}
                        {v.result && <div className="text-gray-300"><b>result:</b> {v.result}</div>}
                        {v.note && <div className="text-gray-400">{v.note}</div>}
                      </li>
                    ))}
                  </ol>
                )}

                <div className="space-y-2">
                  <div className="label">New revision</div>
                  <input className="input" placeholder="experiment run…" value={experiment} onChange={(e) => setExperiment(e.target.value)} />
                  <input className="input" placeholder="result observed…" value={result} onChange={(e) => setResult(e.target.value)} />
                  {FIELDS.map((k) => (
                    <label key={k} className="block text-xs text-gray-400">
                      {k} — {(evidence[k] as number).toFixed(2)}
                      <input type="range" min={0} max={1} step={0.01} className="h-6 w-full accent-white"
                        value={evidence[k] as number}
                        onChange={(e) => setEvidence((p) => ({ ...p, [k]: parseFloat(e.target.value) }))} />
                    </label>
                  ))}
                  <input className="input" placeholder="revision note…" value={note} onChange={(e) => setNote(e.target.value)} />
                  <div className="flex gap-2">
                    <button className="btn" onClick={() => commit(rec)}>Commit revision</button>
                    <button className="btn text-kill" onClick={() => remove(rec.id)}>Delete</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
