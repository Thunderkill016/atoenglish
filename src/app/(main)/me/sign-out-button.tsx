"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * Signs out through the browser client — the same-origin /api/auth proxy is
 * the only path that clears the session cookie on this domain (a server-side
 * signOut() invalidates upstream but leaves the browser cookie intact).
 */
export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const { error } = await createClient().auth.signOut();
        if (error) setPending(false);
        router.push("/");
        router.refresh();
      }}
    >
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
      ) : (
        <LogOut className="mr-2 h-4 w-4" aria-hidden />
      )}
      Đăng xuất
    </Button>
  );
}
