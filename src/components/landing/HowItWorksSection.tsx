import { Headphones, Layers, Mic2, RefreshCw } from "lucide-react";
import ScrollReveal from "@/components/ui/scroll-reveal";

export default function HowItWorksSection() {
  const steps = [
    {
      id: "01",
      title: "Nghe & Đọc (Input)",
      desc: "Tiếp xúc với tiếng Anh thực tế qua các tình huống giao tiếp gần gũi, nghe và đọc theo ngữ điệu người bản xứ.",
      icon: Headphones,
      gradient: "from-primary/5 to-primary/5",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      borderColor: "hover:border-primary/30",
    },
    {
      id: "02",
      title: "Xử lý sâu (Processing)",
      desc: "Làm chủ từ vựng và cấu trúc qua bài tập viết câu phản xạ và ghép thẻ thông minh (SRS), chống học vẹt thụ động.",
      icon: Layers,
      gradient: "from-primary/5 to-primary/5",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      borderColor: "hover:border-primary/30",
    },
    {
      id: "03",
      title: "Nói & Viết (Output)",
      desc: "Luyện nói Shadowing và thực hành đóng vai (Roleplay) tình huống thực tế. Ghi âm và nhận phản hồi lỗi phát âm tức thì.",
      icon: Mic2,
      gradient: "from-primary/5 to-primary/5",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      borderColor: "hover:border-primary/30",
    },
    {
      id: "04",
      title: "Ôn tập thông minh (Review)",
      desc: "Thuật toán ôn tập ngắt quãng (FSRS) tự động tính toán thời điểm vàng để nhắc nhở, đưa từ vựng vào trí nhớ vĩnh viễn.",
      icon: RefreshCw,
      gradient: "from-warning/5 to-warning/5",
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      borderColor: "hover:border-warning/30",
    },
  ];

  const delayMs = [0, 100, 200, 300];

  return (
    <section
      id="how-it-works"
      className="py-24 sm:py-32 lg:py-40 px-5 sm:px-8 relative"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[20%] left-[-10%] w-[45%] h-[45%] rounded-full bg-primary/4 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto space-y-16 sm:space-y-24">
        {/* Section Header */}
        <ScrollReveal className="text-center space-y-4">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-foreground leading-normal">
            Cách học giúp bạn nói được nhanh nhất
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed font-normal">
            Chỉ 4 bước lặp lại mỗi ngày — giúp bạn chuyển từ “thuộc lòng lý
            thuyết” sang “nói trôi chảy tự nhiên”.
          </p>
        </ScrollReveal>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <ScrollReveal
                key={step.id}
                delayMs={delayMs[index]}
                className="h-full"
              >
                <div
                  className={`group relative flex flex-col h-full bg-gradient-to-br ${step.gradient} border border-border/50 ${step.borderColor} p-8 sm:p-9 rounded-3xl space-y-6 hover:shadow-xl hover:shadow-border/[0.03] hover:-translate-y-1 transition-all duration-300`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex size-12 items-center justify-center rounded-xl ${step.iconBg} ${step.iconColor} group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="size-5.5" />
                    </span>
                    <span className="text-3xl font-mono font-bold text-muted-foreground group-hover:text-primary/40 transition-colors duration-300">
                      {step.id}
                    </span>
                  </div>
                  <div className="space-y-3 flex-1 flex flex-col">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight leading-normal">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed flex-1 font-normal">
                      {step.desc}
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
