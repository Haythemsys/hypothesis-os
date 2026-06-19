"use client";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import type { Evidence } from "@/lib/core";

const DRAFT_KEY = "hypothesisos.workflow.draft.v1";
const EVIDENCE_FIELDS: (keyof Evidence)[] = [
  "effect", "replication", "hostileSurvival", "confoundControl", "generalization", "power",
];
const FIELD_LABELS: Record<string, string> = {
  effect: "Effect size", replication: "Replication",
  hostileSurvival: "Hostile survival", confoundControl: "Confound control",
  generalization: "Generalization", power: "Power",
};

type ParseResult = {
  title: string;
  ev: Partial<Evidence>;
  notes: string;
  warnings: string[];
};

// ── Parsers ──────────────────────────────────────────────────────────────────

function parseJSON(text: string): ParseResult {
  const warnings: string[] = [];
  const raw = JSON.parse(text);
  let title = "";
  let ev: Partial<Evidence> = {};

  // Format A: { title, evidence: { effect, replication, ... } }
  if (raw.title && raw.evidence && typeof raw.evidence === "object" && !Array.isArray(raw.evidence)) {
    title = raw.title;
    ev = extractEvidence(raw.evidence);
  }
  // Format B: { hypothesis: { title }, evidence: [{ evidence: {...} }] }
  else if (raw.hypothesis?.title && Array.isArray(raw.evidence)) {
    title = raw.hypothesis.title;
    const last = raw.evidence[raw.evidence.length - 1];
    if (last?.evidence) ev = extractEvidence(last.evidence);
  }
  // Format C: { hypotheses: [{ title, ... }] }
  else if (Array.isArray(raw.hypotheses) && raw.hypotheses.length > 0) {
    title = raw.hypotheses[0].title || "";
    warnings.push("Multiple hypotheses found — using the first one.");
  }
  // Format D: raw evidence object directly
  else if (EVIDENCE_FIELDS.some((f) => f in raw)) {
    ev = extractEvidence(raw);
    title = raw.title || raw.name || raw.hypothesis || "Imported hypothesis";
  }
  else {
    warnings.push("Could not detect a known format. Set a title and evidence manually in the workflow.");
    title = raw.title || raw.name || "";
  }

  if (!title) warnings.push("No hypothesis title found.");
  return { title, ev, notes: JSON.stringify(raw, null, 2).slice(0, 400), warnings };
}

function parseCSV(text: string): ParseResult {
  const warnings: string[] = [];
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return { title: "", ev: {}, notes: text.slice(0, 400), warnings: ["CSV needs at least a header row and one data row."] };

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, "").toLowerCase());
  const values  = lines[1].split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));

  const ev: Partial<Evidence> = {};
  let title = "";

  headers.forEach((h, i) => {
    const val = values[i];
    if (!val) return;
    const fieldKey = EVIDENCE_FIELDS.find((f) => f.toLowerCase() === h || h.includes(f.toLowerCase()));
    if (fieldKey) {
      const num = parseFloat(val);
      if (!isNaN(num)) (ev as any)[fieldKey] = Math.max(0, Math.min(1, num));
    } else if (h === "title" || h === "hypothesis" || h === "name") {
      title = val;
    } else if (h === "ci" || h === "ciexcludesnull") {
      (ev as any).ciExcludesNull = val.toLowerCase() === "true" || val === "1" || val.toLowerCase() === "yes";
    }
  });

  if (!title && values[0]) title = values[0];
  if (!title) warnings.push("No title column found — set title manually.");
  if (Object.keys(ev).length === 0) warnings.push("No evidence columns matched known fields (effect, replication, hostileSurvival, confoundControl, generalization, power).");

  return { title, ev, notes: lines.slice(0, 3).join("\n"), warnings };
}

