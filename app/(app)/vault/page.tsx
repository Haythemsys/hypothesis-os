"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

interface VaultFile {
  id: string;
  name: string;
  ext: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  dataUrl: string;
  notes?: string;
}

const VAULT_KEY = "hypothesisos.vault.v1";
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "text/csv": "CSV",
  "text/plain": "TXT",
  "application/json": "JSON",
};

const EXT_COLOR: Record<string, string> = {
  PDF: "bg-kill/10 text-kill",
  DOCX: "bg-go/10 text-go",
  XLSX: "bg-go/10 text-go",
  CSV: "bg-amber/10 text-amber",
  TXT: "bg-white/8 text-steel",
  JSON: "bg-amber/10 text-amber",
  NOTE: "bg-white/8 text-slate",
};

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function loadVault(): VaultFile[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(VAULT_KEY) || "[]"); }
  catch { return []; }
}

function saveVault(files: VaultFile[]) {
  try { localStorage.setItem(VAULT_KEY, JSON.stringify(files)); }
  catch { /* quota exceeded */ }
}

type Tab = "files" | "notes" | "reports";

export default function EvidenceVault() {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [tab, setTab] = useState<Tab>("files");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [noteText, setNoteText] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setFiles(loadVault()); }, []);

  const addFile = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      setError(`"${file.name}" exceeds 5 MB limit`);
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const extGuess = MIME_TO_EXT[file.type] || file.name.split(".").pop()?.toUpperCase() || "FILE";
      const vf: VaultFile = {
        id: `vf_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        ext: extGuess,
        mimeType: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        dataUrl: reader.result as string,
      };
      setFiles((prev) => {
        const next = [vf, ...prev];
        saveVault(next);
        return next;
      });
      setUploading(false);
    };
    reader.onerror = () => { setError(`Failed to read "${file.name}"`); setUploading(false); };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    Array.from(e.dataTransfer.files).forEach(addFile);
  }, [addFile]);

  const removeFile = (id: string) => {
    setFiles((prev) => { const next = prev.filter((f) => f.id !== id); saveVault(next); return next; });
  };

  const downloadFile = (f: VaultFile) => {
    const a = document.createElement("a");
    a.href = f.dataUrl;
    a.download = f.name;
    a.click();
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    const ts = new Date().toISOString();
    const note: VaultFile = {
      id: `vf_note_${Date.now().toString(36)}`,
      name: `Note · ${new Date().toLocaleDateString()}`,
      ext: "NOTE",
      mimeType: "text/plain",
      size: noteText.length,
      uploadedAt: ts,
      dataUrl: `data:text/plain;charset=utf-8,${encodeURIComponent(noteText)}`,
      notes: noteText,
    };
    setFiles((prev) => { const next = [note, ...prev]; saveVault(next); return next; });
    setNoteText("");
  };

  const fileItems = files.filter((f) => f.ext !== "NOTE");
  const noteItems = files.filter((f) => f.ext === "NOTE");
  const total = files.length;

  const tabs: [Tab, string, number][] = [
    ["files", "Files", fileItems.length],
    ["notes", "Notes", noteItems.length],
    ["reports", "Reports", 0],
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="label">Evidence Vault</div>
          <h1 className="text-2xl font-bold tracking-tight">Document library</h1>
          <p className="mt-1 text-sm text-slate">{total} item{total !== 1 ? "s" : ""} · stored locally in browser</p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-primary shrink-0 text-sm"
        >
          {uploading ? "Reading…" : "+ Upload"}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.xlsx,.csv,.txt,.json"
        className="sr-only"
        onChange={(e) => { Array.from(e.target.files || []).forEach(addFile); e.target.value = ""; }}
      />

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-card border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-amber bg-amber/5 scale-[.995]" : "border-border-soft hover:border-amber/40"
        }`}
      >
        <div className="text-3xl text-slate">⊞</div>
        <p className="mt-2 text-sm text-steel">Drop files here or click to upload</p>
        <p className="mt-1 text-xs text-slate">PDF · DOCX · XLSX · CSV · TXT · JSON · max 5 MB each</p>
      </div>

      {error && (
        <button onClick={() => setError("")} className="w-full rounded-inner bg-kill/10 px-3 py-2 text-left text-sm text-kill">
          ⚠ {error} — click to dismiss
        </button>
      )}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border-hair">
        {tabs.map(([t, label, count]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm transition-colors ${
              tab === t
                ? "border-b-2 border-amber font-semibold text-ivory"
                : "text-slate hover:text-ivory"
            }`}
          >
            {label}
            {count > 0 && (
              <span className="min-w-[18px] rounded-full bg-white/8 px-1 py-0.5 text-center text-[10px] text-steel">
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Files tab */}
      {tab === "files" && (
        fileItems.length === 0 ? (
          <Card>
            <p className="text-sm text-slate">No documents uploaded yet. Drop files above to get started.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fileItems.map((f) => (
              <Card key={f.id} className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <span className={`pill shrink-0 font-mono text-[10px] ${EXT_COLOR[f.ext] || "bg-white/8 text-steel"}`}>
                    {f.ext}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ivory" title={f.name}>{f.name}</p>
                    <p className="text-xs text-slate">{fmtBytes(f.size)}</p>
                    <p className="text-xs text-slate">{new Date(f.uploadedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => downloadFile(f)} className="btn-ghost flex-1 py-1.5 text-xs">
                    ↓ Download
                  </button>
                  <button
                    onClick={() => removeFile(f.id)}
                    aria-label={`Remove ${f.name}`}
                    className="btn-danger px-2.5 py-1.5 text-xs"
                  >
                    ✕
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Notes tab */}
      {tab === "notes" && (
        <div className="space-y-3">
          <Card className="space-y-3">
            <div className="label">Add Research Note</div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Key observations, hypotheses, references…"
              rows={5}
              className="input resize-y"
            />
            <button onClick={addNote} disabled={!noteText.trim()} className="btn-primary text-sm disabled:opacity-40">
              Save Note
            </button>
          </Card>

          {noteItems.length === 0 ? (
            <Card><p className="text-sm text-slate">No notes yet.</p></Card>
          ) : (
            <div className="space-y-3">
              {noteItems.map((f) => (
                <Card key={f.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate">{new Date(f.uploadedAt).toLocaleString()}</span>
                    <button onClick={() => removeFile(f.id)} className="text-xs text-slate hover:text-kill">✕ remove</button>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-steel">{f.notes}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reports tab */}
      {tab === "reports" && (
        <Card className="space-y-2">
          <p className="text-sm text-steel">
            Generated reports live in the decision audit trail.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/audit" className="text-amber hover:underline">→ Audit Trail</Link>
            <Link href="/workflow" className="text-amber hover:underline">→ Decision Workflow</Link>
            <Link href="/export" className="text-amber hover:underline">→ Export Center</Link>
          </div>
        </Card>
      )}
    </div>
  );
}
