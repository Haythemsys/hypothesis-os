"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type EventCounts = Record<string, number>;

const EVENT_LABELS: Record<string, string> = {
  landing_view: "Landing page views",
  demo_viewed: "Demo views",
  demo_started: "Demo → engine clicked",
  onboarding_started: "Onboarding started",
  onboarding_completed: "Onboarding completed",
  decision_created: "Decisions created",
  report_generated: "Reports generated",
  export_clicked: "Exports clicked",
  beta_signup: "Beta signups",
  pricing_interest: "Pricing interest clicks",
};

const FUNNEL = [
  "landing_view",
  "demo_viewed",
  "onboarding_started",
  "decision_created",
  "report_generated",
  "beta_signup",
];

export default function AdminAnalyticsPage() {
  const [counts, setCounts] = useState<EventCounts>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => setCounts(d.counts || {}))
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  const funnelSteps = FUNNEL.map((name) => ({ name, count: counts[name] || 0, label: EVENT_LABELS[name] || name }));
  const maxFunnel = Math.max(...funnelSteps.map((s) => s.count), 1);

  const otherEvents = Object.entries(counts)
    .filter(([name]) => !FUNNEL.includes(name))
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="min-h-screen bg-obsidian text-ivory p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate uppercase tracking-wide mb-1">Admin</div>
            <h1 className="text-2xl font-bold">Product Analytics</h1>
          </div>
          <Link href="/admin/beta" className="btn-ghost text-sm">Beta Signups →</Link>
        </div>

        {loading && <p className="text-steel text-sm">Loading…</p>}
        {error && <p className="text-kill text-sm">{error}</p>}

        {!loading && !error && (
          <>
            <div className="rounded border border-graphite bg-graphite/20 p-4 text-center">
              <div className="text-4xl font-black text-amber">{total.toLocaleString()}</div>
              <div className="text-xs text-slate mt-1">Total events tracked</div>
            </div>

            {/* Conversion funnel */}
            <div>
              <h2 className="text-sm font-semibold text-ivory mb-4">Conversion Funnel</h2>
              <div className="space-y-2">
                {funnelSteps.map((step, i) => {
                  const pct = maxFunnel > 0 ? Math.round((step.count / maxFunnel) * 100) : 0;
                  const convPct = i > 0 && funnelSteps[i - 1].count > 0
                    ? Math.round((step.count / funnelSteps[i - 1].count) * 100)
                    : null;
                  return (
                    <div key={step.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-steel">{step.label}</span>
                        <div className="flex items-center gap-3">
                          {convPct !== null && (
                            <span className={`text-[10px] ${convPct >= 50 ? "text-go" : convPct >= 20 ? "text-unresolved" : "text-kill"}`}>
                              {convPct}% of prev
                            </span>
                          )}
                          <span className="text-ivory font-medium w-10 text-right">{step.count}</span>
                        </div>
                      </div>
                      <div className="h-5 bg-graphite rounded overflow-hidden">
                        <div
                          className="h-full bg-amber/60 rounded transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* All event counts */}
            <div>
              <h2 className="text-sm font-semibold text-ivory mb-4">All Events</h2>
              <div className="rounded border border-graphite overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-graphite">
                    <tr className="text-left">
                      <th className="px-3 py-2 text-xs text-slate font-medium">Event</th>
                      <th className="px-3 py-2 text-xs text-slate font-medium text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(counts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([name, count]) => (
                        <tr key={name} className="border-b border-graphite/40 hover:bg-graphite/10">
                          <td className="px-3 py-2 text-steel">{EVENT_LABELS[name] || name}</td>
                          <td className="px-3 py-2 text-ivory font-medium text-right">{count}</td>
                        </tr>
                      ))}
                    {Object.keys(counts).length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-3 py-6 text-center text-slate text-sm">
                          No events recorded yet. Events fire automatically as users interact with the product.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {otherEvents.length > 0 && (
              <p className="text-xs text-slate">
                {otherEvents.length} additional event type(s) tracked: {otherEvents.map(([n]) => n).join(", ")}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
