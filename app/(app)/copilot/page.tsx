"use client";
import { useState } from "react";
import Link from "next/link";

const VAGUE_WORDS = ["might", "could", "maybe", "perhaps", "possibly", "should", "would", "seems", "appears", "probably", "likely", "hopefully", "potentially", "arguably"];
const HAS_NUMBER = /\d+%|\d+x|\$[\d,]+|\d+\s*(users?|customers?|months?|years?|weeks?|days?|units?|teams?|points?|leads?|signups?)/i;
const HAS_TIMEFRAME = /within\s+\d+|by\s+(Q[1-4]|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})|in\s+\d+\s*(days?|weeks?|months?|years?)|end of (Q[1-4]|year|quarter|month)|before|deadline/i;
const HAS_POPULATION = /\b(among|for\s+(our|the)|targeting|segment|cohort|customers?|users?|clients?|employees?|patients?|teams?|market|enterprise|smb|b2b|b2c|audience|persona)\b/i;
const HAS_MEASURABILITY = /\b(increase|decrease|reduce|improve|achieve|reach|exceed|hit|miss|generate|deliver|produce|demonstrate|show|prove|validate|convert|retain|acquire)\b/i;

interface Dimension { name: string; score: number; found: string; missing: string; fix: string }
interface Issue { severity: "critical" | "warning" | "suggestion"; msg: string; fix: string }
interface EvidencePlan { type: string; method: string; priority: "HIGH" | "MEDIUM" | "LOW"; timeEstimate: string }

function analyze(text: string): { dimensions: Dimension[]; issues: Issue[]; score: number } {
  const lower = text.toLowerCase().trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const vague = VAGUE_WORDS.filter(w => lower.includes(w));
  const hasNum = HAS_NUMBER.test(text);
  const hasTime = HAS_TIMEFRAME.test(text);
  const hasPop = HAS_POPULATION.test(text);
  const hasMeasure = HAS_MEASURABILITY.test(text);
  const hasComp = /\b(compared to|versus|vs|relative to|against|over|better than|vs control|baseline)\b/i.test(text);

  const dimensions: Dimension[] = [
    {
      name: "Specificity",
      score: hasNum ? 2 : wordCount > 15 ? 1 : 0,
      found: hasNum ? "Contains quantifiable targets" : "",
      missing: hasNum ? "" : "Specific metrics, percentages, or dollar amounts",
      fix: "Add specific numbers: '20% increase', '$50K threshold', '100 users'",
    },
    {
      name: "Measurability",
      score: hasMeasure ? 2 : 0,
      found: hasMeasure ? "Contains outcome verb" : "",
      missing: hasMeasure ? "" : "Outcome verb (increase, reduce, achieve, validate)",
      fix: "Use active outcome verbs: 'will increase', 'will achieve', 'will reduce'",
    },
    {
      name: "Timeframe",
      score: hasTime ? 2 : 0,
      found: hasTime ? "Time boundary defined" : "",
      missing: hasTime ? "" : "Time boundary for the test",
      fix: "Add a deadline: 'within 90 days', 'by Q3 2026', 'in 6 months'",
    },
    {
      name: "Target Population",
      score: hasPop ? 2 : 0,
      found: hasPop ? "Target population specified" : "",
      missing: hasPop ? "" : "Who is affected or being tested",
      fix: "Specify who: 'among enterprise customers', 'for our target segment'",
    },
    {
      name: "Testability",
      score: hasNum && hasMeasure ? 2 : hasNum || hasMeasure ? 1 : 0,
      found: hasNum && hasMeasure ? "Falsifiable — has metric + outcome" : "",
      missing: hasNum && hasMeasure ? "" : "Clear pass/fail criteria",
      fix: "Make it falsifiable: if outcome ≥ threshold → GO; if not → KILL",
    },
    {
      name: "Clarity",
      score: vague.length === 0 ? 2 : vague.length <= 2 ? 1 : 0,
      found: vague.length === 0 ? "No vague language detected" : "",
      missing: vague.length > 0 ? `Vague words: "${vague.slice(0, 3).join('", "')}"` : "",
      fix: "Replace modal verbs with direct claims: 'will' not 'might'",
    },
  ];

  const score = Math.round((dimensions.reduce((s, d) => s + d.score, 0) / 12) * 100);

  const issues: Issue[] = [];
  if (vague.length > 0) issues.push({ severity: "critical", msg: `Vague language: "${vague.slice(0, 3).join('", "')}"`, fix: "Replace with definitive statements" });
  if (!hasNum) issues.push({ severity: "critical", msg: "No quantifiable targets", fix: "Add specific numbers or percentages" });
  if (!hasTime) issues.push({ severity: "critical", msg: "No timeframe defined", fix: "Add a time boundary" });
  if (!hasPop) issues.push({ severity: "warning", msg: "Target population not specified", fix: "Define who is being tested" });
  if (!hasMeasure) issues.push({ severity: "warning", msg: "No measurable outcome verb", fix: "Use 'will increase', 'will achieve'" });
  if (!hasComp) issues.push({ severity: "suggestion", msg: "No comparison baseline stated", fix: "Add 'compared to current baseline' or 'vs control group'" });

  return { dimensions, issues, score };
}

