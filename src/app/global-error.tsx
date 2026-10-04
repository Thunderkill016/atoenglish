"use client";

import { useEffect } from "react";
import { captureException } from "@/lib/report-error";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
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
    <html lang="vi">
      <body className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 px-4 max-w-md"
        >
          <div className="flex size-20 items-center justify-center rounded-3xl bg-red-500/10 text-red-400 mx-auto border border-red-500/20">
            <AlertTriangle className="size-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black">Lỗi nghiêm trọng</h1>
            <p className="text-sm text-zinc-400">
              AtoEnglish gặp sự cố không mong muốn. Vui lòng tải lại trang.
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-zinc-600">Digest: {error.digest}</p>
            )}
          </div>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all"
          >
            <RefreshCcw className="size-4" />
            Tải lại
          </button>
        </motion.div>
      </body>
    </html>
  );
}
