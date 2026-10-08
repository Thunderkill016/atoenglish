import { redirect } from "next/navigation";
import { UserRound } from "lucide-react";

import { SignOutButton } from "@/app/(main)/me/sign-out-button";
import { createClient } from "@/lib/supabase/server";

/**
 * Minimal account surface — the "Tôi" nav entry. Shows who is signed in and
 * provides sign-out; deeper profile/settings land here later.
 */
export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/me");

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
        <UserRound className="h-8 w-8 text-muted-foreground" aria-hidden />
      </div>
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Tài khoản</h1>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
      <SignOutButton />
    </div>
  );
}
