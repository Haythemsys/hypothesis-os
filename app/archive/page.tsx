"use client";
import { useMemo, useState } from "react";
import map from "@/docs/KNOWLEDGE_MAP.json";

type File = { name: string; ext: string; bytes: number; category: string };
const FILES = map.files as File[];
const fmt = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

const LABELS: Record<string, string> = {
  "master-report": "Master research report", "phase-report": "Phase reports",
  "engine-report": "Engine reports", "corpus-intelligence": "Corpus intelligence",
  "results": "Results & evidence", "strategy": "Strategy & reframes",
  "concept": "Concepts", "archive-bundle": "Archive bundles", "other": "Other",
};
const ORDER = ["master-report", "phase-report", "engine-report", "results", "corpus-intelligence", "strategy", "concept", "archive-bundle", "other"];
const EXTS = Array.from(new Set(FILES.map((f) => f.ext))).sort();
const PAGE = 30;

export default function Archive() {
  const [q, setQ] = useState("");
  const [ext, setExt] = useState("");
  const [cat, setCat] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return FILES.filter((f) =>
      (!ql || f.name.toLowerCase().includes(ql)) && (!ext || f.ext === ext) && (!cat || f.category === cat));
  }, [q, ext, cat]);

  const groups = ORDER.filter((c) => filtered.some((f) => f.category === c));
  const master = FILES.filter((f) => f.category === "master-report");
  const topPhase = FILES.filter((f) => f.category === "phase-report").sort((a, b) => b.bytes - a.bytes).slice(0, 3);
  const topEngine = FILES.filter((f) => f.category === "engine-report").sort((a, b) => b.bytes - a.bytes).slice(0, 3);

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-xl font-bold">Research Archive</h1>
        <p className="mt-1 text-sm text-gray-400">
          {map.fileCount} research files indexed from disk. Filenames and sizes are real — no
          fabricated content.
        </p>
      </section>

      {!q && !ext && !cat && (
        <section className="card border-2 border-white/15">
          <div className="label mb-2">Highlights</div>
          {master.map((f) => (
            <div key={f.name} className="mb-2 rounded-xl bg-black/30 p-2">
              <div className="text-xs text-go">★ master report</div>
              <div className="break-all text-sm text-gray-200">{f.name}</div>
            </div>
          ))}
          <HiList title="Largest phase reports" files={topPhase} />
          <HiList title="Largest engine reports" files={topEngine} />
        </section>
      )}

      <section className="card space-y-2">
        <input className="input" value={q} placeholder="Search filenames…" onChange={(e) => { setQ(e.target.value); setExpanded({}); }} />
        <div className="table-scroll no-scrollbar flex gap-2 pb-1">
          <Chip active={!ext} onClick={() => setExt("")}>all types</Chip>
          {EXTS.map((x) => <Chip key={x} active={ext === x} onClick={() => setExt(x)}>{x}</Chip>)}
        </div>
        <div className="table-scroll no-scrollbar flex gap-2 pb-1">
          <Chip active={!cat} onClick={() => setCat("")}>all groups</Chip>
          {ORDER.filter((c) => (map.categories as any)[c]).map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{LABELS[c] || c}</Chip>
          ))}
        </div>
        <div className="text-xs text-gray-500">{filtered.length} of {map.fileCount} files</div>
      </section>

      {groups.map((c) => {
        const items = filtered.filter((f) => f.category === c);
        const show = expanded[c] ? items.length : PAGE;
        return (
          <section key={c} className="card">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-semibold">{LABELS[c] || c}</div>
              <span className="label">{items.length}</span>
            </div>
            <ul className="space-y-2 text-sm">
              {items.slice(0, show).map((f) => (
                <li key={f.name} className="flex min-h-9 items-center gap-2">
                  <span className="pill bg-white/10 shrink-0 uppercase">{f.ext}</span>
                  <span className="min-w-0 break-all text-gray-300">{f.name}</span>
                  <span className="ml-auto shrink-0 text-xs text-gray-500">{fmt(f.bytes)}</span>
                </li>
              ))}
            </ul>
            {items.length > PAGE && !expanded[c] && (
              <button
                className="mt-3 w-full rounded-xl border border-line py-2 text-sm text-gray-400 active:bg-white/5"
                onClick={() => setExpanded((p) => ({ ...p, [c]: true }))}>
                Show {items.length - PAGE} more…
              </button>
            )}
          </section>
        );
      })}
      {filtered.length === 0 && <p className="px-1 text-sm text-gray-500">No files match.</p>}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`pill shrink-0 whitespace-nowrap border px-3 py-1.5 ${active ? "border-white/40 bg-white/15 text-white" : "border-line text-gray-400"}`}>
      {children}
    </button>
  );
}
function HiList({ title, files }: { title: string; files: File[] }) {
  if (!files.length) return null;
  return (
    <div className="mt-2">
      <div className="label mb-1">{title}</div>
      <ul className="space-y-0.5 text-xs text-gray-400">
        {files.map((f) => <li key={f.name} className="break-all">{f.name}</li>)}
      </ul>
    </div>
  );
}
