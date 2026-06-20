import { NextRequest, NextResponse } from "next/server";
import { store, newId } from "@/lib/server/sqlite-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role, useCase, company, decisionType } = body;
    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    const signup = store.createBetaSignup({
      id: newId("beta"),
      name: String(name).slice(0, 100),
      email: String(email).toLowerCase().slice(0, 200),
      role: String(role || "").slice(0, 100),
      useCase: String(useCase || "").slice(0, 500),
      company: String(company || "").slice(0, 100),
      decisionType: String(decisionType || "").slice(0, 100),
      createdAt: new Date().toISOString(),
    });

    // Track as analytics event
    store.createEvent({
      id: newId("evt"),
      name: "beta_signup",
      properties: JSON.stringify({ role: signup.role, decisionType: signup.decisionType }),
      orgId: "",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, id: signup.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  // Public count only — admin route has full data
  try {
    const count = store.countBetaSignups();
    return NextResponse.json({ count });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
