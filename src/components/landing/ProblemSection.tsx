import ScrollReveal from "@/components/ui/scroll-reveal";

import { SectionHead } from "./notebook";

export default function ProblemSection() {
  const problems = [
    {
      title: "Phản xạ chậm",
      desc: "Mất từ 5 đến 10 giây để dịch nhẩm cấu trúc ngữ pháp trong đầu trước khi nói.",
      fix: "→ luyện output mỗi ngày",
    },
    {
      title: "Sợ nói sai",
      desc: "E ngại phát âm chưa chuẩn, lo sợ người đối diện không hiểu hoặc đánh giá năng lực.",
      fix: "→ luyện riêng, không ai nghe",
    },
    {
      title: "Thiếu môi trường",
      desc: "Không có bạn đồng hành luyện tập phản xạ giao tiếp mỗi ngày trong môi trường an toàn.",
      fix: "→ shadowing + roleplay",
    },
  ];

  return (
    <section className="px-5 pt-20 sm:px-8 sm:pt-24">
      <div className="mx-auto max-w-[1020px]">
        <ScrollReveal>
          <SectionHead
            hand="✗ ba thứ hay giữ chân bạn…"
            title="Học nhiều năm, vẫn ngại nói."
            lead="Bạn không thiếu kiến thức — bạn thiếu môi trường luyện phản xạ nói tự nhiên."
          />
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {problems.map((prob, idx) => (
            <ScrollReveal key={prob.title} delayMs={idx * 100} className="h-full">
              <div className="h-full rounded-lg border border-dashed border-nb-note-border bg-nb-paper-deep p-5 sm:p-6">
                <h3 className="text-[17px] font-bold text-nb-ink">
                  <s className="decoration-nb-annotation decoration-2">
                    {prob.title}
                  </s>
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-nb-muted">
                  {prob.desc}
                </p>
                <span className="mt-3 inline-block -rotate-[0.6deg] font-hand text-[21px] text-nb-primary">
                  {prob.fix}
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
