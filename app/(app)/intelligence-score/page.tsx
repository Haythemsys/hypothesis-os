"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/client";

type Score = { decisionQuality: number; evidenceQuality: number; riskDiscipline: number; learningVelocity: number; consistency: number; total: number };
type Snapshot = Score & { id: string; orgId: string; recordedAt: string };

const DIMENSIONS: { key: keyof Score; label: string; description: string; weight: string }[] = [
  { key: "decisionQuality", label: "Decision Quality", description: "Fraction of decisions that reached a GO or KILL verdict (resolved).", weight: "25%" },
  { key: "evidenceQuality", label: "Evidence Quality", description: "Average evidence coverage across all decisions (inverse of evidence debt).", weight: "30%" },
  { key: "riskDiscipline", label: "Risk Discipline", description: "Average risk management quality (inverse of average risk score).", weight: "20%" },
  { key: "learningVelocity", label: "Learning Velocity", description: "Decision cadence in the last 3 months — measures organizational speed.", weight: "10%" },
  { key: "consistency", label: "Consistency", description: "Low variance in support scores indicates consistent decision-making standards.", weight: "15%" },
];

function scoreLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 85) return { label: "Elite", color: "text-go", bg: "bg-go/15" };
  if (score >= 70) return { label: "Strong", color: "text-go", bg: "bg-go/10" };
  if (score >= 55) return { label: "Developing", color: "text-amber", bg: "bg-amber/10" };
  if (score >= 35) return { label: "Needs Work", color: "text-unresolved", bg: "bg-amber/8" };
  return { label: "Early Stage", color: "text-kill", bg: "bg-kill/8" };
}

