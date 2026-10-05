import { Check } from "lucide-react";
import ScrollReveal from "@/components/ui/scroll-reveal";

import { SectionHead } from "./notebook";

export default function HowItWorksSection() {
  const steps = [
    {
      title: "Nghe & Đọc",
      phase: "input",
      desc: "Tiếp xúc với tiếng Anh thực tế qua các tình huống giao tiếp gần gũi, nghe và đọc theo ngữ điệu người bản xứ.",
    },
    {
      title: "Xử lý sâu",
      phase: "processing",
      desc: "Làm chủ từ vựng và cấu trúc qua bài tập viết câu phản xạ và ghép thẻ thông minh (SRS), chống học vẹt thụ động.",
    },
    {
      title: "Nói & Viết",
      phase: "output",
      desc: "Luyện nói Shadowing và thực hành đóng vai (Roleplay) tình huống thực tế. Ghi âm và nhận phản hồi lỗi phát âm tức thì.",
    },
    {
      title: "Ôn tập",
      phase: "review",
      desc: "Thuật toán ôn tập ngắt quãng (FSRS) tự động tính toán thời điểm vàng để nhắc nhở, đưa từ vựng vào trí nhớ dài hạn.",
    },
  ];

  return (
    <section id="how-it-works" className="px-5 pt-20 sm:px-8 sm:pt-24">
      <div className="mx-auto max-w-[1020px]">
        <ScrollReveal>
          <SectionHead
            hand="✓ routine 4 bước · 10–15 phút/ngày"
            title="Mỗi buổi học = một trang sổ."
            lead="Chu trình lặp lại mỗi buổi — chuyển từ “thuộc lòng lý thuyết” sang “nói trôi chảy tự nhiên”."
          />
        </ScrollReveal>

        <div className="mt-10 flex flex-col gap-3">
          {steps.map((step, idx) => (
            <ScrollReveal key={step.title} delayMs={idx * 90}>
              <div className="flex items-start gap-4 rounded-[10px] border border-nb-hairline bg-nb-surface px-5 py-4 sm:px-6 sm:py-[18px]">
                <span className="mt-0.5 flex size-[25px] shrink-0 items-center justify-center rounded-[7px] border-2 border-nb-primary-bright text-nb-primary-bright">
                  <Check className="size-4" strokeWidth={3.2} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-nb-ink sm:text-[17px]">
                    {step.title}
                    <span className="ml-2 text-[13px] font-semibold text-nb-muted-soft">
                      {step.phase}
                    </span>
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-nb-muted">
                    {step.desc}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
