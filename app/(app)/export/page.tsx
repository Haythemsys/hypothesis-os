"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/client";
import { Card } from "@/components/ui/Card";

type Hyp = { id: string; title: string; createdAt: string };

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function toCSV(rows: [string, string][]) {
  return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
}

function ExportCenterInner() {
  const searchParams = useSearchParams();
  const [hypotheses, setHypotheses] = useState<Hyp[]>([]);
  const [selected, setSelected] = useState(searchParams.get("id") || "");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    api<{ hypotheses: Hyp[] }>("/api/hypotheses")
      .then((r) => {
        const list = r.hypotheses || [];
        setHypotheses(list);
        // If ?id param was provided but not yet validated, keep it
        const paramId = searchParams.get("id");
        if (paramId && list.some((h) => h.id === paramId)) setSelected(paramId);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [searchParams]);

  const selectedHyp = hypotheses.find((h) => h.id === selected);

  const exportJSON = async () => {
    if (!selected) return;
    setExporting("json");
    try {
      const data = await api<any>(`/api/hypotheses/${selected}`);
      downloadBlob(
        `hypothesis-${selected}.json`,
        JSON.stringify(data, null, 2),
        "application/json"
      );
    } finally { setExporting(null); }
  };

  const exportCSV = async () => {
    if (!selected) return;
    setExporting("csv");
    try {
      const data = await api<any>(`/api/hypotheses/${selected}`);
      const h = data.hypothesis || {};
      const rows: [string, string][] = [
        ["Field", "Value"],
        ["ID", h.id || ""],
        ["Title", h.title || ""],
        ["Created", h.createdAt || ""],
        ["Kinds", (h.kinds || []).join("; ")],
        ["", ""],
        ["Evidence #", "Label | Effect | Replication | HostileSurvival | ConfoundControl | Generalization | Power | CI"],
        ...(data.evidence || []).map((e: any, i: number) => [
          `Evidence ${i + 1}`,
          `${e.label} | ${e.evidence?.effect?.toFixed(2)} | ${e.evidence?.replication?.toFixed(2)} | ${e.evidence?.hostileSurvival?.toFixed(2)} | ${e.evidence?.confoundControl?.toFixed(2)} | ${e.evidence?.generalization?.toFixed(2)} | ${e.evidence?.power?.toFixed(2)} | ${e.evidence?.ciExcludesNull ? "YES" : "NO"}`,
        ]),
        ["", ""],
        ["Verdict #", "Final | Support | Calibration | Band"],
        ...(data.verdicts || []).map((v: any, i: number) => [
          `Verdict ${i + 1}`,
          `${v.finalVerdict} | ${v.support?.toFixed(3)} | ${v.calibration} | ${v.band}`,
        ]),
      ];
      downloadBlob(`hypothesis-${selected}.csv`, toCSV(rows as [string,string][]), "text/csv");
    } finally { setExporting(null); }
  };

  const exportMarkdown = async () => {
    if (!selected) return;
    setExporting("md");
    try {
      const data = await api<any>(`/api/hypotheses/${selected}`);
      const reports: any[] = data.reports || [];
      const md = reports.length > 0
        ? reports[reports.length - 1].markdown
        : `# ${data.hypothesis?.title || selected}\n\n*No report generated yet.*\n\nUse the [Decision Workflow](/workflow) to generate a full analysis report.`;
      downloadBlob(`report-${selected}.md`, md, "text/markdown");
    } finally { setExporting(null); }
  };

  const exportPackage = async () => {
    if (!selected) return;
    setExporting("pkg");
    try {
      const data = await api<any>(`/api/hypotheses/${selected}`);

      downloadBlob(
        "evidence.json",
        JSON.stringify({ hypothesis: data.hypothesis, evidence: data.evidence, verdicts: data.verdicts }, null, 2),
        "application/json"
      );

      await new Promise<void>((r) => setTimeout(r, 400));

      let auditData: any = {};
      try { auditData = await api<any>(`/api/hypotheses/${selected}/audit`); } catch { /* fallback */ }
      downloadBlob("audit.json", JSON.stringify(auditData, null, 2), "application/json");

      await new Promise<void>((r) => setTimeout(r, 400));

      const reports: any[] = data.reports || [];
      const md = reports.length > 0
        ? reports[reports.length - 1].markdown
        : `# ${data.hypothesis?.title || selected}\n\n*Generate a report via the Decision Workflow to populate this file.*`;
      downloadBlob("summary.md", md, "text/markdown");
    } finally { setExporting(null); }
  };

  const formats = [
    {
      id: "pdf",
      icon: "▤",
      label: "PDF Report",
      desc: "Executive Intelligence Brief, print-formatted",
      note: "Opens report page — use browser Print → Save as PDF",
      action: selectedHyp ? () => window.open(`/report/${selected}`, "_blank") : undefined,
    },
    {
      id: "json",
      icon: "{}",
      label: "JSON Export",
      desc: "Complete hypothesis: evidence, verdicts, experiments",
      action: exportJSON,
    },
    {
      id: "csv",
      icon: "⊞",
      label: "CSV Export",
      desc: "Evidence vectors and verdicts as spreadsheet rows",
      action: exportCSV,
    },
    {
      id: "md",
      icon: "≡",
      label: "Markdown Report",
      desc: "Engine-generated analysis as portable Markdown file",
      action: exportMarkdown,
    },
  ] as const;

  return (
    <div className="space-y-5">
      <div>
        <div className="label">Export Center</div>
        <h1 className="text-2xl font-bold tracking-tight">Export intelligence</h1>
        <p className="mt-1 text-sm text-slate">Download decisions as PDF, JSON, CSV, or Markdown</p>
      </div>

      {/* Decision selector */}
      <Card className="space-y-3">
        <div className="label">Select Decision</div>
        {loading ? (
          <div className="h-10 animate-pulse rounded-btn bg-white/5" />
        ) : hypotheses.length === 0 ? (
          <p className="text-sm text-slate">
            No decisions found.{" "}
            <Link href="/workflow" className="text-amber hover:underline">Create one →</Link>
          </p>
        ) : (
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="input"
          >
            <option value="">— Select a decision to export —</option>
            {hypotheses.map((h) => (
              <option key={h.id} value={h.id}>
                {h.title}
              </option>
            ))}
          </select>
        )}
        {selectedHyp && (
          <p className="text-xs text-slate">
            Created {new Date(selectedHyp.createdAt).toLocaleDateString()} ·{" "}
            <Link href={`/audit/${selected}`} className="text-amber hover:underline">View audit →</Link>
          </p>
        )}
      </Card>

      {/* Format grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {formats.map((f) => (
          <Card key={f.id} className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-inner bg-amber/10 font-mono text-sm font-bold text-amber">
                {f.icon}
              </span>
              <div className="min-w-0">
                <div className="font-semibold text-ivory">{f.label}</div>
                <p className="text-xs text-slate">{f.desc}</p>
                {"note" in f && f.note && <p className="mt-1 text-xs italic text-slate-dim">{f.note}</p>}
              </div>
            </div>
            <button
              onClick={f.action}
              disabled={!selected || !f.action || exporting !== null}
              className="btn-ghost w-full py-2 text-sm disabled:opacity-40"
            >
              {exporting === f.id ? "Exporting…" : `↓ Export ${f.label}`}
            </button>
          </Card>
        ))}
      </div>

      {/* Intelligence Package */}
      <Card variant="accent" className="space-y-4">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-inner bg-amber/15 text-2xl">⊗</span>
          <div className="min-w-0">
            <div className="font-bold text-ivory">Export Intelligence Package</div>
            <p className="mt-1 text-sm text-steel">
              Downloads all artifacts for the selected decision as separate files:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate">
              <li><span className="data text-ivory">evidence.json</span> — complete hypothesis + evidence + verdicts</li>
              <li><span className="data text-ivory">audit.json</span> — full audit trail and timeline</li>
              <li><span className="data text-ivory">summary.md</span> — generated analysis report</li>
              <li className="text-slate-dim">PDF: open the report page and use Print → Save as PDF</li>
            </ul>
          </div>
        </div>
        <button
          onClick={exportPackage}
          disabled={!selected || exporting !== null}
          className="btn-primary w-full text-sm disabled:opacity-40"
        >
          {exporting === "pkg" ? "Downloading files…" : "↓ Export Intelligence Package"}
        </button>
      </Card>

      {/* Quick links */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <Link href="/library" className="text-steel hover:text-ivory">Decision Library →</Link>
        <Link href="/vault" className="text-steel hover:text-ivory">Evidence Vault →</Link>
        {selected ? (
          <Link href={`/report/${selected}`} className="text-steel hover:text-ivory">Open Report →</Link>
        ) : (
          <span className="text-slate-dim">Open Report →</span>
        )}
      </div>
    </div>
  );
}

export default function ExportCenter() {
  return (
    <Suspense fallback={<div className="card text-sm text-steel animate-pulse">Loading…</div>}>
      <ExportCenterInner />
    </Suspense>
  );
}
