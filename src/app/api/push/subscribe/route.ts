import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { normalizeName } from "@/lib/push/server";

export const runtime = "nodejs";

interface SubscribeBody {
  role?: "child" | "parent";
  profileName?: string;
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
}

/** Saves (or updates) a browser's push subscription. */
export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Supabase isn't configured on the server." }, { status: 500 });
  }

  let body: SubscribeBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const role = body.role;
  const endpoint = body.subscription?.endpoint;
  const p256dh = body.subscription?.keys?.p256dh;
  const auth = body.subscription?.keys?.auth;

  if (role !== "child" && role !== "parent") {
    return NextResponse.json({ error: "role must be 'child' or 'parent'." }, { status: 400 });
  }
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "subscription.endpoint and keys are required." }, { status: 400 });
  }
  if (role === "child" && !body.profileName?.trim()) {
    return NextResponse.json({ error: "profileName is required for role 'child'." }, { status: 400 });
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      role,
      profile_name: role === "child" ? normalizeName(body.profileName!) : "",
      endpoint,
      p256dh,
      auth,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** Removes a push subscription (e.g. when the user disables notifications). */
export async function DELETE(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Supabase isn't configured on the server." }, { status: 500 });
  }

  let body: { endpoint?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.endpoint) {
    return NextResponse.json({ error: "endpoint is required." }, { status: 400 });
  }

  const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", body.endpoint);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
