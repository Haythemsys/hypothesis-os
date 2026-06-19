"use client";
import { useState, useEffect, useCallback } from "react";
import { api, getIdentity } from "@/lib/client";

type CommentStatus = "open" | "resolved" | "needs_evidence" | "escalated";

type Comment = {
  id: string; orgId: string; hypothesisId: string;
  authorId: string; authorName: string; text: string;
  status: CommentStatus; parentId?: string;
  createdAt: string; resolvedAt?: string;
};

const STATUS_STYLES: Record<CommentStatus, string> = {
  open:           "bg-white/8 text-slate",
  resolved:       "bg-go/15 text-go",
  needs_evidence: "bg-amber/15 text-unresolved",
  escalated:      "bg-kill/15 text-kill",
};

const STATUS_LABELS: Record<CommentStatus, string> = {
  open: "Open", resolved: "Resolved", needs_evidence: "Needs Evidence", escalated: "Escalated",
};

export function CommentThread({ hypothesisId }: { hypothesisId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | CommentStatus>("all");

  const load = useCallback(() => {
    api<{ comments: Comment[] }>(`/api/hypotheses/${hypothesisId}/comments`)
      .then((r) => setComments(r.comments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hypothesisId]);

  useEffect(() => {
    load();
    // Prefill author name from identity
    const id = getIdentity();
    const stored = typeof window !== "undefined" ? localStorage.getItem("hypothesisos.displayName") : null;
    setAuthorName(stored || id.userId.slice(0, 8));
  }, [load]);

  const submit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      await api(`/api/hypotheses/${hypothesisId}/comments`, {
        method: "POST",
        body: { text: text.trim(), authorName: authorName || "Member", parentId: replyTo ?? undefined },
      });
      setText("");
      setReplyTo(null);
      if (authorName) {
        try { localStorage.setItem("hypothesisos.displayName", authorName); } catch {}
      }
      load();
    } catch { /* ignore */ } finally { setSubmitting(false); }
  };

  const setStatus = async (commentId: string, status: CommentStatus) => {
    await api(`/api/hypotheses/${hypothesisId}/comments`, {
      method: "PATCH",
      body: { commentId, status },
    });
    load();
  };

  const roots = comments.filter((c) => !c.parentId).filter((c) => filter === "all" || c.status === filter);
  const replies = (parentId: string) => comments.filter((c) => c.parentId === parentId);
  const openCount = comments.filter((c) => c.status === "open").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="label">Discussion</div>
        <div className="flex items-center gap-2">
          {openCount > 0 && (
            <span className="pill bg-amber/15 text-unresolved text-[10px]">{openCount} open</span>
          )}
          <div className="flex rounded-btn border border-border-hair overflow-hidden">
            {(["all", "open", "needs_evidence", "escalated", "resolved"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-1 text-[10px] font-semibold transition-colors ${filter === f ? "bg-amber text-obsidian" : "text-slate hover:text-ivory"}`}
              >
                {f === "all" ? "All" : STATUS_LABELS[f].split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && <div className="h-12 animate-pulse rounded-inner bg-white/3" />}

      {!loading && roots.length === 0 && (
        <p className="text-xs text-slate text-center py-3">No comments yet. Start the discussion.</p>
      )}

      {roots.map((c) => (
        <div key={c.id} className="space-y-2">
          <CommentCard
            comment={c}
            onReply={() => setReplyTo(replyTo === c.id ? null : c.id)}
            onStatusChange={(s) => setStatus(c.id, s)}
            isReplying={replyTo === c.id}
          />
          {replies(c.id).map((r) => (
            <div key={r.id} className="ml-8">
              <CommentCard comment={r} onStatusChange={(s) => setStatus(r.id, s)} />
            </div>
          ))}
          {replyTo === c.id && (
            <div className="ml-8 rounded-inner border border-amber/20 bg-amber/5 p-3 space-y-2">
              <p className="text-xs text-amber">Replying to {c.authorName}</p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write reply…"
                rows={2}
                className="input text-sm resize-none"
              />
              <div className="flex gap-2">
                <button onClick={submit} disabled={!text.trim() || submitting} className="btn-primary py-1 text-xs disabled:opacity-40">
                  {submitting ? "…" : "Reply"}
                </button>
                <button onClick={() => setReplyTo(null)} className="btn-ghost py-1 text-xs">Cancel</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* New comment form */}
      {!replyTo && (
        <div className="rounded-inner border border-border-hair p-3 space-y-2">
          <input
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name (optional)"
            className="input text-sm py-1.5"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add comment, challenge, or evidence request…"
            rows={3}
            className="input text-sm resize-none"
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={submit} disabled={!text.trim() || submitting} className="btn-primary text-sm py-2 disabled:opacity-40">
              {submitting ? "Posting…" : "Post Comment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentCard({ comment, onReply, onStatusChange, isReplying }: {
  comment: Comment;
  onReply?: () => void;
  onStatusChange: (s: CommentStatus) => void;
  isReplying?: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const statusCls = STATUS_STYLES[comment.status] ?? "bg-white/8 text-slate";

  return (
    <div className={`rounded-inner bg-white/3 px-3 py-2.5 space-y-2 ${isReplying ? "border border-amber/30" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber/20 text-[10px] font-bold text-amber">
            {comment.authorName.slice(0, 1).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-ivory">{comment.authorName}</span>
          <span className={`pill text-[9px] ${statusCls}`}>{STATUS_LABELS[comment.status]}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-slate">{new Date(comment.createdAt).toLocaleDateString()}</span>
          <div className="relative">
            <button onClick={() => setShowMenu((v) => !v)} className="text-slate hover:text-ivory text-xs">⋯</button>
            {showMenu && (
              <div className="absolute right-0 top-5 z-10 rounded-inner border border-border-hair bg-graphite shadow-lg min-w-[140px]">
                {(["open", "resolved", "needs_evidence", "escalated"] as CommentStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => { onStatusChange(s); setShowMenu(false); }}
                    className="block w-full px-3 py-1.5 text-left text-xs text-steel hover:bg-white/5 hover:text-ivory"
                  >
                    Mark as {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="text-sm text-steel whitespace-pre-wrap">{comment.text}</p>
      {onReply && (
        <button onClick={onReply} className="text-[10px] text-slate hover:text-amber transition-colors">
          Reply →
        </button>
      )}
    </div>
  );
}
