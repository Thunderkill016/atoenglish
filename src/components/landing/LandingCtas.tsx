"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ClipboardCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { checkHasSession } from "@/lib/auth-check";
import { trackPilotEventOnce } from "@/lib/pilot/pilot-analytics-client";

/**
 * Dual CTA: primary = free first lesson (guests allowed on unit-a0-1,
 * lesson-before-signup funnel); secondary = scroll to the honest
 * 4-stage roadmap section. Emits pilot analytics once per tab session.
 */
export default function LandingCtas({
  source,
}: {
  source: "landing_hero" | "landing_final_cta";
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkHasSession().then(setIsLoggedIn);
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <Link
        href={isLoggedIn ? "/learn" : "/learn/unit-a0-1"}
        prefetch={false}
        onClick={() => {
          // Pilot funnel is for new visitors — existing users clicking
          // "Tiếp tục học" must not re-seed pilot_started.
          if (!isLoggedIn) {
            trackPilotEventOnce("pilot_started", "pilot", { source });
          }
        }}
        className={buttonVariants({
          className:
            "w-full sm:w-auto sm:min-w-[240px] justify-center bg-primary text-white font-bold h-14 px-8 rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 gap-2",
        })}
      >
        {isLoggedIn ? "Tiếp tục học" : "Học bài đầu tiên — miễn phí"}
        <ArrowRight className="size-4.5" />
      </Link>
      {source === "landing_hero" ? (
        <Link
          href="#roadmap"
          prefetch={false}
          className={buttonVariants({
            variant: "outline",
            className:
              "w-full sm:w-auto border-border bg-card text-foreground font-bold h-14 px-8 rounded-2xl gap-1.5 active:scale-[0.97] transition-all duration-300",
          })}
        >
          Lộ trình 0→9.0 ra sao?
          <ClipboardCheck className="size-4.5" />
        </Link>
      ) : null}
    </div>
  );
}
