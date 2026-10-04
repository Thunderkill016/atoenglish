"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export default function TestimonialsSection() {
  return (
    <section className="relative py-20 sm:py-28 px-5 sm:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/3 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/3 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Header - honest */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Quote className="size-3.5" />
            Thực tế về AtoEnglish
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Một dự án nhỏ đang phát triển
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
            Không có hàng nghìn học viên. Không có con số ảo. Chỉ có công cụ để
            bạn tự luyện nói mỗi ngày.
          </p>
        </motion.div>

        {/* Honest cards - keep the beautiful glass design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              title: "Thử mà không cần tài khoản",
              text: "Học thử trọn vẹn bài đầu tiên (guest mode). Đăng ký miễn phí để mở toàn bộ chương trình và lưu tiến độ.",
            },
            {
              title: "Tập trung vào nói",
              text: "Mỗi bài có Shadowing (nhại theo) và Roleplay tình huống thực tế. Không chỉ đọc chép.",
            },
            {
              title: "Ôn tập FSRS miễn phí",
              text: "Tài khoản miễn phí — dùng thuật toán FSRS mã nguồn mở để nhắc ôn đúng lúc sắp quên.",
            },
            {
              title: "Open Beta",
              text: "Dự án đang phát triển. Sẽ được cải thiện dựa trên phản hồi người dùng thật.",
            },
          ].map((note, idx) => (
            <div
              key={idx}
              className="group relative rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/30 backdrop-blur-sm p-6 space-y-4 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col"
            >
              <div className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                {note.title}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1">
                {note.text}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Muốn xem thực tế? Bấm “Học thử ngay” — bài đầu tiên không cần đăng
          nhập.
        </p>
      </div>
    </section>
  );
}
