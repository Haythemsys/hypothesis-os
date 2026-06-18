import fs from "node:fs";
import path from "node:path";

const ROOT = "/root/storage/downloads";
const RESEARCH_EXT = new Set([".md",".txt",".pdf",".json",".csv",".docx",".zip",".html",".pptx"]);
const KW = /bapa|cih|sovereign|passport|hypoth|register|identity|phase|cognit|corpus|forensic|engine|temporal|reframe|frontier|validation|raid|person|role/i;
const SKIP = /landing|marketing|newsletter|playbook|storyboard|demo_deck|case ?study|dashboard\.html|\.mp4|\.mov/i;

const CATS = [
  [/master_research|master report|MASTER_RESEARCH/i, "master-report"],
  [/phase_?\d|PHASE/i, "phase-report"],
  [/engine_?\d|ENGINE/i, "engine-report"],
  [/corpus/i, "corpus-intelligence"],
  [/reframe|frontier|strategic|post_phase/i, "strategy"],
  [/person_vs_role|temporal|validation|forensic|results|evidence/i, "results"],
  [/passport|sovereign|cih/i, "concept"],
  [/\.zip$/i, "archive-bundle"],
];
const categorize = (n) => (CATS.find(([re]) => re.test(n)) || [null, "other"])[1];

const out = [];
for (const name of fs.readdirSync(ROOT)) {
  const ext = path.extname(name).toLowerCase();
  if (!RESEARCH_EXT.has(ext)) continue;
  if (!KW.test(name)) continue;
  if (SKIP.test(name)) continue;
  let size = 0; try { size = fs.statSync(path.join(ROOT, name)).size; } catch {}
  out.push({ name, ext: ext.slice(1), bytes: size, category: categorize(name) });
}
out.sort((a, b) => a.category.localeCompare(b.category) || b.bytes - a.bytes);

const byCat = {};
for (const f of out) (byCat[f.category] ||= []).push(f);
const map = {
  generatedBy: "scripts/index-archive.mjs",
  source: ROOT,
  note: "Index of research-relevant files actually present on disk. Filenames/sizes are real; no contents fabricated.",
  fileCount: out.length,
  categories: Object.fromEntries(Object.entries(byCat).map(([k, v]) => [k, v.length])),
  files: out,
};
fs.writeFileSync("docs/KNOWLEDGE_MAP.json", JSON.stringify(map, null, 2));
console.log(`indexed ${out.length} research files across ${Object.keys(byCat).length} categories`);
for (const [k, v] of Object.entries(byCat)) console.log(`  ${k.padEnd(20)} ${v.length}`);
