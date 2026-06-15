import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { normalizeName } from "@/lib/push/server";

export const runtime = "nodejs";

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Returns all reminder schedules (one row per child profile). */
export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: "Supabase isn't configured on the server." }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("notification_schedules")
    .select("profile_name, times, enabled")
    .order("profile_name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ schedules: data ?? [] });
}

interface ScheduleBody {
  profileName?: string;
  times?: string[];
  enabled?: boolean;
}

/** Creates or updates the reminder schedule for one child profile. */
export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Supabase isn't configured on the server." }, { status: 500 });
  }

  let body: ScheduleBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.profileName?.trim()) {
    return NextResponse.json({ error: "profileName is required." }, { status: 400 });
  }
  const times = Array.isArray(body.times) ? body.times : [];
  if (!times.every((time) => typeof time === "string" && TIME_RE.test(time))) {
    return NextResponse.json({ error: "times must be an array of 'HH:MM' strings." }, { status: 400 });
  }

  const { error } = await supabase.from("notification_schedules").upsert(
    {
      profile_name: normalizeName(body.profileName),
      times,
      enabled: body.enabled ?? true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "profile_name" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** Deletes a child profile's reminder schedule entirely. */
export async function DELETE(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Supabase isn't configured on the server." }, { status: 500 });
  }

  let body: { profileName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.profileName?.trim()) {
    return NextResponse.json({ error: "profileName is required." }, { status: 400 });
  }

  const { error } = await supabase
    .from("notification_schedules")
    .delete()
    .eq("profile_name", normalizeName(body.profileName));

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
