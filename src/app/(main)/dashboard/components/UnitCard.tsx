import Link from "next/link";
import { BookOpen, TrendingUp, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnitCardProps {
  currentUnitData: {
    unitId: string;
    title: string;
    description: string;
    currentPhase: string;
    progress: number;
    completed: boolean;
    route: string;
    tags: string[];
  };
}

export default function UnitCard({ currentUnitData }: UnitCardProps) {
  const tags = currentUnitData.tags ?? [];

  return (
    <div className="relative rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/25 backdrop-blur-sm p-6 sm:p-8 flex flex-col justify-between overflow-hidden group hover:border-emerald-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-teal-500/5 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute -top-8 -right-8 opacity-[0.04] dark:opacity-[0.06] text-emerald-600 group-hover:scale-105 transition-transform duration-500">
        <BookOpen className="size-48" />
      </div>

      <div className="space-y-5 relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60 px-3 py-1 rounded-full">
            Bài học đang học
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            {currentUnitData.currentPhase}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-tight tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
            {currentUnitData.title}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal max-w-prose">
            {currentUnitData.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-zinc-100/80 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/40 font-semibold"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-zinc-200/50 dark:border-zinc-800/50 relative z-10 space-y-5">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-emerald-500" />
              Tiến trình bài học
            </span>
            <span className="text-zinc-900 dark:text-zinc-50 font-black font-mono">{currentUnitData.progress}%</span>
          </div>
          <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700 ease-out"
              style={{ width: `${currentUnitData.progress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Tiếp tục từ phần đang học và hoàn thành nhiệm vụ giao tiếp của bài.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
            <Link href={`${currentUnitData.route}?mini=1`} className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full h-11 px-5 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold rounded-xl gap-1.5"
              >
                <Zap className="size-4" />
                Học nhanh ~15 phút
              </Button>
            </Link>
            <Link href={currentUnitData.route} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-11 px-7 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-500/30 active:scale-[0.97]">
                <span>Tiếp tục học</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
