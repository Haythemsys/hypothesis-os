import { NextResponse } from "next/server";
import { store } from "@/lib/server/sqlite-store";

export async function GET() {
  try {
    const signups = store.listBetaSignups();
    return NextResponse.json({ signups, total: signups.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
