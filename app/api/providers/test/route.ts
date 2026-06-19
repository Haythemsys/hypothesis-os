import { ok, bad, readJson } from "@/lib/server/http";
import { testConnection, type ProviderConfig } from "@/lib/providers";

export const dynamic = "force-dynamic";

// POST /api/providers/test { providerId, baseUrl, apiKey?, model? }
// Performs a REAL reachability request server-side. Never returns fake success.
// NOTE: a server on Railway cannot reach a phone's localhost Ollama — for local endpoints the
// client also tests directly from the browser (see the Settings page).
export async function POST(req: Request) {
  const cfg = await readJson<ProviderConfig>(req);
  if (!cfg?.providerId) return bad("providerId is required");
  const result = await testConnection(cfg);
  return ok(result, result.ok ? 200 : 502);
}
