"use client";

import { useState, Suspense, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Loader2,
  Sparkles,
  ArrowLeft,
  Sprout,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { MinimalButton } from "@/components/design-system";
import { LoginSchema, SignUpSchema } from "@/lib/security/validation";
import {
  getDailyMinutes,
  getDailyXpGoalFromTime,
  getOnboardingRedirectPath,
  getOnboardingStartingUnitIndex,
  mapQuizLevelToCefr,
} from "@/lib/onboarding";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

// ── Module-level constants (never recreated on re-render) ──
const QUESTIONS = [
  {
    id: 1,
    title: "Trình độ tiếng Anh hiện tại của bạn?",
    subtitle:
      "Chọn mức gần nhất — sau đăng ký có thể làm bài test chính xác hơn.",
    options: [
      { emoji: "🆕", label: "Mất gốc / Chưa biết gì", val: "A0-A1" },
      { emoji: "📚", label: "Biết từ vựng cơ bản, chưa nói được", val: "A2" },
      { emoji: "💬", label: "Giao tiếp được, phản xạ còn chậm", val: "B1" },
      { emoji: "🚀", label: "Tự tin nói tiếng Anh trôi chảy", val: "B2+" },
    ],
  },
  {
    id: 2,
    title: "Mục tiêu học tiếng Anh của bạn?",
    subtitle: "Chúng tôi sẽ cá nhân hóa lộ trình theo mục tiêu này.",
    options: [
      { emoji: "💼", label: "Đi làm, thăng tiến sự nghiệp", val: "work" },
      { emoji: "✈️", label: "Tự tin du lịch nước ngoài", val: "travel" },
      { emoji: "🎓", label: "Học tập, thi chứng chỉ quốc tế", val: "study" },
      {
        emoji: "🗣️",
        label: "Luyện phản xạ nói tự tin hàng ngày",
        val: "daily",
      },
    ],
  },
  {
    id: 3,
    title: "Khó khăn lớn nhất khi học tiếng Anh?",
    subtitle: "Câu trả lời giúp chúng tôi hỗ trợ bạn tốt hơn.",
    options: [
      { emoji: "😰", label: "Sợ nói sai, ngại bị đánh giá", val: "fear" },
      { emoji: "🧠", label: "Biết nhưng không nói ra được", val: "gap" },
      {
        emoji: "⏰",
        label: "Không có thời gian luyện tập đều đặn",
        val: "time",
      },
      { emoji: "💤", label: "Học mãi vẫn hay quên từ vựng", val: "forget" },
    ],
  },
  {
    id: 4,
    title: "Bạn có thể dành bao nhiêu thời gian mỗi ngày?",
    subtitle: "Chúng tôi tối ưu độ dài bài học theo thời gian bạn chọn.",
    options: [
      { emoji: "⚡", label: "5 phút/ngày — Bận rộn", val: "5min" },
      { emoji: "⭐", label: "15 phút/ngày — Tiêu chuẩn", val: "15min" },
      { emoji: "🔥", label: "30 phút/ngày — Nghiêm túc", val: "30min" },
      { emoji: "💎", label: "60 phút/ngày — Tốc hành", val: "60min" },
    ],
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/learn";
  const mode = searchParams.get("mode");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Onboarding — 0=welcome, 1=level, 2=auth (V2: 3-step max)
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [direction, setDirection] = useState(1);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Supabase client — useRef to create only once
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // Skip survey if returning user or mode=login
  useEffect(() => {
    const hasCompletedOnboarding =
      typeof window !== "undefined" &&
      localStorage.getItem("ato_onboarding_completed") === "true";
    if (mode === "login" || hasCompletedOnboarding) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOnboardingStep(2);

      setIsSignUp(false);
    } else {
      setOnboardingStep(0); // Welcome screen first
    }
  }, [mode]);

  // Cleanup timer on unmount
  useEffect(
    () => () => {
      if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    },
    [],
  );

  const levelQuestion = QUESTIONS[0]!;

  const applyDefaultSurveyAnswers = (level: string) => ({
    1: level,
    2: "work",
    3: "fear",
    4: "15min",
  });

  const handleAnswerSelect = (val: string) => {
    const nextAnswers = applyDefaultSurveyAnswers(val);
    setAnswers(nextAnswers);
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setTimeout(() => {
      setDirection(1);
      setOnboardingStep(2);
      setIsSignUp(true);
    }, 400);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const level = answers[1] || "A0-A1";
      const target = answers[2] || "work";
      const obstacle = answers[3] || "fear";
      const time = answers[4] || "15min";
      const postAuthPath = hasAnswers
        ? getOnboardingRedirectPath(level, time)
        : next;
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(postAuthPath)}&level=${encodeURIComponent(level)}&target=${encodeURIComponent(target)}&obstacle=${encodeURIComponent(obstacle)}&time=${encodeURIComponent(time)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectUrl },
      });
      if (error) throw error;
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Đăng nhập bằng Google thất bại.");
      setIsGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }

    const schema = isSignUp ? SignUpSchema : LoginSchema;
    const validated = schema.safeParse({ email, password });
    if (!validated.success) {
      toast.error(validated.error.issues.map((err) => err.message).join(", "));
      return;
    }

    const level = answers[1] || "A0-A1";
    const target = answers[2] || "work";
    const obstacle = answers[3] || "fear";
    const time = answers[4] || "15min";
    const mappedLevel = mapQuizLevelToCefr(level);
    const postAuthPath = hasAnswers
      ? getOnboardingRedirectPath(level, time)
      : next;
    const dailyXpGoal = getDailyXpGoalFromTime(time);
    const dailyMinutes = getDailyMinutes(time);

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(postAuthPath)}&level=${encodeURIComponent(level)}&target=${encodeURIComponent(target)}&obstacle=${encodeURIComponent(obstacle)}&time=${encodeURIComponent(time)}`,
          },
        });
        if (error) throw error;

        if (data?.user) {
          const { data: progress } = await supabase
            .from("user_progress")
            .select("user_id")
            .eq("user_id", data.user.id)
            .maybeSingle();

          if (!progress) {
            await supabase.from("user_progress").insert({
              user_id: data.user.id,
              current_level: mappedLevel,
              starting_unit_index: getOnboardingStartingUnitIndex(level),
              streak: 0,
              total_xp: 0,
              daily_xp_goal: dailyXpGoal,
            });
            // Persist Q2–Q4 from signup survey to dedicated table
            await supabase.from("user_onboarding_profile").insert({
              user_id: data.user.id,
              goal: target,
              obstacle: obstacle,
              daily_minutes: dailyMinutes,
            });
          }
          localStorage.setItem("ato_daily_xp_goal", String(dailyXpGoal));

          toast.success("Đăng ký tài khoản thành công!");
          router.push(postAuthPath);
        } else {
          toast.success(
            "Đăng ký thành công! Vui lòng kiểm tra email xác nhận.",
          );
        }
      } else {
        const { error, data } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        if (data?.user) {
          const { data: progress } = await supabase
            .from("user_progress")
            .select("user_id")
            .eq("user_id", data.user.id)
            .maybeSingle();

          if (!progress) {
            await supabase.from("user_progress").insert({
              user_id: data.user.id,
              current_level: mappedLevel,
              starting_unit_index: getOnboardingStartingUnitIndex(level),
              streak: 0,
              total_xp: 0,
              daily_xp_goal: dailyXpGoal,
            });
          }
          localStorage.setItem("ato_daily_xp_goal", String(dailyXpGoal));
        }

        toast.success("Đăng nhập thành công!");
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Xác thực bằng Email thất bại.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRecapText = () => {
    const levelMap: Record<string, string> = {
      "A0-A1": "Mất gốc",
      A2: "Cơ bản",
      B1: "Giao tiếp",
      "B2+": "Trôi chảy",
    };
    const targetMap: Record<string, string> = {
      work: "Đi làm",
      travel: "Du lịch",
      study: "Học tập",
      daily: "Phản xạ",
    };
    const timeMap: Record<string, string> = {
      "5min": "5 phút/ngày",
      "15min": "15 phút/ngày",
      "30min": "30 phút/ngày",
      "60min": "60 phút/ngày",
    };
    const obstacleMap: Record<string, string> = {
      fear: "Tự tin nói",
      gap: "Phản xạ nói",
      time: "Duy trì thói quen",
      forget: "Ghi nhớ sâu",
    };

    return {
      level: levelMap[answers[1]] || "Mất gốc",
      target: targetMap[answers[2]] || "Đi làm",
      time: timeMap[answers[4]] || "15 phút/ngày",
      obstacle: obstacleMap[answers[3]] || "Phản xạ nói",
    };
  };

  const recap = useMemo(() => getRecapText(), [answers]); // eslint-disable-line react-hooks/exhaustive-deps
  const hasAnswers = !!answers[1];

  return (
    <div className="min-h-screen min-h-[100dvh] bg-card text-foreground font-sans flex flex-col lg:flex-row selection:bg-primary/10 selection:text-primary">
      {/* ── Right Column: Survey / Login (mobile-first, full width; desktop chrome removed) ── */}
      <div className="flex-1 flex flex-col justify-between py-8 sm:py-12 px-5 sm:px-12 md:px-16 lg:px-24 bg-white relative overflow-y-auto">
        {/* Background glow + dot grid */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -left-[40%] w-[80%] h-[80%] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-[40%] -right-[40%] w-[80%] h-[80%] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
        </div>

        {/* Top Navigation */}
        <header className="max-w-md w-full mx-auto flex items-center justify-between mb-4 sm:mb-8 z-10">
          <Link href="/" className="lg:hidden flex items-center gap-2.5 group">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
              <Sprout className="size-4.5" />
            </span>
            <div className="flex flex-col leading-none text-left">
              <span className="text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                AtoEnglish
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                Grow every day
              </span>
            </div>
          </Link>

          {onboardingStep === 1 ? (
            <Button
              variant="ghost"
              onClick={() => {
                if (autoAdvanceTimer.current)
                  clearTimeout(autoAdvanceTimer.current);
                setDirection(-1);
                setOnboardingStep(0);
              }}
              className="ml-auto text-xs font-bold text-muted-foreground hover:text-foreground h-10 min-w-[80px] gap-1.5 rounded-xl border border-border hover:bg-card transition-all"
            >
              <ArrowLeft className="size-3.5" />
              Quay lại
            </Button>
          ) : (
            <Link href="/" className="ml-auto">
              <Button
                variant="ghost"
                className="text-xs font-bold text-muted-foreground hover:text-foreground h-10 min-w-[80px] gap-1.5 rounded-xl border border-border hover:bg-card transition-all"
              >
                <ArrowLeft className="size-3.5" />
                Về trang chủ
              </Button>
            </Link>
          )}
        </header>

        {/* Main animated content */}
        <main
          id="main-content"
          className="max-w-md w-full mx-auto my-auto py-4 z-10"
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={onboardingStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 350, damping: 32 },
                opacity: { duration: 0.25 },
              }}
              className="flex flex-col space-y-6 text-left"
            >
              {/* ── Step 0: Welcome screen ── */}
              {onboardingStep === 0 ? (
                <div className="space-y-5 sm:space-y-8 text-center flex flex-col items-center py-2 sm:py-6">
                  {/* Illustration */}
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className="relative"
                  >
                    <div className="size-24 rounded-3xl bg-primary flex items-center justify-center text-5xl shadow-xl shadow-primary/20">
                      🌱
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute -top-2 -right-2 text-2xl"
                    >
                      ✨
                    </motion.div>
                  </motion.div>

                  {/* Headline */}
                  <div className="space-y-3">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                      Bắt đầu hành trình nói{" "}
                      <span className="bg-gradient-to-r from-primary to-primary bg-clip-text text-transparent">
                        28 ngày
                      </span>
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
                      Chọn trình độ gần nhất để AtoEnglish gợi ý điểm bắt đầu
                      cho nhiệm vụ nói đầu tiên.
                    </p>
                  </div>

                  {/* Feature pills */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      "🗓 28 ngày · 1 mục tiêu nói",
                      "⏱ 10–15 phút/ngày",
                      "🌱 Bắt đầu từ A0",
                    ].map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-semibold text-primary bg-primary/10 border border-primary/40 px-3 py-1.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Primary CTA */}
                  <MinimalButton
                    onClick={() => {
                      setDirection(1);
                      setOnboardingStep(1);
                    }}
                    fullWidth
                    className="max-w-xs"
                  >
                    Chọn điểm bắt đầu 🚀
                  </MinimalButton>

                  {/* Already have account */}
                  <button
                    type="button"
                    onClick={() => {
                      setDirection(1);
                      setOnboardingStep(2);
                      setIsSignUp(false);
                    }}
                    className="text-xs text-muted-foreground hover:text-muted-foreground font-medium transition-colors underline underline-offset-4"
                  >
                    Tôi đã có tài khoản. Đăng nhập →
                  </button>
                </div>
              ) : /* ── Step 1: Level question ── */
              onboardingStep === 1 ? (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-tight">
                      {levelQuestion.title}
                    </h1>
                    <p className="text-xs text-muted-foreground font-normal">
                      {levelQuestion.subtitle}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2.5 pt-1">
                    {levelQuestion.options.map((opt, idx) => {
                      const isSelected = answers[1] === opt.val;
                      return (
                        <motion.button
                          key={idx}
                          type="button"
                          onClick={() => handleAnswerSelect(opt.val)}
                          whileHover={{ scale: 1.012, y: -1 }}
                          whileTap={{ scale: 0.995 }}
                          className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 font-semibold text-sm flex items-center gap-4 shadow-sm group ${
                            isSelected
                              ? "border-primary bg-primary/10/60 text-primary shadow-primary/10"
                              : "border-border bg-white text-foreground hover:border-primary hover:bg-primary/10/20"
                          }`}
                        >
                          <span className="text-2xl shrink-0 leading-none">
                            {opt.emoji}
                          </span>
                          <span className="flex-1 leading-snug">
                            {opt.label}
                          </span>
                          {isSelected && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 25,
                              }}
                              className="flex size-5 items-center justify-center rounded-full bg-primary text-white shrink-0"
                            >
                              <Check className="size-3" strokeWidth={3} />
                            </motion.span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  <p className="text-center text-xs text-muted-foreground pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (autoAdvanceTimer.current)
                          clearTimeout(autoAdvanceTimer.current);
                        setDirection(1);
                        setOnboardingStep(2);
                        setIsSignUp(false);
                        setAnswers({});
                      }}
                      className="hover:text-muted-foreground underline underline-offset-4 transition-colors"
                    >
                      Tôi đã có tài khoản
                    </button>
                  </p>
                </div>
              ) : (
                /* ── Step 2: Auth Form ── */
                <>
                  {/* Recap banner */}
                  <div className="space-y-3 text-left">
                    {hasAnswers && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-col gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10 backdrop-blur-sm"
                      >
                        <div className="flex items-center gap-2 text-xs font-bold text-primary">
                          <Sparkles className="size-4" />
                          <span>Đã chọn điểm bắt đầu phù hợp</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center text-xs sm:text-xs font-bold text-primary bg-primary/10/50 px-2.5 py-0.5 rounded-lg border border-primary/40/30">
                            Cấp độ: {recap.level}
                          </span>
                          <span className="inline-flex items-center text-xs sm:text-xs font-bold text-primary bg-primary/10/50 px-2.5 py-0.5 rounded-lg border border-primary/40/30">
                            Học tập: {recap.time}
                          </span>
                        </div>
                      </motion.div>
                    )}

                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                      {hasAnswers
                        ? "Bài học đầu tiên đã sẵn sàng!"
                        : isSignUp
                          ? "Tạo tài khoản mới"
                          : "Chào mừng quay trở lại"}
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                      {hasAnswers
                        ? "Đăng ký hoặc đăng nhập để bắt đầu luyện nhiệm vụ nói đầu tiên."
                        : isSignUp
                          ? "Đăng ký nhanh để bắt đầu bài học đầu tiên."
                          : "Đăng nhập để tiếp tục tiến trình học tập của bạn."}
                    </p>
                  </div>

                  {/* Auth actions */}
                  <div className="space-y-4 pt-1">
                    {/* Google login */}
                    <motion.div
                      whileHover={{ scale: 1.01, y: -0.5 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Button
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading || isLoading}
                        className="w-full bg-white hover:bg-card text-foreground font-bold h-12 rounded-xl text-sm gap-3 active:scale-[0.98] transition-all duration-300 border border-border shadow-sm flex items-center justify-center"
                      >
                        {isGoogleLoading ? (
                          <Loader2 className="size-4 animate-spin text-muted-foreground" />
                        ) : (
                          <svg className="size-5 shrink-0" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                              fill="#EA4335"
                            />
                          </svg>
                        )}
                        <span>Tiếp tục với Google</span>
                      </Button>
                    </motion.div>

                    {/* Separator */}
                    <div className="relative flex py-1 items-center">
                      <div className="flex-grow border-t border-border" />
                      <span className="flex-shrink mx-4 text-xs text-muted-foreground font-bold uppercase tracking-widest">
                        Hoặc sử dụng email
                      </span>
                      <div className="flex-grow border-t border-border" />
                    </div>

                    {/* Email form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      <div className="space-y-3">
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                          <input
                            id="login-email"
                            type="email"
                            placeholder="Email của bạn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            aria-label="Email của bạn"
                            autoComplete="email"
                            inputMode="email"
                            enterKeyHint="next"
                            className="flex h-12 w-full rounded-xl border border-border bg-white px-3.5 py-2 pl-11 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all duration-300 shadow-sm"
                            required
                          />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
                          <input
                            id="login-password"
                            type="password"
                            placeholder="Mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            aria-label="Mật khẩu"
                            autoComplete={
                              isSignUp ? "new-password" : "current-password"
                            }
                            enterKeyHint="done"
                            className="flex h-12 w-full rounded-xl border border-border bg-white px-3.5 py-2 pl-11 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all duration-300 shadow-sm"
                            required
                          />
                        </div>
                      </div>

                      <MinimalButton
                        type="submit"
                        disabled={isLoading || isGoogleLoading}
                        fullWidth
                      >
                        {isLoading && (
                          <Loader2 className="size-4 animate-spin" />
                        )}
                        <span>
                          {isSignUp
                            ? hasAnswers
                              ? "Bắt đầu bài học đầu tiên"
                              : "Đăng ký tài khoản"
                            : "Đăng nhập bằng Email"}
                        </span>
                      </MinimalButton>
                    </form>

                    {/* Toggle + redo survey */}
                    <div className="flex flex-col items-center gap-3 pt-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-primary hover:text-primary font-bold transition-colors underline underline-offset-4"
                      >
                        {isSignUp
                          ? "Đã có tài khoản? Đăng nhập ngay"
                          : "Chưa có tài khoản? Đăng ký học thử"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDirection(-1);
                          setOnboardingStep(1);
                          setAnswers({});
                          if (typeof window !== "undefined") {
                            localStorage.removeItem("ato_onboarding_completed");
                          }
                        }}
                        className="text-muted-foreground hover:text-foreground font-semibold transition-colors"
                      >
                        {hasAnswers
                          ? "Làm lại khảo sát định hướng"
                          : "Làm khảo sát để nhận lộ trình riêng"}
                      </button>
                    </div>
                  </div>

                  {/* Legal */}
                  <p className="text-xs text-center text-muted-foreground leading-relaxed pt-2">
                    Bằng việc tiếp tục, bạn đồng ý với{" "}
                    <Link
                      href="/terms"
                      className="underline hover:text-muted-foreground transition-colors font-medium"
                    >
                      Điều khoản dịch vụ
                    </Link>{" "}
                    và{" "}
                    <Link
                      href="/privacy"
                      className="underline hover:text-muted-foreground transition-colors font-medium"
                    >
                      Chính sách bảo mật
                    </Link>{" "}
                    của AtoEnglish.
                  </p>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="max-w-md w-full mx-auto text-center text-xs text-muted-foreground font-normal pt-8 z-10">
          &copy; {new Date().getFullYear()} AtoEnglish. Bảo lưu mọi quyền.
        </footer>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-card flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
