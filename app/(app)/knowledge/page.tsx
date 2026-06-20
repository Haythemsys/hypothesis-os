"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type KnowledgeItemType = "principle" | "lesson" | "pattern" | "checklist";
type KnowledgeItem = { id: string; hypothesisId?: string; type: KnowledgeItemType; title: string; body: string; tags: string[]; createdAt: string };
type Hypothesis = { id: string; title: string };

const TYPE_STYLE: Record<KnowledgeItemType, { icon: string; label: string; pill: string }> = {
  principle: { icon: "◆", label: "Principle", pill: "bg-amber/20 text-amber" },
  lesson: { icon: "✦", label: "Lesson", pill: "bg-go/15 text-go" },
  pattern: { icon: "⊛", label: "Pattern", pill: "bg-white/10 text-steel" },
  checklist: { icon: "☑", label: "Checklist", pill: "bg-kill/15 text-kill" },
};

export default function Knowledge() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [hyps, setHyps] = useState<Hypothesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newItem, setNewItem] = useState({ type: "lesson" as KnowledgeItemType, title: "", body: "", tags: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api<{ items: KnowledgeItem[] }>("/api/knowledge"),
      api<{ hypotheses: Hypothesis[] }>("/api/hypotheses"),
    ]).then(([ki, hh]) => {
      setItems(ki.items || []);
      setHyps(hh.hypotheses || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function extract(hypothesisId: string) {
    setExtracting(hypothesisId);
    try {
      const r = await api<{ items: KnowledgeItem[] }>("/api/knowledge", {
        method: "POST",
        body: JSON.stringify({ action: "extract", hypothesisId }),
      });
      setItems(prev => [...(r.items || []), ...prev]);
    } catch {}
    setExtracting(null);
  }

  async function createItem() {
    if (!newItem.title || !newItem.body) return;
    setSaving(true);
    try {
      const r = await api<{ item: KnowledgeItem }>("/api/knowledge", {
        method: "POST",
        body: JSON.stringify({ ...newItem, tags: newItem.tags.split(",").map(t => t.trim()).filter(Boolean) }),
      });
      setItems(prev => [r.item, ...prev]);
      setNewItem({ type: "lesson", title: "", body: "", tags: "" });
      setShowCreate(false);
    } catch {}
    setSaving(false);
  }

  async function deleteItem(id: string) {
    await api(`/api/knowledge?id=${id}`, { method: "DELETE" }).catch(() => {});
    setItems(prev => prev.filter(i => i.id !== id));
    if (expanded === id) setExpanded(null);
  }

  const filtered = items.filter(item => {
    if (filter !== "ALL" && item.type !== filter) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.body.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const typeCounts: Record<string, number> = { ALL: items.length };
  for (const item of items) typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="label">Knowledge Base</div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge Extraction</h1>
          <p className="mt-1 text-sm text-slate">Automatically convert completed decisions into reusable principles, lessons, patterns, and checklists.</p>
        </div>
        <button onClick={() => setShowCreate(v => !v)} className="btn-primary text-sm shrink-0">+ Add</button>
      </div>

      {/* Manual create */}
      {showCreate && (
        <div className="card space-y-3">
          <div className="label">Add Knowledge Item</div>
          <select className="input text-sm py-2" value={newItem.type} onChange={e => setNewItem(p => ({ ...p, type: e.target.value as KnowledgeItemType }))}>
            {Object.entries(TYPE_STYLE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input className="input text-sm" placeholder="Title" value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))} />
          <textarea className="input text-sm min-h-[80px] resize-none" placeholder="Body / description" value={newItem.body} onChange={e => setNewItem(p => ({ ...p, body: e.target.value }))} />
          <input className="input text-sm" placeholder="Tags (comma-separated)" value={newItem.tags} onChange={e => setNewItem(p => ({ ...p, tags: e.target.value }))} />
          <div className="flex gap-2">
            <button onClick={createItem} disabled={!newItem.title || !newItem.body || saving} className="btn-primary text-sm">{saving ? "Saving…" : "Save"}</button>
            <button onClick={() => setShowCreate(false)} className="btn-ghost text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Extract from decisions */}
      {hyps.length > 0 && (
        <div className="card space-y-2">
          <div className="label">Extract from Decisions</div>
          <p className="text-xs text-slate">Automatically extract lessons, principles, and patterns from completed decisions.</p>
          <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
            {hyps.map(h => (
              <div key={h.id} className="flex items-center gap-2 py-1">
                <span className="text-xs text-steel flex-1 truncate">{h.title}</span>
                <button
                  onClick={() => extract(h.id)}
                  disabled={extracting === h.id}
                  className="text-xs text-amber hover:underline shrink-0"
                >
                  {extracting === h.id ? "Extracting…" : "Extract →"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        {["ALL", "principle", "lesson", "pattern", "checklist"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`pill text-xs capitalize transition-colors ${filter === f ? "bg-amber text-obsidian" : "bg-white/8 text-slate hover:text-ivory"}`}>
            {f === "ALL" ? "All" : TYPE_STYLE[f as KnowledgeItemType].label} ({typeCounts[f] || 0})
          </button>
        ))}
        <input className="input text-sm py-1 flex-1 min-w-[140px]" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Items */}
      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="card h-16 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-6 space-y-2">
          <p className="text-sm text-slate">{items.length === 0 ? "No knowledge items yet. Extract from decisions above." : "No items match your filters."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const style = TYPE_STYLE[item.type];
            return (
              <div key={item.id} className="card border border-border-hair">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`pill text-[10px] ${style.pill}`}>{style.icon} {style.label}</span>
                      <button onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                        className="text-sm font-semibold text-steel hover:text-ivory text-left">{item.title}</button>
                    </div>
                    {item.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.tags.map(t => <span key={t} className="pill bg-white/5 text-slate text-[10px]">{t}</span>)}
                      </div>
                    )}
                    {expanded === item.id && (
                      <div className="mt-2 text-xs text-steel whitespace-pre-wrap leading-relaxed border-t border-border-hair pt-2">{item.body}</div>
                    )}
                    <div className="mt-1 flex gap-2">
                      {item.hypothesisId && <Link href={`/report/${item.hypothesisId}`} className="text-xs text-amber hover:underline">View Decision →</Link>}
                      <span className="data text-xs text-slate">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button onClick={() => deleteItem(item.id)} className="text-slate hover:text-kill text-xs shrink-0">✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(TYPE_STYLE).map(([type, style]) => (
          <div key={type} className="card text-center">
            <div className="data text-xl font-bold text-ivory">{typeCounts[type] || 0}</div>
            <div className="label mt-1">{style.label}s</div>
          </div>
        ))}
      </div>
    </div>
  );
}
