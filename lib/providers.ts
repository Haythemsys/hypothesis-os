// HypothesisOS — model provider system (Phase 6 & 7).
// One abstraction over local + external providers. NO provider is hardcoded as "the" model;
// the user picks one in Settings. Every call is a REAL fetch — testConnection never reports
// fake success. If no provider is configured, LLM features degrade gracefully (the
// deterministic engine still works with zero providers).

export type ProviderFormat = "openai" | "anthropic" | "ollama" | "google";

export interface ProviderMeta {
  id: string;
  label: string;
  defaultBaseUrl: string;
  needsKey: boolean;
  format: ProviderFormat;
  local?: boolean;
}

export const PROVIDERS: ProviderMeta[] = [
  { id: "local_ollama", label: "Local (Ollama)", defaultBaseUrl: "http://localhost:11434", needsKey: false, format: "ollama", local: true },
  { id: "openai", label: "OpenAI", defaultBaseUrl: "https://api.openai.com/v1", needsKey: true, format: "openai" },
  { id: "anthropic", label: "Anthropic", defaultBaseUrl: "https://api.anthropic.com", needsKey: true, format: "anthropic" },
  { id: "google", label: "Google (Gemini)", defaultBaseUrl: "https://generativelanguage.googleapis.com", needsKey: true, format: "google" },
  { id: "groq", label: "Groq", defaultBaseUrl: "https://api.groq.com/openai/v1", needsKey: true, format: "openai" },
  { id: "openrouter", label: "OpenRouter", defaultBaseUrl: "https://openrouter.ai/api/v1", needsKey: true, format: "openai" },
  { id: "together", label: "Together", defaultBaseUrl: "https://api.together.xyz/v1", needsKey: true, format: "openai" },
  { id: "custom_http", label: "Custom HTTP (OpenAI-compatible)", defaultBaseUrl: "", needsKey: false, format: "openai" },
];

export interface ProviderConfig {
  providerId: string;
  baseUrl: string;
  apiKey?: string;
  model?: string;
}
export interface ChatMessage { role: "system" | "user" | "assistant"; content: string }

export function metaFor(providerId: string): ProviderMeta | undefined {
  return PROVIDERS.find((p) => p.id === providerId);
}
const trim = (u: string) => (u || "").replace(/\/+$/, "");

/** Build the real HTTP request for a chat completion. */
function buildChat(cfg: ProviderConfig, messages: ChatMessage[]) {
  const meta = metaFor(cfg.providerId);
  const fmt = meta?.format ?? "openai";
  const base = trim(cfg.baseUrl || meta?.defaultBaseUrl || "");
  const model = cfg.model || "";
  const headers: Record<string, string> = { "content-type": "application/json" };

  if (fmt === "ollama") {
    return { url: `${base}/api/chat`, headers,
      body: { model, messages, stream: false } };
  }
  if (fmt === "anthropic") {
    headers["x-api-key"] = cfg.apiKey ?? "";
    headers["anthropic-version"] = "2023-06-01";
    const sys = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
    const rest = messages.filter((m) => m.role !== "system");
    return { url: `${base}/v1/messages`, headers,
      body: { model, system: sys || undefined, messages: rest, max_tokens: 1024 } };
  }
  if (fmt === "google") {
    const contents = messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
    return { url: `${base}/v1beta/models/${model}:generateContent?key=${encodeURIComponent(cfg.apiKey ?? "")}`,
      headers, body: { contents } };
  }
  // openai-compatible
  if (cfg.apiKey) headers["authorization"] = `Bearer ${cfg.apiKey}`;
  return { url: `${base}/chat/completions`, headers,
    body: { model, messages, stream: false } };
}

function parseChat(fmt: ProviderFormat, json: any): string {
  if (fmt === "ollama") return json?.message?.content ?? "";
  if (fmt === "anthropic") return (json?.content ?? []).map((c: any) => c?.text ?? "").join("");
  if (fmt === "google") return (json?.candidates?.[0]?.content?.parts ?? []).map((p: any) => p?.text ?? "").join("");
  return json?.choices?.[0]?.message?.content ?? "";
}

/** Execute a chat completion. Throws on any non-OK response (never fakes success). */
export async function chat(cfg: ProviderConfig, messages: ChatMessage[], timeoutMs = 30000): Promise<string> {
  const meta = metaFor(cfg.providerId);
  const { url, headers, body } = buildChat(cfg, messages);
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: ctrl.signal });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    let json: any; try { json = JSON.parse(text); } catch { throw new Error("non-JSON response from provider"); }
    return parseChat(meta?.format ?? "openai", json);
  } finally { clearTimeout(t); }
}

/** A real, lightweight reachability test. Returns {ok, detail} — failures are reported honestly. */
export async function testConnection(cfg: ProviderConfig, timeoutMs = 12000): Promise<{ ok: boolean; detail: string }> {
  const meta = metaFor(cfg.providerId);
  const fmt = meta?.format ?? "openai";
  const base = trim(cfg.baseUrl || meta?.defaultBaseUrl || "");
  if (!base) return { ok: false, detail: "No base URL set." };

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    let url = "", headers: Record<string, string> = {};
    if (fmt === "ollama") { url = `${base}/api/tags`; }
    else if (fmt === "anthropic") { url = `${base}/v1/models`; headers = { "x-api-key": cfg.apiKey ?? "", "anthropic-version": "2023-06-01" }; }
    else if (fmt === "google") { url = `${base}/v1beta/models?key=${encodeURIComponent(cfg.apiKey ?? "")}`; }
    else { url = `${base}/models`; if (cfg.apiKey) headers = { authorization: `Bearer ${cfg.apiKey}` }; }

    const res = await fetch(url, { method: "GET", headers, signal: ctrl.signal });
    const body = await res.text();
    if (!res.ok) return { ok: false, detail: `HTTP ${res.status}: ${body.slice(0, 160)}` };
    // count models if we can, just as a useful signal
    let n = 0;
    try { const j = JSON.parse(body); n = (j.data || j.models || j.models?.length || []).length || 0; } catch {}
    return { ok: true, detail: n ? `Reachable — ${n} model(s) visible.` : "Reachable." };
  } catch (e: any) {
    return { ok: false, detail: e?.name === "AbortError" ? "Timed out." : (e?.message || "Unreachable.") };
  } finally { clearTimeout(t); }
}
