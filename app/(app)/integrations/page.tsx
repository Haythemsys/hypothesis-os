"use client";
import { useState } from "react";
import Link from "next/link";

type ConnectorStatus = "connected" | "configure" | "coming_soon";

type Connector = {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: ConnectorStatus;
  fields?: { key: string; label: string; placeholder: string; type?: string }[];
  useCase: string;
};

const CONNECTORS: Connector[] = [
  {
    id: "csv",
    name: "CSV Import",
    description: "Import structured data from CSV files as evidence. Supports metrics, survey results, and financial data.",
    icon: "⊞",
    status: "configure",
    useCase: "Market survey data, cohort analysis, financial projections",
    fields: [],
  },
  {
    id: "google_sheets",
    name: "Google Sheets",
    description: "Connect a Google Sheet and pull rows as evidence dimensions. Ideal for tracking metrics over time.",
    icon: "⊟",
    status: "configure",
    useCase: "KPI dashboards, experiment logs, financial models",
    fields: [
      { key: "sheet_url", label: "Sheet URL", placeholder: "https://docs.google.com/spreadsheets/d/..." },
      { key: "range", label: "Data Range", placeholder: "Sheet1!A1:Z100" },
      { key: "api_key", label: "Google API Key", placeholder: "AIza…", type: "password" },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    description: "Connect a Notion database to pull structured properties as evidence fields.",
    icon: "▣",
    status: "configure",
    useCase: "Product backlogs, research databases, meeting notes",
    fields: [
      { key: "integration_token", label: "Integration Token", placeholder: "secret_…", type: "password" },
      { key: "database_id", label: "Database ID", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    description: "Pull GitHub repository data — issues, PRs, commit velocity — as technical evidence for product decisions.",
    icon: "◈",
    status: "configure",
    useCase: "Technical feasibility, team velocity, codebase health",
    fields: [
      { key: "token", label: "Personal Access Token", placeholder: "ghp_…", type: "password" },
      { key: "repo", label: "Repository", placeholder: "owner/repo" },
    ],
  },
  {
    id: "jira",
    name: "Jira",
    description: "Import Jira epic and sprint data to evidence execution risk and team capacity for a decision.",
    icon: "⚑",
    status: "configure",
    useCase: "Execution risk, team capacity, backlog prioritization",
    fields: [
      { key: "base_url", label: "Jira Base URL", placeholder: "https://your-org.atlassian.net" },
      { key: "email", label: "Email", placeholder: "you@company.com" },
      { key: "api_token", label: "API Token", placeholder: "…", type: "password" },
      { key: "project_key", label: "Project Key", placeholder: "PROJ" },
    ],
  },
];

const STATUS_STYLE: Record<ConnectorStatus, string> = {
  connected: "bg-go/20 text-go",
  configure: "bg-amber/15 text-amber",
  coming_soon: "bg-white/8 text-slate",
};
const STATUS_LABEL: Record<ConnectorStatus, string> = {
  connected: "Connected",
  configure: "Configure",
  coming_soon: "Coming Soon",
};

export default function Integrations() {
  const [activeConnector, setActiveConnector] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<string | null>(null);

  function handleOpen(id: string) {
    setActiveConnector(activeConnector === id ? null : id);
    setTestResult(null);
  }

  function handleField(key: string, val: string) {
    setFormValues(prev => ({ ...prev, [key]: val }));
  }

  function handleTest(connector: Connector) {
    // Simulate a connection test (UI demo — no real API call)
    setTestResult("Validating…");
    setTimeout(() => {
      if (connector.id === "csv") {
        setTestResult("✓ CSV Import is always available — use the Import page.");
      } else {
        const filled = (connector.fields || []).filter(f => formValues[f.key]?.trim());
        if (filled.length < (connector.fields || []).length) {
          setTestResult("✗ Fill all required fields before testing.");
        } else {
          setTestResult("⚙ Integration configured. Real data sync requires server-side OAuth — deploy to Railway with credentials to activate.");
        }
      }
    }, 800);
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="label">Real World Data Connectors</div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="mt-1 text-sm text-slate">Connect existing organizational data sources as evidence for your decisions.</p>
      </div>

      {/* Quick note */}
      <div className="card border-amber/20 bg-amber/5">
        <div className="text-xs text-slate space-y-1">
          <div className="font-semibold text-steel">How Integrations Work</div>
          <div>Data from connected sources is extracted as evidence. It passes through the same deterministic engine — integrations provide input, the engine decides. No connector can override a verdict.</div>
          <div className="mt-1">For CSV import, use the <Link href="/import" className="text-amber hover:underline">Import page</Link>. For document upload, use <Link href="/evidence-upload" className="text-amber hover:underline">Evidence Upload</Link>.</div>
        </div>
      </div>

      {/* Connector cards */}
      <div className="space-y-3">
        {CONNECTORS.map(c => (
          <div key={c.id} className="card space-y-3">
            <div className="flex items-start gap-3">
              <div className="text-2xl shrink-0 mt-0.5">{c.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm">{c.name}</h3>
                  <span className={`pill text-[10px] ${STATUS_STYLE[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate">{c.description}</p>
                <p className="mt-0.5 text-xs text-slate/70">Use case: {c.useCase}</p>
              </div>
              {c.status !== "coming_soon" && (
                <button onClick={() => handleOpen(c.id)} className="btn-ghost text-xs shrink-0 py-1 px-3">
                  {activeConnector === c.id ? "Close" : c.id === "csv" ? "Use" : "Configure"}
                </button>
              )}
            </div>

            {activeConnector === c.id && (
              <div className="border-t border-border-hair pt-3 space-y-3">
                {c.id === "csv" ? (
                  <div className="space-y-2">
                    <p className="text-sm text-steel">CSV import is fully functional. Use the Import page for structured data or Evidence Upload for documents.</p>
                    <div className="flex gap-2">
                      <Link href="/import" className="btn-primary text-sm">CSV Import →</Link>
                      <Link href="/evidence-upload" className="btn-ghost text-sm">Evidence Upload →</Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      {(c.fields || []).map(f => (
                        <div key={f.key}>
                          <label className="label mb-1">{f.label}</label>
                          <input
                            type={f.type || "text"}
                            className="input text-sm"
                            placeholder={f.placeholder}
                            value={formValues[f.key] || ""}
                            onChange={e => handleField(f.key, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => handleTest(c)} className="btn-primary text-sm">Test Connection</button>
                      <button onClick={() => setTestResult(null)} className="btn-ghost text-sm">Clear</button>
                    </div>
                    {testResult && (
                      <div className={`rounded-inner border px-3 py-2 text-sm ${testResult.startsWith("✓") ? "bg-go/10 border-go/20 text-go" : testResult.startsWith("✗") ? "bg-kill/10 border-kill/20 text-kill" : "bg-amber/10 border-amber/20 text-steel"}`}>
                        {testResult}
                      </div>
                    )}
                    <p className="text-xs text-slate">Credentials are stored in your browser session only. Full sync requires server deployment with environment variables.</p>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom integration note */}
      <div className="card bg-white/2 border-border-hair space-y-1">
        <div className="text-sm font-semibold">Custom Integrations</div>
        <p className="text-xs text-slate">Need a connector not listed here? Use the Evidence Upload API (<code className="data text-[10px]">POST /api/evidence-ingest</code>) to push structured content from any source programmatically.</p>
        <p className="text-xs text-slate mt-1">All evidence — regardless of source — flows through the same deterministic engine. No integration can change verdict thresholds.</p>
      </div>
    </div>
  );
}
