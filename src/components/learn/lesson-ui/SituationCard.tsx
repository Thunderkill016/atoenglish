import { getCefrActionContract } from "@/lib/lessons/cefr-action-contracts";
import LessonCard from "./LessonCard";

interface SituationCardProps {
  unitId: string;
  situation: string;
  outcomes?: string[];
}

export default function SituationCard({ unitId, situation, outcomes }: SituationCardProps) {
  const cefrAction = getCefrActionContract(unitId);

  return (
    <LessonCard variant="highlight" className="mb-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex size-8 items-center justify-center rounded-xl bg-sky-500/15 text-base">
            📍
          </span>
          <span className="text-[11px] font-black text-sky-400 uppercase tracking-widest">
            Tình huống thực tế
          </span>
        </div>
        <p className="text-white text-lg sm:text-xl leading-relaxed font-semibold mb-4">
          {situation}
        </p>

        {cefrAction && (
          <div className="mb-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-300">
                CEFR {cefrAction.level}
              </span>
              <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-300">
                {cefrAction.mode}
              </span>
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-emerald-400 mb-1">
              Nhiệm vụ giao tiếp đích
            </p>
            <p className="text-sm font-semibold leading-relaxed text-zinc-100">
              {cefrAction.actionTaskVi}
            </p>
            <ul className="mt-3 space-y-1.5">
              {cefrAction.successCriteriaVi.map((criterion) => (
                <li key={criterion} className="flex items-start gap-2 text-xs leading-relaxed text-zinc-400">
                  <span className="mt-0.5 text-emerald-400">✓</span>
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[10px] leading-relaxed text-zinc-500">
              Tham chiếu: {cefrAction.source.title}. Điểm quiz/XP của bài chưa được coi là bằng chứng CEFR mastery.
            </p>
          </div>
        )}

        {outcomes && outcomes.length > 0 && (
          <ul className="space-y-2">
            {outcomes.map((o, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-zinc-400 bg-black/20 rounded-xl px-3 py-2.5"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </LessonCard>
  );
}
