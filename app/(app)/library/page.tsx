"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import {
  selfCritique, navigate, calibrate, evidenceDebt, decisionRisk,
  type Evidence,
} from "@/lib/core";
import { VerdictPill } from "@/components/Verdict";
import { RiskPill } from "@/components/ui/Pill";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Meter";

type LibEntry = {
  id: string;
  title: string;
  createdAt: string;
  verdict: string;
  support: number;
  calibration: number;
  band: string;
  risk: string;
  riskScore: number;
  debtPct: number;
  hasEvidence: boolean;
};

type SortKey = "newest" | "support" | "risk";
type FilterVerdict = "ALL" | "GO" | "KILL" | "UNRESOLVED";

const RISK_ORDER: Record<string, number> = { CRITICAL: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
const VERDICT_DOT: Record<string, string> = { GO: "bg-go", KILL: "bg-kill", UNRESOLVED: "bg-amber" };

export default function DecisionLibrary() {
  const [entries, setEntries] = useState<LibEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [query, setQuery] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<FilterVerdict>("ALL");
  const [sort, setSort] = useState<SortKey>("newest");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await api<{ hypotheses: { id: string; title: string; createdAt: string }[] }>("/api/hypotheses");
        const hyps = (r.hypotheses || []).slice(0, 50);

        const details = await Promise.all(
          hyps.map((h) =>
            api<{ evidence: { evidence: Evidence; createdAt: string }[] }>(`/api/hypotheses/${h.id}`)
              .then((d) => ({ h, d }))
              .catch(() => null)
          )
        );

        if (cancelled) return;

        const computed: LibEntry[] = [];
        for (const item of details) {
          if (!item) continue;
          const ev = item.d.evidence?.[item.d.evidence.length - 1]?.evidence;
          if (!ev) {
            computed.push({
              id: item.h.id, title: item.h.title, createdAt: item.h.createdAt,
              verdict: "UNRESOLVED", support: 0, calibration: 0, band: "—",
              risk: "LOW", riskScore: 0, debtPct: 100, hasEvidence: false,
            });
            continue;
          }
          const cal = calibrate(ev);
          const crit = selfCritique(ev);
          const nav = navigate(ev, crit.finalVerdict);
          const debt = evidenceDebt(ev, nav);
          const risk = decisionRisk(debt, nav, cal.score);
          computed.push({
            id: item.h.id, title: item.h.title, createdAt: item.h.createdAt,
            verdict: crit.finalVerdict, support: nav.currentSupport,
            calibration: cal.score, band: cal.band, risk: risk.level,
            riskScore: risk.score, debtPct: debt.pct, hasEvidence: true,
          });
        }
        setEntries(computed);
      } catch (e: any) {
        if (!cancelled) setErr(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = entries;
    if (verdictFilter !== "ALL") list = list.filter((e) => e.verdict === verdictFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((e) => e.title.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      if (sort === "newest") return a.createdAt > b.createdAt ? -1 : 1;
      if (sort === "support") return b.support - a.support;
      if (sort === "risk") return RISK_ORDER[b.risk] - RISK_ORDER[a.risk];
      return 0;
    });
  }, [entries, verdictFilter, query, sort]);

  const counts = useMemo(() => {
    const go = entries.filter((e) => e.verdict === "GO").length;
    const kill = entries.filter((e) => e.verdict === "KILL").length;
    const unr = entries.filter((e) => e.verdict === "UNRESOLVED").length;
    return { go, kill, unr };
  }, [entries]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="label">Decision Library</div>
          <h1 className="text-2xl font-bold tracking-tight">All decisions</h1>
          <p className="mt-1 text-sm text-slate">{entries.length} decisions tracked</p>
        </div>
        <ButtonLink href="/workflow">+ New decision</ButtonLink>
      </div>

      {/* Verdict summary strip */}
      {entries.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {([["ALL", "All", "bg-white/8 text-steel"], ["GO", `${counts.go} GO`, "bg-go/10 text-go"], ["KILL", `${counts.kill} KILL`, "bg-kill/10 text-kill"], ["UNRESOLVED", `${counts.unr} Unresolved`, "bg-amber/10 text-unresolved"]] as [FilterVerdict, string, string][]).map(([v, label, cls]) => (
            <button
              key={v}
              onClick={() => setVerdictFilter(v)}
              className={`pill transition-opacity ${cls} ${verdictFilter !== v && verdictFilter !== "ALL" ? "opacity-50" : ""} ${verdictFilter === v ? "ring-1 ring-current" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search decisions…"
          className="input flex-1"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="input sm:w-44"
        >
          <option value="newest">Newest first</option>
          <option value="support">Highest support</option>
          <option value="risk">Highest risk</option>
        </select>
      </div>

      {/* Loading / error / empty */}
      {loading && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-card bg-white/5" />
          ))}
        </div>
      )}
      {err && <Card className="text-sm text-kill">{err}</Card>}
      {!loading && entries.length === 0 && (
        <Card variant="accent" className="space-y-3 text-center">
          <p className="text-steel">No decisions yet.</p>
          <ButtonLink href="/workflow" className="inline-flex">Run your first decision →</ButtonLink>
        </Card>
      )}
      {!loading && entries.length > 0 && filtered.length === 0 && (
        <Card>
          <p className="text-sm text-slate">
            No decisions match your filters.{" "}
            <button onClick={() => { setVerdictFilter("ALL"); setQuery(""); }} className="text-amber hover:underline">Clear filters</button>
          </p>
        </Card>
      )}

      {/* Decision cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e) => (
          <Link key={e.id} href={`/audit/${e.id}`} className="card group flex flex-col gap-3 transition-colors hover:bg-white/5">
            {/* Card header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${VERDICT_DOT[e.verdict] ?? "bg-slate"}`} />
                <span className="text-[10px] uppercase tracking-wide text-slate">
                  {new Date(e.createdAt).toLocaleDateString()}
                </span>
              </div>
              <VerdictPill verdict={e.verdict as any} />
            </div>

            {/* Title */}
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ivory group-hover:text-amber transition-colors">
              {e.title}
            </h3>

            {/* Metrics row */}
            {e.hasEvidence ? (
              <>
                <div className="grid grid-cols-3 gap-1 text-center text-xs">
                  <div>
                    <div className="data text-base font-bold text-ivory">{e.support.toFixed(2)}</div>
                    <div className="text-slate">support</div>
                  </div>
                  <div>
                    <div className="data text-base font-bold text-ivory">{e.calibration}</div>
                    <div className="text-slate">calibration</div>
                  </div>
                  <div>
                    <div className="data text-base font-bold text-ivory">{e.debtPct}%</div>
                    <div className="text-slate">debt</div>
                  </div>
                </div>
                <Meter value={e.debtPct} tone="debt" />
              </>
            ) : (
              <p className="text-xs text-slate italic">No evidence recorded yet</p>
            )}

            {/* Footer row */}
            <div className="flex items-center justify-between">
              <RiskPill level={e.risk} />
              <div className="flex items-center gap-2">
                <Link
                  href={`/report/${e.id}`}
                  onClick={(ev) => ev.stopPropagation()}
                  className="text-[11px] text-slate hover:text-amber"
                >
                  Report ↗
                </Link>
                <Link
                  href={`/export?id=${e.id}`}
                  onClick={(ev) => ev.stopPropagation()}
                  className="text-[11px] text-slate hover:text-amber"
                >
                  Export ↗
                </Link>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
