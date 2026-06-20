import Link from "next/link";
import { Logo } from "@/components/logo/Logo";

function DocSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="border-t border-border-hair pt-8 mt-8 scroll-mt-20">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="space-y-3 text-steel text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function Q({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-ivory font-medium">{q}</p>
      <div className="text-steel">{children}</div>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded border border-amber/20 bg-amber/5 p-4 text-sm text-ivory">
      {children}
    </div>
  );
}

export default function DocsPage() {
  const toc = [
    ["#what-is", "What is HypothesisOS?"],
    ["#verdicts", "How verdicts work"],
    ["#go-kill", "GO / KILL / UNRESOLVED"],
    ["#evidence", "Evidence dimensions"],
    ["#navigation", "Evidence Navigation"],
    ["#debt", "Evidence Debt"],
    ["#reports", "Reports & exports"],
    ["#limits", "Limitations"],
  ];

  return (
    <div className="min-h-screen bg-obsidian text-ivory flex flex-col">
      <header className="border-b border-border-hair px-4 py-3 flex items-center gap-3">
        <Logo size={20} href="/" />
        <div className="flex-1" />
        <Link href="/trust" className="text-sm text-steel hover:text-ivory transition-colors">Trust</Link>
        <Link href="/workflow" className="btn-primary text-sm ml-2">Try the engine →</Link>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 py-14 flex gap-10">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-20 space-y-1">
            <p className="text-xs text-slate uppercase tracking-wide mb-3">On this page</p>
            {toc.map(([href, label]) => (
              <a key={href} href={href} className="block text-sm text-steel hover:text-ivory transition-colors py-0.5">
                {label}
              </a>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="label text-amber mb-2">Documentation</div>
          <h1 className="text-3xl font-bold">HypothesisOS User Guide</h1>
          <p className="text-steel mt-3 max-w-2xl leading-relaxed">
            A plain-language guide to understanding what HypothesisOS does, how to read its output,
            and how to get the most out of it. No technical background required.
          </p>

          <DocSection id="what-is" title="What is HypothesisOS?">
            <p>
              HypothesisOS is a decision falsification platform. It helps you answer one question before you commit to a decision:
              <strong className="text-ivory"> "Do I have enough evidence to justify this?"</strong>
            </p>
            <p>
              You describe your decision as a hypothesis (a statement that can be true or false), then rate 12 dimensions of evidence.
              The engine returns a structured verdict — GO, KILL, or UNRESOLVED — based on what the evidence actually supports.
            </p>
            <Callout>
              <strong>Who is it for?</strong> Founders deciding whether to launch. Investors validating a thesis.
              Product managers choosing what to build. Researchers checking if a hypothesis is ready for a full study.
              Anyone who needs to defend a decision with structured evidence.
            </Callout>
            <Q q="Is this an AI chatbot?">
              No. The core verdict is computed by a deterministic algorithm, not a language model. It works the same way every time.
              Some features use pattern-matching to help you write reports and summaries — but none of them can change the verdict.
            </Q>
            <Q q="What makes it different from ChatGPT?">
              ChatGPT gives you an opinion based on a prompt. HypothesisOS scores your actual evidence and returns a mathematically consistent verdict.
              The same evidence always returns the same verdict. There is no hallucination, no variation between runs, and no way to "prompt-engineer" a better outcome.
            </Q>
          </DocSection>

          <DocSection id="verdicts" title="How verdicts work">
            <p>
              When you enter evidence, the engine scores 12 dimensions on a 0–100 scale, computes a weighted support ratio,
              applies a self-critique check, and returns a verdict.
            </p>
            <div className="rounded border border-graphite bg-graphite/20 p-4 space-y-2 font-mono text-xs">
              <p className="text-slate"><span>{"// Simplified algorithm"}</span></p>
              <p><span className="text-amber">support</span> = weighted_sum(all_dimensions) / max_possible</p>
              <p><span className="text-amber">if</span> support &gt;= 0.65 → <span className="text-go">GO</span></p>
              <p><span className="text-amber">if</span> support &lt;= 0.35 → <span className="text-kill">KILL</span></p>
              <p><span className="text-amber">else</span> → <span className="text-unresolved">UNRESOLVED</span></p>
            </div>
            <p>
              A self-critique layer can downgrade a GO verdict if critical dimensions are missing.
              For example, a GO with zero evidence strength will be downgraded to UNRESOLVED regardless of overall support.
            </p>
            <Q q="Can I change the thresholds?">
              No. The thresholds are fixed at 65% (GO) and 35% (KILL). This is intentional — it prevents gaming and ensures the same evidence produces the same verdict for everyone.
            </Q>
          </DocSection>

          <DocSection id="go-kill" title="GO / KILL / UNRESOLVED — what they mean">
            <div className="space-y-4">
              <div className="rounded border border-go/30 bg-go/5 p-4">
                <p className="text-go font-bold text-lg">GO</p>
                <p className="mt-1">The evidence base supports moving forward. At least 65% weighted support with no critical gaps.</p>
                <p className="mt-1 text-xs text-slate">Does not mean "guaranteed success." It means: your evidence justifies the next step.</p>
              </div>
              <div className="rounded border border-kill/30 bg-kill/5 p-4">
                <p className="text-kill font-bold text-lg">KILL</p>
                <p className="mt-1">The evidence base does not support moving forward. 35% or less weighted support.</p>
                <p className="mt-1 text-xs text-slate">A KILL is valuable — it saves you from a bad decision before you commit resources.</p>
              </div>
              <div className="rounded border border-unresolved/30 bg-unresolved/5 p-4">
                <p className="text-unresolved font-bold text-lg">UNRESOLVED</p>
                <p className="mt-1">The evidence is between the two thresholds. You need more evidence before deciding.</p>
                <p className="mt-1 text-xs text-slate">This is the most common outcome for early-stage decisions. It tells you exactly which dimensions to improve.</p>
              </div>
            </div>
          </DocSection>

          <DocSection id="evidence" title="Evidence dimensions">
            <p>The engine scores 12 dimensions. Each maps to a real-world factor that affects whether a decision should proceed.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ["Market Size", "Is there a large enough opportunity?"],
                ["Competitive Advantage", "Can you win against alternatives?"],
                ["Team Capability", "Does the team have what it takes?"],
                ["Evidence Strength", "How strong and direct is your evidence?"],
                ["Feasibility", "Can this actually be executed?"],
                ["Stakeholder Buy-in", "Are the key people aligned?"],
                ["Risk Mitigation", "Are the main risks addressed?"],
                ["Novelty", "Does this bring something new?"],
                ["Reproducibility", "Can the result be replicated?"],
                ["Cost-Benefit", "Does the value justify the cost?"],
                ["Time Constraint", "Is the timing right?"],
                ["Reversibility", "Can you reverse course if wrong?"],
              ].map(([dim, desc]) => (
                <div key={dim} className="border border-graphite rounded p-3">
                  <p className="text-ivory text-sm font-medium">{dim}</p>
                  <p className="text-slate text-xs mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </DocSection>

          <DocSection id="navigation" title="Evidence Navigation">
            <p>
              Evidence Navigation is a recommendation system built on top of the verdict. After calculating your score,
              the engine tells you which dimensions have the highest impact on changing the verdict.
            </p>
            <Q q="What does 'prioritize improving X' mean?">
              It means raising dimension X by a small amount would move the support ratio most significantly toward GO.
              It is calculated by partial derivative approximation — not a guess, not an opinion.
            </Q>
            <Q q="What is a blocker?">
              A blocker is a dimension that is so low it prevents a GO verdict even if everything else is high.
              The engine flags these separately so you know where to focus.
            </Q>
          </DocSection>

          <DocSection id="debt" title="Evidence Debt">
            <p>
              Evidence Debt measures how much of your evidence base is missing or weak. It is shown as a percentage.
            </p>
            <p>
              <strong className="text-ivory">Low debt (under 30%)</strong> means you have strong, broad evidence.
              <strong className="text-unresolved ml-1">Medium debt (30–60%)</strong> means significant gaps remain.
              <strong className="text-kill ml-1">High debt (over 60%)</strong> means the decision is underevidenced — proceed with extreme caution.
            </p>
            <Callout>
              Evidence Debt is separate from the verdict. A GO verdict with high debt means: the engine approved based on what you provided,
              but you have big blind spots. These are explicitly flagged in the report.
            </Callout>
          </DocSection>

          <DocSection id="reports" title="Reports & exports">
            <Q q="What can I export?">
              Every decision can be exported as PDF (via browser print), JSON (full structured data), Markdown (human-readable report),
              or CSV (evidence dimensions and scores). Use the Export Center at /export.
            </Q>
            <Q q="Can I share a decision?">
              Yes — each decision report has a shareable link at /report/[id]. The link is accessible to anyone who has it.
              During the beta, there is no access control on shared report links.
            </Q>
            <Q q="Can I import decisions?">
              Yes — use the Import Center at /import to upload a JSON export from a previous decision.
            </Q>
          </DocSection>

          <DocSection id="limits" title="Limitations">
            <Q q="Can HypothesisOS make decisions for me?">
              No. It scores your evidence and returns a structural verdict. The quality of the verdict depends entirely on
              the accuracy of your evidence inputs. Garbage in, garbage out.
            </Q>
            <Q q="Does it work for all types of decisions?">
              The 12-dimension model works well for strategic, product, investment, and research decisions.
              It is less suited for purely operational decisions (e.g., "should we use font A or B?") or decisions
              where all 12 dimensions are not applicable.
            </Q>
            <Q q="What if I disagree with the verdict?">
              Review which dimensions drove the outcome and adjust your evidence ratings if they are inaccurate.
              If your evidence is accurate and the verdict is still wrong, the engine is telling you something you may not want to hear — that is the point.
            </Q>
            <Q q="Is it available offline?">
              The evidence workflow page works offline once loaded (localStorage). The export, reports, and API-backed features require an internet connection.
            </Q>
          </DocSection>

          <div className="mt-12 flex flex-wrap gap-4 border-t border-border-hair pt-8">
            <Link href="/trust" className="btn-ghost text-sm">Trust & transparency →</Link>
            <Link href="/demo" className="btn-ghost text-sm">See 3 live demos →</Link>
            <Link href="/workflow" className="btn-primary text-sm">Try the engine →</Link>
          </div>
        </main>
      </div>
    </div>
  );
}
