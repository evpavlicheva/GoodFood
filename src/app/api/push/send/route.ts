import { NextRequest, NextResponse } from "next/server";
import { isPushConfigured, sendPushToRole, type PushPayload } from "@/lib/push/server";

export const runtime = "nodejs";

interface SendBody {
  role?: "child" | "parent";
  profileName?: string;
  kind?: "reminder" | "order_placed";
  title?: string;
  body?: string;
}

const DEFAULTS: Record<"reminder" | "order_placed", { title: string; body: string }> = {
  reminder: { title: "GoodFood", body: "Time to choose your food! 🍽️" },
  order_placed: { title: "GoodFood", body: "Your child just placed an order! 🔔" },
};

/**
 * Sends a push notification.
 * - `role: "child"` + `profileName` -> "time to order" reminder to that child.
 * - `role: "parent"` -> "order placed" notification to the parent inbox.
 */
export async function POST(request: NextRequest) {
  if (!isPushConfigured) {
    return NextResponse.json({ error: "Push notifications aren't configured on the server." }, { status: 500 });
  }

  let body: SendBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const role = body.role;
  const kind = body.kind;

  if (role !== "child" && role !== "parent") {
    return NextResponse.json({ error: "role must be 'child' or 'parent'." }, { status: 400 });
  }
  if (kind !== "reminder" && kind !== "order_placed") {
    return NextResponse.json({ error: "kind must be 'reminder' or 'order_placed'." }, { status: 400 });
  }
  if (role === "child" && !body.profileName?.trim()) {
    return NextResponse.json({ error: "profileName is required for role 'child'." }, { status: 400 });
  }

  const defaults = DEFAULTS[kind];
  const payload: PushPayload = {
    title: body.title?.trim() || defaults.title,
    body: body.body?.trim() || defaults.body,
    kind,
    tag: kind,
    url: role === "child" ? "/home" : "/dashboard",
    profileName: body.profileName?.trim(),
  };

  const result = await sendPushToRole(role, role === "child" ? body.profileName! : null, payload);

  return NextResponse.json({ ok: true, ...result });
}
