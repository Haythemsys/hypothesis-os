"use client";
import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/client";
import {
  selfCritique, navigate, calibrate,
  evidenceDebt, decisionEffort,
  decisionRisk, investorView,
  type Evidence,
} from "@/lib/core";
import { VerdictPill, Bar } from "@/components/Verdict";

type HypRow = { id: string; title: string };
type HypDetail = {
  hypothesis: any;
  evidence: { evidence: Evidence; label: string }[];
};

type ComputedView = {
  title: string;
  verdict: string;
  support: number;
  calibration: number;
  band: string;
  debtPct: number;
  debtBand: string;
  riskLevel: string;
  investorVerdict: string;
  distanceToGo: string | null;
  navigable: boolean;
};

function computeView(title: string, evidence: Evidence, calScore: number): ComputedView {
  const crit = selfCritique(evidence);
  const nav  = navigate(evidence, crit.finalVerdict);
  const debt = evidenceDebt(evidence, nav);
  const eff  = decisionEffort(nav);
  const risk = decisionRisk(debt, nav, calScore);
  const inv  = investorView(debt, risk, nav);
  return {
    title,
    verdict:         crit.finalVerdict,
    support:         nav.currentSupport,
    calibration:     calScore,
    band:            crit.calibration.band,
    debtPct:         debt.pct,
    debtBand:        debt.band,
    riskLevel:       risk.level,
    investorVerdict: inv.verdict,
    distanceToGo:    nav.distanceToGo,
    navigable:       nav.navigable,
  };
}

const RISK_CLS: Record<string, string> = { LOW: "text-go", MEDIUM: "text-unresolved", HIGH: "text-kill", CRITICAL: "text-kill" };
const INV_CLS:  Record<string, string> = { YES: "text-go", NO: "text-kill", "NOT YET": "text-unresolved" };

export default function Compare() {
  const [hyps, setHyps] = useState<HypRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selA, setSelA] = useState("");
  const [selB, setSelB] = useState("");
  const [detailA, setDetailA] = useState<HypDetail | null>(null);
  const [detailB, setDetailB] = useState<HypDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    api("/api/hypotheses")
      .then((r: any) => setHyps(r.hypotheses || []))
      .catch((e: any) => setErr(e.message || String(e)))
      .finally(() => setLoading(false));
  }, []);

  const fetchDetail = async (id: string): Promise<HypDetail | null> => {
    try { return await api(`/api/hypotheses/${id}`); }
    catch { return null; }
  };

  const compare = async () => {
    if (!selA || !selB) return;
    setLoadingDetail(true);
    const [a, b] = await Promise.all([fetchDetail(selA), fetchDetail(selB)]);
    setDetailA(a); setDetailB(b);
    setLoadingDetail(false);
  };

  const viewA = useMemo<ComputedView | null>(() => {
    if (!detailA) return null;
    const ev = detailA.evidence?.[detailA.evidence.length - 1]?.evidence;
    if (!ev) return null;
    const cal = calibrate(ev);
    return computeView(detailA.hypothesis.title, ev, cal.score);
  }, [detailA]);

  const viewB = useMemo<ComputedView | null>(() => {
    if (!detailB) return null;
    const ev = detailB.evidence?.[detailB.evidence.length - 1]?.evidence;
    if (!ev) return null;
    const cal = calibrate(ev);
    return computeView(detailB.hypothesis.title, ev, cal.score);
  }, [detailB]);

  if (loading) return <p className="card text-sm text-gray-400">Loading…</p>;
  if (err)     return <p className="card text-sm text-kill">{err}</p>;

  return (
    <div className="space-y-4">
      <section className="card space-y-1">
        <h1 className="text-xl font-bold">Benchmark Compare</h1>
        <p className="text-sm text-gray-400">Side-by-side comparison of any two hypotheses.</p>
      </section>

      {/* Selectors */}
      <section className="card space-y-3">
        <div className="label">Select two hypotheses</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <HypSelect label="Hypothesis A" value={selA} onChange={setSelA} options={hyps} exclude={selB} />
          <HypSelect label="Hypothesis B" value={selB} onChange={setSelB} options={hyps} exclude={selA} />
        </div>
        <button className="btn w-full" onClick={compare}
          disabled={!selA || !selB || selA === selB || loadingDetail}>
          {loadingDetail ? "Loading…" : "Compare"}
        </button>
      </section>

      {/* Comparison table */}
      {viewA && viewB && (
        <section className="card overflow-hidden p-0">
          <div className="grid grid-cols-3 border-b border-line">
            <div className="p-3 text-xs text-gray-400 font-semibold">Dimension</div>
            <ColHeader title={viewA.title} />
            <ColHeader title={viewB.title} />
          </div>
          <CompRow label="Verdict">
            <VerdictPill verdict={viewA.verdict as any} />
            <VerdictPill verdict={viewB.verdict as any} />
          </CompRow>
          <CompRowText label="Support"
            a={viewA.support.toFixed(2)} b={viewB.support.toFixed(2)}
            better={viewA.support >= viewB.support ? "a" : "b"} />
          <CompRowText label="Calibration"
            a={`${viewA.calibration}/100`} b={`${viewB.calibration}/100`}
            better={viewA.calibration >= viewB.calibration ? "a" : "b"} />
          <CompRow label="Evidence debt">
            <DebtBadge pct={viewA.debtPct} />
            <DebtBadge pct={viewB.debtPct} />
          </CompRow>
          <CompRow label="Decision risk">
            <span className={`font-semibold text-sm ${RISK_CLS[viewA.riskLevel]}`}>{viewA.riskLevel}</span>
            <span className={`font-semibold text-sm ${RISK_CLS[viewB.riskLevel]}`}>{viewB.riskLevel}</span>
          </CompRow>
          <CompRow label="Invest more?">
            <span className={`font-semibold text-sm ${INV_CLS[viewA.investorVerdict]}`}>{viewA.investorVerdict}</span>
            <span className={`font-semibold text-sm ${INV_CLS[viewB.investorVerdict]}`}>{viewB.investorVerdict}</span>
          </CompRow>
          <CompRowText label="Distance to GO"
            a={viewA.distanceToGo ?? (viewA.navigable ? "—" : "Not navigable")}
            b={viewB.distanceToGo ?? (viewB.navigable ? "—" : "Not navigable")} />
          {/* Support bars */}
          <div className="grid grid-cols-3 border-t border-line/50 px-3 py-2">
            <div className="text-xs text-gray-400 self-center">Support bar</div>
            <div className="pr-3 pt-1"><Bar value={viewA.support} label="" /></div>
            <div className="pl-0 pt-1"><Bar value={viewB.support} label="" /></div>
          </div>
        </section>
      )}

      {hyps.length < 2 && (
        <p className="card text-sm text-gray-400 text-center">
          You need at least 2 hypotheses with evidence to compare. Use Workflow to add more.
        </p>
      )}
    </div>
  );
}

