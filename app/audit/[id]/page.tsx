"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { api } from "@/lib/client";
import { VerdictPill, Bar } from "@/components/Verdict";

type AuditResponse = {
  hypothesis: any;
  project: any | null;
  latestVerdict: any | null;
  eventCount: number;
  timeline: AuditEvent[];
};

type AuditEvent =
  | { type: "hypothesis_created"; at: string; data: any }
  | { type: "experiments_designed"; at: string; data: any[] }
  | { type: "evidence_recorded"; at: string; data: any }
  | { type: "verdict_rendered"; at: string; data: any }
  | { type: "report_generated"; at: string; data: any };

const EVENT_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  hypothesis_created: { label: "Hypothesis created", icon: "◈", color: "text-white" },
  experiments_designed: { label: "Experiments designed", icon: "⚙", color: "text-blue-400" },
  evidence_recorded: { label: "Evidence recorded", icon: "⊕", color: "text-yellow-400" },
  verdict_rendered: { label: "Verdict rendered", icon: "⚖", color: "text-white" },
  report_generated: { label: "Report generated", icon: "▤", color: "text-green-400" },
};

export default function AuditDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<AuditResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    api(`/api/hypotheses/${id}/audit`)
      .then((r: AuditResponse) => setData(r))
      .catch((e) => setErr(e.message || String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const toggle = (i: number) =>
    setExpanded((p) => {
      const n = new Set(p);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  if (loading) return <p className="card text-sm text-gray-400">Loading audit trail…</p>;
  if (err) return <p className="card text-sm text-kill">{err}</p>;
  if (!data) return null;

  const { hypothesis, project, latestVerdict, timeline } = data;

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="card space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link href="/audit" className="text-xs text-gray-500 hover:text-white">← Audit Index</Link>
            <h1 className="mt-1 text-lg font-bold leading-snug">{hypothesis.title}</h1>
            {project && <p className="text-xs text-gray-500 mt-0.5">Project: {project.name}</p>}
          </div>
          {latestVerdict && (
            <div className="flex flex-col items-end gap-1 shrink-0">
              <VerdictPill verdict={latestVerdict.finalVerdict} />
              <span className="text-[10px] text-gray-500">
                {latestVerdict.band} {latestVerdict.calibration}/100
              </span>
            </div>
          )}
        </div>

        {/* Decomposition */}
        <div className="flex flex-wrap gap-1.5">
          {(hypothesis.kinds || []).map((k: string) => (
            <span key={k} className="pill bg-white/10 text-xs">{k}</span>
          ))}
          <span className={`pill text-xs ${hypothesis.requiresGeneralization ? "verdict-UNRESOLVED" : "bg-white/10"}`}>
            {hypothesis.requiresGeneralization ? "requires generalization" : "scoped"}
          </span>
        </div>

        <p className="text-xs text-gray-500">
          {timeline.length} events · created {new Date(hypothesis.createdAt).toLocaleString()}
        </p>
      </section>

      {/* Timeline */}
      <section className="card space-y-0 pb-0">
        <p className="label mb-3">Decision Timeline</p>
        <div className="relative">
          {/* Vertical connector line */}
          <div className="absolute left-[15px] top-0 bottom-0 w-px bg-white/10" />

          <div className="space-y-0">
            {timeline.map((event, i) => {
              const cfg = EVENT_CONFIG[event.type] ?? { label: event.type, icon: "·", color: "text-gray-400" };
              const isExpanded = expanded.has(i);
              const isLast = i === timeline.length - 1;

              return (
                <div key={i} className={`relative pl-10 ${isLast ? "pb-4" : "pb-4"}`}>
                  {/* Node dot */}
                  <div className={`absolute left-[8px] top-[2px] w-[15px] h-[15px] rounded-full border-2 border-ink flex items-center justify-center text-[9px] ${cfg.color} bg-ink`}>
                    {cfg.icon}
                  </div>

                  <button
                    className="w-full text-left"
                    onClick={() => toggle(i)}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-[10px] text-gray-500 shrink-0">
                        {new Date(event.at).toLocaleString()}
                      </span>
                    </div>

                    {/* Collapsed summary */}
                    {!isExpanded && (
                      <EventSummary event={event} />
                    )}
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="mt-2">
                      <EventDetail event={event} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-2">
        <Link href="/workflow" className="btn flex-1 text-center text-sm">New workflow</Link>
        <Link href="/audit" className="btn flex-1 text-center text-sm bg-white/5">← Index</Link>
      </div>
    </div>
  );
}

function EventSummary({ event }: { event: AuditEvent }) {
  switch (event.type) {
    case "hypothesis_created":
      return (
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {event.data.assumptions?.length ?? 0} assumptions · {event.data.confounds?.length ?? 0} confounds
        </p>
      );
    case "experiments_designed":
      return (
        <p className="text-xs text-gray-500 mt-0.5">
          {event.data.length} experiment plans
        </p>
      );
    case "evidence_recorded":
      return (
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {event.data.label} · effect {event.data.evidence?.effect?.toFixed(2) ?? "—"}
        </p>
      );
    case "verdict_rendered":
      return (
        <div className="mt-1 flex items-center gap-2">
          <VerdictPill verdict={event.data.finalVerdict} />
          <span className="text-xs text-gray-500">
            support {event.data.support?.toFixed(2)} · {event.data.band} {event.data.calibration}/100
          </span>
        </div>
      );
    case "report_generated":
      return (
        <p className="text-xs text-gray-500 mt-0.5 truncate">{event.data.title}</p>
      );
    default:
      return null;
  }
}

function EventDetail({ event }: { event: AuditEvent }) {
  switch (event.type) {
    case "hypothesis_created": {
      const h = event.data;
      return (
        <div className="space-y-2 text-sm">
          <Detail label="Assumptions" items={h.assumptions} />
          <Detail label="Confounds" items={h.confounds} />
          <Detail label="Kinds" items={h.kinds} />
        </div>
      );
    }
    case "experiments_designed": {
      return (
        <div className="space-y-2">
          {event.data.map((exp: any, i: number) => (
            <div key={i} className="rounded-xl bg-black/30 p-2 text-sm">
              <div className="font-semibold text-xs">{exp.tier} <span className="text-gray-500 font-normal">· {exp.cost}</span></div>
              <p className="text-xs text-gray-400 mt-0.5">{exp.purpose}</p>
              <ul className="mt-1 list-disc pl-4 text-xs text-gray-300">
                {(exp.steps || []).map((s: string, j: number) => <li key={j}>{s}</li>)}
              </ul>
            </div>
          ))}
        </div>
      );
    }
    case "evidence_recorded": {
      const ev = event.data.evidence || {};
      const fields = [
        ["Effect", ev.effect],
        ["Replication", ev.replication],
        ["Hostile survival", ev.hostileSurvival],
        ["Confound control", ev.confoundControl],
        ["Generalization", ev.generalization],
        ["Power", ev.power],
      ];
      return (
        <div className="space-y-1.5">
          <p className="text-xs text-gray-400">{event.data.label}</p>
          {fields.map(([label, val]) =>
            typeof val === "number" ? (
              <div key={label as string} className="text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-white">{(val as number).toFixed(2)}</span>
                </div>
                <Bar value={val as number} label={label as string} />
              </div>
            ) : null
          )}
          <p className="text-xs text-gray-500 mt-1">
            CI excludes null: {ev.ciExcludesNull ? "YES" : "NO"} ·
            Requires generalization: {ev.claimRequiresGeneralization ? "YES" : "NO"}
          </p>
        </div>
      );
    }
    case "verdict_rendered": {
      const v = event.data;
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <VerdictPill verdict={v.finalVerdict} />
            <span className="text-xs text-gray-400">
              support {v.support?.toFixed(2)} · {v.band} {v.calibration}/100
            </span>
          </div>
          {v.finalVerdict !== v.verdict && (
            <p className="text-xs text-unresolved">
              Downgraded from {v.verdict} by self-critique
            </p>
          )}
          <Detail label="Reasons" items={v.reasons} />
        </div>
      );
    }
    case "report_generated": {
      const r = event.data;
      return (
        <div className="space-y-1">
          <p className="text-xs text-gray-400">{r.aiAssisted ? "AI-assisted" : "Deterministic"}</p>
          <pre className="table-scroll whitespace-pre-wrap rounded-xl bg-black/40 p-2 text-[10px] text-gray-300 max-h-48 overflow-y-auto">
            {r.markdown}
          </pre>
        </div>
      );
    }
    default:
      return null;
  }
}

function Detail({ label, items }: { label: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400">{label}</p>
      <ul className="mt-0.5 list-disc pl-4 text-xs text-gray-300 space-y-0.5">
        {items.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    </div>
  );
}
