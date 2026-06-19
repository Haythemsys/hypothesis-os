"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";
import { NAV_ITEMS, SIDEBAR_EXTRA } from "./nav-items";

type Cmd = { id: string; label: string; icon: string; sub?: string; run: () => void };
type Hyp = { id: string; title: string };

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hyps, setHyps] = useState<Hyp[]>([]);
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Lazy-load hypotheses when palette opens
  useEffect(() => {
    if (!open) return;
    setQ(""); setSel(0);
    inputRef.current?.focus();
    api<{ hypotheses: Hyp[] }>("/api/hypotheses")
      .then((r) => setHyps(r.hypotheses || []))
      .catch(() => setHyps([]));
  }, [open]);

  const go = (href: string) => { router.push(href); onClose(); };

  const commands: Cmd[] = useMemo(() => {
    const nav = [...NAV_ITEMS, ...SIDEBAR_EXTRA].map((n) => ({
      id: "nav:" + n.href, label: n.label, icon: n.icon, sub: n.href, run: () => go(n.href),
    }));
    const newDecision: Cmd = { id: "new", label: "New decision", icon: "+", sub: "Start a workflow", run: () => go("/workflow") };
    const hypCmds: Cmd[] = hyps.map((h) => ({
      id: "hyp:" + h.id, label: h.title, icon: "◇", sub: "Open audit trail", run: () => go(`/audit/${h.id}`),
    }));
    return [newDecision, ...nav, ...hypCmds];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hyps]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(t) || c.sub?.toLowerCase().includes(t));
  }, [q, commands]);

  useEffect(() => { setSel(0); }, [q]);

  // Keyboard handling
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
      if (e.key === "Enter")     { e.preventDefault(); filtered[sel]?.run(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, filtered, sel, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal>
      <button aria-label="Close" className="absolute inset-0 bg-obsidian/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg animate-scale-in overflow-hidden rounded-card border border-border-soft bg-graphite-2 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border-hair px-4">
          <span className="text-slate">🔍</span>
          <input
            ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Type a command or search hypotheses…"
            className="min-h-12 w-full bg-transparent py-3 text-base text-ivory outline-none placeholder:text-slate-dim"
          />
        </div>
        <ul className="max-h-[50vh] overflow-y-auto py-1">
          {filtered.length === 0 && <li className="px-4 py-3 text-sm text-slate">No matches.</li>}
          {filtered.map((c, i) => (
            <li key={c.id}>
              <button
                onMouseEnter={() => setSel(i)}
                onClick={c.run}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${i === sel ? "bg-white/5" : ""}`}
              >
                <span className={`w-5 shrink-0 text-center ${i === sel ? "text-amber" : "text-slate"}`}>{c.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-ivory">{c.label}</span>
                  {c.sub && <span className="block truncate text-xs text-slate">{c.sub}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
