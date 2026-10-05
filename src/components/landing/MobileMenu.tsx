"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

// Shared state via module-level event (simple, no context needed)
const listeners: ((open: boolean) => void)[] = [];
let _isOpen = false;

function setOpen(val: boolean) {
  _isOpen = val;
  listeners.forEach((fn) => fn(val));
}

function useMenuOpen() {
  const [open, setOpenState] = useState(_isOpen);
  useEffect(() => {
    listeners.push(setOpenState);
    return () => {
      const idx = listeners.indexOf(setOpenState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);
  return open;
}

export function MobileMenuButton() {
  const open = useMenuOpen();
  return (
    <button
      onClick={() => setOpen(!open)}
      aria-label={open ? "Đóng menu" : "Mở menu"}
      className="flex size-9 items-center justify-center rounded-xl text-nb-ink transition-colors duration-200 hover:bg-nb-paper-deep md:hidden"
    >
      {open ? <X className="size-5" /> : <Menu className="size-5" />}
    </button>
  );
}

export function MobileMenu() {
  const open = useMenuOpen();

  const links = [
    { href: "#how-it-works", label: "Cách học" },
    { href: "#science", label: "Phương pháp" },
    { href: "#faq", label: "Hỏi đáp" },
  ];

  return (
    <div
      className={`overflow-hidden border-t border-dashed border-nb-hairline bg-nb-surface transition-all duration-300 ease-in-out md:hidden ${
        open ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="px-5 py-4 flex flex-col gap-1">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className="flex h-11 items-center rounded-xl px-3 text-sm font-bold text-nb-ink transition-colors duration-200 hover:bg-nb-paper-deep hover:text-nb-primary"
          >
            {link.label}
          </a>
        ))}
        <div className="my-1 border-t border-dashed border-nb-hairline" />
        <Link
          href="/login?mode=login"
          onClick={() => setOpen(false)}
          className="flex h-11 items-center rounded-xl px-3 text-sm font-semibold text-nb-muted transition-colors duration-200 hover:bg-nb-paper-deep hover:text-nb-ink"
        >
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
