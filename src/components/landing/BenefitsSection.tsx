import ScrollReveal from "@/components/ui/scroll-reveal";

import { SectionHead, Waveform } from "./notebook";

/** Taped lesson notes — real unit examples from the A0–A1 journey. */
export default function BenefitsSection() {
  const lessons = [
    {
      unit: "Unit A0-5",
      quote: "“Hi, I’m Minh. I work in Da Nang.”",
      desc: "Thông tin cá nhân — giới thiệu tên và nơi bạn sống, làm việc.",
      minutes: "4",
      rotate: "-rotate-[0.7deg]",
    },
    {
      unit: "Unit A0-8",
      quote: "“Could you say that again?”",
      desc: "Cụm từ sinh tồn — xin người đối diện nói chậm lại.",
      minutes: "3",
      rotate: "rotate-[0.5deg]",
    },
    {
      unit: "Unit 1 (A1)",
      quote: "“What do you do for work?”",
      desc: "Greetings & Self-Introduction — mở rộng câu giới thiệu.",
      minutes: "5",
      rotate: "-rotate-[0.4deg]",
    },
  ];

  return (
    <section className="px-5 pt-20 sm:px-8 sm:pt-24">
      <div className="mx-auto max-w-[1020px]">
        <ScrollReveal>
          <SectionHead
            hand="…ghi chú nghiêm túc"
            title="Bài hôm nay, ví dụ thật."
          />
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {lessons.map((lesson, idx) => (
            <ScrollReveal key={lesson.unit} delayMs={idx * 100} className="h-full">
              <article
                className={`nb-taped relative h-full rounded border border-nb-hairline bg-nb-surface px-5 pb-5 pt-6 shadow-[0_8px_20px_rgba(90,80,50,0.08)] sm:px-6 ${lesson.rotate}`}
              >
                <span className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-nb-annotation">
                  {lesson.unit}
                </span>
                <h3 className="mt-2.5 font-serif italic text-[18px] leading-snug text-nb-ink">
                  {lesson.quote}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-nb-muted">
                  {lesson.desc}
                </p>
                <div className="mt-4 flex items-center gap-2.5 border-t border-dashed border-nb-hairline pt-3 text-xs font-bold text-nb-muted">
                  <Waveform className="origin-left scale-75" />
                  luyện nói · {lesson.minutes} phút
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
