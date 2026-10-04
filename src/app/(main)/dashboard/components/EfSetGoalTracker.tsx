"use client";

import { useState } from "react";
import { Target, ChevronRight, ExternalLink } from "lucide-react";

const CEFR_ORDER = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];

interface Milestone {
  id: string;
  label: string;
  done: (level: string, units: number) => boolean;
}

interface GoalConfig {
  title: string;
  targetLevel: string;
  link: string;
  linkText: string;
  milestones: Milestone[];
}

const GOAL_CONFIG: Record<string, GoalConfig> = {
  A0: {
    title: "Chứng chỉ CEFR A1",
    targetLevel: "A1",
    link: "https://www.efset.org/quick-check/",
    linkText: "Thi EF SET Quick Check (miễn phí)",
    milestones: [
      { id: "placement", label: "Làm placement test CEFR", done: () => true },
      { id: "a0-units", label: "Hoàn thành A0 foundation (8 units)", done: (_l, u) => u >= 8 },
      { id: "a1-vocab", label: "Học 200 từ vựng cơ bản A1", done: (_l, u) => u >= 12 },
      { id: "grammar", label: "Ôn ngữ pháp: Present Simple, To Be, There is/are", done: (l) => CEFR_ORDER.indexOf(l) >= 1 },
      { id: "reading", label: "Luyện 10 câu reading comprehension (Quiz)", done: (_l, u) => u >= 5 },
      { id: "efset", label: "Thi EF SET Quick Check → đạt A1", done: (l) => CEFR_ORDER.indexOf(l) >= 1 },
    ],
  },
  A1: {
    title: "Chứng chỉ CEFR A2",
    targetLevel: "A2",
    link: "https://www.efset.org/cefr/a2/",
    linkText: "Tìm hiểu tiêu chuẩn CEFR A2",
    milestones: [
      { id: "past-simple", label: "Làm quen với các thì quá khứ (Past Simple)", done: (_l, u) => u >= 13 },
      { id: "reading-a2", label: "Đọc hiểu 15 đoạn văn tiếng Anh cơ bản", done: (_l, u) => u >= 14 },
      { id: "comparatives", label: "Học so sánh hơn & so sánh nhất (Comparatives)", done: (_l, u) => u >= 15 },
      { id: "travel-a2", label: "Luyện phát âm & chỉ đường du lịch (A2 Travel)", done: (_l, u) => u >= 16 },
      { id: "shadowing", label: "Luyện 30 bài nói phản xạ Shadowing/Roleplay", done: (_l, u) => u >= 17 },
      { id: "a2-complete", label: "Hoàn thành toàn bộ lộ trình A2 (18 units)", done: (l, u) => u >= 18 || CEFR_ORDER.indexOf(l) >= 2 },
    ],
  },
  A2: {
    title: "Chứng chỉ CEFR B1 (IELTS 4.5+)",
    targetLevel: "B1",
    link: "https://www.efset.org/cefr/b1/",
    linkText: "Kiểm tra kỹ năng tiếng Anh B1",
    milestones: [
      { id: "past-continuous", label: "Học thì Quá khứ Tiếp diễn & Hoàn thành", done: (_l, u) => u >= 20 },
      { id: "phrasal-verbs", label: "Nắm vững 20 Phrasal Verbs công sở thiết yếu", done: (_l, u) => u >= 27 },
      { id: "reading-b1", label: "Đọc hiểu chủ đề tin tức, sức khỏe & môi trường", done: (_l, u) => u >= 30 },
      { id: "business-email", label: "Soạn thảo email công việc & giao tiếp kinh doanh", done: (_l, u) => u >= 31 },
      { id: "speaking-discussion", label: "Luyện nói đàm thoại và thảo luận (Discussion)", done: (_l, u) => u >= 29 },
      { id: "b1-complete", label: "Thi đạt mục tiêu B1 (IELTS 4.5+)", done: (l, u) => u >= 32 || CEFR_ORDER.indexOf(l) >= 3 },
    ],
  },
  B1: {
    title: "Chứng chỉ CEFR B2 (IELTS 6.5+)",
    targetLevel: "B2",
    link: "https://www.efset.org/cefr/b2/",
    linkText: "Tìm hiểu bài thi EF SET B2",
    milestones: [
      { id: "conditionals", label: "Sử dụng câu điều kiện loại 2 & 3", done: (_l, u) => u >= 34 },
      { id: "academic-passive", label: "Dùng câu bị động học thuật nâng cao", done: (_l, u) => u >= 36 },
      { id: "inversion", label: "Nắm vững cấu trúc đảo ngữ (Inversion)", done: (_l, u) => u >= 38 },
      { id: "presentation-speaking", label: "Luyện thuyết trình & đàm phán nâng cao", done: (_l, u) => u >= 40 },
      { id: "ielts-vocab", label: "Học 60 từ vựng học thuật IELTS 6.5+", done: (_l, u) => u >= 41 },
      { id: "b2-complete", label: "Thi đạt mục tiêu B2 (IELTS 6.5+)", done: (l, u) => u >= 42 || CEFR_ORDER.indexOf(l) >= 4 },
    ],
  },
  B2: {
    title: "Mục tiêu: Đạt C1 / Fluency",
    targetLevel: "C1",
    link: "https://www.efset.org/cefr/c1/",
    linkText: "Tìm hiểu chứng chỉ CEFR C1",
    milestones: [
      { id: "full-curriculum", label: "Hoàn thành toàn bộ lộ trình B2 (42 units)", done: (_l, u) => u >= 42 },
      { id: "academic-srs", label: "Ôn luyện 500 thẻ từ vựng học thuật SRS", done: (_l, u) => u >= 42 },
      { id: "speaking-recordings", label: "Thực hiện 50 phiên luyện nói ghi âm", done: (_l, u) => u >= 42 },
      { id: "advanced-reading", label: "Đọc hiểu tài liệu chuyên ngành & tin tức", done: (_l, u) => u >= 42 },
      { id: "advanced-writing", label: "Viết luận & báo cáo học thuật chuyên sâu", done: (_l, u) => u >= 42 },
      { id: "c1-mock", label: "Thi thử IELTS đạt 7.0+ hoặc EF SET C1", done: (_l, u) => u >= 42 },
    ],
  },
};

