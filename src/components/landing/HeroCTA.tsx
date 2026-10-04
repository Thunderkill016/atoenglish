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
          href={isLoggedIn ? "/learn" : "/learn"}
          prefetch={false}
          onClick={() =>
            trackPilotEventOnce("pilot_started", "pilot", {
              source: "landing_hero",
            })
          }
          className={buttonVariants({
            className:
              "w-full sm:w-auto sm:min-w-[220px] justify-center bg-gradient-to-r from-primary via-primary to-primary hover:from-primary hover:via-primary hover:to-primary text-white font-bold h-14 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 gap-2",
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
              "w-full sm:w-auto border-border bg-white/5 backdrop-blur-md hover:bg-white/10 text-foreground hover:text-foreground font-bold h-14 px-8 rounded-2xl gap-1.5 active:scale-[0.97] transition-all duration-300",
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted border border-border/80 text-xs font-medium text-muted-foreground"
          >
            <span>{stat.icon}</span>
            <span>{stat.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
