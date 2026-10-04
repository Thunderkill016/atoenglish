"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import {
  desktopMoreItems,
  desktopPrimaryNav,
  type NavItem,
} from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

function collectRoutes(): NavItem[] {
  const seen = new Set<string>();
  const items: NavItem[] = [];

  const add = (item: NavItem) => {
    if (seen.has(item.href)) return;
    seen.add(item.href);
    items.push(item);
  };

  // Canonical route model: 4 primary tabs + TÔI secondary surfaces.
  [...desktopPrimaryNav, ...desktopMoreItems].forEach(add);

  return items.sort((a, b) => a.title.localeCompare(b.title, "vi"));
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const routes = useMemo(() => collectRoutes(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return routes;
    return routes.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.href.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q),
    );
  }, [query, routes]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 bg-foreground/50 backdrop-blur-sm"
      onClick={close}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-border/60 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Điều hướng nhanh"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
          <Search className="size-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm trang… (Trang chủ, Học, Ôn tập…)"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            type="button"
            onClick={close}
            className="p-1 rounded-lg text-muted-foreground hover:text-muted-foreground"
            aria-label="Đóng"
          >
            <X className="size-4" />
          </button>
        </div>

        <ul className="max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-muted-foreground">
              Không tìm thấy trang phù hợp
            </li>
          ) : (
            filtered.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-card transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground shrink-0">
                    {item.href}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>

        <div className="px-4 py-2 border-t border-border/50 text-xs text-muted-foreground flex justify-between">
          <span>⌘K / Ctrl+K mở palette</span>
          <button
            type="button"
            className={cn("text-primary font-semibold hover:underline")}
            onClick={() => {
              close();
              router.push("/learn");
            }}
          >
            Về Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
