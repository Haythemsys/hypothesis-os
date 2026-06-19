const MAY = [
  "Decompose a hypothesis into assumptions, confounds, and variables",
  "Suggest possible confounds to rule out",
  "Propose experiments (cheap / strong / hostile)",
  "Write report prose and executive summaries",
  "Simulate a hostile review to stress-test reasoning",
  "Summarize evidence in plain language",
];
const MAY_NOT = [
  "Fabricate evidence or data",
  "Invent results that were not measured",
  "Override or change the deterministic verdict",
  "Hide uncertainty or inflate confidence",
];

export default function Governance() {
  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-xl font-bold">AI Governance</h1>
        <p className="mt-1 text-sm text-gray-400">
          The deterministic engine is the <b>constitutional judge</b>. AI is an assistant that can
          help frame and explain — it can never decide.
        </p>
      </section>

      <section className="card border-2 border-go/30">
        <div className="label mb-2 text-go">AI may</div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-300">
          {MAY.map((x) => <li key={x}>{x}</li>)}
        </ul>
      </section>

      <section className="card border-2 border-kill/40">
        <div className="label mb-2 text-kill">AI may NOT</div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-300">
          {MAY_NOT.map((x) => <li key={x}>{x}</li>)}
        </ul>
      </section>

      <section className="card">
        <div className="label mb-2">How this is enforced</div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-400">
          <li><code>POST /api/hypotheses/:id/classify</code> consults <b>only</b> the engine; it reports <code>judge: &quot;deterministic-engine&quot;</code>.</li>
          <li>Reports build their verdict deterministically; any AI prose is appended under a labelled “AI-assisted” heading and cannot alter the verdict.</li>
          <li>If no provider is configured, every AI feature degrades off — the verdict pipeline is unaffected.</li>
          <li>Thresholds are pre-registered and visible on the Benchmark page; verdicts are reproducible without any model.</li>
        </ul>
      </section>
    </div>
  );
}
