import { classify, BAPA_HYPOTHESES, MAJOR_IDS, DOMAINS, THRESHOLDS } from "@/lib/core";
import { VerdictPill } from "@/components/Verdict";

export default function Benchmark() {
  const bapaRows = BAPA_HYPOTHESES.map((h) => {
    const r = classify(h.evidence);
    return { h, r, ok: r.verdict === h.expected, major: MAJOR_IDS.includes(h.id) };
  });
  const bapaOk = bapaRows.filter((x) => x.ok).length;
  const majors = bapaRows.filter((x) => x.major);
  const majorOk = majors.filter((x) => x.ok).length;

  const domainStats = Object.entries(DOMAINS).map(([domain, list]) => {
    const rows = list.map((h) => ({ h, got: classify(h.evidence).verdict }));
    const ok = rows.filter((x) => x.got === x.h.expected).length;
    return { domain, rows, ok, n: list.length };
  });
  const domTotal = domainStats.reduce((a, d) => a + d.n, 0);
  const domOk = domainStats.reduce((a, d) => a + d.ok, 0);
  const allOk = bapaOk === bapaRows.length && domOk === domTotal;

  return (
    <div className="space-y-4">
      <section className={`card border-2 ${allOk ? "verdict-GO" : "verdict-KILL"}`}>
        <h1 className="text-xl font-bold">Benchmarks</h1>
        <p className="mt-1 text-sm text-gray-400">
          Each hypothesis is encoded as <b>evidence only</b>; the engine never sees the answer, then
          its verdict is scored against the established outcome.
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Stat n={`${bapaOk}/${bapaRows.length}`} label="BAPA" />
          <Stat n={`${majorOk}/${majors.length}`} label="major" />
          <Stat n={`${domOk}/${domTotal}`} label="multi-domain" />
        </div>
        <div className="mt-3 text-center text-sm font-bold">
          {allOk ? "✓ ALL BENCHMARKS PASS" : "✗ some benchmarks failed"}
        </div>
      </section>

      {domainStats.map((d) => (
        <section key={d.domain} className="card">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-semibold">{d.domain}</div>
            <span className={`pill ${d.ok === d.n ? "verdict-GO" : "verdict-KILL"}`}>{d.ok}/{d.n}</span>
          </div>
          <ul className="space-y-2 text-sm">
            {d.rows.map(({ h, got }) => (
              <li key={h.id} className="flex items-center gap-2">
                <VerdictPill verdict={got} />
                <span className="truncate text-gray-300">{h.title}</span>
                {got !== h.expected && <span className="ml-auto text-xs text-kill">exp {h.expected}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="card">
        <div className="label mb-2">BAPA (founding benchmark)</div>
        <ul className="space-y-2 text-sm">
          {bapaRows.map(({ h, r, ok, major }) => (
            <li key={h.id} className="flex items-center gap-2">
              {major && <span className="pill bg-white/10">major</span>}
              <VerdictPill verdict={r.verdict} />
              <span className="truncate text-gray-300">{h.title}</span>
              {!ok && <span className="ml-auto text-xs text-kill">exp {h.expected}</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <div className="label mb-2">Pre-registered thresholds</div>
        <ul className="grid grid-cols-2 gap-1 font-mono text-xs text-gray-400">
          {Object.entries(THRESHOLDS).map(([k, v]) => <li key={k}>{k} = {String(v)}</li>)}
        </ul>
      </section>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-xl bg-black/30 p-3 text-center">
      <div className="text-xl font-black">{n}</div>
      <div className="label">{label}</div>
    </div>
  );
}
