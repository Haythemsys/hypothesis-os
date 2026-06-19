import type { NextRequest } from "next/server";
import { ok } from "@/lib/server/http";
import map from "@/docs/KNOWLEDGE_MAP.json";

export const dynamic = "force-dynamic";

// GET /api/archive?q=&ext=&category=  — serves the REAL indexed file list (no fabricated content).
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").toLowerCase();
  const ext = sp.get("ext") || "";
  const category = sp.get("category") || "";

  let files = (map.files as { name: string; ext: string; bytes: number; category: string }[]).slice();
  if (q) files = files.filter((f) => f.name.toLowerCase().includes(q));
  if (ext) files = files.filter((f) => f.ext === ext);
  if (category) files = files.filter((f) => f.category === category);

  return ok({
    source: map.source, fileCount: map.fileCount, categories: map.categories,
    returned: files.length, files,
  });
}
