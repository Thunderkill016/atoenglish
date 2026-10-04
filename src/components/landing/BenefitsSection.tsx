import { Zap, Clock, Wallet } from "lucide-react";
import ScrollReveal from "@/components/ui/scroll-reveal";

export default function BenefitsSection() {
  const benefits = [
    {
      icon: Zap,
      title: "Phản xạ nói tự nhiên",
      desc: "Luyện nói chủ động giúp bạn bật ra câu trả lời lập tức, hoàn toàn loại bỏ thói quen dịch nhẩm ngữ pháp từ tiếng Việt sang tiếng Anh trong đầu.",
    },
    {
      icon: Clock,
      title: "15 phút mỗi ngày là đủ",
      desc: "Lộ trình học ngắn gọn, thiết kế tối ưu hóa trên mọi thiết bị di động giúp bạn dễ dàng duy trì thói quen học tập bền bỉ hàng ngày mà không bị quá tải.",
    },
    {
      icon: Wallet,
      title: "Miễn phí trong Open Beta",
      desc: "Hiện tại bạn có thể dùng toàn bộ tính năng luyện nói, shadowing và ôn tập FSRS mà không mất phí.",
    },
  ];

  const delayMs = [0, 100, 200];

  return (
    <section className="bg-gradient-to-b from-muted/20 to-muted/50 py-24 sm:py-32 lg:py-40 px-5 sm:px-8 border-y border-border/40 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto space-y-16 sm:space-y-20">
        {/* Section Header */}
        <ScrollReveal className="text-center space-y-4">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-normal">
            Bạn sẽ thay đổi như thế nào?
          </h2>
        </ScrollReveal>

        {/* Benefit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => {
            const BenefitIcon = benefit.icon;
            return (
              <ScrollReveal
                key={index}
                delayMs={delayMs[index]}
                className="flex"
              >
                <div className="group relative overflow-hidden z-0 flex flex-col items-start p-5 sm:p-8 rounded-[2rem] border border-border/50 bg-white/70 backdrop-blur-sm hover:shadow-xl hover:shadow-border/[0.03] hover:-translate-y-1 transition-all duration-300 space-y-4 sm:space-y-6 w-full">
                  {/* CSS-only Glowing Border Gradient */}
                  <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-r from-primary/25 to-primary/25 opacity-0 group-hover:opacity-100 blur-[3px] transition duration-500 -z-10" />
                  <div className="absolute inset-0 rounded-[2rem] bg-white/95 -z-10 transition-colors duration-300" />

                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:scale-105 transition-transform duration-300 border border-primary/40/50 shadow-sm">
                    <BenefitIcon className="size-6" strokeWidth={2.2} />
                  </span>
                  <div className="space-y-3.5 text-left flex-1 flex flex-col">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight leading-normal">
                      {benefit.title}
                    </h3>
                    <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed font-normal flex-1">
                      {benefit.desc}
                    </p>
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
