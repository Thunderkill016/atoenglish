"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { captureException } from "@/lib/report-error";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function UnitError({ error, reset }: ErrorProps) {
  useEffect(() => {
    captureException(error, { tags: { location: "unit" } });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-warning/10 text-warning">
        <AlertTriangle className="size-8" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-xl font-black text-foreground">
          Không thể tải bài học
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Có lỗi khi tải nội dung bài học này. Vui lòng thử lại hoặc quay về
          trang bài học.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={reset}
          className="gap-2 bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary text-white rounded-xl h-11 px-5 active:scale-95 transition-all"
        >
          <RefreshCw className="size-4" />
          Thử lại
        </Button>
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 rounded-xl h-11 px-5 border border-border bg-transparent hover:bg-card text-sm font-semibold text-foreground transition-colors duration-150"
        >
          <ArrowLeft className="size-4" />
          Quay về Bài học
        </Link>
      </div>
    </div>
  );
}
