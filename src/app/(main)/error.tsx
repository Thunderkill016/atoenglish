"use client";

import { useEffect } from "react";
import { captureException } from "@/lib/report-error";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 text-center space-y-6">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-64 w-64 rounded-full bg-destructive/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 max-w-md"
      >
        {/* Icon */}
        <div className="flex size-20 items-center justify-center rounded-3xl bg-destructive/10 text-destructive mx-auto border border-destructive/20">
          <AlertTriangle className="size-10" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-foreground">Có lỗi xảy ra</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Đã xảy ra lỗi khi tải trang này. Hãy thử tải lại hoặc quay về trang
            chủ.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-muted-foreground/60 bg-muted/50 px-3 py-1 rounded-lg inline-block">
              Mã lỗi: {error.digest}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all active:scale-[0.98]"
          >
            <RefreshCcw className="size-4" />
            Thử lại
          </button>
          <Link
            href="/learn"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-border bg-transparent text-foreground text-sm font-bold hover:bg-muted transition-all active:scale-[0.98]"
          >
            <Home className="size-4" />
            Về Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
