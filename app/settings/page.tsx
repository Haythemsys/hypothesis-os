"use client";
import { useEffect, useState } from "react";
import { PROVIDERS, metaFor, type ProviderConfig } from "@/lib/providers";
import { getProviderConfig, saveProviderConfig, clearProviderConfig, getIdentity, setOrg, api } from "@/lib/client";

export default function Settings() {
  const [cfg, setCfg] = useState<ProviderConfig>({ providerId: "local_ollama", baseUrl: "http://localhost:11434", apiKey: "", model: "" });
  const [test, setTest] = useState<{ ok: boolean; detail: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [orgId, setOrgId] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const saved = getProviderConfig(); if (saved) setCfg(saved);
    const id = getIdentity(); setUserId(id.userId); setOrgId(id.orgId);
  }, []);

  const meta = metaFor(cfg.providerId);
  const pick = (providerId: string) => {
    const m = metaFor(providerId);
    setCfg((p) => ({ ...p, providerId, baseUrl: m?.defaultBaseUrl || p.baseUrl }));
    setTest(null);
  };
  const save = () => { saveProviderConfig(cfg); setTest({ ok: true, detail: "Saved on this device." }); };

  const runTest = async () => {
    setTesting(true); setTest(null);
    try {
      // Server-side test for cloud providers; for LOCAL endpoints try the browser first
      // (a Railway server can't reach your phone's localhost — the browser can).
      if (meta?.local) {
        try {
          const r = await fetch(cfg.baseUrl.replace(/\/+$/, "") + "/api/tags");
          if (r.ok) { setTest({ ok: true, detail: "Reachable from this device (browser)." }); setTesting(false); return; }
        } catch {}
      }
      const r = await api<{ ok: boolean; detail: string }>("/api/providers/test", { method: "POST", body: cfg })
        .catch((e) => ({ ok: false, detail: String(e.message || e) }));
      setTest(r);
    } finally { setTesting(false); }
  };

  return (
    <div className="space-y-4">
      <section className="card">
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Configure a model provider. No provider is hardcoded; the deterministic engine works
          with <b>no</b> provider configured — LLM features simply stay off.
        </p>
      </section>

      <section className="card space-y-3">
        <div className="label">Model provider</div>
        <div className="grid grid-cols-2 gap-2">
          {PROVIDERS.map((p) => (
            <button key={p.id} onClick={() => pick(p.id)}
              className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm ${cfg.providerId === p.id ? "border-white/40 bg-white/10" : "border-line"}`}>
              {p.label}{p.local ? " · local" : ""}
            </button>
          ))}
        </div>

        <Field label="Base URL">
          <input className="input" value={cfg.baseUrl} placeholder={meta?.defaultBaseUrl}
            onChange={(e) => setCfg((p) => ({ ...p, baseUrl: e.target.value }))} />
        </Field>
        {meta?.needsKey && (
          <Field label="API key (stored only on this device)">
            <input className="input" type="password" value={cfg.apiKey} autoComplete="off"
              onChange={(e) => setCfg((p) => ({ ...p, apiKey: e.target.value }))} />
          </Field>
        )}
        <Field label="Model name">
          <input className="input" value={cfg.model} placeholder={meta?.local ? "e.g. llama3.1" : "e.g. gpt-4o-mini"}
            onChange={(e) => setCfg((p) => ({ ...p, model: e.target.value }))} />
        </Field>

        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={runTest} disabled={testing}>{testing ? "Testing…" : "Test connection"}</button>
          <button className="btn" onClick={save}>Save</button>
          <button className="btn text-kill" onClick={() => { clearProviderConfig(); setTest({ ok: true, detail: "Cleared." }); }}>Clear</button>
        </div>
        {test && (
          <p className={`rounded-lg p-2 text-sm ${test.ok ? "verdict-GO" : "verdict-KILL"}`}>
            {test.ok ? "✓ " : "✗ "}{test.detail}
          </p>
        )}
        {meta?.local && (
          <p className="text-xs text-gray-500">
            Local tip: run <code>ollama serve</code> and <code>ollama pull {cfg.model || "llama3.1"}</code>.
            On a phone, point Base URL at your LAN host (e.g. <code>http://192.168.1.x:11434</code>).
          </p>
        )}
      </section>

      <section className="card space-y-2">
        <div className="label">Identity (account-ready, not yet authenticated)</div>
        <p className="text-xs text-gray-500">Your device id scopes your data. Set an org to share with a team.</p>
        <div className="text-sm text-gray-300">user: <code>{userId}</code></div>
        <div className="flex gap-2">
          <input className="input" value={orgId} placeholder="org id (blank = private)" onChange={(e) => setOrgId(e.target.value)} />
          <button className="btn shrink-0" onClick={() => { setOrg(orgId); setTest({ ok: true, detail: "Org updated." }); }}>Set org</button>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1"><span className="label">{label}</span>{children}</label>;
}
