"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import {
  selfCritique, navigate, calibrate, evidenceDebt, decisionEffort, decisionRisk,
  type Evidence,
} from "@/lib/core";
import { VerdictPill } from "@/components/Verdict";
import { Card } from "@/components/ui/Card";
import { Ring } from "@/components/ui/Ring";
import { Meter } from "@/components/ui/Meter";
import { RiskPill } from "@/components/ui/Pill";
import { ButtonLink } from "@/components/ui/Button";

type DashData = {
  totalHypotheses: number;
  counts: { GO?: number; KILL?: number; UNRESOLVED?: number };
  recent: { title: string; verdict: string; createdAt: string }[];
};
type Hyp = { id: string; title: string };
type Active = {
  id: string; title: string; verdict: string; support: number;
  risk: string; riskScore: number; debtPct: number;
};

const RISK_ORDER: Record<string, number> = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };

export default function MissionControl() {
  const [data, setData] = useState<DashData | null>(null);
  const [active, setActive] = useState<Active[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [riskFilter, setRiskFilter] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [dash, list] = await Promise.all([
          api<DashData>("/api/dashboard"),
          api<{ hypotheses: Hyp[] }>("/api/hypotheses"),
        ]);
        if (cancelled) return;
        setData(dash);

        // Fetch details (capped) and compute risk/debt client-side via the engine.
        const capped = (list.hypotheses || []).slice(0, 24);
        const details = await Promise.all(
          capped.map((h) =>
            api<{ hypothesis: Hyp; evidence: { evidence: Evidence }[] }>(`/api/hypotheses/${h.id}`)
              .then((d) => ({ h, d })).catch(() => null)
          )
        );
        if (cancelled) return;
        const computed: Active[] = [];
        for (const item of details) {
          if (!item) continue;
          const ev = item.d.evidence?.[item.d.evidence.length - 1]?.evidence;
          if (!ev) continue;
          const cal = calibrate(ev);
          const crit = selfCritique(ev);
          const nav = navigate(ev, crit.finalVerdict);
          const debt = evidenceDebt(ev, nav);
          const eff = decisionEffort(nav);
          const risk = decisionRisk(debt, nav, cal.score);
          computed.push({
            id: item.h.id, title: item.h.title, verdict: crit.finalVerdict,
            support: nav.currentSupport, risk: risk.level, riskScore: risk.score, debtPct: debt.pct,
          });
        }
        computed.sort((a, b) => (RISK_ORDER[b.risk] - RISK_ORDER[a.risk]) || (b.debtPct - a.debtPct));
        setActive(computed);
      } catch (e: any) {
        if (!cancelled) setErr(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const counts = data?.counts ?? {};
  const go = counts.GO ?? 0, kill = counts.KILL ?? 0, unr = counts.UNRESOLVED ?? 0;
  const totalVerdicts = go + kill + unr;
  const total = data?.totalHypotheses ?? 0;

  const health = totalVerdicts > 0 ? Math.round(((go * 1.0 + unr * 0.4) / totalVerdicts) * 100) : 0;

  const riskDist = useMemo(() => {
    const d = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
    for (const a of active) (d as any)[a.risk]++;
    return d;
  }, [active]);

  const debtAgg = useMemo(() => {
    if (active.length === 0) return { avg: 0, nearGo: 0, deficit: 0 };
    const avg = Math.round(active.reduce((s, a) => s + a.debtPct, 0) / active.length);
    return { avg, nearGo: active.filter((a) => a.debtPct <= 10).length, deficit: active.filter((a) => a.debtPct > 60).length };
  }, [active]);

  const shownActive = riskFilter ? active.filter((a) => a.risk === riskFilter) : active;

  if (loading) return <DashSkeleton />;
  if (err) return <Card className="text-sm text-kill">{err}</Card>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="label">Mission Control</div>
          <h1 className="text-2xl font-bold tracking-tight">Decision operations</h1>
        </div>
      </div>

      {total === 0 ? (
        <Card variant="accent" className="space-y-3 text-center">
          <p className="text-steel">No decisions under evaluation.</p>
          <ButtonLink href="/workflow" className="inline-flex">Begin a decision →</ButtonLink>
        </Card>
      ) : (
        <>
          {/* Top row: Health · Risk · Debt */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Decision Health */}
            <Card className="flex items-center gap-4">
              <Ring value={health} label={`${health}%`} sublabel="health" />
              <div className="min-w-0">
                <div className="label">Decision Health</div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm">
                  <span className="text-go">{go} GO</span>
                  <span className="text-kill">{kill} KILL</span>
                  <span className="text-unresolved">{unr} UNRESOLVED</span>
                </div>
                <p className="mt-1 text-xs text-slate">{total} hypotheses tracked</p>
              </div>
            </Card>

            {/* Risk Distribution */}
            <Card className="space-y-3">
              <div className="label">Risk Distribution</div>
              <RiskBar dist={riskDist} onPick={(lvl) => setRiskFilter((f) => (f === lvl ? null : lvl))} active={riskFilter} />
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate">
                <Legend c="bg-go" n={riskDist.LOW} l="Low" />
                <Legend c="bg-amber" n={riskDist.MEDIUM} l="Med" />
                <Legend c="bg-kill" n={riskDist.HIGH} l="High" />
                <Legend c="bg-kill" n={riskDist.CRITICAL} l="Crit" />
              </div>
            </Card>

            {/* Evidence Debt */}
            <Card className="space-y-2">
              <div className="label">Evidence Debt</div>
              <div className="flex items-baseline gap-2">
                <span className="data text-3xl font-bold text-ivory">{debtAgg.avg}%</span>
                <span className="text-xs text-slate">avg across active</span>
              </div>
              <Meter value={debtAgg.avg} tone="debt" />
              <p className="text-xs text-slate">{debtAgg.nearGo} near GO · {debtAgg.deficit} major deficit</p>
            </Card>
          </div>

          {/* Active + Recent */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="label">Active Hypotheses {riskFilter && <span className="text-amber">· {riskFilter}</span>}</div>
                {riskFilter && <button onClick={() => setRiskFilter(null)} className="text-xs text-slate hover:text-ivory">clear</button>}
              </div>
              {shownActive.length === 0 ? (
                <p className="text-sm text-slate">No hypotheses with recorded evidence{riskFilter ? ` at ${riskFilter} risk` : ""}.</p>
              ) : (
                <ul className="divide-y divide-border-hair">
                  {shownActive.map((a) => (
                    <li key={a.id}>
                      <Link href={`/audit/${a.id}`} className="flex items-center gap-3 py-2.5 -mx-2 px-2 rounded-inner hover:bg-white/5">
                        <VerdictPill verdict={a.verdict} />
                        <span className="min-w-0 flex-1 truncate text-sm text-ivory">{a.title}</span>
                        <span className="data shrink-0 text-sm text-steel">{a.support.toFixed(2)}</span>
                        <RiskPill level={a.risk} />
                        <span className="shrink-0 text-slate">›</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="space-y-3">
              <div className="label">Recent Decisions</div>
              {(data?.recent ?? []).length === 0 ? (
                <p className="text-sm text-slate">No verdicts yet.</p>
              ) : (
                <ul className="space-y-2">
                  {data!.recent.map((r, i) => (
                    <li key={i} className="flex items-center justify-between gap-2 text-sm">
                      <span className="min-w-0 flex-1 truncate text-steel">{r.title}</span>
                      <VerdictPill verdict={r.verdict} />
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="lg:hidden">
            <ButtonLink href="/workflow" className="w-full">+ New decision</ButtonLink>
          </div>
        </>
      )}
    </div>
  );
}

function RiskBar({ dist, onPick, active }: {
  dist: Record<string, number>; onPick: (lvl: string) => void; active: string | null;
}) {
  const total = dist.LOW + dist.MEDIUM + dist.HIGH + dist.CRITICAL || 1;
  const segs = [
    { lvl: "LOW", n: dist.LOW, c: "bg-go" },
    { lvl: "MEDIUM", n: dist.MEDIUM, c: "bg-amber" },
    { lvl: "HIGH", n: dist.HIGH, c: "bg-kill" },
    { lvl: "CRITICAL", n: dist.CRITICAL, c: "bg-kill brightness-75" },
  ];
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/8">
      {segs.map((s) => s.n > 0 && (
        <button key={s.lvl} onClick={() => onPick(s.lvl)} title={`${s.lvl}: ${s.n}`}
          className={`${s.c} transition-opacity ${active && active !== s.lvl ? "opacity-40" : ""}`}
          style={{ width: `${(s.n / total) * 100}%` }} />
      ))}
    </div>
  );
}

function Legend({ c, n, l }: { c: string; n: number; l: string }) {
  return <span className="inline-flex items-center gap-1"><span className={`inline-block h-2 w-2 rounded-full ${c}`} />{l} {n}</span>;
}

function DashSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-white/5" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-card bg-white/5" />)}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-card bg-white/5 lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-card bg-white/5" />
      </div>
    </div>
  );
}
