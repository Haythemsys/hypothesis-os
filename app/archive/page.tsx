import map from "./knowledge-map.json";

const fmt = (b: number) => b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`;
const LABELS: Record<string, string> = {
  "master-report": "Master research report",
  "phase-report": "Phase reports",
  "engine-report": "Engine reports",
  "corpus-intelligence": "Corpus intelligence",
  "results": "Results & evidence",
  "strategy": "Strategy & reframes",
  "concept": "Concepts (Passport / Sovereignty)",
  "archive-bundle": "Archive bundles (.zip)",
  "other": "Other research files",
};
const ORDER = ["master-report","phase-report","engine-report","results","corpus-intelligence","strategy","concept","archive-bundle","other"];

export default function Archive() {
  const files = map.files as { name: string; ext: string; bytes: number; category: string }[];
  const groups = ORDER.filter((c) => files.some((f) => f.category === c));

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-xl font-bold">Research Archive</h1>
        <p className="mt-1 text-sm text-gray-400">
          {map.fileCount} research files indexed from <code className="text-xs">{map.source}</code>.
          Filenames and sizes are read from disk — nothing here is fabricated.
        </p>
      </section>

      {groups.map((cat) => {
        const items = files.filter((f) => f.category === cat).slice(0, 40);
        return (
          <section key={cat} className="card">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-semibold">{LABELS[cat] || cat}</div>
              <span className="label">{files.filter((f) => f.category === cat).length}</span>
            </div>
            <ul className="space-y-1.5 text-sm">
              {items.map((f) => (
                <li key={f.name} className="flex items-center gap-2">
                  <span className="pill bg-white/10 uppercase">{f.ext}</span>
                  <span className="truncate text-gray-300">{f.name}</span>
                  <span className="ml-auto shrink-0 text-xs text-gray-500">{fmt(f.bytes)}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
