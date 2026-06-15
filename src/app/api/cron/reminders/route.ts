import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { isPushConfigured, sendPushToRole } from "@/lib/push/server";

export const runtime = "nodejs";

// How close (in minutes) "now" must be to a scheduled time for it to fire.
// Keeps this endpoint working whether it's hit every minute (external cron)
// or every few minutes, without double-sending or missing a slot.
const FIRE_WINDOW_MINUTES = 10;

interface ScheduleRow {
  profile_name: string;
  times: string[];
  enabled: boolean;
  last_sent: Record<string, boolean>;
}

/** "HH:MM" and "YYYY-MM-DD" for `timeZone`, right now. */
function nowInTimezone(timeZone: string): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const map: Record<string, string> = {};
  for (const part of parts) map[part.type] = part.value;
  return { date: `${map.year}-${map.month}-${map.day}`, time: `${map.hour}:${map.minute}` };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Cron endpoint: checks every child's reminder schedule and sends a "time
 * to order!" push for any time slot that's due and hasn't fired yet today.
 *
 * Protected by `CRON_SECRET` — call with `Authorization: Bearer <secret>`.
 * Vercel Cron Jobs send this header automatically when `CRON_SECRET` is set
 * as an env var. On the Hobby plan, Vercel Cron can only run once a day, so
 * for multiple daily reminder times, point a free external cron service
 * (e.g. cron-job.org) at this URL every few minutes with the same header.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET isn't configured on the server." }, { status: 500 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: "Supabase isn't configured on the server." }, { status: 500 });
  }
  if (!isPushConfigured) {
    return NextResponse.json({ error: "Push notifications aren't configured on the server." }, { status: 500 });
  }

  const timezone = process.env.NOTIFICATION_TIMEZONE || "UTC";
  const { date, time } = nowInTimezone(timezone);
  const nowMinutes = toMinutes(time);

  const { data, error } = await supabase
    .from("notification_schedules")
    .select("profile_name, times, enabled, last_sent")
    .eq("enabled", true);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as ScheduleRow[];
  const fired: { profileName: string; time: string }[] = [];

  for (const row of rows) {
    const lastSent = row.last_sent && typeof row.last_sent === "object" ? row.last_sent : {};
    let dueTime: string | null = null;

    for (const slot of row.times) {
      const key = `${date}_${slot}`;
      if (lastSent[key]) continue;

      const diff = nowMinutes - toMinutes(slot);
      if (diff >= 0 && diff < FIRE_WINDOW_MINUTES) {
        dueTime = slot;
        break;
      }
    }

    if (!dueTime) continue;

    await sendPushToRole("child", row.profile_name, {
      title: "GoodFood",
      body: "Time to choose your food! 🍽️",
      kind: "reminder",
      tag: "reminder",
      url: "/home",
      profileName: row.profile_name,
    });

    await supabase
      .from("notification_schedules")
      .update({
        last_sent: { ...lastSent, [`${date}_${dueTime}`]: true },
        updated_at: new Date().toISOString(),
      })
      .eq("profile_name", row.profile_name);

    fired.push({ profileName: row.profile_name, time: dueTime });
  }

  return NextResponse.json({ ok: true, checked: rows.length, fired });
}
