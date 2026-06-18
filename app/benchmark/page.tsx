import { classify, BAPA_HYPOTHESES, MAJOR_IDS, THRESHOLDS } from "@/lib/core";
import { VerdictPill } from "@/components/Verdict";

export default function Benchmark() {
  const rows = BAPA_HYPOTHESES.map((h) => {
    const r = classify(h.evidence);
    return { h, r, ok: r.verdict === h.expected, major: MAJOR_IDS.includes(h.id) };
  });
  const overall = rows.filter((x) => x.ok).length;
  const majors = rows.filter((x) => x.major);
  const majorOk = majors.filter((x) => x.ok).length;
  const met = majorOk === majors.length;

  return (
    <div className="space-y-4">
      <section className={`card border-2 ${met ? "verdict-GO" : "verdict-KILL"}`}>
        <h1 className="text-xl font-bold">BAPA Benchmark</h1>
        <p className="mt-1 text-sm text-gray-400">
          Self-validation. Each BAPA hypothesis is encoded as <b>evidence only</b>; the engine never
          sees the historical answer. Its verdict is then scored against the established outcome.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-black/30 p-3 text-center">
            <div className="text-2xl font-black">{overall}/{rows.length}</div>
            <div className="label">overall</div>
          </div>
          <div className="rounded-xl bg-black/30 p-3 text-center">
            <div className="text-2xl font-black">{majorOk}/{majors.length}</div>
            <div className="label">major (criterion)</div>
          </div>
        </div>
        <div className="mt-3 text-center text-sm font-bold">
          {met ? "✓ SUCCESS CRITERION MET" : "✗ success criterion failed"}
        </div>
      </section>

      <section className="space-y-3">
        {rows.map(({ h, r, ok, major }) => (
          <div key={h.id} className={`card ${ok ? "" : "border-kill"}`}>
            <div className="flex items-center gap-2">
              {major && <span className="pill bg-white/10">major</span>}
              <span className="truncate font-semibold">{h.title}</span>
              <span className="ml-auto text-xs text-gray-500">{ok ? "PASS" : "FAIL"}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="text-gray-500">expected</span>
              <VerdictPill verdict={h.expected} />
              <span className="text-gray-500">got</span>
              <VerdictPill verdict={r.verdict} />
              <span className="ml-auto text-xs text-gray-500">{h.phase}</span>
            </div>
            <div className="mt-2 text-xs text-gray-400">{r.reasons[0]}</div>
          </div>
        ))}
      </section>

      <section className="card">
        <div className="label mb-2">Pre-registered thresholds (the engine's constitution)</div>
        <ul className="grid grid-cols-2 gap-1 font-mono text-xs text-gray-400">
          {Object.entries(THRESHOLDS).map(([k, v]) => (
            <li key={k}>{k} = {String(v)}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
