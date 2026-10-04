"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
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
          className={buttonVariants({
            className:
              "bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-bold h-9 px-5 rounded-xl active:scale-[0.96] transition-all duration-200 shadow-sm shadow-emerald-600/10 dark:shadow-emerald-500/5",
          })}
        >
          Vào Dashboard
        </Link>
      ) : (
        <>
          <Link
            href="/login?mode=login"
            prefetch={false}
            className={buttonVariants({
              variant: "ghost",
              className:
                "hidden sm:inline-flex text-sm font-semibold text-zinc-700 dark:text-zinc-350 hover:text-zinc-950 dark:hover:text-zinc-50 h-9 px-4 rounded-xl transition-colors duration-200",
            })}
          >
            Đăng nhập
          </Link>
          <Link
            href="/login"
            prefetch={false}
            className={buttonVariants({
              className:
                "bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold h-8 sm:h-9 px-3 sm:px-5 rounded-xl active:scale-[0.96] transition-all duration-200 shadow-sm shadow-emerald-600/10 dark:shadow-emerald-500/5",
            })}
          >
            <span className="hidden sm:inline">Bắt đầu học ngay</span>
            <span className="sm:hidden">Học ngay</span>
          </Link>
        </>
      )}
    </div>
  );
}