function generateImproved(text: string, result: ReturnType<typeof analyze>): string {
  let improved = text.trim().replace(/\.$/, "");
  improved = improved.replace(/\b(might|could|possibly|potentially)\b/gi, "will");
  improved = improved.replace(/\b(perhaps|maybe)\b/gi, "").replace(/\s{2,}/g, " ").trim();
  improved = improved.replace(/\bshould\b/gi, "will");
  const { dimensions } = result;
  const needsPop = dimensions.find(d => d.name === "Target Population" && d.score === 0);
  const needsNum = dimensions.find(d => d.name === "Specificity" && d.score === 0);
  const needsTime = dimensions.find(d => d.name === "Timeframe" && d.score === 0);
  if (needsNum) improved = improved.replace(/\b(increase|improve|grow|reduce|achieve)\b/i, m => `${m} by [X%]`);
  if (needsPop) improved += " among [TARGET SEGMENT]";
  if (needsTime) improved += " within [TIMEFRAME]";
  return improved + ".";
}

function generateEvidencePlan(text: string): EvidencePlan[] {
  const plan: EvidencePlan[] = [];
  const isMarket = /market|customer|consumer|user|segment|audience|buyer/i.test(text);
  const isFinancial = /revenue|cost|profit|roi|margin|\$|financial|budget/i.test(text);
  const isProduct = /product|feature|build|ship|launch|deploy|release|software|app/i.test(text);
  const isPeople = /hire|team|talent|employee|headcount|culture|staff/i.test(text);
  const isClinical = /patient|clinical|trial|treatment|drug|therapy|medical|health/i.test(text);
  const isGrowth = /growth|acquisition|retention|churn|ltv|cac|conversion|funnel/i.test(text);
  const isOps = /process|operation|efficiency|automation|workflow|supply/i.test(text);

  if (isMarket) {
    plan.push({ type: "Customer Discovery", method: "Interview 15–20 target customers using Jobs-to-be-Done framework", priority: "HIGH", timeEstimate: "2–3 weeks" });
    plan.push({ type: "Market Sizing", method: "TAM/SAM/SOM from 3 independent market research sources", priority: "HIGH", timeEstimate: "1 week" });
    plan.push({ type: "Competitive Analysis", method: "Map 5–8 competitors' positioning, pricing, and NPS scores", priority: "MEDIUM", timeEstimate: "1 week" });
  }
  if (isFinancial) {
    plan.push({ type: "Unit Economics Model", method: "Bottom-up P&L with ±30% sensitivity on key assumptions", priority: "HIGH", timeEstimate: "1 week" });
    plan.push({ type: "Comparable Analysis", method: "3–5 comparable deals or companies with known financials", priority: "HIGH", timeEstimate: "3–5 days" });
    plan.push({ type: "Expert Financial Validation", method: "Validate model with 2 domain experts or CFOs in similar businesses", priority: "MEDIUM", timeEstimate: "1–2 weeks" });
  }
  if (isProduct) {
    plan.push({ type: "Technical Feasibility Spike", method: "Prove hardest technical assumption in ≤5 engineering days", priority: "HIGH", timeEstimate: "1 week" });
    plan.push({ type: "Prototype Usability Test", method: "Clickable prototype tested with ≥10 target users; measure task completion", priority: "HIGH", timeEstimate: "1–2 weeks" });
    plan.push({ type: "Pre-Launch Demand Signal", method: "Waitlist or LOI collection — target 100+ high-intent signups", priority: "MEDIUM", timeEstimate: "2–4 weeks" });
  }
  if (isPeople) {
    plan.push({ type: "Talent Market Research", method: "LinkedIn Insights, Levels.fyi, Glassdoor for target roles", priority: "HIGH", timeEstimate: "3–5 days" });
    plan.push({ type: "Organizational Design Review", method: "Assess current team capacity vs. role requirements", priority: "HIGH", timeEstimate: "1 week" });
  }
  if (isClinical) {
    plan.push({ type: "Systematic Literature Review", method: "PubMed review of published studies; extract effect sizes and safety data", priority: "HIGH", timeEstimate: "2 weeks" });
    plan.push({ type: "KOL Interviews", method: "Interview 5+ Key Opinion Leaders in the therapeutic area", priority: "HIGH", timeEstimate: "2–3 weeks" });
    plan.push({ type: "Regulatory Pathway Assessment", method: "Map FDA/EMA pathway with experienced regulatory counsel", priority: "HIGH", timeEstimate: "2 weeks" });
  }
  if (isGrowth) {
    plan.push({ type: "Cohort Retention Analysis", method: "6-month cohort retention data by channel and segment", priority: "HIGH", timeEstimate: "3–5 days" });
    plan.push({ type: "A/B Test Design", method: "Pre-registered experiment with power analysis and sample size calculation", priority: "HIGH", timeEstimate: "1 week" });
    plan.push({ type: "Industry Benchmarks", method: "Collect benchmarks for key growth metrics from 3 credible sources", priority: "MEDIUM", timeEstimate: "3–5 days" });
  }
  if (isOps) {
    plan.push({ type: "Process Audit", method: "Map current-state process; quantify time and cost at each step", priority: "HIGH", timeEstimate: "1–2 weeks" });
    plan.push({ type: "30-Day Pilot", method: "Controlled pilot with pre-defined measurement protocol and success threshold", priority: "HIGH", timeEstimate: "1 week to design" });
  }

  // Always included
  plan.push({ type: "Controlled Experiment", method: "Design 30–60 day experiment with pre-registered pass/fail criteria before any data collection", priority: "HIGH", timeEstimate: "Define before starting" });
  plan.push({ type: "Expert Review Panel", method: "Submit evidence package to 1 skeptic and 1 advocate for independent review", priority: "MEDIUM", timeEstimate: "Before final decision" });

  const seen = new Set<string>();
  return plan.filter(p => { if (seen.has(p.type)) return false; seen.add(p.type); return true; });
}

