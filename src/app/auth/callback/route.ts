import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveAuthNext } from "@/app/login/auth-helpers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next");

  // Neon Auth (Better Auth) completes OAuth upstream and redirects here with
  // the session cookie already set — there is no `code` to exchange. Read the
  // session directly; skip when unauthenticated (failed/cancelled login).
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    return NextResponse.redirect(`${origin}/login?mode=login`);
  }

  // `next` is an internal path supplied by our own login flow — reject
  // absolute/scheme-relative URLs so it cannot become an open redirect.
  return NextResponse.redirect(`${origin}${resolveAuthNext(next)}`);
}
