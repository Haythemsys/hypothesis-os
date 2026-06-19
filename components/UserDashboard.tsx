"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { VerdictPill } from "./Verdict";

type Stats = {
  totalHypotheses: number;
  counts: Record<string, number>;
  recent: { title: string; verdict: string; createdAt: string }[];
};

export default function UserDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<Stats>("/api/dashboard").then(setStats).catch(() => null);
  }, []);

  if (!stats) return null;
  if (stats.totalHypotheses === 0) return (
    <section className="card border border-white/10 text-center text-sm text-gray-500">
      No hypotheses yet. <a href="/workflow" className="underline">Start a workflow</a> to create your first.
    </section>
  );

  return (
    <>
      <section className="grid grid-cols-3 gap-3">
        <Stat n={stats.counts.GO || 0} label="GO" cls="text-go" />
        <Stat n={stats.counts.KILL || 0} label="KILL" cls="text-kill" />
        <Stat n={stats.counts.UNRESOLVED || 0} label="UNRESOLVED" cls="text-unresolved" />
      </section>

      {stats.recent.length > 0 && (
        <section className="card">
          <div className="label mb-2">Your latest verdicts</div>
          <ul className="space-y-2">
            {stats.recent.map((v, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <VerdictPill verdict={v.verdict as any} />
                <span className="min-w-0 truncate text-gray-300">{v.title}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 text-xs text-gray-500">{stats.totalHypotheses} total hypothesis{stats.totalHypotheses !== 1 ? "es" : ""}</div>
        </section>
      )}
    </>
  );
}

function Stat({ n, label, cls }: { n: number; label: string; cls: string }) {
  return (
    <div className="card text-center">
      <div className={`text-3xl font-black ${cls}`}>{n}</div>
      <div className="label mt-1">{label}</div>
    </div>
  );
}
