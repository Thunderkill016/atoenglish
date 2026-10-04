import {
  LESSON_BLUEPRINT,
  REFERENCE_UNIT_ID,
  type ContentBlockId,
} from "@/lib/lessons/lesson-blueprint";
import { IPOR_META, type IporPhase } from "@/lib/lessons/learning-flow";

const IPOR_PHASES: IporPhase[] = ["input", "processing", "output", "review"];

/** Gộp blueprint blocks theo IPOR — cùng khung với unit1.ts + lesson-blueprint.ts */
const STEPS = IPOR_PHASES.map((phase) => {
  const blocks = LESSON_BLUEPRINT.filter((b) => b.phase === phase && b.sectionIds.length > 0);
  const labels: Record<ContentBlockId, string> = {
    meta: "",
    hook: "tình huống",
    warmup: "ôn SRS",
    vocab: "từ vựng",
    grammar: "ngữ pháp",
    exercises_input: "luyện tập",
    dialogues: "hội thoại",
    fluency: "phản xạ",
    output: "dịch → shadowing → nói",
    review: "quiz + ôn tích lũy",
  };
  const text = blocks.map((b) => labels[b.id]).filter(Boolean).join(" → ");
  return { phase, text };
});

export default function HowToLearnCard() {
  return (
    <div className="mb-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4">
      <p className="text-xs font-black text-zinc-500 uppercase tracking-wider mb-1">
        Cách học 1 bài (~30 phút)
      </p>
      <p className="text-xs text-zinc-600 mb-3">
        Cùng khung với nội dung — tham chiếu {REFERENCE_UNIT_ID} (SDL + IPOR)
      </p>
      <ol className="space-y-2.5">
        {STEPS.map(({ phase, text }, i) => (
          <li key={phase} className="flex items-start gap-3 text-sm">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-xs font-black text-zinc-400">
              {i + 1}
            </span>
            <div>
              <span className="text-xs font-bold text-zinc-600">
                {IPOR_META[phase].labelVi}
              </span>
              <p className="text-zinc-300 leading-snug">{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-zinc-600 border-t border-zinc-800/80 pt-3">
        Ôn nhanh chỉ dùng khi đã học bài này ít nhất 1 lần.
      </p>
    </div>
  );
}