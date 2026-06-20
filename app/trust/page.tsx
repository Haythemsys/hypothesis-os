import Link from "next/link";
import { Logo } from "@/components/logo/Logo";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border-hair pt-8 mt-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="prose-slate space-y-3 text-steel text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function Fact({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-amber text-lg mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-ivory font-medium text-sm">{title}</p>
        <p className="text-steel text-sm mt-0.5">{body}</p>
      </div>
    </div>
  );
}

export default function TrustPage() {
  return (
    <div className="min-h-screen bg-obsidian text-ivory flex flex-col">
      <header className="border-b border-border-hair px-4 py-3 flex items-center gap-3">
        <Logo size={20} href="/" />
        <div className="flex-1" />
        <Link href="/docs" className="text-sm text-steel hover:text-ivory transition-colors">Documentation</Link>
        <Link href="/workflow" className="btn-primary text-sm ml-2">Try the engine →</Link>
      </header>

      <div className="mx-auto w-full max-w-3xl px-4 py-14">
        <div className="label text-amber mb-2">Trust & Transparency</div>
        <h1 className="text-3xl font-bold">How HypothesisOS works — and what it doesn&apos;t do.</h1>
        <p className="text-steel mt-3 max-w-2xl leading-relaxed">
          Before you rely on any tool for important decisions, you should understand exactly what it does.
          This page has no marketing — just clear facts about the engine, the data, and the limits.
        </p>

        <Section title="The deterministic engine">
          <div className="space-y-4">
            <Fact
              icon="⚙"
              title="The verdict is math, not an opinion."
              body="HypothesisOS uses a fixed algorithm: it scores 12 evidence dimensions, computes a weighted support ratio, applies a self-critique layer, and returns GO, KILL, or UNRESOLVED. The same evidence values always return the same verdict."
            />
            <Fact
              icon="⚖"
              title="Thresholds are public and fixed."
              body="GO requires ≥ 65% weighted support. KILL requires ≤ 35%. Everything between is UNRESOLVED. These thresholds do not change based on your input or subscription tier."
            />
            <Fact
              icon="◈"
              title="No prompt engineering, no model drift."
              body="The core verdict engine is .mjs files — pure JavaScript functions. No language model is involved in the verdict calculation. It cannot hallucinate a verdict."
            />
            <Fact
              icon="⚑"
              title="8/8 benchmark cases verified."
              body="The engine has been validated against 8 edge-case scenarios including near-GO, near-KILL, high-calibration, and contradiction-heavy cases. Results are documented in the public benchmark."
            />
          </div>
        </Section>

        <Section title="AI — where it helps and where it stops">
          <div className="space-y-4">
            <Fact
              icon="✦"
              title="AI assists presentation, not decisions."
              body="Features like Decision Copilot, Board Brief, and Executive Summary use pattern-matching and template generation. They present the engine output in different formats — they cannot override the verdict."
            />
            <Fact
              icon="✗"
              title="AI never changes a verdict."
              body='If the engine says KILL, every AI feature downstream will show KILL. There is no "AI override" path, no confidence adjustment, and no prompt that changes the engine output.'
            />
            <Fact
              icon="⌗"
              title="Full audit trail available."
              body="Every evidence submission and verdict is stored with a timestamp. You can export the complete history of any decision at any time in JSON, CSV, or Markdown."
            />
          </div>
        </Section>

        <Section title="Data & storage">
          <div className="space-y-4">
            <Fact
              icon="⊞"
              title="Your decisions are scoped to your identity."
              body="All decisions, evidence records, and reports are stored under your user ID and organization ID. Other users cannot see your data. The beta uses localStorage + SQLite with scoped queries."
            />
            <Fact
              icon="↑"
              title="No uploaded documents are shared."
              body="When you upload evidence documents, they are stored privately under your account. They are not used to train any model, shared with other users, or sent to third-party AI services."
            />
            <Fact
              icon="↗"
              title="You can export or delete your data."
              body="Use the Export Center to download your full decision history at any time. During the beta, contact us to request data deletion."
            />
          </div>
        </Section>

        <Section title="What the engine does not do">
          <div className="space-y-4">
            <Fact
              icon="✗"
              title="It does not fabricate evidence."
              body="HypothesisOS never invents evidence or fills in gaps. A missing dimension scores 0 — which increases evidence debt and may block a GO verdict. This is intentional."
            />
            <Fact
              icon="✗"
              title="It does not guarantee correct decisions."
              body="The engine scores your evidence inputs. If your evidence is wrong, the verdict reflects that. HypothesisOS is a structured thinking tool — not an oracle."
            />
            <Fact
              icon="✗"
              title="It does not have access to the internet or external data."
              body="The engine works only with the evidence you provide. It does not fetch market data, news, or any external source during a decision analysis."
            />
          </div>
        </Section>

        <Section title="Beta limitations">
          <div className="space-y-4">
            <Fact
              icon="⚑"
              title="No real authentication yet."
              body="The beta uses a local identity stored in your browser. There is no password login, no Google/GitHub OAuth, and no server-side session management. Do not use HypothesisOS for confidential decisions in this state."
            />
            <Fact
              icon="⚑"
              title="No data guarantee during beta."
              body="While we take care not to lose data, the beta database may be reset without notice. Export important decisions before relying on them."
            />
            <Fact
              icon="⚑"
              title="No uptime SLA."
              body="The beta runs on shared infrastructure. We do not guarantee availability or response time."
            />
          </div>
        </Section>

        <div className="mt-12 flex flex-wrap gap-4">
          <Link href="/docs" className="btn-ghost text-sm">Read the documentation →</Link>
          <Link href="/workflow" className="btn-primary text-sm">Try the engine →</Link>
        </div>
      </div>
    </div>
  );
}
