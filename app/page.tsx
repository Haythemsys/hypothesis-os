import Link from "next/link";
import { classify, BAPA_HYPOTHESES, MAJOR_IDS } from "@/lib/core";
import { VerdictPill } from "@/components/Verdict";
import UserDashboard from "@/components/UserDashboard";

export default function Dashboard() {
  const majorCorrect = BAPA_HYPOTHESES.filter(
    (h) => MAJOR_IDS.includes(h.id) && classify(h.evidence).verdict === h.expected
  ).length;

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-xl font-bold">Research cockpit</h1>
        <p className="mt-1 text-sm text-gray-400">
          Input a hypothesis → get a verdict with evidence, calibration, and a self-critique it had
          to survive. The deterministic engine decides; AI only assists.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Link href="/workflow" className="btn bg-white/15 text-center">Start a workflow ›</Link>
          <Link href="/evidence" className="btn text-center">Analyze evidence ›</Link>
        </div>
      </section>

      {/* User's own research — client component fetches /api/dashboard */}
      <UserDashboard />

      <section className="card flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="label">Self-validation (major BAPA hypotheses)</div>
          <div className="text-2xl font-black">{majorCorrect}/{MAJOR_IDS.length} correct</div>
        </div>
        <Link href="/benchmark" className="btn shrink-0">Benchmarks ›</Link>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Tile href="/workflow" t="Workflow" d="Hypothesis → evidence → verdict → report" />
        <Tile href="/lab" t="Hypothesis Lab" d="Decompose a claim into assumptions" />
        <Tile href="/experiments" t="Experiment Engine" d="Cheap / strong / hostile tests" />
        <Tile href="/evidence" t="Evidence Engine" d="Calibrate evidence sliders" />
        <Tile href="/graph" t="Knowledge Graph" d="Contradictions & dependencies" />
        <Tile href="/memory" t="Research Memory" d="Versioned hypotheses" />
        <Tile href="/archive" t="Research Archive" d="218 indexed research files" />
        <Tile href="/settings" t="Settings" d="Model provider & local models" />
      </section>
    </div>
  );
}

function Tile({ href, t, d }: { href: string; t: string; d: string }) {
  return (
    <Link href={href} className="card active:bg-white/5">
      <div className="font-semibold">{t}</div>
      <div className="mt-1 text-sm text-gray-400">{d}</div>
    </Link>
  );
}
