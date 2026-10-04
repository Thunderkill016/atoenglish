"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { checkHasSession } from "@/lib/auth-check";
import { trackPilotEventOnce } from "@/lib/pilot/pilot-analytics-client";

const QUICK_STATS = [
  { icon: "🗓️", text: "28 ngày · một mục tiêu nói" },
  { icon: "⏱️", text: "10–15 phút mỗi ngày" },
  { icon: "💼", text: "Luyện nói cho công việc" },
  { icon: "🇻🇳", text: "Dành cho người Việt mất gốc" },
];

export default function HeroCTA() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkHasSession().then(setIsLoggedIn);
  }, []);

  return (
    <div className="animate-fade-in-up animation-delay-225 flex flex-col items-center gap-4 pt-4 w-full">
      {/* CTA links are styled as buttons but remain a single interactive element. */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full">
        <Link
          href={isLoggedIn ? "/dashboard" : "/learn"}
          prefetch={false}
          onClick={() =>
            trackPilotEventOnce("pilot_started", "pilot", { source: "landing_hero" })
          }
          className={buttonVariants({
            className:
              "w-full sm:w-auto sm:min-w-[220px] justify-center bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:via-teal-400 hover:to-emerald-400 text-white font-bold h-14 px-8 rounded-2xl shadow-lg shadow-emerald-600/20 dark:shadow-emerald-500/15 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 gap-2",
          })}
        >
          {isLoggedIn ? "Vào Dashboard" : "Bắt đầu bài đầu tiên"}
          <ArrowRight className="size-4.5" />
        </Link>
        <Link
          href="/login"
          prefetch={false}
          className={buttonVariants({
            variant: "outline",
            className:
              "w-full sm:w-auto border-zinc-200 dark:border-white/15 bg-white/5 dark:bg-white/5 backdrop-blur-md hover:bg-white/10 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white font-bold h-14 px-8 rounded-2xl gap-1.5 active:scale-[0.97] transition-all duration-300",
          })}
        >
          <span>Đăng nhập</span>
          <ChevronRight className="size-4.5" />
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {QUICK_STATS.map((stat) => (
          <div
            key={stat.text}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-white/8 text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            <span>{stat.icon}</span>
            <span>{stat.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
