"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  classify, BAPA_HYPOTHESES, ALL_BENCHMARKS, detectContradictions,
  selfCritique, navigate, type Evidence,
} from "@/lib/core";
import { api } from "@/lib/client";
// @ts-ignore
import { EDGES as _EDGES, REL_STYLE as _REL_STYLE } from "@/lib/graph.mjs";

const EDGES = _EDGES as { from: string; to: string; rel: string; note: string }[];
const REL_STYLE = _REL_STYLE as Record<string, string>;

type HypSummary = { id: string; title: string; createdAt: string };
type EvidenceRecord = { id: string; evidence: Evidence };
type HypFull = { hypothesis: HypSummary; evidence: EvidenceRecord[]; verdicts: any[] };

const VERDICT_CLS: Record<string, string> = {
  GO: "text-go", KILL: "text-kill", UNRESOLVED: "text-unresolved",
};
const VERDICT_BG: Record<string, string> = {
  GO: "bg-go/15 border-go/20", KILL: "bg-kill/15 border-kill/20", UNRESOLVED: "bg-amber/15 border-amber/20",
};

type UserNode = { id: string; title: string; verdict: string; support: number; navigable: boolean; createdAt: string };

export default function Graph() {
  const byId = Object.fromEntries(BAPA_HYPOTHESES.map((h) => [h.id, h]));
  const verdict = (id: string) => classify(byId[id].evidence).verdict;

  const contradictions = detectContradictions([...BAPA_HYPOTHESES, ...ALL_BENCHMARKS]);
  const hard = contradictions.filter((c) => c.severity === "hard");
  const soft = contradictions.filter((c) => c.severity === "soft");

  const [userNodes, setUserNodes] = useState<UserNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<"decisions" | "contradictions" | "dependencies">("decisions");

  useEffect(() => {
    api<{ hypotheses: HypSummary[] }>("/api/hypotheses")
      .then(async (r) => {
        const nodes: UserNode[] = [];
        for (const h of (r.hypotheses || []).slice(0, 30)) {
          try {
            const detail = await api<HypFull>(`/api/hypotheses/${h.id}`);
            const ev = detail.evidence?.[detail.evidence.length - 1]?.evidence;
            if (!ev) { nodes.push({ id: h.id, title: h.title, verdict: "UNRESOLVED", support: 0, navigable: false, createdAt: h.createdAt }); continue; }
            const crit = selfCritique(ev);
            const nav = navigate(ev, crit.finalVerdict);
            nodes.push({ id: h.id, title: h.title, verdict: crit.finalVerdict, support: nav.currentSupport, navigable: nav.navigable, createdAt: h.createdAt });
          } catch {
            nodes.push({ id: h.id, title: h.title, verdict: "UNRESOLVED", support: 0, navigable: false, createdAt: h.createdAt });
          }
        }
        setUserNodes(nodes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectedNode = userNodes.find((n) => n.id === selected);

  return (
    <div className="space-y-4">
      <div>
        <div className="label">Knowledge Graph</div>
        <h1 className="text-2xl font-bold tracking-tight">Decision Knowledge Graph</h1>
        <p className="mt-1 text-sm text-slate">Nodes, dependencies, and contradictions across your decision portfolio.</p>
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        {(["decisions", "contradictions", "dependencies"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`pill text-xs capitalize transition-colors ${view === v ? "bg-amber text-obsidian" : "bg-white/8 text-slate hover:text-ivory"}`}
          >
            {v}
          </button>
        ))}
      </div>

      {/* YOUR DECISIONS — interactive node map */}
      {view === "decisions" && (
        <div className="card space-y-4">
          <div className="label">Your Decision Nodes ({userNodes.length})</div>
          {loading ? (
            <div className="h-16 animate-pulse rounded-inner bg-white/3" />
          ) : userNodes.length === 0 ? (
            <p className="text-sm text-slate text-center py-4">No decisions yet. <Link href="/workflow" className="text-amber hover:underline">Create one →</Link></p>
          ) : (
            <>
              {/* Graph visualization */}
              <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-inner bg-white/3">
                {userNodes.map((node, i) => {
                  const angle = (i / userNodes.length) * 2 * Math.PI;
                  const radius = 38; // % of container
                  const cx = 50 + radius * Math.cos(angle);
                  const cy = 50 + radius * Math.sin(angle);
                  const isSelected = selected === node.id;
                  const color = node.verdict === "GO" ? "#3FB67A" : node.verdict === "KILL" ? "#E5544B" : "#E8A23D";

                  return (
                    <button
                      key={node.id}
                      className={`absolute flex items-center justify-center rounded-full text-[9px] font-bold text-obsidian cursor-pointer transition-all hover:scale-125 hover:z-10 ${isSelected ? "ring-2 ring-white scale-125 z-20" : ""}`}
                      style={{
                        left: `${cx}%`, top: `${cy}%`,
                        transform: "translate(-50%, -50%)",
                        width: 22, height: 22,
                        backgroundColor: color,
                        opacity: node.navigable ? 1 : 0.65,
                      }}
                      title={node.title}
                      onClick={() => setSelected(isSelected ? null : node.id)}
                    >
                      {node.verdict.slice(0, 1)}
                    </button>
                  );
                })}
                {/* Central hub */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-amber/20 border border-amber/40 text-[10px] font-bold text-amber">
                  ◈
                </div>
                {/* Connection lines SVG */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
                  {userNodes.map((_, i) => {
                    const angle = (i / userNodes.length) * 2 * Math.PI;
                    const cx = 50 + 38 * Math.cos(angle);
                    const cy = 50 + 38 * Math.sin(angle);
                    return <line key={i} x1="50%" y1="50%" x2={`${cx}%`} y2={`${cy}%`} stroke="#E8A23D" strokeWidth="1" />;
                  })}
                </svg>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-go" />GO</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-kill" />KILL</span>
                <span className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber" />UNRESOLVED</span>
                <span className="text-slate">· Dimmed = not navigable to GO</span>
              </div>

              {/* Selected node detail */}
              {selectedNode && (
                <div className={`rounded-inner border ${VERDICT_BG[selectedNode.verdict] ?? "border-border-hair bg-white/3"} px-3 py-3 space-y-2`}>
                  <div className={`font-semibold text-sm ${VERDICT_CLS[selectedNode.verdict]}`}>{selectedNode.title}</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className={`pill ${VERDICT_BG[selectedNode.verdict] ?? "bg-white/8 text-steel"} ${VERDICT_CLS[selectedNode.verdict]}`}>{selectedNode.verdict}</span>
                    <span className="text-slate">support {(selectedNode.support * 100).toFixed(0)}%</span>
                    <span className="text-slate">{selectedNode.navigable ? "navigable to GO" : "not navigable"}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/report/${selectedNode.id}`} className="btn-primary text-xs py-1">Report ↗</Link>
                    <Link href={`/premortem/${selectedNode.id}`} className="btn-ghost text-xs py-1">Premortem</Link>
                  </div>
                </div>
              )}

              {/* Node list */}
              <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar">
                {userNodes.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setSelected(selected === node.id ? null : node.id)}
                    className={`w-full flex items-center gap-2 rounded-inner px-3 py-2 text-left transition-colors hover:bg-white/5 ${selected === node.id ? "bg-white/5" : ""}`}
                  >
                    <span className={`w-2 h-2 shrink-0 rounded-full ${node.verdict === "GO" ? "bg-go" : node.verdict === "KILL" ? "bg-kill" : "bg-amber"}`} />
                    <span className="text-sm text-steel truncate flex-1">{node.title}</span>
                    <span className={`data text-xs shrink-0 ${VERDICT_CLS[node.verdict]}`}>{(node.support * 100).toFixed(0)}%</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* CONTRADICTIONS */}
      {view === "contradictions" && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <div className="label">Contradiction Engine</div>
            <span className="label">{hard.length} hard · {soft.length} soft</span>
          </div>
          {hard.length === 0 && soft.length === 0 && (
            <p className="text-sm text-slate">No contradictions detected across benchmark hypotheses.</p>
          )}
          <ul className="space-y-3">
            {[...hard, ...soft].map((c, i) => (
              <li key={i} className="rounded-inner bg-white/3 p-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`pill text-xs ${c.severity === "hard" ? "bg-kill/15 text-kill" : "bg-amber/15 text-unresolved"}`}>{c.severity}</span>
                  <span className="data text-xs text-slate">{c.a}</span>
                  <span className="text-slate">↔</span>
                  <span className="data text-xs text-slate">{c.b}</span>
                  <span className="ml-auto data text-[10px] text-slate">{c.variable}</span>
                </div>
                <div className="mt-1 text-xs text-slate">{c.aClaim} · {c.bClaim}</div>
                <div className="mt-1 text-sm text-steel">{c.resolution}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* DEPENDENCIES */}
      {view === "dependencies" && (
        <div className="card space-y-3">
          <div className="label">Benchmark Dependencies ({EDGES.length} edges)</div>
          <ul className="space-y-2">
            {EDGES.map((e, i) => (
              <li key={i} className="rounded-inner bg-white/3 p-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="data text-xs text-slate">{e.from}</span>
                  <span className={`pill bg-white/8 text-[10px] ${REL_STYLE[e.rel] || "text-slate"}`}>{e.rel}</span>
                  <span className="data text-xs text-slate">{e.to}</span>
                </div>
                <div className="mt-0.5 text-xs text-slate">{e.note}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
