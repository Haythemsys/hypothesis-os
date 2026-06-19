"use client";
// Client-side helpers: a stable per-device identity (so the API scopes data per user even
// before real auth) and provider-config persistence. API keys live ONLY in this device's
// localStorage and are sent per-request — never stored server-side.
import type { ProviderConfig } from "./providers";

const ID_KEY = "hypothesisos.identity.v1";
const PROVIDER_KEY = "hypothesisos.provider.v1";

export function getIdentity(): { userId: string; orgId: string } {
  if (typeof window === "undefined") return { userId: "local-user", orgId: "" };
  try {
    const raw = localStorage.getItem(ID_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const userId = "u_" + Math.random().toString(36).slice(2, 10);
  const id = { userId, orgId: "" }; // empty org => personal (isolated) by default
  try { localStorage.setItem(ID_KEY, JSON.stringify(id)); } catch {}
  return id;
}

export function setOrg(orgId: string) {
  const id = getIdentity();
  const next = { ...id, orgId: orgId.trim() };
  try { localStorage.setItem(ID_KEY, JSON.stringify(next)); } catch {}
}

function headers(extra?: Record<string, string>): Record<string, string> {
  const id = getIdentity();
  const h: Record<string, string> = { "content-type": "application/json", "x-user-id": id.userId, ...extra };
  if (id.orgId) h["x-org-id"] = id.orgId;
  return h;
}

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(path, {
    method: opts.method || "GET",
    headers: headers(),
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let data: any; try { data = JSON.parse(text); } catch { data = { error: text }; }
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data as T;
}

export function getProviderConfig(): ProviderConfig | null {
  if (typeof window === "undefined") return null;
  try { const raw = localStorage.getItem(PROVIDER_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
export function saveProviderConfig(cfg: ProviderConfig) {
  try { localStorage.setItem(PROVIDER_KEY, JSON.stringify(cfg)); } catch {}
}
export function clearProviderConfig() {
  try { localStorage.removeItem(PROVIDER_KEY); } catch {}
}