function scoreInfo(score: number): { label: string; color: string; bg: string } {
  if (score <= 30) return { label: "Weak", color: "text-kill", bg: "bg-kill/15" };
  if (score <= 55) return { label: "Needs Work", color: "text-unresolved", bg: "bg-amber/10" };
  if (score <= 75) return { label: "Developing", color: "text-amber", bg: "bg-amber/10" };
  if (score <= 90) return { label: "Strong", color: "text-go", bg: "bg-go/10" };
  return { label: "Excellent", color: "text-go", bg: "bg-go/10" };
}

export default function Copilot() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof analyze> | null>(null);
  const [improved, setImproved] = useState("");
  const [evidencePlan, setEvidencePlan] = useState<EvidencePlan[]>([]);
  const [activeTab, setActiveTab] = useState<"analysis" | "improved" | "evidence">("analysis");

  function run() {
    const r = analyze(input);
    setResult(r);
    setImproved(generateImproved(input, r));
    setEvidencePlan(generateEvidencePlan(input));
    setActiveTab("analysis");
  }

  const info = result ? scoreInfo(result.score) : null;

  return (
    <div className="space-y-4">
      <div>
        <div className="label">Decision Copilot</div>
        <h1 className="text-2xl font-bold tracking-tight">Hypothesis Copilot</h1>
        <p className="mt-1 text-sm text-slate">Strengthen your hypothesis before running the engine. Copilot suggests — engine decides.</p>
      </div>

      <div className="card space-y-3">
        <div className="label">Your Hypothesis</div>
        <textarea
          className="input min-h-[96px] resize-none"
          placeholder="e.g. 'Our new pricing page will increase enterprise conversion by 25% within 90 days of launch.'"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <div className="flex items-center gap-3">
          <button onClick={run} disabled={input.trim().split(/\s+/).filter(Boolean).length < 4} className="btn-primary text-sm">
            Analyze →
          </button>
          <span className="text-xs text-slate data">{input.trim().split(/\s+/).filter(Boolean).length} words</span>
        </div>
      </div>

      {result && (
        <>
          <div className={`card flex items-center gap-4 ${info?.bg}`}>
            <div className="text-5xl font-bold data" style={{ color: result.score >= 76 ? "#3FB67A" : result.score >= 56 ? "#E8A23D" : "#E5544B" }}>
              {result.score}
            </div>
            <div className="flex-1">
              <div className={`text-lg font-semibold ${info?.color}`}>{info?.label}</div>
              <div className="text-xs text-slate">Hypothesis Quality Score · 0–100</div>
              <div className="mt-0.5 text-xs text-slate">
                {result.issues.filter(i => i.severity === "critical").length} critical ·{" "}
                {result.issues.filter(i => i.severity === "warning").length} warnings ·{" "}
                {result.issues.filter(i => i.severity === "suggestion").length} suggestions
              </div>
            </div>
            <Link href="/workflow" className="btn-primary text-sm shrink-0">Run Engine →</Link>
          </div>

          <div className="flex gap-2 flex-wrap">
            {(["analysis", "improved", "evidence"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`pill text-xs transition-colors ${activeTab === t ? "bg-amber text-obsidian" : "bg-white/8 text-slate hover:text-ivory"}`}>
                {t === "analysis" ? "Analysis" : t === "improved" ? "Improved Hypothesis" : "Evidence Plan"}
              </button>
            ))}
          </div>

          {activeTab === "analysis" && (
            <div className="space-y-3">
              <div className="card space-y-3">
                <div className="label">Dimension Scores</div>
                {result.dimensions.map(d => (
                  <div key={d.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{d.name}</span>
                      <span className={`data text-xs ${d.score === 2 ? "text-go" : d.score === 1 ? "text-amber" : "text-kill"}`}>
                        {d.score === 2 ? "✓ Strong" : d.score === 1 ? "~ Partial" : "✗ Missing"}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(d.score / 2) * 100}%`, backgroundColor: d.score === 2 ? "#3FB67A" : d.score === 1 ? "#E8A23D" : "#E5544B" }} />
                    </div>
                    {d.score < 2 && <p className="text-xs text-slate">{d.fix}</p>}
                  </div>
                ))}
              </div>

              {result.issues.length > 0 && (
                <div className="card space-y-2">
                  <div className="label">Detected Issues</div>
                  {result.issues.map((issue, i) => (
                    <div key={i} className={`rounded-inner border px-3 py-2 space-y-0.5 ${issue.severity === "critical" ? "bg-kill/10 border-kill/20" : issue.severity === "warning" ? "bg-amber/10 border-amber/20" : "bg-white/3 border-border-hair"}`}>
                      <div className="flex items-center gap-2">
                        <span className={`pill text-[10px] ${issue.severity === "critical" ? "bg-kill/20 text-kill" : issue.severity === "warning" ? "bg-amber/20 text-amber" : "bg-white/10 text-slate"}`}>{issue.severity}</span>
                        <span className="text-xs font-medium">{issue.msg}</span>
                      </div>
                      <p className="text-xs text-slate pl-1">→ {issue.fix}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "improved" && (
            <div className="card space-y-4">
              <div className="label">Original → Improved</div>
              <div className="space-y-3">
                <div className="rounded-inner bg-kill/10 border border-kill/20 p-3">
                  <div className="label text-kill mb-1">Original · Score {result.score}</div>
                  <p className="text-sm text-steel leading-relaxed">{input}</p>
                </div>
                <div className="text-center text-amber text-xl">↓</div>
                <div className="rounded-inner bg-go/10 border border-go/20 p-3">
                  <div className="label text-go mb-1">Improved</div>
                  <p className="text-sm text-ivory leading-relaxed">{improved}</p>
                  <p className="mt-2 text-xs text-slate">Items [IN BRACKETS] need your specific values.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setInput(improved)} className="btn-primary text-sm">Use This Version</button>
                <Link href="/workflow" className="btn-ghost text-sm">Run Engine →</Link>
              </div>
            </div>
          )}

          {activeTab === "evidence" && (
            <div className="card space-y-3">
              <div className="label">Evidence Collection Plan · {evidencePlan.length} items</div>
              <div className="space-y-2">
                {evidencePlan.map((item, i) => (
                  <div key={i} className="rounded-inner bg-white/3 border border-border-hair p-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`pill text-[10px] ${item.priority === "HIGH" ? "bg-amber/20 text-amber" : item.priority === "MEDIUM" ? "bg-white/10 text-steel" : "bg-white/5 text-slate"}`}>{item.priority}</span>
                      <span className="text-sm font-semibold">{item.type}</span>
                      <span className="ml-auto data text-xs text-slate">{item.timeEstimate}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate">{item.method}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate text-center">Copilot suggests evidence priorities. Engine verdict is determined by your evidence scores.</p>
            </div>
          )}
        </>
      )}

      <div className="card bg-white/2 border-border-hair">
        <p className="text-xs text-slate"><span className="font-semibold text-steel">About this tool: </span>Copilot uses deterministic rules — no LLM, no external APIs. It can suggest but cannot override the engine. Verdict authority belongs exclusively to the deterministic engine.</p>
      </div>
    </div>
  );
}
