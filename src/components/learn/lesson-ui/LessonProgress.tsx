import { SECTION_ORDER, TOTAL_SECTIONS } from "../lesson-sections";

interface LessonProgressProps {
  sectionOrderIdx: number;
}

export default function LessonProgress({ sectionOrderIdx }: LessonProgressProps) {
  const progress = Math.round((sectionOrderIdx / (TOTAL_SECTIONS - 1)) * 100);

  return (
    <div
      className="flex items-center gap-0 mt-2"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Tiến độ bài học: bước ${sectionOrderIdx + 1} / ${TOTAL_SECTIONS}`}
    >
      {SECTION_ORDER.map((secNum, index) => {
        const isSectionCompleted = index < sectionOrderIdx;
        const isSectionCurrent = index === sectionOrderIdx;

        return (
          <div key={secNum} className="flex items-center flex-1 min-w-0">
            <div
              className={`relative flex items-center justify-center rounded-full shrink-0 transition-all duration-300 ${
                isSectionCurrent
                  ? "w-7 h-7 bg-emerald-500 ring-2 ring-emerald-400/50 ring-offset-1 ring-offset-zinc-950 shadow-lg shadow-emerald-900/60"
                  : isSectionCompleted
                    ? "w-5 h-5 bg-emerald-800"
                    : "w-5 h-5 bg-zinc-800"
              }`}
            >
              {isSectionCompleted ? (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5l2 2 4-4"
                    stroke="#34d399"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <span
                  className={`font-bold tabular-nums leading-none select-none ${
                    isSectionCurrent
                      ? "text-white text-xs"
                      : "text-zinc-600 text-xs"
                  }`}
                >
                  {index + 1}
                </span>
              )}
              {isSectionCurrent && (
                <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
              )}
            </div>
            {index < SECTION_ORDER.length - 1 && (
              <div
                className={`h-px flex-1 mx-0.5 transition-all duration-500 ${
                  index < sectionOrderIdx ? "bg-emerald-700" : "bg-zinc-800"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
