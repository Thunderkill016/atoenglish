"use client";

import { useEffect } from "react";
import { captureException } from "@/lib/report-error";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export default function ProgressError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error, { tags: { location: "progress" } });
  }, [error]);

  return (
    <div className="relative flex min-h-[60vh] flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-64 w-64 rounded-full bg-destructive/5 blur-3xl pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 max-w-sm"
      >
        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto border border-destructive/20">
          <AlertTriangle className="size-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-foreground">
            Không thể tải Tiến trình
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Đã xảy ra lỗi. Kiểm tra kết nối mạng và thử lại.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground/60 bg-muted/50 px-3 py-1 rounded-lg inline-block">
              {error.digest}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            <RefreshCcw className="size-4" />
            Thử lại
          </button>
          <Link
            href="/learn"
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl border border-border bg-transparent text-foreground text-sm font-bold hover:bg-muted transition-all active:scale-[0.98]"
          >
            <LayoutDashboard className="size-4" />
            Về Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
