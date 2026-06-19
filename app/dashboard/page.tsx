"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { VerdictPill } from "@/components/Verdict";

type DashData = {
  totalHypotheses: number;
  counts: { GO?: number; KILL?: number; UNRESOLVED?: number };
  recent: { title: string; verdict: string; createdAt: string }[];
};

const VERDICT_CLS: Record<string, string> = {
  GO: "text-go", KILL: "text-kill", UNRESOLVED: "text-unresolved",
};

export default function Dashboard() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/api/dashboard")
      .then((r: DashData) => setData(r))
      .catch((e: any) => setErr(e.message || String(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="card text-sm text-gray-400">Loading dashboard…</p>;
  if (err)     return <p className="card text-sm text-kill">{err}</p>;
  if (!data)   return null;

  const { totalHypotheses, counts, recent } = data;
  const go   = counts.GO         ?? 0;
  const kill = counts.KILL       ?? 0;
  const unr  = counts.UNRESOLVED ?? 0;
  const total = go + kill + unr || 1;

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="card space-y-1">
        <h1 className="text-xl font-bold">Project Dashboard</h1>
        <p className="text-sm text-gray-400">Aggregate view of all hypotheses in this workspace.</p>
      </section>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Total hypotheses" value={totalHypotheses} color="" />
        <Tile label="GO"         value={go}   color="text-go"         />
        <Tile label="KILL"       value={kill} color="text-kill"       />
        <Tile label="UNRESOLVED" value={unr}  color="text-unresolved" />
      </div>

      {/* Verdict distribution bar */}
      {totalHypotheses > 0 && (
        <section className="card space-y-3">
          <div className="label">Verdict distribution</div>
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            {go   > 0 && <div className="bg-go"         style={{ width: `${(go   / total) * 100}%` }} />}
            {kill > 0 && <div className="bg-kill"       style={{ width: `${(kill / total) * 100}%` }} />}
            {unr  > 0 && <div className="bg-unresolved" style={{ width: `${(unr  / total) * 100}%` }} />}
          </div>
          <div className="flex gap-4 text-xs text-gray-400">
            <span><span className="text-go font-semibold">■</span> GO {go > 0 ? Math.round((go / total) * 100) : 0}%</span>
            <span><span className="text-kill font-semibold">■</span> KILL {kill > 0 ? Math.round((kill / total) * 100) : 0}%</span>
            <span><span className="text-unresolved font-semibold">■</span> UNRESOLVED {unr > 0 ? Math.round((unr / total) * 100) : 0}%</span>
          </div>
        </section>
      )}

      {/* Recent verdicts */}
      {recent.length > 0 && (
        <section className="card space-y-3">
          <div className="label">Recent verdicts</div>
          <div className="space-y-2">
            {recent.map((r, i) => (
              <div key={i} className="flex items-start justify-between gap-2 rounded-xl bg-black/20 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{r.title}</p>
                  <p className="text-[10px] text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <VerdictPill verdict={r.verdict as any} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {totalHypotheses === 0 && (
        <section className="card space-y-2 text-center">
          <p className="text-gray-400 text-sm">No hypotheses yet.</p>
          <Link href="/workflow" className="btn inline-block text-sm">Start with Workflow</Link>
        </section>
      )}

      {/* Quick links */}
      <section className="grid grid-cols-2 gap-3">
        <Link href="/workflow"   className="card flex flex-col gap-1 active:bg-white/5">
          <span className="text-xl">⚡</span>
          <span className="font-semibold text-sm">New Workflow</span>
          <span className="text-xs text-gray-400">Add a hypothesis</span>
        </Link>
        <Link href="/compare"    className="card flex flex-col gap-1 active:bg-white/5">
          <span className="text-xl">⇄</span>
          <span className="font-semibold text-sm">Compare</span>
          <span className="text-xs text-gray-400">Side-by-side benchmark</span>
        </Link>
        <Link href="/evidence"   className="card flex flex-col gap-1 active:bg-white/5">
          <span className="text-xl">⚖</span>
          <span className="font-semibold text-sm">Analyze</span>
          <span className="text-xs text-gray-400">Evidence engine</span>
        </Link>
        <Link href="/audit"      className="card flex flex-col gap-1 active:bg-white/5">
          <span className="text-xl">⌗</span>
          <span className="font-semibold text-sm">Audit Trail</span>
          <span className="text-xs text-gray-400">Decision timeline</span>
        </Link>
      </section>
    </div>
  );
}

function Tile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card space-y-1">
      <div className="label">{label}</div>
      <div className={`text-3xl font-bold ${color || "text-white"}`}>{value}</div>
    </div>
  );
}
