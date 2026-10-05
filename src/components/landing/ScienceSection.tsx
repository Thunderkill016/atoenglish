import ScrollReveal from "@/components/ui/scroll-reveal";

import { SectionHead } from "./notebook";

/** Margin-note stats: figures underlined in ink, annotations in handwriting. */
export default function ScienceSection() {
  const notes = [
    { num: "28", unit: "ngày", note: "đến bài đầu tiên nói được" },
    { num: "A0 → A1", unit: "", note: "thang CEFR — từ con số 0" },
    { num: "10–15", unit: "phút/ngày", note: "đủ để không bỏ cuộc" },
    { num: "3", unit: "kỹ năng", note: "Nói · Nghe · Từ vựng — song song" },
  ];

  return (
    <section id="science" className="px-5 pt-20 sm:px-8 sm:pt-24">
      <div className="mx-auto max-w-[1020px]">
        <ScrollReveal>
          <SectionHead
            hand="có căn cứ"
            title="Không hứa hão — có phương pháp."
          />
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          {notes.map((note, idx) => (
            <ScrollReveal key={note.num} delayMs={idx * 70}>
              <div className="leading-[1.3]">
                <div className="font-extrabold text-[38px] tracking-[-0.02em] text-nb-ink">
                  <span className="underline decoration-[#58cc02] decoration-[3px] underline-offset-[6px]">
                    {note.num}
                  </span>
                  {note.unit && (
                    <span className="ml-1.5 text-base font-bold text-nb-muted">
                      {note.unit}
                    </span>
                  )}
                </div>
                <div className="mt-1.5 font-hand text-[18px] text-nb-muted">
                  {note.note}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delayMs={120}>
          <p className="mx-auto mt-10 max-w-[620px] border-t border-dashed border-nb-hairline pt-6 text-center text-sm leading-relaxed text-nb-muted">
            Ôn tập tự động bằng thuật toán lặp lại ngắt quãng (FSRS) — nhắc đúng
            lúc trước khi bạn quên. AtoEnglish đang trong giai đoạn thử nghiệm
            (Open Beta): tính năng phát triển mỗi tuần, và mọi con số trên trang
            này là mục tiêu thiết kế — không phải khẳng định kết quả.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
