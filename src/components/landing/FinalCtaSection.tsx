"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Mic } from "lucide-react";

import ScrollReveal from "@/components/ui/scroll-reveal";
import { checkHasSession } from "@/lib/auth-check";
import { trackPilotEventOnce } from "@/lib/pilot/pilot-analytics-client";

import { Waveform } from "./notebook";

/** Night band — the closing page of the notebook, voice CTA per DESIGN.md. */
export default function FinalCtaSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkHasSession().then(setIsLoggedIn);
  }, []);

  return (
    <section className="mt-24 bg-nb-night px-5 py-20 text-white sm:px-8 sm:py-24">
      <div className="mx-auto max-w-[1020px] text-center">
        <ScrollReveal>
          <p className="font-hand text-[24px] text-nb-on-night-soft">
            trang cuối của cuốn sổ
          </p>
          <h2 className="mt-3 text-[30px] font-extrabold leading-[1.12] tracking-[-0.02em] sm:text-[40px]">
            Sẵn sàng nói câu tiếng Anh
            <br className="hidden sm:block" /> đầu tiên chưa?
          </h2>
          <p className="mx-auto mt-4 max-w-[480px] text-[15px] leading-relaxed text-nb-on-night-soft sm:text-base">
            Bài đầu tiên chỉ mất ~5 phút. Nghe mẫu, nhại theo, nói lại — không
            ai nghe trừ bạn.
          </p>
        </ScrollReveal>

        <ScrollReveal delayMs={100}>
          <div className="mt-8 flex justify-center text-nb-primary-bright">
            <Waveform className="scale-125" />
          </div>
        </ScrollReveal>

        <ScrollReveal delayMs={160}>
          <div className="mt-8 flex flex-col items-center gap-4">
            <Link
              href="/learn"
              prefetch={false}
              onClick={() =>
                trackPilotEventOnce("pilot_started", "pilot", {
                  source: "landing_final_cta",
                })
              }
              className="nb-btn-primary h-14 px-9 text-base"
            >
              <Mic className="size-5" />
              {isLoggedIn ? "Vào Dashboard ngay" : "Nói câu đầu tiên"}
              <ArrowRight className="size-5" />
            </Link>
            <p className="text-[13px] font-semibold text-nb-on-night-soft">
              Đăng ký nhanh qua Google · Điều kiện chương trình sẽ được thông
              báo rõ
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
