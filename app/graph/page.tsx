import { classify, BAPA_HYPOTHESES } from "@/lib/core";
import { VerdictPill } from "@/components/Verdict";
// @ts-ignore - JS module
import { EDGES as _EDGES, REL_STYLE as _REL_STYLE } from "@/lib/graph.mjs";

const EDGES = _EDGES as { from: string; to: string; rel: string; note: string }[];
const REL_STYLE = _REL_STYLE as Record<string, string>;

export default function Graph() {
  const byId = Object.fromEntries(BAPA_HYPOTHESES.map((h) => [h.id, h]));
  const verdict = (id: string) => classify(byId[id].evidence).verdict;
  const contradictions = EDGES.filter((e: any) => e.rel === "contradicted-by");

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-xl font-bold">Knowledge Graph</h1>
        <p className="mt-1 text-sm text-gray-400">
          How the hypotheses relate: dependencies, support, and contradictions extracted from the
          research record.
        </p>
      </section>

      <section className="card">
        <div className="label mb-2">Nodes</div>
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

      {contradictions.length > 0 && (
        <section className="card border-2 border-kill/40">
          <div className="label mb-2 text-kill">Contradictions</div>
          <ul className="space-y-2 text-sm">
            {contradictions.map((e: any, i: number) => (
              <li key={i}>
                <span className="font-mono text-xs">{e.from}</span> ✕{" "}
                <span className="font-mono text-xs">{e.to}</span>
                <div className="text-gray-400">{e.note}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card">
        <div className="label mb-2">Edges</div>
        <ul className="space-y-3 text-sm">
          {EDGES.map((e: any, i: number) => (
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
