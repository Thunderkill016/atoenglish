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
              "bg-primary hover:bg-primary text-white text-sm font-bold h-9 px-5 rounded-xl active:scale-[0.96] transition-all duration-200 shadow-sm shadow-primary/10",
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
                "hidden sm:inline-flex text-sm font-semibold text-foreground hover:text-foreground h-9 px-4 rounded-xl transition-colors duration-200",
            })}
          >
            Đăng nhập
          </Link>
          <Link
            href="/login"
            prefetch={false}
            className={buttonVariants({
              className:
                "bg-primary hover:bg-primary text-white text-xs sm:text-sm font-bold h-8 sm:h-9 px-3 sm:px-5 rounded-xl active:scale-[0.96] transition-all duration-200 shadow-sm shadow-primary/10",
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
