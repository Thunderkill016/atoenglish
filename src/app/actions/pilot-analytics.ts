"use server";

import { headers } from "next/headers";

import {
  createRateLimiter,
  getClientIpFromHeaders,
} from "@/lib/security/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { PilotEventInputSchema } from "@/lib/pilot/pilot-analytics";

const pilotEventLimiter = createRateLimiter(60, 60_000, "pilot-events");

type PilotEventRow = {
  event_name: string;
  user_id: string | null;
  anonymous_id: string;
  source: string | null;
  unit_id: string | null;
  day_number: number | null;
  score: number | null;
  star_count: number | null;
  passed: boolean | null;
};

type PilotEventsClient = {
  from: (table: "pilot_events") => {
    insert: (row: PilotEventRow) => PromiseLike<{
      error: { message: string } | null;
    }>;
  };
};

export async function recordPilotEvent(
  input: unknown,
): Promise<{ success: boolean }> {
  const parsed = PilotEventInputSchema.safeParse(input);
  if (!parsed.success || !parsed.data.anonymousId) return { success: false };

  const requestHeaders = await headers();
  const ip = getClientIpFromHeaders(requestHeaders);
  const rateLimit = await pilotEventLimiter.check(ip);
  if (!rateLimit.success) return { success: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const event = parsed.data;
  const row: PilotEventRow = {
    event_name: event.eventName,
    user_id: user?.id ?? null,
    anonymous_id: event.anonymousId!,
    source: event.source ?? null,
    unit_id: event.unitId ?? null,
    day_number: event.dayNumber ?? null,
    score: event.score ?? null,
    star_count: event.starCount ?? null,
    passed: event.passed ?? null,
  };

  const { error } = await (supabase as unknown as PilotEventsClient)
    .from("pilot_events")
    .insert(row);

  return { success: !error };
}
