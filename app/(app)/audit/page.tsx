"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { VerdictPill } from "@/components/Verdict";

type HypothesisSummary = {
  id: string;
  title: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
};

type VerdictRecord = {
  id: string;
  finalVerdict: string;
  support: number;
  calibration: number;
  band: string;
  createdAt: string;
};

type AuditEntry = {
  hypothesis: HypothesisSummary;
  latestVerdict: VerdictRecord | null;
  eventCount: number;
};

export default function AuditIndex() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    api("/api/hypotheses")
      .then(async (r: { hypotheses: HypothesisSummary[] }) => {
        const all = r.hypotheses ?? [];
        // Fetch audit summary for each hypothesis in parallel (cap at 20 for perf)
        const slice = all.slice(0, 20);
        const settled = await Promise.allSettled(
          slice.map((h) =>
            api(`/api/hypotheses/${h.id}/audit`).then((a: any) => ({
              hypothesis: h,
              latestVerdict: a.latestVerdict,
              eventCount: a.eventCount,
            }))
          )
        );
        const results: AuditEntry[] = settled
          .filter((s) => s.status === "fulfilled")
          .map((s) => (s as PromiseFulfilledResult<AuditEntry>).value);
        setEntries(results);
      })
      .catch((e) => setErr(e.message || String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-xl font-bold">Decision Audit Trail</h1>
        <p className="mt-1 text-sm text-steel">
          Every hypothesis decision is traceable from creation to verdict to report.
        </p>
      </section>

      {loading && <p className="card text-sm text-steel">Loading…</p>}
      {err && <p className="card text-sm text-kill">{err}</p>}

      {!loading && entries.length === 0 && (
        <div className="card space-y-2 text-center text-sm text-steel">
          <p>No hypotheses yet.</p>
          <Link href="/workflow" className="btn inline-block">Start a workflow</Link>
        </div>
      )}

      <div className="space-y-2">
        {entries.map(({ hypothesis, latestVerdict, eventCount }) => (
          <Link
            key={hypothesis.id}
            href={`/audit/${hypothesis.id}`}
            className="card flex items-start gap-3 active:bg-white/5"
          >
            <div className="flex-1 min-w-0">
              <p className="truncate font-semibold text-sm">{hypothesis.title}</p>
              <p className="text-xs text-slate mt-0.5">
                {eventCount} events · {new Date(hypothesis.createdAt).toLocaleDateString()}
              </p>
            </div>
            {latestVerdict ? (
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <VerdictPill verdict={latestVerdict.finalVerdict as any} />
                <span className="text-[10px] text-slate">
                  {latestVerdict.band} {latestVerdict.calibration}/100
                </span>
              </div>
            ) : (
              <span className="pill bg-white/10 text-xs text-steel shrink-0">no verdict</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
