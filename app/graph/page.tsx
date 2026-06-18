import { classify, BAPA_HYPOTHESES, ALL_BENCHMARKS, detectContradictions } from "@/lib/core";
import { VerdictPill } from "@/components/Verdict";
// @ts-ignore - JS module
import { EDGES as _EDGES, REL_STYLE as _REL_STYLE } from "@/lib/graph.mjs";

const EDGES = _EDGES as { from: string; to: string; rel: string; note: string }[];
const REL_STYLE = _REL_STYLE as Record<string, string>;

export default function Graph() {
  const byId = Object.fromEntries(BAPA_HYPOTHESES.map((h) => [h.id, h]));
  const verdict = (id: string) => classify(byId[id].evidence).verdict;

  // Phase D — auto-detected contradictions across BAPA + multi-domain hypotheses.
  const contradictions = detectContradictions([...BAPA_HYPOTHESES, ...ALL_BENCHMARKS]);
  const hard = contradictions.filter((c) => c.severity === "hard");
  const soft = contradictions.filter((c) => c.severity === "soft");

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-xl font-bold">Knowledge Graph</h1>
        <p className="mt-1 text-sm text-gray-400">
          Dependencies, support, and contradictions — the contradictions are detected automatically
          from each hypothesis&apos;s implications.
        </p>
      </section>

      <section className="card border-2 border-kill/40">
        <div className="mb-2 flex items-center justify-between">
          <div className="label text-kill">Contradiction Engine</div>
          <span className="label">{hard.length} hard · {soft.length} soft</span>
        </div>
        {hard.length === 0 && <p className="text-sm text-gray-500">No hard (both-confirmed) contradictions.</p>}
        <ul className="space-y-3 text-sm">
          {[...hard, ...soft].map((c, i) => (
            <li key={i} className="rounded-xl bg-black/30 p-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`pill ${c.severity === "hard" ? "verdict-KILL" : "verdict-UNRESOLVED"}`}>{c.severity}</span>
                <span className="font-mono text-xs text-gray-400">{c.a}</span>
                <span className="text-gray-500">↔</span>
                <span className="font-mono text-xs text-gray-400">{c.b}</span>
                <span className="ml-auto font-mono text-[10px] text-gray-500">{c.variable}</span>
              </div>
              <div className="mt-1 text-xs text-gray-400">{c.aClaim} · {c.bClaim}</div>
              <div className="mt-1 text-gray-300">{c.resolution}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <div className="label mb-2">Nodes (BAPA)</div>
        <ul className="space-y-2">
          {BAPA_HYPOTHESES.map((h) => (
            <li key={h.id} className="flex items-center gap-2 text-sm">
              <VerdictPill verdict={verdict(h.id)} />
              <span className="font-mono text-xs text-gray-500">{h.id}</span>
              <span className="truncate text-gray-300">{h.title}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <div className="label mb-2">Edges (dependencies & support)</div>
        <ul className="space-y-3 text-sm">
          {EDGES.map((e, i) => (
            <li key={i}>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-xs text-gray-400">{e.from}</span>
                <span className={`pill bg-white/5 ${REL_STYLE[e.rel] || ""}`}>{e.rel}</span>
                <span className="font-mono text-xs text-gray-400">{e.to}</span>
              </div>
              <div className="mt-0.5 text-gray-400">{e.note}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
