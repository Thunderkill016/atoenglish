"use client";

import { useEffect } from "react";
import Link from "next/link";
import { captureException } from "@/lib/report-error";

/**
 * Root-level error boundary — catches unexpected errors in root-segment pages.
 * Renders inside the existing root layout (no html/body needed).
 * For (main) group errors see src/app/(main)/error.tsx.
 * For root layout.tsx errors see src/app/global-error.tsx.
 */
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error, { tags: { location: "root" } });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-foreground px-6 text-center text-white">
      <span className="text-5xl">⚠️</span>
      <h1 className="text-2xl font-black">Có lỗi xảy ra</h1>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
        Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại hoặc quay về trang
        chủ.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
        >
          Thử lại
        </button>
        <Link
          href="/learn"
          className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-bold text-white hover:bg-foreground transition-colors"
        >
          Về Dashboard
        </Link>
      </div>
      {error.digest && (
        <p className="text-xs text-muted-foreground">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
