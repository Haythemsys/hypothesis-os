"use client";
import { useState } from "react";
import Link from "next/link";
import { decompose } from "@/lib/core";

export default function Lab() {
  const [text, setText] = useState("");
  const [d, setD] = useState<any>(null);

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-xl font-bold">Hypothesis Lab</h1>
        <p className="mt-1 text-sm text-gray-400">
          State a claim. The Lab breaks it into the assumptions, confounds, and variables you must
          confront before it can earn a verdict.
        </p>
        <textarea
          className="input mt-3 min-h-[96px]" value={text} placeholder="e.g. A person's writing style identifies them across any context."
          onChange={(e) => setText(e.target.value)} />
        <div className="mt-3 flex gap-2">
          <button className="btn" onClick={() => setD(decompose(text))}>Decompose</button>
          {d && <Link href="/experiments" className="btn">Design tests ›</Link>}
        </div>
      </section>

      {d && (
        <>
          <section className="card">
            <div className="label mb-2">Claim type</div>
            <div className="flex flex-wrap gap-2">
              {d.kinds.map((k: string) => <span key={k} className="pill bg-white/10">{k}</span>)}
              <span className={`pill ${d.requiresGeneralization ? "verdict-UNRESOLVED" : "bg-white/10"}`}>
                {d.requiresGeneralization ? "requires generalization" : "scoped to one context"}
              </span>
            </div>
          </section>
          <Listing title="Assumptions to defend" items={d.assumptions} />
          <Listing title="Confounds to rule out" items={d.confounds} />
          <section className="card">
            <div className="label mb-2">Variables</div>
            <dl className="space-y-1 text-sm">
              <Row k="Independent" v={d.variables.independent} />
              <Row k="Dependent" v={d.variables.dependent} />
              <Row k="Unit of analysis" v={d.variables.unitOfAnalysis} />
              <Row k="Controls" v={d.variables.controls.join(", ")} />
            </dl>
          </section>
        </>
      )}
    </div>
  );
}

function Listing({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="card">
      <div className="label mb-2">{title}</div>
      <ul className="list-disc space-y-1 pl-5 text-sm text-gray-300">
        {items.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    </section>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex gap-2"><dt className="w-32 shrink-0 text-gray-500">{k}</dt><dd>{v}</dd></div>;
}