export default function IntelligenceScore() {
  const [score, setScore] = useState<Score | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    api<{ score: Score | null; snapshots: Snapshot[] }>("/api/intelligence-score")
      .then(r => { setScore(r.score); setSnapshots(r.snapshots || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function saveSnapshot() {
    setSaving(true);
    try {
      const r = await api<{ snapshot: Snapshot }>("/api/intelligence-score", { method: "POST" });
      setSnapshots(prev => [...prev, r.snapshot]);
      setSavedMsg(`Snapshot saved at ${new Date(r.snapshot.recordedAt).toLocaleDateString()}`);
      setTimeout(() => setSavedMsg(""), 3000);
    } catch {}
    setSaving(false);
  }

  const info = score ? scoreLabel(score.total) : null;
  const maxSnap = snapshots.length > 0 ? Math.max(...snapshots.map(s => s.total), 1) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="label">Decision Intelligence Score</div>
          <h1 className="text-2xl font-bold tracking-tight">Intelligence Score</h1>
          <p className="mt-1 text-sm text-slate">0–100 composite score measuring your organization's decision intelligence across 5 dimensions.</p>
        </div>
        {score && (
          <button onClick={saveSnapshot} disabled={saving} className="btn-primary text-sm shrink-0">
            {saving ? "Saving…" : "Save Snapshot"}
          </button>
        )}
      </div>

      {savedMsg && <div className="rounded-inner bg-go/10 border border-go/20 px-3 py-2 text-sm text-go">{savedMsg}</div>}

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="card h-20 animate-pulse" />)}</div>
      ) : !score ? (
        <div className="card text-center py-6 space-y-2">
          <p className="text-sm text-slate">No decisions yet to score.</p>
          <Link href="/workflow" className="btn-primary text-sm inline-block">Create First Decision →</Link>
        </div>
      ) : (
        <>
          {/* Total score */}
          <div className={`card flex items-center gap-4 ${info?.bg}`}>
            <div>
              <div className="data text-6xl font-bold" style={{ color: score.total >= 70 ? "#3FB67A" : score.total >= 50 ? "#E8A23D" : "#E5544B" }}>
                {score.total}
              </div>
              <div className="label mt-1">Intelligence Score</div>
            </div>
            <div className="flex-1">
              <div className={`text-xl font-bold ${info?.color}`}>{info?.label}</div>
              <div className="mt-1 h-3 rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ width: `${score.total}%`, backgroundColor: score.total >= 70 ? "#3FB67A" : score.total >= 50 ? "#E8A23D" : "#E5544B" }} />
              </div>
              <div className="mt-1 text-xs text-slate">Weighted composite of 5 dimensions</div>
            </div>
          </div>

          {/* Dimensions */}
          <div className="card space-y-4">
            <div className="label">Dimension Breakdown</div>
            {DIMENSIONS.map(dim => {
              const val = score[dim.key];
              return (
                <div key={dim.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{dim.label}</span>
                      <span className="ml-2 data text-[10px] text-slate">weight {dim.weight}</span>
                    </div>
                    <span className={`data text-sm font-bold ${val >= 70 ? "text-go" : val >= 45 ? "text-amber" : "text-kill"}`}>{val}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: val >= 70 ? "#3FB67A" : val >= 45 ? "#E8A23D" : "#E5544B" }} />
                  </div>
                  <p className="text-xs text-slate">{dim.description}</p>
                </div>
              );
            })}
          </div>

          {/* Benchmarks */}
          <div className="card space-y-3">
            <div className="label">Benchmarks</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: "Elite Orgs", value: 85, color: "#3FB67A" },
                { label: "Strong Orgs", value: 70, color: "#3FB67A" },
                { label: "Average Orgs", value: 50, color: "#E8A23D" },
                { label: "Your Score", value: score.total, color: score.total >= 70 ? "#3FB67A" : score.total >= 50 ? "#E8A23D" : "#E5544B" },
              ].map(b => (
                <div key={b.label} className="card text-center bg-white/2">
                  <div className="data text-xl font-bold" style={{ color: b.color }}>{b.value}</div>
                  <div className="label mt-0.5">{b.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Score history */}
          {snapshots.length > 0 && (
            <div className="card space-y-3">
              <div className="label">Score History ({snapshots.length} snapshots)</div>
              <div className="flex items-end gap-1.5 h-20">
                {snapshots.slice(-12).map((snap, i) => (
                  <div key={snap.id} className="flex-1 flex flex-col items-center gap-0.5">
                    <div className="w-full rounded-sm transition-all" style={{
                      height: `${(snap.total / maxSnap) * 64}px`,
                      minHeight: 4,
                      backgroundColor: snap.total >= 70 ? "#3FB67A" : snap.total >= 50 ? "#E8A23D" : "#E5544B",
                    }} title={`${snap.total} on ${new Date(snap.recordedAt).toLocaleDateString()}`} />
                    <span className="data text-[9px] text-slate">{new Date(snap.recordedAt).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate">Save snapshots regularly to track your organization's intelligence growth over time.</p>
            </div>
          )}

          {/* Improvement tips */}
          <div className="card space-y-2">
            <div className="label">How to Improve</div>
            <div className="space-y-2">
              {score.evidenceQuality < 70 && (
                <div className="rounded-inner bg-amber/8 border border-amber/20 p-2.5 text-xs text-steel">
                  <span className="font-semibold text-amber">Evidence Quality ({score.evidenceQuality}): </span>
                  Collect evidence across all dimensions before reaching a verdict. Use the Evidence Assistant to identify gaps.
                </div>
              )}
              {score.decisionQuality < 70 && (
                <div className="rounded-inner bg-amber/8 border border-amber/20 p-2.5 text-xs text-steel">
                  <span className="font-semibold text-amber">Decision Quality ({score.decisionQuality}): </span>
                  Resolve more decisions to GO or KILL. Time-box unresolved decisions to force a verdict.
                </div>
              )}
              {score.riskDiscipline < 70 && (
                <div className="rounded-inner bg-amber/8 border border-amber/20 p-2.5 text-xs text-steel">
                  <span className="font-semibold text-amber">Risk Discipline ({score.riskDiscipline}): </span>
                  Use the Premortem Engine before GO decisions. Mitigation plans lower risk scores.
                </div>
              )}
              {score.learningVelocity < 50 && (
                <div className="rounded-inner bg-amber/8 border border-amber/20 p-2.5 text-xs text-steel">
                  <span className="font-semibold text-amber">Learning Velocity ({score.learningVelocity}): </span>
                  Increase decision cadence. The goal is 2–4 decisions per month per team.
                </div>
              )}
              {score.total >= 70 && (
                <div className="rounded-inner bg-go/8 border border-go/20 p-2.5 text-xs text-go">
                  ✓ Strong performance across dimensions. Focus on maintaining consistency as you scale.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
