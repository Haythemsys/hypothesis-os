"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type RiskItem = {
  id: string; title: string; verdict: string | null;
  support: number; debt: number; risk: string; riskScore: number;
  effort: string; evidenceCount: number;
};

const VERDICT_CLS: Record<string, string> = {
  GO: "text-go", KILL: "text-kill", UNRESOLVED: "text-unresolved",
};

const RISK_COLOR: Record<string, string> = {
  LOW: "#3FB67A", MEDIUM: "#E8A23D", HIGH: "#E5544B", CRITICAL: "#b91c1c",
};

export default function RiskMap() {
  const [items, setItems] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RiskItem | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>("ALL");

  useEffect(() => {
    api<{ items: RiskItem[] }>("/api/portfolio")
      .then((r) => setItems((r.items || []).filter((i) => i.verdict !== null) as RiskItem[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Map support (X axis = "Value") and risk score (Y axis) to coordinates
  // Quadrants: High Value / Low Risk = top-right; High Value / High Risk = top-left, etc.
  const plotted = items
    .filter((i) => filterRisk === "ALL" || i.risk === filterRisk)
    .map((item) => {
      const x = (item.support ?? 0) * 90 + 5; // support → value axis (0-100%)
      const y = 100 - ((item.riskScore ?? 50) * 0.9 + 5); // risk → inverted Y
      return { ...item, x, y };
    });

  const quadrantStats = {
    highValLowRisk:  items.filter((i) => (i.support ?? 0) >= 0.55 && (i.riskScore ?? 50) < 50),
    highValHighRisk: items.filter((i) => (i.support ?? 0) >= 0.55 && (i.riskScore ?? 50) >= 50),
    lowValLowRisk:   items.filter((i) => (i.support ?? 0) < 0.55  && (i.riskScore ?? 50) < 50),
    lowValHighRisk:  items.filter((i) => (i.support ?? 0) < 0.55  && (i.riskScore ?? 50) >= 50),
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="label">Risk Intelligence</div>
        <h1 className="text-2xl font-bold tracking-tight">Organizational Risk Map</h1>
        <p className="mt-1 text-sm text-slate">Every decision plotted by evidence strength (Value) vs. risk exposure. Identify portfolio blind spots.</p>
      </div>

      {/* Quadrant summary */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "High Value / Low Risk", count: quadrantStats.highValLowRisk.length, cls: "text-go", bg: "bg-go/5 border-go/20" },
          { label: "High Value / High Risk", count: quadrantStats.highValHighRisk.length, cls: "text-unresolved", bg: "bg-amber/5 border-amber/20" },
          { label: "Low Value / Low Risk", count: quadrantStats.lowValLowRisk.length, cls: "text-steel", bg: "bg-white/3 border-border-hair" },
          { label: "Low Value / High Risk", count: quadrantStats.lowValHighRisk.length, cls: "text-kill", bg: "bg-kill/5 border-kill/20" },
        ].map((q) => (
          <div key={q.label} className={`rounded-inner border ${q.bg} px-3 py-3`}>
            <div className="text-[10px] text-slate">{q.label}</div>
            <div className={`data mt-1 text-2xl font-bold ${q.cls}`}>{q.count}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRisk(r)}
            className={`pill text-xs transition-colors ${filterRisk === r ? "bg-amber text-obsidian" : "bg-white/8 text-slate hover:text-ivory"}`}
          >
            {r}
          </button>
        ))}
      </div>

      {loading && <div className="card animate-pulse h-64 bg-white/3" />}

      {!loading && (
        <div className="card space-y-4">
          {/* Matrix visualization */}
          <div className="relative">
            {/* Y axis label */}
            <div className="absolute -left-1 top-0 bottom-8 flex flex-col justify-between text-[9px] text-slate">
              <span>High Risk</span>
              <span>Low Risk</span>
            </div>

            {/* Chart */}
            <div className="ml-12 mr-0">
              <div className="relative h-72 sm:h-96 w-full overflow-hidden rounded-inner bg-white/3">
                {/* Quadrant backgrounds */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                  <div className="bg-kill/3" />
                  <div className="bg-go/3" />
                  <div className="bg-white/0" />
                  <div className="bg-amber/3" />
                </div>
                {/* Dividers */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
                {/* Quadrant labels */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-2 grid-rows-2 text-[9px] font-semibold text-white/10 p-2">
                  <div className="flex items-start justify-start">HIGH RISK / LOW VALUE</div>
                  <div className="flex items-start justify-end">HIGH RISK / HIGH VALUE</div>
                  <div className="flex items-end justify-start">LOW RISK / LOW VALUE</div>
                  <div className="flex items-end justify-end">LOW RISK / HIGH VALUE</div>
                </div>

                {/* Decision nodes */}
                {plotted.map((item) => {
                  const color = RISK_COLOR[item.risk ?? "MEDIUM"] ?? "#6b7280";
                  const isSelected = selected?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      className={`absolute flex items-center justify-center rounded-full text-[8px] font-bold text-obsidian cursor-pointer transition-all hover:scale-125 hover:z-10 ${isSelected ? "ring-2 ring-white scale-125 z-20" : ""}`}
                      style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        transform: "translate(-50%, -50%)",
                        width: 20, height: 20,
                        backgroundColor: color,
                      }}
                      title={`${item.title} — ${item.verdict} · ${(item.support * 100).toFixed(0)}% support · ${item.risk} risk`}
                      onClick={() => setSelected(isSelected ? null : item)}
                    >
                      {item.verdict?.slice(0, 1) ?? "?"}
                    </button>
                  );
                })}

                {plotted.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm text-slate">No decisions with evidence yet.</p>
                  </div>
                )}
              </div>
              {/* X axis label */}
              <div className="mt-1 flex justify-between text-[9px] text-slate">
                <span>Low Value (Support)</span>
                <span>→</span>
                <span>High Value (Support)</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs">
            {Object.entries(RISK_COLOR).map(([level, color]) => (
              <div key={level} className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-slate">{level}</span>
              </div>
            ))}
            <span className="text-slate">· Node letter = verdict initial</span>
          </div>
        </div>
      )}

      {/* Selected decision detail */}
      {selected && (
        <div className="card space-y-2">
          <div className="flex items-center justify-between">
            <div className="label">{selected.title}</div>
            <button onClick={() => setSelected(null)} className="text-slate hover:text-ivory text-xs">✕</button>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className={`pill ${selected.verdict === "GO" ? "bg-go/15 text-go" : selected.verdict === "KILL" ? "bg-kill/15 text-kill" : "bg-amber/15 text-unresolved"}`}>
              {selected.verdict}
            </span>
            <span className="text-slate">Support {((selected.support ?? 0) * 100).toFixed(0)}%</span>
            <span className="text-slate">Debt {(selected.debt ?? 0).toFixed(0)}%</span>
            <span style={{ color: RISK_COLOR[selected.risk ?? "MEDIUM"] }}>{selected.risk} Risk</span>
          </div>
          <div className="flex gap-2 mt-2">
            <Link href={`/report/${selected.id}`} className="btn-primary text-xs py-1.5">Report ↗</Link>
            <Link href={`/premortem/${selected.id}`} className="btn-ghost text-xs py-1.5">Premortem</Link>
          </div>
        </div>
      )}

      {/* Table view */}
      <div className="card space-y-3">
        <div className="label">Decision Table</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-hair">
                <th className="pb-2 text-left font-semibold text-slate">Decision</th>
                <th className="pb-2 text-center font-semibold text-slate">Verdict</th>
                <th className="pb-2 text-center font-semibold text-slate">Support</th>
                <th className="pb-2 text-center font-semibold text-slate">Risk</th>
                <th className="pb-2 text-center font-semibold text-slate">Debt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hair">
              {items.slice(0, 20).map((item) => (
                <tr key={item.id} className="hover:bg-white/3 cursor-pointer" onClick={() => setSelected(item)}>
                  <td className="py-2 pr-4 text-steel max-w-[200px] truncate">{item.title}</td>
                  <td className="py-2 text-center">
                    <span className={`font-semibold ${VERDICT_CLS[item.verdict ?? ""] ?? "text-slate"}`}>{item.verdict ?? "—"}</span>
                  </td>
                  <td className="py-2 text-center text-slate">{((item.support ?? 0) * 100).toFixed(0)}%</td>
                  <td className="py-2 text-center font-semibold" style={{ color: RISK_COLOR[item.risk ?? "MEDIUM"] }}>{item.risk}</td>
                  <td className="py-2 text-center text-slate">{(item.debt ?? 0).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
