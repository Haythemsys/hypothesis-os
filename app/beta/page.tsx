"use client";
import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo/Logo";

const ROLES = ["Founder / CEO", "Product Manager", "Investor / VC", "Researcher", "Executive / Director", "Consultant", "Engineer", "Other"];
const DECISION_TYPES = ["Product launch", "Investment decision", "Research claim", "Hiring", "Strategic planning", "M&A / Partnership", "Other"];
const USE_CASES = [
  "Replace gut-feel with structured evidence",
  "Reduce costly wrong decisions",
  "Build a defensible audit trail",
  "Improve team decision quality",
  "Validate startup hypotheses faster",
  "Support board / investor reporting",
  "Other",
];

export default function BetaPage() {
  const [form, setForm] = useState({ name: "", email: "", role: "", useCase: "", company: "", decisionType: "" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/beta-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
        fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "beta_signup", properties: { role: form.role } }),
        }).catch(() => {});
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-obsidian text-ivory flex flex-col">
      <header className="border-b border-border-hair px-4 py-3 flex items-center gap-3">
        <Logo size={20} href="/" />
        <div className="flex-1" />
        <Link href="/workflow" className="text-sm text-steel hover:text-ivory transition-colors">
          Try the engine →
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {status === "success" ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">✓</div>
              <h1 className="text-2xl font-bold text-go">You&apos;re on the list.</h1>
              <p className="text-steel">
                We&apos;ll reach out to <strong className="text-ivory">{form.email}</strong> when beta access opens.
                In the meantime, try the engine — no account needed.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <Link href="/workflow" className="btn-primary">Run a decision →</Link>
                <Link href="/demo" className="btn-ghost">See demos</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <div className="label text-amber mb-1">Private Beta — Free</div>
                <h1 className="text-2xl font-bold">Join the waitlist.</h1>
                <p className="text-steel mt-2 text-sm">
                  HypothesisOS is in private beta. Request early access and we&apos;ll reach out when a slot opens.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate block mb-1">Full name *</label>
                  <input
                    required
                    type="text"
                    className="w-full rounded border border-graphite bg-graphite/40 px-3 py-2 text-sm text-ivory placeholder:text-slate focus:border-amber focus:outline-none"
                    placeholder="Ada Lovelace"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate block mb-1">Work email *</label>
                  <input
                    required
                    type="email"
                    className="w-full rounded border border-graphite bg-graphite/40 px-3 py-2 text-sm text-ivory placeholder:text-slate focus:border-amber focus:outline-none"
                    placeholder="ada@company.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate block mb-1">Company / organization</label>
                  <input
                    type="text"
                    className="w-full rounded border border-graphite bg-graphite/40 px-3 py-2 text-sm text-ivory placeholder:text-slate focus:border-amber focus:outline-none"
                    placeholder="Acme Inc."
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate block mb-1">Your role</label>
                  <select
                    className="w-full rounded border border-graphite bg-graphite/40 px-3 py-2 text-sm text-ivory focus:border-amber focus:outline-none"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate block mb-1">Type of decisions you make</label>
                  <select
                    className="w-full rounded border border-graphite bg-graphite/40 px-3 py-2 text-sm text-ivory focus:border-amber focus:outline-none"
                    value={form.decisionType}
                    onChange={(e) => setForm((f) => ({ ...f, decisionType: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {DECISION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate block mb-1">Primary use case</label>
                  <select
                    className="w-full rounded border border-graphite bg-graphite/40 px-3 py-2 text-sm text-ivory focus:border-amber focus:outline-none"
                    value={form.useCase}
                    onChange={(e) => setForm((f) => ({ ...f, useCase: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {USE_CASES.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {errorMsg && (
                <p className="text-kill text-sm">{errorMsg}</p>
              )}

              <button
                type="submit"
                className="btn-primary w-full"
                disabled={status === "submitting" || !form.name.trim() || !form.email.trim()}
              >
                {status === "submitting" ? "Submitting…" : "Request beta access →"}
              </button>

              <p className="text-center text-xs text-slate">
                No spam. No sales calls. Just early access.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
