import Link from "next/link";
import { classify, BAPA_HYPOTHESES, MAJOR_IDS } from "@/lib/core";
import { VerdictPill } from "@/components/Verdict";

export default function Dashboard() {
  const results = BAPA_HYPOTHESES.map((h) => ({ h, r: classify(h.evidence) }));
  const counts = results.reduce<Record<string, number>>((a, { r }) => {
    a[r.verdict] = (a[r.verdict] || 0) + 1; return a;
  }, {});
  const majorCorrect = results.filter(({ h, r }) => MAJOR_IDS.includes(h.id) && r.verdict === h.expected).length;

  const tiles = [
    { href: "/lab", t: "Hypothesis Lab", d: "Decompose a claim into assumptions, confounds, variables." },
    { href: "/experiments", t: "Experiment Engine", d: "Generate cheap / strong / hostile tests." },
    { href: "/evidence", t: "Evidence Engine", d: "Score evidence → GO / KILL / UNRESOLVED." },
    { href: "/graph", t: "Knowledge Graph", d: "Hypotheses, dependencies, contradictions." },
    { href: "/archive", t: "Research Archive", d: "Indexed local research (BAPA, R1–R20)." },
    { href: "/benchmark", t: "BAPA Benchmark", d: "Self-validation against known outcomes." },
  ];

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-xl font-bold">Decision engine</h1>
        <p className="mt-1 text-sm text-gray-400">
          Input a hypothesis → output a verdict with evidence. Not a chat. Every claim is pushed toward
          <span className="text-go"> GO</span>, <span className="text-kill">KILL</span>, or
          <span className="text-unresolved"> UNRESOLVED</span>.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Stat n={counts.GO || 0} label="GO" cls="text-go" />
        <Stat n={counts.KILL || 0} label="KILL" cls="text-kill" />
        <Stat n={counts.UNRESOLVED || 0} label="UNRESOLVED" cls="text-unresolved" />
      </section>

      <section className="card flex items-center justify-between">
        <div>
          <div className="label">Self-validation (major BAPA hypotheses)</div>
          <div className="text-2xl font-black">{majorCorrect}/{MAJOR_IDS.length} correct</div>
        </div>
        <Link href="/benchmark" className="btn">Open ›</Link>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tiles.map((x) => (
          <Link key={x.href} href={x.href} className="card active:bg-white/5">
            <div className="font-semibold">{x.t}</div>
            <div className="mt-1 text-sm text-gray-400">{x.d}</div>
          </Link>
        ))}
      </section>

      <section className="card">
        <div className="label mb-2">Latest verdicts</div>
        <ul className="space-y-2">
          {results.slice(0, 4).map(({ h, r }) => (
            <li key={h.id} className="flex items-center gap-2 text-sm">
              <VerdictPill verdict={r.verdict} />
              <span className="truncate text-gray-300">{h.title}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ n, label, cls }: { n: number; label: string; cls: string }) {
  return (
    <div className="card text-center">
      <div className={`text-3xl font-black ${cls}`}>{n}</div>
      <div className="label mt-1">{label}</div>
    </div>
  );
}