function parseTXT(text: string): ParseResult {
  const warnings: string[] = [];
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  let title = "";
  const ev: Partial<Evidence> = {};

  // First line after stripping # = title
  for (const line of lines) {
    const stripped = line.replace(/^#+\s*/, "").trim();
    if (stripped) { title = stripped; break; }
  }

  // Scan for key:value patterns matching evidence fields
  for (const line of lines) {
    const match = line.match(/^([a-z_]+)\s*[:=]\s*([\d.]+)/i);
    if (!match) continue;
    const key = match[1].toLowerCase().replace(/_/g, "");
    const num = parseFloat(match[2]);
    const field = EVIDENCE_FIELDS.find((f) => f.toLowerCase() === key);
    if (field && !isNaN(num)) (ev as any)[field] = Math.max(0, Math.min(1, num));
  }

  if (!title) warnings.push("Could not extract a title from the first line.");
  if (Object.keys(ev).length === 0) warnings.push("No evidence values found. Add lines like 'effect: 0.7' to import evidence.");

  return { title, ev, notes: lines.slice(0, 5).join("\n"), warnings };
}

function extractEvidence(raw: any): Partial<Evidence> {
  const ev: any = {};
  for (const f of EVIDENCE_FIELDS) {
    if (f in raw && typeof raw[f] === "number") ev[f] = Math.max(0, Math.min(1, raw[f]));
  }
  if ("ciExcludesNull" in raw) ev.ciExcludesNull = Boolean(raw.ciExcludesNull);
  if ("claimRequiresGeneralization" in raw) ev.claimRequiresGeneralization = Boolean(raw.claimRequiresGeneralization);
  return ev;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ImportCenter() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const processFile = useCallback((file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      setError("File too large — max 2 MB for import.");
      return;
    }
    setFileName(file.name);
    setError("");
    setParsed(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      try {
        let result: ParseResult;
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext === "json") result = parseJSON(text);
        else if (ext === "csv") result = parseCSV(text);
        else result = parseTXT(text); // txt, md
        setParsed(result);
        setEditTitle(result.title);
      } catch (e: any) {
        setError(`Parse error: ${e.message}`);
      }
    };
    reader.onerror = () => setError("Failed to read file.");
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const sendToWorkflow = () => {
    if (!parsed) return;
    const draft: any = { title: editTitle || parsed.title, project: "Imported", ev: { ...parsed.ev } };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    router.push("/workflow");
  };

  const evCount = parsed ? Object.keys(parsed.ev).filter((k) => EVIDENCE_FIELDS.includes(k as any)).length : 0;

  return (
    <div className="space-y-5">
      <div>
        <div className="label">Import Center</div>
        <h1 className="text-2xl font-bold tracking-tight">Import decision data</h1>
        <p className="mt-1 text-sm text-slate">Upload JSON, CSV, TXT, or Markdown — parsed and injected into the workflow</p>
      </div>

      {/* Drop zone */}
      <input
        ref={inputRef}
        type="file"
        accept=".json,.csv,.txt,.md,.markdown"
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = ""; }}
      />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-card border-2 border-dashed p-10 text-center transition-colors ${
          dragging ? "border-amber bg-amber/5" : "border-border-soft hover:border-amber/40"
        }`}
      >
        <div className="text-3xl text-slate">↑</div>
        <p className="mt-2 font-semibold text-ivory">Drop file or click to upload</p>
        <p className="mt-1 text-sm text-slate">JSON · CSV · TXT · Markdown</p>
        {fileName && <p className="mt-2 text-xs text-amber">{fileName}</p>}
      </div>

      {error && (
        <Card className="border-kill/30">
          <p className="text-sm text-kill">⚠ {error}</p>
        </Card>
      )}

      {/* Format guide */}
      {!parsed && !error && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([
            ["JSON", '{ "title": "My claim", "evidence": { "effect": 0.7, "replication": 0.6, "hostileSurvival": 0.5, "confoundControl": 0.8, "generalization": 0.6, "power": 0.7 } }'],
            ["CSV", "title,effect,replication,hostileSurvival,confoundControl,generalization,power\nMy claim,0.7,0.6,0.5,0.8,0.6,0.7"],
            ["TXT", "My hypothesis title\n\neffect: 0.7\nreplication: 0.6\nhostileSurvival: 0.5"],
            ["Markdown", "# My hypothesis\n\neffect: 0.7\nreplication: 0.6\nhostileSurvival: 0.5"],
          ] as [string, string][]).map(([ext, example]) => (
            <Card key={ext} className="space-y-2">
              <div className="pill bg-amber/10 text-amber font-mono text-[10px]">{ext}</div>
              <pre className="overflow-x-auto rounded bg-obsidian p-2 text-[9px] text-steel leading-relaxed">{example}</pre>
            </Card>
          ))}
        </div>
      )}

      {/* Parse result */}
      {parsed && (
        <div className="space-y-4 animate-fade-up">
          {/* Warnings */}
          {parsed.warnings.length > 0 && (
            <div className="rounded-inner border border-amber-dim/30 bg-amber/5 px-4 py-3 space-y-1">
              {parsed.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber">⚠ {w}</p>
              ))}
            </div>
          )}

          {/* Preview card */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="label text-go">Parse successful</div>
              <span className="pill bg-go/10 text-go text-xs">{evCount}/6 evidence fields</span>
            </div>

            {/* Title edit */}
            <div className="space-y-1.5">
              <label className="label">Hypothesis title</label>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Enter hypothesis title…"
                className="input"
              />
            </div>

            {/* Evidence preview */}
            {evCount > 0 && (
              <div className="space-y-2">
                <div className="label">Evidence preview</div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {EVIDENCE_FIELDS.map((f) => {
                    const val = (parsed.ev as any)[f];
                    const has = val !== undefined;
                    return (
                      <div key={f} className={`rounded-inner px-3 py-2 ${has ? "bg-white/5" : "bg-white/2 opacity-40"}`}>
                        <div className="text-[10px] text-slate">{FIELD_LABELS[f]}</div>
                        <div className={`data text-lg font-bold ${has ? "text-ivory" : "text-slate"}`}>
                          {has ? (val as number).toFixed(2) : "—"}
                        </div>
                        {has && (
                          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/8">
                            <div
                              className={`h-full rounded-full ${val >= 0.7 ? "bg-go" : val >= 0.4 ? "bg-amber" : "bg-kill"}`}
                              style={{ width: `${val * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Raw preview */}
            <details className="text-xs">
              <summary className="cursor-pointer text-slate hover:text-ivory">Raw preview</summary>
              <pre className="mt-2 overflow-x-auto rounded-inner bg-obsidian p-3 text-[10px] text-steel leading-relaxed">{parsed.notes}</pre>
            </details>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={sendToWorkflow}
              disabled={!editTitle.trim()}
              className="btn-primary flex-1 disabled:opacity-40"
            >
              Send to Workflow →
            </button>
            <button
              onClick={() => { setParsed(null); setFileName(""); setEditTitle(""); }}
              className="btn-ghost"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
