import webpush, { WebPushError, type PushSubscription as WebPushSubscription } from "web-push";
import { supabase } from "@/lib/supabase/client";

export type NotificationRole = "child" | "parent";

export interface PushPayload {
  /** Notification title shown by the OS. */
  title: string;
  /** Notification body text. */
  body: string;
  /**
   * "reminder"     -> shown to a child, triggers the jingle + full-screen
   *                   "Пора сделать заказ!" overlay if the app is open.
   * "order_placed" -> shown to the parent when a child places an order.
   */
  kind: "reminder" | "order_placed";
  /** Optional dedupe tag for the OS notification. */
  tag?: string;
  /** Optional URL to focus/open when the notification is clicked. */
  url?: string;
  /** Extra context, e.g. the child's name, shown in the overlay. */
  profileName?: string;
}

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT;

export const isPushConfigured = !!(vapidPublicKey && vapidPrivateKey && vapidSubject && supabase);

if (vapidPublicKey && vapidPrivateKey && vapidSubject) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

interface SubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * Sends `payload` to every push subscription matching `role` (and, for
 * children, `profileName`). Subscriptions that the push service reports as
 * gone (404/410 — e.g. the browser data was cleared) are removed from the
 * database automatically.
 *
 * Returns how many subscriptions were notified successfully.
 */
export async function sendPushToRole(
  role: NotificationRole,
  profileName: string | null,
  payload: PushPayload
): Promise<{ sent: number; total: number }> {
  if (!supabase) return { sent: 0, total: 0 };

  let query = supabase.from("push_subscriptions").select("id, endpoint, p256dh, auth").eq("role", role);
  if (role === "child") {
    query = query.eq("profile_name", normalizeName(profileName ?? ""));
  }

  const { data, error } = await query;
  if (error || !data) return { sent: 0, total: 0 };

  const rows = data as SubscriptionRow[];
  const body = JSON.stringify(payload);
  const staleIds: string[] = [];
  let sent = 0;

  await Promise.all(
    rows.map(async (row) => {
      const subscription: WebPushSubscription = {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth },
      };
      try {
        await webpush.sendNotification(subscription, body);
        sent += 1;
      } catch (err) {
        if (err instanceof WebPushError && (err.statusCode === 404 || err.statusCode === 410)) {
          staleIds.push(row.id);
        }
      }
    })
  );

  if (staleIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", staleIds);
  }

  return { sent, total: rows.length };
}

/** Matches the case-insensitive name normalization used by `childProfile.ts`. */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}
