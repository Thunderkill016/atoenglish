import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getDailyMinutes,
  getDailyXpGoalFromTime,
  getOnboardingRedirectPath,
  getOnboardingStartingUnitIndex,
  mapQuizLevelToCefr,
} from "@/lib/onboarding";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/learn";
  let destination = next;

  // Neon Auth (Better Auth) completes OAuth upstream and redirects here with
  // the session cookie already set — there is no `code` to exchange. Read the
  // session directly; skip when unauthenticated (failed/cancelled login).
  {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    if (data?.user) {
      const user = data.user;
      const level = searchParams.get("level") ?? "A0-A1";
      const target = searchParams.get("target") ?? "work";
      const obstacle = searchParams.get("obstacle") ?? "fear";
      const time = searchParams.get("time") ?? "15min";
      const mappedLevel = mapQuizLevelToCefr(level);
      const dailyXpGoal = getDailyXpGoalFromTime(time);
      const dailyMinutes = getDailyMinutes(time);

      const { data: existingProgress } = await supabase
        .from("user_progress")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      const isNewUser = !existingProgress;

      // Upsert user_progress — insert for new users, skip for returning users
      // (ignoreDuplicates preserves existing level/xp/streak on re-login)
      await supabase.from("user_progress").upsert(
        {
          user_id: user.id,
          current_level: mappedLevel,
          starting_unit_index: getOnboardingStartingUnitIndex(level),
          streak: 0,
          total_xp: 0,
          daily_xp_goal: dailyXpGoal,
        },
        { onConflict: "user_id", ignoreDuplicates: true }
      );

      if (isNewUser) {
        // Persist Q2–Q4 from signup survey (goal/obstacle/daily_minutes)
        await supabase.from("user_onboarding_profile").upsert(
          {
            user_id: user.id,
            goal: target,
            obstacle: obstacle,
            daily_minutes: dailyMinutes,
          },
          { onConflict: "user_id", ignoreDuplicates: true }
        );
      }

      // New signups with onboarding survey → first lesson micro-session (~3 min)
      if (isNewUser && searchParams.has("level")) {
        destination = getOnboardingRedirectPath(level, time);
      }
    }
  }

  return NextResponse.redirect(`${origin}${destination}`);
}
