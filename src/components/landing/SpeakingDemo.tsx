"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Ear, Mic, Wand2 } from "lucide-react";

const BARS = [10, 22, 34, 18, 40, 28, 14, 36, 24, 30, 12, 38, 20, 26, 16];

/**
 * Static-shape voice-UI demo: three explicit states (listen / speak /
 * feedback) with distinct visuals — not one ambiguous animation.
 */
export default function SpeakingDemo() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="w-full max-w-md mx-auto rounded-3xl border border-border/60 bg-card p-5 shadow-lg shadow-primary/10"
    >
      <div className="flex items-center gap-2 rounded-2xl bg-muted/50 px-4 py-3">
        <Ear className="size-4 shrink-0 text-phase-input" />
        <div className="flex flex-1 items-center gap-[3px]">
          {BARS.map((h, i) => (
            <motion.span
              key={`listen-${i}`}
              animate={
                reduceMotion ? {} : { scaleY: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }
              }
              transition={{
                repeat: Infinity,
                duration: 1.8,
                delay: i * 0.06,
                ease: "easeInOut",
              }}
              className="w-[3px] rounded-full bg-phase-input"
              style={{ height: h }}
            />
          ))}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-phase-input">
          Nghe
        </span>
      </div>

      <div className="my-3 flex items-center justify-center gap-2 text-[11px] font-semibold text-muted-foreground">
        <span className="h-px w-8 bg-border" />
        bạn nhắc lại
        <span className="h-px w-8 bg-border" />
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
        <Mic className="size-4 shrink-0 text-primary" />
        <div className="flex flex-1 items-center gap-[3px]">
          {BARS.map((h, i) => (
            <motion.span
              key={`speak-${i}`}
              animate={
                reduceMotion
                  ? {}
                  : {
                      scaleY: [1, 1.6, 1],
                      opacity: [0.6, 1, 0.6],
                    }
              }
              transition={{
                repeat: Infinity,
                duration: 1.4,
                delay: i * 0.05,
                ease: "easeInOut",
              }}
              className="w-[3px] rounded-full bg-primary"
              style={{ height: h }}
            />
          ))}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
          Nói
        </span>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-state-known/30 bg-state-known/5 px-4 py-3">
        <Wand2 className="mt-0.5 size-4 shrink-0 text-state-known" />
        <p className="text-xs leading-relaxed text-foreground">
          <span className="font-semibold italic">“I work as a designer.”</span>
          <span className="mt-1 block text-muted-foreground">
            Độ chính xác 82% · mẹo: nối âm cuối /z/ ở “designer”.
          </span>
        </p>
      </div>
    </div>
  );
}
