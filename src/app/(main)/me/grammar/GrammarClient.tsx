"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lightbulb } from "lucide-react";
import {
  GRAMMAR_TOPICS,
  LEVEL_COLORS,
  LEVEL_BG,
  type GrammarLevel,
  type GrammarTopic,
} from "@/lib/data/grammar-topics";
import { SecondaryPageShell } from "@/components/design-system";

const LEVELS: GrammarLevel[] = ["A0", "A1", "A2", "B1", "B2"];

const LEVEL_LABEL: Record<GrammarLevel, string> = {
  A0: "A0 · Starter",
  A1: "A1 · Beginner",
  A2: "A2 · Elementary",
  B1: "B1 · Intermediate",
  B2: "B2 · Upper-Intermediate",
};

// Tailwind-safe class maps (avoids dynamic class generation issues)
const LEVEL_TAB_ACTIVE: Record<GrammarLevel, string> = {
  A0: "border-cyan-500 bg-cyan-500/10 text-cyan-400",
  A1: "border-emerald-500 bg-emerald-500/10 text-emerald-400",
  A2: "border-blue-500 bg-blue-500/10 text-blue-400",
  B1: "border-violet-500 bg-violet-500/10 text-violet-400",
  B2: "border-orange-500 bg-orange-500/10 text-orange-400",
};

const LEVEL_TAB_INACTIVE = "border-zinc-800 bg-transparent text-zinc-500 hover:border-zinc-600 hover:text-zinc-400";

const LEVEL_TEXT: Record<GrammarLevel, string> = {
  A0: "text-cyan-400",
  A1: "text-emerald-400",
  A2: "text-blue-400",
  B1: "text-violet-400",
  B2: "text-orange-400",
};

export default function GrammarClient() {
  const [activeLevel, setActiveLevel] = useState<GrammarLevel>("A0");
  const [openTopic, setOpenTopic] = useState<string | null>(null);

  const filtered = GRAMMAR_TOPICS.filter(t => t.level === activeLevel);

  return (
    <SecondaryPageShell
      title="Ngữ Pháp A0 → B2"
      subtitle="Giải thích tiếng Việt · Ví dụ thực tế · Lỗi hay gặp · Mẹo nhớ"
    >
      <div className="max-w-lg mx-auto pb-16">

        {/* Level tabs */}
        <div className="flex gap-1.5 mb-5">
          {LEVELS.map(lvl => (
            <button
              key={lvl}
              onClick={() => { setActiveLevel(lvl); setOpenTopic(null); }}
              className={`flex-1 py-2 rounded-xl border-[1.5px] text-xs font-black transition-all duration-150 ${
                lvl === activeLevel ? LEVEL_TAB_ACTIVE[lvl] : LEVEL_TAB_INACTIVE
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Level label */}
        <p className={`text-[11px] font-bold uppercase tracking-widest mb-3 ${LEVEL_TEXT[activeLevel]}`}>
          {LEVEL_LABEL[activeLevel]} · {filtered.length} chủ đề
        </p>

        {/* Topic list */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLevel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2"
          >
            {filtered.map(topic => (
              <TopicCard
                key={topic.id}
                topic={topic}
                isOpen={openTopic === topic.id}
                onToggle={() => setOpenTopic(openTopic === topic.id ? null : topic.id)}
                levelColor={LEVEL_TEXT[activeLevel]}
                levelBg={LEVEL_BG[activeLevel]}
                levelBorder={LEVEL_COLORS[activeLevel]}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </SecondaryPageShell>
  );
}

function TopicCard({
  topic,
  isOpen,
  onToggle,
  levelColor,
  levelBorder,
}: {
  topic: GrammarTopic;
  isOpen: boolean;
  onToggle: () => void;
  levelColor: string;
  levelBg: string;
  levelBorder: string;
}) {
  return (
    <div className={`bg-zinc-900/80 rounded-2xl overflow-hidden border transition-colors duration-200 ${
      isOpen ? "border-zinc-700" : "border-zinc-800/80"
    }`}>
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-transparent text-left"
      >
        <span className="text-xl shrink-0">{topic.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-zinc-50 mb-0.5">{topic.title}</p>
          <p className="text-[11px] text-zinc-500 font-semibold">{topic.subtitleEn}</p>
        </div>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-all duration-200 ${isOpen ? levelColor + " rotate-180" : "text-zinc-600"}`}
        />
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-3.5">
              {/* Divider */}
              <div className="h-px bg-zinc-800" />

              {/* Explanation */}
              <div>
                <p className={`text-[11px] font-black uppercase tracking-widest mb-1.5 ${levelColor}`}>📌 Giải thích</p>
                <p className="text-xs text-zinc-400 leading-relaxed">{topic.explanation}</p>
              </div>

              {/* Structure formula */}
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2.5">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${levelColor}`}>📐 Cấu trúc</p>
                <code className="text-xs text-zinc-200 font-mono leading-relaxed">{topic.structure}</code>
              </div>

              {/* Rules */}
              <div>
                <p className={`text-[11px] font-black uppercase tracking-widest mb-2 ${levelColor}`}>📋 Quy tắc</p>
                <div className="flex flex-col gap-1.5">
                  {topic.rules.map((rule, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 mt-0.5 bg-zinc-800 ${levelColor}`}>
                        {i + 1}
                      </span>
                      <span className="text-xs text-zinc-400 leading-relaxed">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Examples */}
              <div>
                <p className={`text-[11px] font-black uppercase tracking-widest mb-2 ${levelColor}`}>✏️ Ví dụ</p>
                <div className="flex flex-col gap-1.5">
                  {topic.examples.map((ex, i) => (
                    <div key={i} className={`bg-zinc-950/60 rounded-xl px-3 py-2.5 border-l-[3px] ${
                      levelBorder.startsWith("#") ? "" : ""
                    }`} style={{ borderLeftColor: levelBorder }}>
                      <p className="text-sm text-zinc-50 font-semibold mb-0.5">{ex.en}</p>
                      <p className="text-xs text-zinc-500">{ex.vn}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mistakes */}
              <div>
                <p className="text-[11px] font-black text-red-400 uppercase tracking-widest mb-2">❌ Lỗi Hay Gặp</p>
                <div className="flex flex-col gap-1">
                  {topic.mistakes.map((m, i) => (
                    <p key={i} className="text-xs text-zinc-400 leading-relaxed">{m}</p>
                  ))}
                </div>
              </div>

              {/* Tip */}
              <div className="flex gap-2 items-start bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-400 leading-relaxed">
                  <strong className="text-amber-400">Mẹo: </strong>{topic.tip}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
