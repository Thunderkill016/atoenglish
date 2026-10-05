import { Play } from "lucide-react";

import { Waveform } from "./notebook";

/**
 * Hero payload — a real lesson rendered as a taped notebook sheet holding a
 * voice conversation (DESIGN.md: chat-demo-card). Honest content: this is what
 * the first lesson actually looks like.
 */
export default function VoiceDemo() {
  return (
    <div className="nb-taped relative rotate-[0.4deg] rounded-lg border border-nb-hairline bg-nb-surface p-5 sm:p-6 shadow-[0_14px_34px_rgba(90,80,50,0.12)]">
      <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.1em] text-nb-muted-soft mb-4">
        Bài 1 · Gặp đồng nghiệp mới
      </p>

      {/* Tutor instruction */}
      <div className="mb-3 mr-auto max-w-[88%] rounded-2xl rounded-bl-md border border-nb-hairline bg-nb-surface px-4 py-3 text-[14px] leading-relaxed text-nb-ink">
        <span className="block text-[10.5px] font-extrabold uppercase tracking-wider text-nb-muted-soft">
          AtoEnglish
        </span>
        Nghe người bản xứ nói, rồi nhại theo nhé:
      </div>

      {/* Native voice message */}
      <div className="mb-3 ml-auto flex max-w-[88%] items-center gap-3 rounded-2xl rounded-br-md border-[1.5px] border-nb-primary bg-nb-surface px-4 py-3 shadow-[0_4px_12px_rgba(47,158,68,0.14)]">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-nb-primary">
          <Play className="size-4 fill-white text-white" />
        </span>
        <span className="min-w-0">
          <Waveform />
          <span className="block truncate font-serif italic text-[11.5px] text-nb-muted-soft">
            “Hi, I’m Minh. I work in Da Nang.”
          </span>
        </span>
        <span className="text-xs font-extrabold text-nb-muted">0:07</span>
      </div>

      {/* Learner's own answer */}
      <div className="mb-3 ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-nb-primary px-4 py-3 text-white">
        <span className="font-serif italic text-[16px]">
          “Hi, I’m Minh. I work in Da Nang.”
        </span>
      </div>

      {/* Pronunciation feedback */}
      <div className="mr-auto max-w-[88%] rounded-2xl rounded-bl-md border border-nb-hairline bg-nb-surface px-4 py-3 text-[14px] leading-relaxed text-nb-ink">
        <span className="block text-[10.5px] font-extrabold uppercase tracking-wider text-nb-muted-soft">
          Phản hồi
        </span>
        Nghe được rồi — âm /w/ trong “work” hơi nhẹ, thử lại lần nữa →
      </div>
    </div>
  );
}
