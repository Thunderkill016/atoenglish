"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, TriangleAlert } from "lucide-react";

import { deleteAllMyData } from "@/app/actions/account";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * `/me` danger zone — erase all learner data (SPEC §14). Two-step inline
 * confirm matching the library delete convention, then the atomic
 * delete_my_data() RPC wipes every user-keyed table in one transaction.
 * On success the session ends: sign out through the browser client (the
 * /api/auth proxy clears the cookie) and land on the public home page.
 */
export function DeleteDataSection() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function onConfirm() {
    setPending(true);
    setFailed(false);
    const result = await deleteAllMyData();
    if (!result.ok) {
      setPending(false);
      setFailed(true);
      return;
    }
    // Data is gone — end the session so the empty account isn't browsable.
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <section className="rounded-xl border border-destructive/30 bg-card p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-destructive">
        <TriangleAlert className="h-4 w-4" aria-hidden />
        Xoá dữ liệu
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Xoá vĩnh viễn mọi dữ liệu học tập của bạn: từ và câu đã lưu, transcript,
        lịch sử luyện tập và tiến độ ôn tập. Không thể khôi phục.
      </p>
      {failed && (
        <p role="alert" className="mt-2 text-xs text-destructive">
          Chưa xoá được — chưa có dữ liệu nào bị mất. Thử lại.
        </p>
      )}
      {confirming ? (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs">
          <span>Chắc chắn xoá toàn bộ? Không hoàn tác được.</span>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="rounded-md border border-border px-2.5 py-1 font-medium"
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={pending}
              className="rounded-md bg-destructive px-2.5 py-1 font-medium text-destructive-foreground disabled:opacity-50"
            >
              {pending ? (
                <Loader2
                  className="inline h-3.5 w-3.5 animate-spin"
                  aria-hidden
                />
              ) : (
                "Xoá hết"
              )}
            </button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="mt-3"
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Xoá toàn bộ dữ liệu của tôi
        </Button>
      )}
    </section>
  );
}
