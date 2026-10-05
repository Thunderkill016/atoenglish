import ScrollReveal from "@/components/ui/scroll-reveal";

import { SectionHead } from "./notebook";

/**
 * Honest notes — no fake testimonials. Each taped note states a fact about
 * the product that a skeptical learner can verify by trying lesson one.
 */
export default function TestimonialsSection() {
  const notes = [
    {
      title: "Thử mà không cần tài khoản",
      text: "Học thử trọn vẹn bài đầu tiên (guest mode). Đăng ký miễn phí để mở toàn bộ chương trình và lưu tiến độ.",
      rotate: "-rotate-[0.6deg]",
    },
    {
      title: "Tập trung vào nói",
      text: "Mỗi bài có Shadowing (nhại theo) và Roleplay tình huống thực tế. Không chỉ đọc chép.",
      rotate: "rotate-[0.5deg]",
    },
    {
      title: "Ôn tập FSRS miễn phí",
      text: "Tài khoản miễn phí — dùng thuật toán FSRS mã nguồn mở để nhắc ôn đúng lúc sắp quên.",
      rotate: "-rotate-[0.4deg]",
    },
    {
      title: "Open Beta",
      text: "Dự án đang phát triển. Sẽ được cải thiện dựa trên phản hồi người dùng thật.",
      rotate: "rotate-[0.7deg]",
    },
  ];

  return (
    <section className="px-5 pt-20 sm:px-8 sm:pt-24">
      <div className="mx-auto max-w-[1020px]">
        <ScrollReveal>
          <SectionHead
            hand="* nói thật, không phóng đại"
            title="Một dự án nhỏ đang phát triển."
            lead="Không có hàng nghìn học viên. Không có con số ảo. Chỉ có công cụ để bạn tự luyện nói mỗi ngày."
          />
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {notes.map((note, idx) => (
            <ScrollReveal key={note.title} delayMs={idx * 80} className="h-full">
              <div
                className={`nb-taped relative h-full rounded border border-nb-hairline bg-nb-surface px-5 pb-5 pt-6 shadow-[0_8px_20px_rgba(90,80,50,0.08)] sm:px-6 ${note.rotate}`}
              >
                <h3 className="font-hand text-[24px] font-bold leading-tight text-nb-ink">
                  {note.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-nb-muted">
                  {note.text}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delayMs={120}>
          <p className="mt-8 text-center font-hand text-[20px] text-nb-muted">
            muốn kiểm chứng? bài đầu tiên không cần đăng nhập →
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
