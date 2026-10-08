import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-8 bg-background px-4 text-center text-foreground">
      {/* Ambient */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />

      {/* 404 Number */}
      <div className="relative">
        <span className="bg-gradient-to-b from-primary/20 to-transparent bg-clip-text text-[120px] font-black leading-none text-transparent select-none sm:text-[180px]">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-20 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 text-primary">
            <Search className="size-10" />
          </div>
        </div>
      </div>

      <div className="max-w-sm space-y-3">
        <h1 className="text-2xl font-black sm:text-3xl">Trang không tồn tại</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Có vẻ như bạn lạc đường rồi. Trang này không tồn tại hoặc đã bị xóa.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          <Home className="size-4" />
          Trang chủ
        </Link>
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 text-sm font-bold text-foreground transition-all hover:border-primary/30 active:scale-[0.98]"
        >
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
