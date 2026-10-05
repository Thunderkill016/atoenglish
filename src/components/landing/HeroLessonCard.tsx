"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock, Mic, Sparkles } from "lucide-react";

const LESSON_STEPS = [
  { label: "Nghe câu mẫu", state: "done" },
  { label: "Hiểu cấu trúc", state: "done" },
  { label: "Nói theo mẫu", state: "active" },
  { label: "Ôn tập FSRS", state: "locked" },
] as const;

/**
 * Hero visual: an animated slice of the real lesson loop (input →
 * processing → output → review). Pure CSS/JS animation of product UI —
 * no screenshots, no stock imagery.
 */
export default function HeroLessonCard() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="relative w-full max-w-sm mx-auto rounded-3xl border border-border/60 bg-card p-5 shadow-xl shadow-primary/10"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Mic className="size-3.5" />
          </span>
          <span className="text-xs font-bold text-foreground">
            Bài A0-1 · Ngày 1
          </span>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
          10–15 phút
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        {LESSON_STEPS.map((step, i) => (
          <motion.div
            key={step.label}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * i + 0.2, duration: 0.4 }}
            className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 ${
              step.state === "active"
                ? "border-primary/40 bg-primary/5"
                : step.state === "done"
                  ? "border-border/40 bg-muted/40"
                  : "border-dashed border-border/60 bg-transparent"
            }`}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                step.state === "active"
                  ? "bg-primary text-white"
                  : step.state === "done"
                    ? "bg-state-known/15 text-state-known"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {step.state === "done" ? (
                <Check className="size-3.5" />
              ) : step.state === "locked" ? (
                <Lock className="size-3" />
              ) : (
                <span className="size-1.5 rounded-full bg-white" />
              )}
            </span>
            <span
              className={`text-sm font-semibold ${
                step.state === "locked"
                  ? "text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {step.label}
            </span>
            {step.state === "active" && (
              <motion.span
                animate={reduceMotion ? {} : { opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.6 }}
                className="ml-auto text-[10px] font-bold uppercase tracking-wide text-primary"
              >
                Đang học
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className="text-muted-foreground">Tiến độ buổi học</span>
          <span className="text-primary">3/4 bước</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            initial={reduceMotion ? { width: "75%" } : { width: "0%" }}
            animate={{ width: "75%" }}
            transition={{ delay: 0.9, duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-primary"
          />
        </div>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.9, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.4 }}
        className="absolute -right-3 -top-3 flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 shadow-md"
      >
        <Sparkles className="size-3.5 text-primary" />
        <span className="text-[10px] font-bold text-foreground">
          Bắt đầu từ A0
        </span>
      </motion.div>
    </div>
  );
}
