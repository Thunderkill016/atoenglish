"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ScrollReveal from "@/components/ui/scroll-reveal";

import { SectionHead } from "./notebook";

export default function FaqSection() {
  const faqs = [
    {
      q: "Người mất gốc hoặc mới bắt đầu từ con số 0 có học được không?",
      a: "Có. Hành trình đầu tiên bắt đầu từ A0 và tập trung vào một nhiệm vụ thực tế: giới thiệu bản thân, công việc và biết xin người đối diện nhắc lại hoặc nói chậm hơn.",
    },
    {
      q: "Mỗi ngày tôi cần học bao lâu?",
      a: "Mục tiêu là 10–15 phút mỗi ngày trong 28 ngày. Mỗi buổi tập trung vào một bước nhỏ: nghe mẫu, luyện cụm từ, nói có hướng dẫn và ôn lại nội dung cần nhớ.",
    },
    {
      q: "AtoEnglish khác gì so với Duolingo hay Babbel?",
      a: "AtoEnglish tập trung vào giao tiếp thực tế cho người Việt — không gamification hời hợt. Bạn học theo phương pháp khoa học PPP (Present–Practice–Produce) kết hợp FSRS, thực hành nói Shadowing thực sự và roleplay tình huống. Nội dung được thiết kế sát nhu cầu của người học Việt Nam, không phải bản dịch từ nước ngoài.",
    },
    {
      q: "Tôi có phải cài đặt ứng dụng vào điện thoại không?",
      a: "Không cần. AtoEnglish là một nền tảng Web-App hiện đại, chạy trực tiếp trên trình duyệt web của bạn. Giao diện được tối ưu hóa mượt mà cho cả điện thoại di động (iPhone, Android), máy tính bảng lẫn máy tính cá nhân. Chỉ cần mở trình duyệt, đăng nhập nhanh bằng Google là học được ngay.",
    },
    {
      q: "Tôi có thể học thử trước khi tham gia chương trình 28 ngày không?",
      a: "Có. Bạn có thể học thử bài đầu tiên trước khi quyết định tham gia. Điều kiện, lịch học và chi phí của chương trình 28 ngày sẽ được thông báo rõ trước khi mở tuyển.",
    },
    {
      q: "Thuật toán Ôn tập ngắt quãng (FSRS) là gì?",
      a: "FSRS (Free Spaced Repetition Scheduler) là thuật toán khoa học ghi nhớ tiên tiến bậc nhất hiện nay. Thay vì cố gắng học vẹt, FSRS sẽ đo lường mức độ ghi nhớ của bạn đối với từng từ vựng và tự động lên lịch nhắc nhở ôn tập vào đúng 'thời điểm vàng' ngay trước khi bạn chuẩn bị quên. Nhờ đó, bạn ghi nhớ từ vựng lâu hơn đáng kể so với cách học vẹt truyền thống.",
    },
    {
      q: "Dữ liệu và tiến độ học của tôi có được bảo mật không?",
      a: "Hoàn toàn bảo mật. AtoEnglish sử dụng Neon Postgres với Row Level Security (RLS) — dữ liệu của bạn chỉ có thể được truy cập bởi chính bạn. Đăng nhập qua Google OAuth 2.0 được mã hóa an toàn. Chúng tôi không bán hay chia sẻ dữ liệu cá nhân với bên thứ ba. Xem thêm tại Chính sách Bảo mật.",
    },
    {
      q: "Tôi bận đi làm, không có nhiều thời gian — liệu có theo kịp không?",
      a: "Hành trình được thiết kế theo các phiên 10–15 phút. Khi bận, bạn có thể hoàn thành một bước nhỏ rồi tiếp tục ở lần sau; điều quan trọng là quay lại và thực hiện nhiệm vụ nói, không phải giữ streak bằng mọi giá.",
    },
    {
      q: "Tôi nên bắt đầu từ unit nào? Làm sao biết trình độ hiện tại?",
      a: "Bạn có thể làm bài Kiểm tra đầu vào (Placement Test) chỉ trong 5 phút để hệ thống gợi ý unit phù hợp với trình độ hiện tại. Nếu mới bắt đầu hoàn toàn, hãy bắt đầu từ Unit A0-1 (Bảng chữ cái). Nếu đã biết căn bản, bạn có thể bắt đầu từ Unit 1 (A1 — Chào hỏi & Giới thiệu). Hệ thống sẽ tự điều chỉnh theo tốc độ học của bạn.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="px-5 pt-20 sm:px-8 sm:pt-24">
      <div className="mx-auto max-w-[760px]">
        <ScrollReveal>
          <SectionHead
            hand="? trả lời trước khi bạn hỏi"
            title="Giải đáp thắc mắc."
            lead="Những câu hỏi người học hay lo nhất — trả lời thẳng, không vòng vo."
          />
        </ScrollReveal>

        <div className="mt-10 space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <ScrollReveal key={idx} delayMs={idx * 40}>
                <div className="overflow-hidden rounded-[10px] border border-nb-hairline bg-nb-surface transition-colors duration-200 hover:border-nb-note-border">
                  <button
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    className="group flex w-full select-none items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                  >
                    <span className="text-sm font-bold text-nb-ink transition-colors duration-200 group-hover:text-nb-primary sm:text-[15px]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`size-5 shrink-0 text-nb-muted transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-nb-primary" : ""
                      }`}
                    />
                  </button>

                  <div
                    id={`faq-answer-${idx}`}
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] border-t border-dashed border-nb-hairline"
                        : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 py-4 text-sm leading-relaxed text-nb-muted sm:px-6 sm:py-5">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
