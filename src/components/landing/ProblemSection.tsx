import { XCircle } from "lucide-react";
import ScrollReveal from "@/components/ui/scroll-reveal";

export default function ProblemSection() {
  const problems = [
    {
      title: "Học nhiều nhưng phản xạ chậm",
      desc: "Mất từ 5 đến 10 giây để dịch nhẩm cấu trúc ngữ pháp trong đầu trước khi nói.",
    },
    {
      title: "Nỗi sợ nói sai & bị phán xét",
      desc: "E ngại phát âm chưa chuẩn, lo sợ người đối diện không hiểu hoặc đánh giá năng lực.",
    },
    {
      title: "Thiếu môi trường thực hành",
      desc: "Không có bạn đồng hành luyện tập phản xạ giao tiếp mỗi ngày trong môi trường an toàn.",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-muted/50 to-white border-y border-border/40 py-24 sm:py-32 px-5 sm:px-8 relative overflow-hidden">
      {/* Soft background light */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center space-y-16">
        <ScrollReveal>
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground border border-border/50 shadow-inner">
                <XCircle className="size-6 animate-pulse" />
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-normal">
              Bạn học tiếng Anh nhiều năm nhưng vẫn ngại nói?
            </h2>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
              Hàng trăm giờ học ngữ pháp, thuộc hàng nghìn từ vựng… nhưng khi
              cần mở miệng giao tiếp thực tế thì lại bế tắc. Bạn không thiếu
              kiến thức, bạn chỉ thiếu môi trường để luyện phản xạ nói tự nhiên.
            </p>
          </div>
        </ScrollReveal>

        {/* 3 Problems Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {problems.map((prob, idx) => (
            <ScrollReveal key={idx} delayMs={idx * 100}>
              <div className="bg-white/60 backdrop-blur-sm p-7 rounded-2xl border border-border/60 shadow-sm space-y-3.5 hover:border-primary/30 hover:-translate-y-1 hover:shadow-md transition-all duration-300 h-full">
                <div className="text-primary font-bold text-sm sm:text-base">
                  0{idx + 1}. {prob.title}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  {prob.desc}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="space-y-2 pt-4">
            <p className="text-primary font-black text-lg sm:text-xl">
              AtoEnglish được xây dựng để giải quyết đúng vấn đề này.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
