import Link from "next/link";

const TOOLS = [
  { href: "/dashboard",   t: "Project Dashboard",    d: "Aggregate view: GO/KILL/UNRESOLVED counts, recent verdicts",         icon: "▦" },
  { href: "/compare",     t: "Benchmark Compare",     d: "Side-by-side comparison of two hypotheses on key metrics",           icon: "⇄" },
  { href: "/lab",         t: "Hypothesis Lab",        d: "Decompose a claim into assumptions & confounds",                     icon: "⚗" },
  { href: "/experiments", t: "Experiment Engine",     d: "Cheap / strong / hostile test plans",                               icon: "⚙" },
  { href: "/audit",       t: "Decision Audit Trail",  d: "Traceable timeline: hypothesis → evidence → verdict → report",      icon: "⌗" },
  { href: "/graph",       t: "Knowledge Graph",       d: "Dependencies & auto-detected contradictions",                       icon: "◉" },
  { href: "/memory",      t: "Research Memory",       d: "Versioned, traceable hypothesis history",                           icon: "⎘" },
  { href: "/archive",     t: "Research Archive",      d: "Indexed local research files",                                      icon: "▤" },
  { href: "/settings",    t: "Settings",              d: "Model provider, local models, identity",                            icon: "⚙" },
  { href: "/governance",  t: "AI Governance",         d: "What AI may and may not do",                                        icon: "§" },
];

export default function More() {
  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-xl font-bold">More</h1>
        <p className="mt-1 text-sm text-gray-400">Tools, configuration, and governance.</p>
      </section>
      <section className="grid grid-cols-1 gap-3">
        {TOOLS.map((x) => (
          <Link key={x.href} href={x.href} className="card flex items-center gap-3 active:bg-white/5">
            <span className="text-2xl">{x.icon}</span>
            <span>
              <span className="block font-semibold">{x.t}</span>
              <span className="block text-sm text-gray-400">{x.d}</span>
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
