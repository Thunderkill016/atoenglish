"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { checkHasSession } from "@/lib/auth-check";

export default function NavbarAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkHasSession().then(setIsLoggedIn);
  }, []);

  return (
    <div className="flex items-center gap-3">
      {isLoggedIn ? (
        <Link
          href="/learn"
          prefetch={false}
          className="nb-btn-primary h-10 px-5 text-sm"
        >
          Vào Dashboard
        </Link>
      ) : (
        <>
          <Link
            href="/login?mode=login"
            prefetch={false}
            className="hidden h-10 items-center px-3 text-sm font-semibold text-nb-muted transition-colors hover:text-nb-ink sm:inline-flex"
          >
            Đăng nhập
          </Link>
          <Link
            href="/login"
            prefetch={false}
            className="nb-btn-primary h-10 px-4 text-[13px] sm:px-5 sm:text-sm"
          >
            <span className="hidden sm:inline">Bắt đầu học ngay</span>
            <span className="sm:hidden">Bắt đầu học</span>
          </Link>
        </>
      )}
    </div>
  );
}