function HypSelect({ label, value, onChange, options, exclude }: {
  label: string; value: string; onChange: (v: string) => void;
  options: HypRow[]; exclude: string;
}) {
  return (
    <div>
      <div className="label mb-1">{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="input text-sm">
        <option value="">— select —</option>
        {options.filter(h => h.id !== exclude).map(h => (
          <option key={h.id} value={h.id}>{h.title}</option>
        ))}
      </select>
    </div>
  );
}

function ColHeader({ title }: { title: string }) {
  return (
    <div className="p-3 text-xs font-semibold text-white line-clamp-2">{title}</div>
  );
}

function CompRow({ label, children }: { label: string; children: React.ReactNode }) {
  const [a, b] = Array.isArray(children) ? children : [children];
  return (
    <div className="grid grid-cols-3 border-t border-line/50 px-3 py-2.5">
      <div className="text-xs text-gray-400 self-center">{label}</div>
      <div className="pr-2">{a}</div>
      <div>{b}</div>
    </div>
  );
}

function CompRowText({ label, a, b, better }: {
  label: string; a: string; b: string; better?: "a" | "b";
}) {
  return (
    <div className="grid grid-cols-3 border-t border-line/50 px-3 py-2.5">
      <div className="text-xs text-gray-400 self-center">{label}</div>
      <div className={`text-sm font-semibold ${better === "a" ? "text-white" : "text-gray-400"}`}>{a}</div>
      <div className={`text-sm font-semibold ${better === "b" ? "text-white" : "text-gray-400"}`}>{b}</div>
    </div>
  );
}

function DebtBadge({ pct }: { pct: number }) {
  const cls = pct <= 10 ? "text-go" : pct <= 30 ? "text-unresolved" : "text-kill";
  return <span className={`font-semibold text-sm ${cls}`}>{pct}%</span>;
}
