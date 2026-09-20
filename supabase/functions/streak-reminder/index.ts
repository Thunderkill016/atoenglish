/**
 * Supabase Edge Function: streak-reminder
 * Runs from a trusted scheduler using POST only.
 * Requires: Authorization: Bearer $STREAK_REMINDER_CRON_SECRET
 */

import { createClient } from "jsr:@supabase/supabase-js@2";
import { authorizeBearer, jsonResponse } from "../_shared/privileged-auth.ts";

async function sendWebPush(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: { title: string; body: string; icon: string },
): Promise<boolean> {
  const { endpoint, keys } = subscription;
  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
  const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@atoenglish.app";

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.error("[Push] VAPID keys not configured");
    return false;
  }

  try {
    const webpush = await import("npm:web-push@3");
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    await webpush.sendNotification(
      { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } },
      JSON.stringify(payload),
    );
    return true;
  } catch (err) {
    console.error("[Push] Send failed:", err);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authError = authorizeBearer(
    req,
    Deno.env.get("STREAK_REMINDER_CRON_SECRET"),
  );
  if (authError) return authError;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStr = todayStart.toISOString();

  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("user_id, endpoint, keys")
    .not(
      "user_id",
      "in",
      `(
        SELECT DISTINCT user_id FROM card_review_logs
        WHERE created_at >= '${todayStr}'
        UNION
        SELECT DISTINCT user_id FROM completed_lessons
        WHERE completed_at >= '${todayStr}'
      )`,
    )
    .limit(500);

  if (error) {
    console.error("[Reminder] Query failed:", error);
    return jsonResponse({ error: error.message }, 500);
  }

  const payload = {
    title: "AtoEnglish 🔥",
    body: "Streak của bạn đang chờ! Chỉ 5 phút thôi — đừng để nó bị mất nhé.",
    icon: "/icon-192.png",
  };

  let sent = 0;
  let failed = 0;
  for (const sub of subscriptions ?? []) {
    const ok = await sendWebPush(sub, payload);
    if (ok) sent++;
    else failed++;
  }

  console.log(`[Reminder] Sent: ${sent}, Failed: ${failed}`);
  return jsonResponse({ sent, failed, total: subscriptions?.length ?? 0 });
});
