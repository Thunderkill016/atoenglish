"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import ScrollReveal from "@/components/ui/scroll-reveal";
import { checkHasSession } from "@/lib/auth-check";
import { trackPilotEventOnce } from "@/lib/pilot/pilot-analytics-client";

export default function FinalCtaSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkHasSession().then(setIsLoggedIn);
  }, []);

  return (
    <section className="relative py-24 sm:py-32 lg:py-40 px-5 sm:px-8 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-gradient-to-br from-muted/60 to-white backdrop-blur-md px-6 py-16 sm:p-16 md:p-20 text-center space-y-8 sm:space-y-10 shadow-xl shadow-border/[0.02]">
          <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[60px]" />
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[60px]" />
          </div>

          <ScrollReveal className="space-y-4">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-normal">
              Sẵn sàng luyện nhiệm vụ nói đầu tiên?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto font-normal">
              Bắt đầu bằng bài giới thiệu bản thân và công việc. Mỗi ngày 10–15
              phút, học thử bài đầu không cần tài khoản.
            </p>
          </ScrollReveal>

          <ScrollReveal delayMs={75}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="size-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary tracking-wide">
                Hành trình thử nghiệm 28 ngày · Bắt đầu từ A0
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal
            delayMs={150}
            className="flex flex-col items-center gap-4"
          >
            <Link
              href={isLoggedIn ? "/learn" : "/learn"}
              prefetch={false}
              onClick={() =>
                trackPilotEventOnce("pilot_started", "pilot", {
                  source: "landing_final_cta",
                })
              }
              className={buttonVariants({
                className:
                  "w-full sm:w-auto sm:min-w-[280px] justify-center bg-primary hover:bg-primary text-white font-bold h-14 px-10 rounded-2xl shadow-lg shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.01] active:scale-[0.97] transition-all duration-300 gap-2.5",
              })}
            >
              {isLoggedIn ? "Vào Dashboard ngay" : "Bắt đầu bài đầu tiên"}
              <ArrowRight className="size-5" />
            </Link>
            <div className="text-xs text-muted-foreground font-semibold tracking-wider uppercase">
              Đăng ký nhanh qua Google • Điều kiện chương trình sẽ được thông
              báo rõ
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