interface EfSetGoalTrackerProps {
  userLevel: string;
  completedUnits: number;
}

export default function EfSetGoalTracker({ userLevel, completedUnits }: EfSetGoalTrackerProps) {
  const [expanded, setExpanded] = useState(false);
  const config = GOAL_CONFIG[userLevel] ?? GOAL_CONFIG["B2"]!;
  const levelIdx = CEFR_ORDER.indexOf(userLevel);
  const targetIdx = CEFR_ORDER.indexOf(config.targetLevel);
  const isPassed = levelIdx >= targetIdx;
  const doneCount = config.milestones.filter(m => m.done(userLevel, completedUnits)).length;
  const pct = Math.round((doneCount / config.milestones.length) * 100);

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 shrink-0">
          <Target className="size-5 text-amber-500" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-black text-amber-500 uppercase tracking-widest">Mục tiêu</p>
            {isPassed && (
              <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                ✓ Đạt {config.targetLevel}
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{config.title}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1.5 bg-amber-500/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-amber-500 shrink-0">{doneCount}/{config.milestones.length}</span>
          </div>
        </div>
        <ChevronRight
          className={`size-4 text-amber-400/60 shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-amber-500/10 pt-3">
          {config.milestones.map(m => {
            const done = m.done(userLevel, completedUnits);
            return (
              <div key={m.id} className="flex items-center gap-2.5">
                <span className={`flex size-4 items-center justify-center rounded-full shrink-0 text-[9px] font-black ${
                  done ? "bg-emerald-500 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400"
                }`}>
                  {done ? "✓" : "·"}
                </span>
                <span className={`text-xs font-medium ${done ? "line-through text-zinc-400 dark:text-zinc-600" : "text-zinc-700 dark:text-zinc-300"}`}>
                  {m.label}
                </span>
              </div>
            );
          })}
          <a
            href={config.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
          >
            <ExternalLink className="size-3.5 text-amber-500" />
            <span className="text-xs font-bold text-amber-500">{config.linkText}</span>
          </a>

          {/* Realistic motivation — small consistent daily practice > bursts; link to free speaking (vibrant glass, no hype) */}
          <div className="mt-2 p-2 rounded-xl bg-white/5 dark:bg-zinc-950/30 border border-white/10 text-[10px] text-zinc-600 dark:text-zinc-400 leading-snug">
            Nhỏ đều đặn mỗi ngày &gt; bùng nổ một lần. Thói quen nói ngắn giữ tiến bộ bền vững.
            <a href="/me/speaking" className="ml-1 font-medium text-emerald-500 hover:underline">Luyện nói miễn phí →</a>
          </div>
        </div>
      )}
    </div>
  );
}
