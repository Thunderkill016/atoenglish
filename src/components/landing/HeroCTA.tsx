"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { checkHasSession } from "@/lib/auth-check";
import { trackPilotEventOnce } from "@/lib/pilot/pilot-analytics-client";

export default function HeroCTA() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkHasSession().then(setIsLoggedIn);
  }, []);

  return (
    <div className="mt-8 flex flex-wrap items-center gap-4">
      <Link
        href="/learn"
        prefetch={false}
        onClick={() =>
          trackPilotEventOnce("pilot_started", "pilot", {
            source: "landing_hero",
          })
        }
        className="nb-btn-primary h-13 px-7 text-[15px]"
      >
        {isLoggedIn ? "Vào Dashboard" : "Học thử bài đầu"}
        <ArrowRight className="size-4.5" />
      </Link>
      <Link href="#how-it-works" className="nb-btn-secondary h-13 px-6 text-[15px]">
        Xem cách học
      </Link>
      <span className="-rotate-[0.8deg] font-hand text-[20px] text-nb-muted">
        ← không cần tài khoản luôn nhé
      </span>
    </div>
  );
}
