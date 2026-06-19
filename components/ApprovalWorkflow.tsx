"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/client";

type ApprovalStatus = "draft" | "under_review" | "approved" | "rejected" | "archived";

type Approval = {
  id: string; orgId: string; hypothesisId: string;
  status: ApprovalStatus; submittedBy: string;
  reviewerId?: string; executiveId?: string;
  reviewerNotes?: string; executiveNotes?: string;
  submittedAt?: string; reviewedAt?: string; executiveAt?: string;
  createdAt: string;
};

const LIFECYCLE: { status: ApprovalStatus; label: string; icon: string }[] = [
  { status: "draft",        label: "Draft",        icon: "○" },
  { status: "under_review", label: "Under Review", icon: "⟳" },
  { status: "approved",     label: "Approved",     icon: "✓" },
];

const STATUS_STYLES: Record<ApprovalStatus, string> = {
  draft:        "bg-white/8 text-slate",
  under_review: "bg-amber/15 text-unresolved",
  approved:     "bg-go/15 text-go",
  rejected:     "bg-kill/15 text-kill",
  archived:     "bg-white/5 text-slate",
};

const STATUS_LABELS: Record<ApprovalStatus, string> = {
  draft: "Draft", under_review: "Under Review", approved: "Approved",
  rejected: "Rejected", archived: "Archived",
};

export function ApprovalWorkflow({ hypothesisId }: { hypothesisId: string }) {
  const [approval, setApproval] = useState<Approval | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api<{ approval: Approval | null }>(`/api/hypotheses/${hypothesisId}/approval`)
      .then((r) => setApproval(r.approval))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hypothesisId]);

  useEffect(() => { load(); }, [load]);

  const act = async (action: string) => {
    setBusy(true);
    try {
      await api(`/api/hypotheses/${hypothesisId}/approval`, {
        method: "POST",
        body: { action, notes: notes || undefined },
      });
      setNotes("");
      load();
    } catch { /* ignore */ } finally { setBusy(false); }
  };

  const status = approval?.status ?? "draft";
  const stepIndex = LIFECYCLE.findIndex((s) => s.status === status);

  if (loading) return <div className="h-10 animate-pulse rounded-inner bg-white/3" />;

  return (
    <div className="space-y-4">
      <div className="label">Approval Status</div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {LIFECYCLE.map((step, i) => (
          <div key={step.status} className="flex items-center gap-2 flex-1">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              status === "rejected" && i > 0 ? "bg-kill/15 text-kill" :
              i <= Math.max(0, stepIndex) ? "bg-amber text-obsidian" : "bg-white/8 text-slate"
            }`}>
              {step.icon}
            </div>
            <span className={`hidden sm:block text-xs ${i <= stepIndex ? "text-ivory" : "text-slate"}`}>{step.label}</span>
            {i < LIFECYCLE.length - 1 && (
              <div className={`flex-1 h-px ${i < stepIndex ? "bg-amber" : "bg-border-hair"}`} />
            )}
          </div>
        ))}
        <span className={`pill text-xs shrink-0 ${STATUS_STYLES[status]}`}>{STATUS_LABELS[status]}</span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        {status === "draft" && (
          <button onClick={() => act("submit")} disabled={busy} className="btn-primary text-sm disabled:opacity-40">
            {busy ? "…" : "Submit for Review"}
          </button>
        )}

        {status === "under_review" && (
          <>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reviewer notes (optional)…"
              rows={2}
              className="input text-sm resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => act("review_approve")} disabled={busy} className="btn-primary flex-1 text-sm disabled:opacity-40">
                {busy ? "…" : "Approve"}
              </button>
              <button onClick={() => act("review_reject")} disabled={busy} className="btn-danger flex-1 text-sm disabled:opacity-40">
                {busy ? "…" : "Reject"}
              </button>
            </div>
          </>
        )}

        {(status === "approved" || status === "rejected") && (
          <div className="flex gap-2">
            <button onClick={() => act("reopen")} disabled={busy} className="btn-ghost text-sm disabled:opacity-40">
              Reopen as Draft
            </button>
            <button onClick={() => act("archive")} disabled={busy} className="btn-quiet text-sm disabled:opacity-40">
              Archive
            </button>
          </div>
        )}

        {status === "archived" && (
          <button onClick={() => act("reopen")} disabled={busy} className="btn-ghost text-sm disabled:opacity-40">
            Reopen
          </button>
        )}
      </div>

      {/* History */}
      {approval && (
        <div className="space-y-1 text-[11px] text-slate">
          {approval.submittedAt && <p>Submitted: {new Date(approval.submittedAt).toLocaleString()}</p>}
          {approval.reviewedAt && <p>Reviewed: {new Date(approval.reviewedAt).toLocaleString()}</p>}
          {approval.reviewerNotes && <p className="text-steel">Notes: {approval.reviewerNotes}</p>}
          {approval.executiveNotes && <p className="text-steel">Executive: {approval.executiveNotes}</p>}
        </div>
      )}
    </div>
  );
}
