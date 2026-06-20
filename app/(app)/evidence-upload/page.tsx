"use client";
import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/client";

const ACCEPT = ".pdf,.docx,.txt,.md,.csv,.json";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const BINARY_TYPES = ["pdf", "docx"];

type ParsedDoc = {
  id: string; name: string; type: string; size: number;
  summary: string; claims: string[]; metrics: string[]; dates: string[]; entities: string[];
  uploadedAt: string;
};

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

function parseCSV(text: string): string {
  const lines = text.split("\n").slice(0, 200);
  return lines.join("\n");
}

function parseJSON(text: string): string {
  try {
    const obj = JSON.parse(text);
    return JSON.stringify(obj, null, 2).slice(0, 10000);
  } catch {
    return text;
  }
}

export default function EvidenceUpload() {
  const [docs, setDocs] = useState<ParsedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<ParsedDoc | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<{ documents: ParsedDoc[] }>("/api/evidence-ingest")
      .then(r => setDocs(r.documents || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    const newDocs: ParsedDoc[] = [];

    for (const file of Array.from(files)) {
      if (file.size > MAX_SIZE) { setError(`${file.name} exceeds 5MB limit.`); continue; }
      const ext = file.name.split(".").pop()?.toLowerCase() || "txt";
      let content = "";
      if (BINARY_TYPES.includes(ext)) {
        content = `[Binary file: ${file.name}]\n\nThis file type requires server-side parsing. Content extracted: filename=${file.name}, size=${(file.size / 1024).toFixed(1)}KB, type=${ext}.\n\nFor full text extraction, convert to TXT or use copy-paste mode.`;
      } else {
        try {
          let raw = await readFileAsText(file);
          if (ext === "csv") raw = parseCSV(raw);
          if (ext === "json") raw = parseJSON(raw);
          content = raw;
        } catch { setError(`Failed to read ${file.name}`); continue; }
      }

      try {
        const r = await api<{ document: ParsedDoc }>("/api/evidence-ingest", {
          method: "POST",
          body: JSON.stringify({ name: file.name, type: ext, size: file.size, content }),
        });
        newDocs.push(r.document);
      } catch { setError(`Failed to upload ${file.name}`); }
    }

    setDocs(prev => [...newDocs, ...prev]);
    setUploading(false);
  }

  async function deleteDoc(id: string) {
    await api(`/api/evidence-ingest?id=${id}`, { method: "DELETE" }).catch(() => {});
    setDocs(prev => prev.filter(d => d.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const typeColor: Record<string, string> = {
    pdf: "bg-kill/20 text-kill", docx: "bg-amber/20 text-amber",
    txt: "bg-go/15 text-go", md: "bg-go/15 text-go",
    csv: "bg-white/10 text-steel", json: "bg-white/10 text-slate",
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="label">Evidence Ingestion Center</div>
        <h1 className="text-2xl font-bold tracking-tight">Evidence Upload</h1>
        <p className="mt-1 text-sm text-slate">Upload documents and extract claims, metrics, dates, and entities as evidence.</p>
      </div>

      {/* Drop zone */}
      <div
        className="card border-2 border-dashed border-border-soft text-center cursor-pointer hover:border-amber/40 hover:bg-amber/3 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
        onDragOver={e => e.preventDefault()}
      >
        <input ref={inputRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={e => handleFiles(e.target.files)} />
        <div className="py-4 space-y-1">
          {uploading ? (
            <div className="text-amber text-sm animate-pulse">Processing files…</div>
          ) : (
            <>
              <div className="text-2xl">↑</div>
              <div className="text-sm font-medium">Drop files or click to upload</div>
              <div className="text-xs text-slate">PDF · DOCX · TXT · MD · CSV · JSON · max 5MB each</div>
            </>
          )}
        </div>
      </div>

      {error && <div className="rounded-inner bg-kill/10 border border-kill/20 px-3 py-2 text-sm text-kill">{error}</div>}

      {/* Stats */}
      {docs.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Documents", value: docs.length },
            { label: "Total Claims", value: docs.reduce((s, d) => s + d.claims.length, 0) },
            { label: "Metrics Found", value: docs.reduce((s, d) => s + d.metrics.length, 0) },
          ].map(m => (
            <div key={m.label} className="card text-center">
              <div className="data text-xl font-bold text-amber">{m.value}</div>
              <div className="label mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Document list */}
      <div className="card space-y-3">
        <div className="label">Uploaded Documents ({docs.length})</div>
        {loading ? (
          <div className="h-12 animate-pulse rounded-inner bg-white/3" />
        ) : docs.length === 0 ? (
          <p className="text-sm text-slate text-center py-4">No documents yet. Upload files above.</p>
        ) : (
          <div className="space-y-2">
            {docs.map(doc => (
              <div
                key={doc.id}
                className={`rounded-inner border p-3 cursor-pointer transition-colors ${selected?.id === doc.id ? "bg-white/5 border-amber/30" : "bg-white/2 border-border-hair hover:bg-white/3"}`}
                onClick={() => setSelected(selected?.id === doc.id ? null : doc)}
              >
                <div className="flex items-center gap-2">
                  <span className={`pill text-[10px] shrink-0 ${typeColor[doc.type] || "bg-white/10 text-slate"}`}>{doc.type.toUpperCase()}</span>
                  <span className="text-sm font-medium truncate flex-1">{doc.name}</span>
                  <span className="data text-xs text-slate shrink-0">{(doc.size / 1024).toFixed(1)}KB</span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteDoc(doc.id); }}
                    className="ml-1 text-slate hover:text-kill text-xs shrink-0"
                  >✕</button>
                </div>
                <p className="mt-1 text-xs text-slate truncate">{doc.summary || "No summary available"}</p>

                {selected?.id === doc.id && (
                  <div className="mt-3 space-y-3 border-t border-border-hair pt-3">
                    {doc.claims.length > 0 && (
                      <div>
                        <div className="label mb-1">Claims ({doc.claims.length})</div>
                        <ul className="space-y-1">
                          {doc.claims.slice(0, 5).map((c, i) => (
                            <li key={i} className="text-xs text-steel leading-relaxed">• {c}</li>
                          ))}
                          {doc.claims.length > 5 && <li className="text-xs text-slate">+{doc.claims.length - 5} more</li>}
                        </ul>
                      </div>
                    )}
                    {doc.metrics.length > 0 && (
                      <div>
                        <div className="label mb-1">Metrics ({doc.metrics.length})</div>
                        <div className="flex flex-wrap gap-1">
                          {doc.metrics.slice(0, 10).map((m, i) => (
                            <span key={i} className="pill bg-amber/10 text-amber text-[10px] data">{m}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {doc.entities.length > 0 && (
                      <div>
                        <div className="label mb-1">Entities</div>
                        <div className="flex flex-wrap gap-1">
                          {doc.entities.slice(0, 8).map((e, i) => (
                            <span key={i} className="pill bg-white/8 text-steel text-[10px]">{e}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {doc.dates.length > 0 && (
                      <div>
                        <div className="label mb-1">Dates</div>
                        <div className="flex flex-wrap gap-1">
                          {doc.dates.slice(0, 6).map((d, i) => (
                            <span key={i} className="pill bg-white/5 text-slate text-[10px] data">{d}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-slate">Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paste mode */}
      <PasteMode onSave={doc => setDocs(prev => [doc, ...prev])} />
    </div>
  );
}

function PasteMode({ onSave }: { onSave: (doc: ParsedDoc) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!text.trim() || !name.trim()) return;
    setSaving(true);
    try {
      const r = await api<{ document: ParsedDoc }>("/api/evidence-ingest", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), type: "txt", size: text.length, content: text }),
      });
      onSave(r.document);
      setName(""); setText(""); setOpen(false);
    } catch {}
    setSaving(false);
  }

  return (
    <div className="card">
      <button onClick={() => setOpen(o => !o)} className="text-sm text-amber hover:underline">
        {open ? "Close paste mode" : "Or paste text directly →"}
      </button>
      {open && (
        <div className="mt-3 space-y-2">
          <input className="input text-sm" placeholder="Document name" value={name} onChange={e => setName(e.target.value)} />
          <textarea className="input min-h-[120px] resize-none text-sm" placeholder="Paste document content here…" value={text} onChange={e => setText(e.target.value)} />
          <button onClick={save} disabled={!text.trim() || !name.trim() || saving} className="btn-primary text-sm">
            {saving ? "Saving…" : "Save Document"}
          </button>
        </div>
      )}
    </div>
  );
}
