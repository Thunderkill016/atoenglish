"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export default function TestimonialsSection() {
  return (
    <section className="relative py-20 sm:py-28 px-5 sm:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px]" />
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <Quote className="size-3.5" />
            Thực tế về AtoEnglish
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            Một dự án nhỏ đang phát triển
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
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
              className="group relative rounded-2xl border border-border/60 bg-white/60 backdrop-blur-sm p-6 space-y-4 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col"
            >
              <div className="text-primary font-bold text-sm">{note.title}</div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {note.text}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Muốn xem thực tế? Bấm “Học thử ngay” — bài đầu tiên không cần đăng
          nhập.
        </p>
      </div>
    </section>
  );
}
