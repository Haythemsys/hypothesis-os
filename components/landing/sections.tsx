import Link from "next/link";
import { Logo } from "@/components/logo/Logo";

// ── Shared section wrapper ───────────────────────────────────────────────────
function Section({ id, eyebrow, title, children, className = "" }: {
  id: string; eyebrow?: string; title?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-20 border-t border-border-hair py-14 sm:py-20 ${className}`}>
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        {eyebrow && <div className="label text-amber">{eyebrow}</div>}
        {title && <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>}
        <div className={title ? "mt-6" : ""}>{children}</div>
      </div>
    </section>
  );
}

// ── Sticky top nav ───────────────────────────────────────────────────────────
export function LandingNav() {
  const links = [
    ["#how", "How it works"], ["#demo", "Live demo"],
    ["#vs-ai", "vs AI"], ["#pricing", "Pricing"], ["#faq", "FAQ"],
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b border-border-hair bg-obsidian/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-4 px-4 sm:px-6">
        <Logo size={22} />
        <nav className="ml-auto hidden items-center gap-6 md:flex">
          {links.map(([href, label]) => (
            <a key={href} href={href} className="text-sm text-steel transition-colors hover:text-ivory">{label}</a>
          ))}
        </nav>
        <Link href="/app" className="btn-primary ml-auto text-sm md:ml-0">Run a decision →</Link>
      </div>
    </header>
  );
}

// ── §1 Hero ──────────────────────────────────────────────────────────────────
export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* faint signal-path motif */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #E8A23D 0, transparent 40%), radial-gradient(circle at 80% 70%, #A4ADBC 0, transparent 45%)" }} />
      <div className="relative mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="label text-amber">Decision Falsification Platform</div>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
          Stop bad decisions<br />before they <span className="text-amber">cost you money.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-steel">
          HypothesisOS analyzes your evidence, finds hidden failure signals, and tells you whether
          a hypothesis should move forward, stop, or remain unresolved — with a deterministic verdict
          you can defend.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/app" className="btn-primary px-6 text-base">Run your first decision →</Link>
          <a href="#how" className="btn-ghost px-6 text-base">See how it works</a>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate">
          <span>▸ <span className="text-steel">0 false-GO</span> across a 106-case study</span>
          <span>▸ <span className="text-steel">Deterministic</span> · same evidence, same verdict</span>
          <span>▸ <span className="text-steel">Reproducible</span> · fully auditable</span>
        </div>
      </div>
    </section>
  );
}

// ── §2 Problem ───────────────────────────────────────────────────────────────
export function Problem() {
  const cards = [
    ["Replication of one", "A single positive result, treated as a pattern. One cohort, one window — projected into a confident yes."],
    ["Untested under fire", "Every data point gathered under favorable conditions. No hostile test was ever run against the claim."],
    ["Generalized without proof", "Results from one context stretched across a much broader claim — with no out-of-sample evidence."],
  ];
  return (
    <Section id="problem" eyebrow="The problem" title="Most bad decisions aren't made with bad evidence.">
      <p className="-mt-3 max-w-2xl text-steel">
        They're made with <span className="text-ivory">good evidence interpreted charitably</span> —
        because the team wanted the answer to be yes. These three failure modes show up again and again:
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map(([t, d]) => (
          <div key={t} className="card">
            <div className="text-kill">✕</div>
            <h3 className="mt-2 font-semibold text-ivory">{t}</h3>
            <p className="mt-1 text-sm text-steel">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── §3 How it works ──────────────────────────────────────────────────────────
export function HowItWorks() {
  const steps = [
    ["01", "Encode", "Translate your evidence into 8 measured dimensions — effect, replication, hostile survival, confound control, generalization, power, and confidence interval."],
    ["02", "Falsify", "Kill gates fire on fatal weaknesses before support is even computed. A claim that fails one gate cannot be averaged back to life."],
    ["03", "Navigate", "Get a verdict plus the exact, cheapest set of evidence moves that would change it — or an honest unresolved."],
  ];
  return (
    <Section id="how" eyebrow="How it works" title="Three steps from evidence to verdict.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {steps.map(([n, t, d]) => (
          <div key={n} className="card">
            <span className="data text-sm text-amber">{n}</span>
            <h3 className="mt-1 text-lg font-semibold text-ivory">{t}</h3>
            <p className="mt-2 text-sm text-steel">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── §5 Navigation engine ─────────────────────────────────────────────────────
export function NavigationEngine() {
  return (
    <Section id="navigation" eyebrow="Navigation engine" title="It doesn't just judge. It routes.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center">
        <p className="text-steel">
          Every UNRESOLVED verdict comes with the cheapest set of evidence moves that would change it —
          ranked by leverage. You always know the distance to GO, and the single highest-impact next study.
        </p>
        <div className="card space-y-2 text-sm">
          <div className="label">Path to GO</div>
          {[["Independent replication", "+0.20"], ["Statistical power", "+0.08"], ["Confound control", "+0.06"]].map(([s, g], i) => (
            <div key={s} className="flex items-center gap-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber/15 text-xs font-bold text-amber">{i + 1}</span>
              <span className="flex-1 text-ivory">{s}</span>
              <span className="data text-amber">{g}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ── §6 Audit trail ───────────────────────────────────────────────────────────
export function AuditTrail() {
  const events = [
    ["Hypothesis created", "decomposed into assumptions & confounds"],
    ["Evidence recorded", "8 dimensions encoded"],
    ["Verdict rendered", "deterministic · reproducible"],
    ["Brief generated", "investor-ready export"],
  ];
  return (
    <Section id="audit" eyebrow="Audit trail" title="Every verdict is traceable.">
      <p className="-mt-3 max-w-2xl text-steel">
        Defend any decision with its full evidence history. The same inputs always produce the same verdict —
        no session-to-session drift, no hidden reasoning.
      </p>
      <div className="mt-6 card">
        <ol className="relative space-y-4 pl-6">
          <span className="absolute left-[7px] top-1 bottom-1 w-px bg-border-soft" />
          {events.map(([t, d]) => (
            <li key={t} className="relative">
              <span className="absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 border-obsidian bg-amber" />
              <div className="text-sm font-semibold text-ivory">{t}</div>
              <div className="text-xs text-slate">{d}</div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

// ── §7 Evidence debt + §8 Risk (combined band) ───────────────────────────────
export function EvidenceDebtRisk() {
  return (
    <>
      <Section id="debt" eyebrow="Evidence debt" title="Know how far you are from a defensible GO.">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center">
          <p className="text-steel">
            Evidence debt collapses every remaining gap to GO into a single number — so "we need more data"
            becomes "we are 34% short, here's where."
          </p>
          <div className="card space-y-2">
            <div className="flex justify-between text-sm"><span className="text-steel">Evidence debt</span><span className="data text-ivory">34%</span></div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/8"><div className="h-full w-[34%] rounded-full bg-amber" /></div>
            <div className="flex justify-between text-xs text-slate"><span>Near GO</span><span>Major deficit</span></div>
          </div>
        </div>
      </Section>
      <Section id="risk" eyebrow="Risk analysis" title="Evidence gaps become decision risk.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[["Decision Risk", "MEDIUM", "text-amber"], ["Invest more?", "NOT YET", "text-amber"], ["Cost to resolve", "MEDIUM", "text-amber"], ["Confidence", "MODERATE", "text-steel"]].map(([l, v, c]) => (
            <div key={l} className="card">
              <div className="text-[10px] uppercase tracking-wide text-slate">{l}</div>
              <div className={`data mt-1 text-lg font-semibold ${c}`}>{v}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-2xl text-sm text-steel">
          A clear LOW / MEDIUM / HIGH / CRITICAL risk read, plus a YES / NO / NOT YET signal on whether
          further investment is justified — derived only from the evidence, never the verdict.
        </p>
      </Section>
    </>
  );
}

// ── §9 Compare vs AI ─────────────────────────────────────────────────────────
export function CompareVsAI() {
  const rows: [string, boolean, boolean][] = [
    ["Same evidence, same answer", false, true],
    ["Unconditional kill gates", false, true],
    ["Tells you what's missing", false, true],
    ["Path to a better verdict", false, true],
    ["Can be talked into a yes", true, false],
  ];
  return (
    <Section id="vs-ai" eyebrow="vs general AI" title="Use AI to explore. Use HypothesisOS to decide.">
      <div className="overflow-hidden rounded-card border border-border-hair">
        <div className="grid grid-cols-[1fr_auto_auto] gap-2 border-b border-border-hair bg-graphite-2 px-4 py-2 text-xs uppercase tracking-wide text-slate">
          <span>Capability</span><span className="w-20 text-center">ChatGPT</span><span className="w-24 text-center text-amber">HypothesisOS</span>
        </div>
        {rows.map(([label, ai, hos]) => (
          <div key={label} className="grid grid-cols-[1fr_auto_auto] items-center gap-2 border-b border-border-hair px-4 py-2.5 text-sm last:border-0">
            <span className="text-ivory">{label}</span>
            <span className={`w-20 text-center ${ai ? "text-kill" : "text-slate"}`}>{ai ? "✓" : "✗"}</span>
            <span className={`w-24 text-center ${hos ? "text-go" : "text-slate"}`}>{hos ? "✓" : "✗"}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate">
        Both rows matter: the kill gate is unconditional; an LLM's caveat is a suggestion it can be argued out of.
      </p>
    </Section>
  );
}

// ── §10 Pricing ──────────────────────────────────────────────────────────────
export function Pricing() {
  const tiers = [
    ["Individual", "$39", "/mo", ["Unlimited hypotheses", "Full engine + navigation", "Executive briefs"], false],
    ["Team", "$149", "/mo", ["Up to 10 seats", "Shared mission control", "Audit trails"], true],
    ["Studio", "$399", "/mo", ["Up to 25 seats", "Portfolio risk view", "Priority support"], false],
    ["Enterprise", "Custom", "", ["SSO + procurement", "Stage-gate integration", "Dedicated support"], false],
  ] as const;
  return (
    <Section id="pricing" eyebrow="Pricing" title="Less than an hour of engineering. Per month.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map(([name, price, per, feats, popular]) => (
          <div key={name} className={popular ? "card-accent" : "card"}>
            {popular && <div className="label text-amber">Most popular</div>}
            <div className="mt-1 font-semibold text-ivory">{name}</div>
            <div className="mt-2"><span className="data text-3xl font-bold text-ivory">{price}</span><span className="text-sm text-slate">{per}</span></div>
            <ul className="mt-4 space-y-1.5 text-sm text-steel">
              {feats.map((f) => <li key={f} className="flex gap-2"><span className="text-amber">▸</span>{f}</li>)}
            </ul>
            <Link href="/app" className={`${popular ? "btn-primary" : "btn-ghost"} mt-5 w-full`}>Start</Link>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-slate">No credit card to try. The engine runs locally in your browser.</p>
    </Section>
  );
}

// ── §11 FAQ ──────────────────────────────────────────────────────────────────
export function FAQ() {
  const qs = [
    ["Isn't this just a scoring rubric?", "No. A rubric averages weak evidence with strong evidence. Kill gates are unconditional — a single fatal dimension kills the hypothesis regardless of the rest. That's the structural difference."],
    ["What if my evidence doesn't fit 8 dimensions?", "The framework is calibrated for research and behavioral evidence. Encoding requires judgment, but the dimensions are domain-agnostic. The calibration score tells you honestly how complete your encoding is."],
    ["Does AI make the decision?", "No. The verdict engine is fully deterministic — same evidence, same verdict, every time. Any LLM layer is confined to explanation and cannot change a verdict or a value."],
    ["Is my data private?", "Evidence is scoped per device. The live demo and engine run client-side. Nothing about your hypothesis is required to leave your browser to get a verdict."],
    ["Can I export?", "Yes. Every hypothesis produces an investor-ready Executive Brief you can print or save as PDF."],
  ];
  return (
    <Section id="faq" eyebrow="FAQ" title="Questions, answered honestly.">
      <div className="space-y-3">
        {qs.map(([q, a]) => (
          <details key={q} className="card group">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ivory">
              {q}<span className="text-slate transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 text-sm text-steel">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

// ── §12 Final CTA + footer ───────────────────────────────────────────────────
export function FinalCTA() {
  return (
    <Section id="start" className="text-center">
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Decide on evidence, not optimism.</h2>
      <p className="mx-auto mt-4 max-w-xl text-steel">
        Run a real decision through the engine in the next five minutes. No account required to start.
      </p>
      <div className="mt-8"><Link href="/app" className="btn-primary px-8 text-base">Run your first decision →</Link></div>
      <footer className="mt-16 flex flex-col items-center gap-3 border-t border-border-hair pt-8 text-sm text-slate sm:flex-row sm:justify-between">
        <Logo size={20} />
        <div className="flex gap-5">
          <Link href="/app" className="hover:text-ivory">App</Link>
          <Link href="/governance" className="hover:text-ivory">Governance</Link>
          <Link href="/more" className="hover:text-ivory">Tools</Link>
        </div>
        <span>Deterministic decision intelligence</span>
      </footer>
    </Section>
  );
}
