"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import ScrollReveal from "@/components/ui/scroll-reveal";

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
    <section id="faq" className="py-24 sm:py-32 px-5 sm:px-8 border-t border-zinc-200/40 dark:border-zinc-800/40 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[40%] right-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-500/3 dark:bg-emerald-500/1 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto space-y-16">
        {/* Section Header */}
        <ScrollReveal className="text-center space-y-4">
          <div className="flex justify-center">
            {/* Fix: border-emerald-250/20 → border-emerald-200/30 (emerald-250 doesn't exist) */}
            <span className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/30 shadow-sm">
              <HelpCircle className="size-5.5" />
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-normal">
            Giải đáp thắc mắc
          </h2>
          <p className="text-base sm:text-lg text-zinc-650 dark:text-zinc-350 max-w-xl mx-auto leading-relaxed font-normal">
            Những câu hỏi thường gặp giúp bạn yên tâm bắt đầu hành trình học nói tiếng Anh.
          </p>
        </ScrollReveal>

        {/* Accordions */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <ScrollReveal key={idx} delayMs={idx * 75}>
                <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-900/15 backdrop-blur-sm shadow-sm overflow-hidden hover:border-emerald-500/20 dark:hover:border-emerald-500/10 transition-colors duration-200">
                  {/* Fix: added aria-expanded + aria-controls for accessibility */}
                  <button
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left select-none group"
                  >
                    <span className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors duration-200">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`size-5 text-zinc-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""
                      }`}
                    />
                  </button>

                  {/* Fix: grid-rows technique instead of max-h hack for smooth animation */}
                  {/* Fix: border-zinc-150 / zinc-850 → zinc-200 / zinc-800 (non-existent classes) */}
                  <div
                    id={`faq-answer-${idx}`}
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] border-t border-zinc-200 dark:border-zinc-800"
                        : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="p-5 sm:p-6 text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-normal bg-zinc-50/30 dark:bg-zinc-900/10">
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
