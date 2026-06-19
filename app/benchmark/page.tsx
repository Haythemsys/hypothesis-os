import { classify, explain, BAPA_HYPOTHESES, MAJOR_IDS, DOMAINS, THRESHOLDS } from "@/lib/core";
import { VerdictPill } from "@/components/Verdict";
import map from "@/docs/KNOWLEDGE_MAP.json";

type File = { name: string; ext: string; bytes: number; category: string };
const FILES = map.files as File[];

// Tokens used to link a BAPA hypothesis to REAL indexed research files (no fabrication).
const RELATED: Record<string, string[]> = {
  identity_static: ["PHASE2", "POST_PHASE2", "PHASE_04"],
  cognitive_fingerprint: ["PHASE2", "PHASE_04"],
  model_fingerprint: ["PHASE_10", "AI_ADAPTATION", "FRONTIER"],
  portable_register: ["PERSON_VS_ROLE", "CORPUS_INTELLIGENCE"],
  context_dominance: ["CORPUS_INTELLIGENCE", "PERSON_VS_ROLE"],
  temporal_stability: ["TEMPORAL", "VALIDATION"],
  within_context_person: ["PERSON_VS_ROLE"],
  adaptation_layer: ["REFRAME", "FRONTIER", "NEXT"],
};
function relatedFiles(id: string): File[] {
  const toks = RELATED[id] || [];
  return FILES.filter((f) => toks.some((t) => f.name.toUpperCase().includes(t))).slice(0, 3);
}
const evSummary = (e: any) =>
  `eff ${e.effect} · rep ${e.replication} · hostile ${e.hostileSurvival} · confound ${e.confoundControl}` +
  (e.claimRequiresGeneralization ? ` · gen ${e.generalization}` : "");

export default function Benchmark() {
  const bapa = BAPA_HYPOTHESES.map((h) => {
    const r = classify(h.evidence);
    return { h, r, ex: explain(h.evidence, h.title), ok: r.verdict === h.expected, major: MAJOR_IDS.includes(h.id), files: relatedFiles(h.id) };
  });
  const bapaOk = bapa.filter((x) => x.ok).length;
  const majorOk = bapa.filter((x) => x.major && x.ok).length;
  const majorN = bapa.filter((x) => x.major).length;

  const domainStats = Object.entries(DOMAINS).map(([domain, list]) => {
    const rows = list.map((h) => ({ h, got: classify(h.evidence).verdict }));
    return { domain, rows, ok: rows.filter((x) => x.got === x.h.expected).length, n: list.length };
  });
  const domOk = domainStats.reduce((a, d) => a + d.ok, 0);
  const domN = domainStats.reduce((a, d) => a + d.n, 0);
  const allOk = bapaOk === bapa.length && domOk === domN;

  return (
    <div className="space-y-4">
      <section className={`card border-2 ${allOk ? "verdict-GO" : "verdict-KILL"}`}>
        <h1 className="text-xl font-bold">Benchmarks</h1>
        <p className="mt-1 text-sm text-gray-400">
          Each hypothesis is encoded as <b>evidence only</b>; the engine never sees the answer,
          then its verdict is scored against the established outcome.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat n={`${bapaOk}/${bapa.length}`} label="BAPA" />
          <Stat n={`${majorOk}/${majorN}`} label="major" />
          <Stat n={`${domOk}/${domN}`} label="multi-domain" />
        </div>
        <div className="mt-3 text-center text-sm font-bold">{allOk ? "✓ ALL BENCHMARKS PASS" : "✗ some failed"}</div>
      </section>

      <section className="card">
        <div className="label mb-1">Why this benchmark matters</div>
        <p className="text-sm text-gray-400">
          BAPA is a real, completed research program with <b>known</b> outcomes — identity-in-text
          failed, context dominance and within-context temporal stability survived. If the engine
          can reproduce those verdicts from evidence alone, it earns trust on claims whose answers
          we don&apos;t yet know. The multi-domain set extends that test to science, psychology,
          business, marketing, and AI.
        </p>
      </section>

      <section className="space-y-3">
        <div className="label">BAPA (founding benchmark)</div>
        {bapa.map(({ h, r, ex, ok, major, files }) => (
          <div key={h.id} className={`card ${ok ? "" : "border-kill"}`}>
            <div className="flex items-start gap-2">
              {major && <span className="pill bg-white/10 shrink-0">major</span>}
              <span className="min-w-0 font-semibold leading-snug">{h.title}</span>
              <span className={`pill ${ok ? "verdict-GO" : "verdict-KILL"} ml-auto shrink-0`}>{ok ? "PASS" : "FAIL"}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-gray-500">expected</span><VerdictPill verdict={h.expected} />
              <span className="text-gray-500">engine</span><VerdictPill verdict={r.verdict} />
              <span className="ml-auto text-xs text-gray-500">{h.phase}</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">evidence used: {evSummary(h.evidence)}</div>
            <div className="mt-1 text-sm text-gray-400"><b>why {ok ? "pass" : "fail"}:</b> {r.reasons[0]}</div>
            {files.length > 0 && (
              <div className="mt-2 border-t border-line pt-2">
                <div className="label mb-1">related indexed research</div>
                <ul className="space-y-0.5 text-xs text-gray-500">
                  {files.map((f) => <li key={f.name} className="break-all">{f.name}</li>)}
                </ul>
              </div>
            )}
          </div>
        ))}
      </section>

      {domainStats.map((d) => (
        <section key={d.domain} className="card">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-semibold">{d.domain}</div>
            <span className={`pill ${d.ok === d.n ? "verdict-GO" : "verdict-KILL"}`}>{d.ok}/{d.n}</span>
          </div>
          <ul className="space-y-2 text-sm">
            {d.rows.map(({ h, got }) => (
              <li key={h.id} className="flex items-start gap-2">
                <VerdictPill verdict={got} />
                <span className="min-w-0 text-gray-300">{h.title}</span>
                {got !== h.expected && <span className="ml-auto shrink-0 text-xs text-kill">exp {h.expected}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="card">
        <div className="label mb-2">Pre-registered thresholds</div>
        <ul className="grid grid-cols-2 gap-1 font-mono text-xs text-gray-400">
          {Object.entries(THRESHOLDS).map(([k, v]) => <li key={k}>{k} = {String(v)}</li>)}
        </ul>
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return <div className="rounded-xl bg-black/30 p-3 text-center"><div className="text-xl font-black">{n}</div><div className="label">{label}</div></div>;
}
