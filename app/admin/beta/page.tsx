"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type Signup = {
  id: string;
  name: string;
  email: string;
  role: string;
  useCase: string;
  company: string;
  decisionType: string;
  createdAt: string;
};

function toCSV(signups: Signup[]): string {
  const header = ["ID", "Name", "Email", "Role", "Company", "Decision Type", "Use Case", "Signed Up"];
  const rows = signups.map((s) => [
    s.id, s.name, s.email, s.role, s.company, s.decisionType, s.useCase,
    new Date(s.createdAt).toLocaleString(),
  ]);
  return [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function downloadCSV(data: string, filename: string) {
  const blob = new Blob([data], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AdminBetaPage() {
  const [signups, setSignups] = useState<Signup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/beta-signups")
      .then((r) => r.json())
      .then((d) => { setSignups(d.signups || []); })
      .catch(() => setError("Failed to load signups"))
      .finally(() => setLoading(false));
  }, []);

  const roleBreakdown = signups.reduce((acc, s) => {
    const k = s.role || "Unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const useCaseBreakdown = signups.reduce((acc, s) => {
    const k = s.useCase || "Not specified";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-obsidian text-ivory p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate uppercase tracking-wide mb-1">Admin</div>
            <h1 className="text-2xl font-bold">Beta Signups</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/analytics" className="btn-ghost text-sm">Analytics →</Link>
            <button
              className="btn-primary text-sm"
              onClick={() => downloadCSV(toCSV(signups), `beta-signups-${new Date().toISOString().split("T")[0]}.csv`)}
              disabled={signups.length === 0}
            >
              Export CSV
            </button>
          </div>
        </div>

        {loading && <p className="text-steel text-sm">Loading…</p>}
        {error && <p className="text-kill text-sm">{error}</p>}

        {!loading && !error && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded border border-graphite bg-graphite/20 p-4 text-center">
                <div className="text-3xl font-black text-amber">{signups.length}</div>
                <div className="text-xs text-slate mt-1">Total signups</div>
              </div>
              <div className="rounded border border-graphite bg-graphite/20 p-4">
                <div className="text-xs text-slate uppercase tracking-wide mb-2">By role</div>
                {Object.entries(roleBreakdown).sort(([, a], [, b]) => b - a).slice(0, 4).map(([r, n]) => (
                  <div key={r} className="flex justify-between text-sm">
                    <span className="text-steel">{r}</span>
                    <span className="text-ivory font-medium">{n}</span>
                  </div>
                ))}
              </div>
              <div className="rounded border border-graphite bg-graphite/20 p-4">
                <div className="text-xs text-slate uppercase tracking-wide mb-2">By use case</div>
                {Object.entries(useCaseBreakdown).sort(([, a], [, b]) => b - a).slice(0, 3).map(([u, n]) => (
                  <div key={u} className="flex justify-between text-sm">
                    <span className="text-steel truncate max-w-[150px]">{u}</span>
                    <span className="text-ivory font-medium shrink-0 ml-2">{n}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Signups table */}
            {signups.length === 0 ? (
              <div className="rounded border border-graphite p-8 text-center text-steel text-sm">
                No signups yet. Share <code className="text-amber">/beta</code> to collect them.
              </div>
            ) : (
              <div className="rounded border border-graphite overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-graphite">
                    <tr className="text-left">
                      {["Name", "Email", "Role", "Company", "Decision Type", "Use Case", "Date"].map((h) => (
                        <th key={h} className="px-3 py-2 text-xs text-slate font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {signups.map((s) => (
                      <tr key={s.id} className="border-b border-graphite/40 hover:bg-graphite/10">
                        <td className="px-3 py-2 text-ivory">{s.name}</td>
                        <td className="px-3 py-2 text-steel">{s.email}</td>
                        <td className="px-3 py-2 text-steel">{s.role || "—"}</td>
                        <td className="px-3 py-2 text-steel">{s.company || "—"}</td>
                        <td className="px-3 py-2 text-steel">{s.decisionType || "—"}</td>
                        <td className="px-3 py-2 text-steel max-w-xs truncate">{s.useCase || "—"}</td>
                        <td className="px-3 py-2 text-slate text-xs whitespace-nowrap">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
