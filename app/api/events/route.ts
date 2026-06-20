import { NextRequest, NextResponse } from "next/server";
import { store, newId } from "@/lib/server/sqlite-store";
import { getIdentity } from "@/lib/server/identity";

const VALID_EVENTS = new Set([
  "landing_view", "demo_started", "decision_created", "report_generated",
  "export_clicked", "beta_signup", "pricing_interest", "onboarding_started",
  "onboarding_completed", "demo_viewed",
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, properties } = body;
    if (!name || !VALID_EVENTS.has(name)) {
      return NextResponse.json({ error: "Invalid event name." }, { status: 400 });
    }

    let orgId = "";
    try {
      const ident = getIdentity(req);
      orgId = ident.orgId;
    } catch {
      // anonymous event — ok for landing page
    }

    store.createEvent({
      id: newId("evt"),
      name: String(name),
      properties: JSON.stringify(properties || {}),
      orgId,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const counts = store.countEventsByName();
    return NextResponse.json({ counts });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
