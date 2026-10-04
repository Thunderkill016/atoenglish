"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, Mic, MicOff, Sparkles, ChevronRight } from "lucide-react";
import { MinimalButton } from "@/components/design-system";
import LessonSectionHeader from "../lesson-ui/LessonSectionHeader";
import LessonContinueButton from "../lesson-ui/LessonContinueButton";
import { lessonSectionMotion } from "../lesson-ui/motion";
import { toast } from "sonner";
import { calcSpeechScore } from "@/lib/utils/speech";
import { SpeechRecognitionFallback } from "@/lib/utils/speech-fallback";
import { assessPronunciation } from "@/app/actions/phoneme";
import type { PhonemeError } from "@/app/actions/phoneme";
import type { UnitData } from "../UnitTemplate";

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal?: boolean;
    };
    length: number;
  };
  resultIndex?: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionObj {
  lang: string;
  interimResults: boolean;
  maxAlternatives?: number;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface ShadowingSectionProps {
  unit: UnitData;
  sectionOrderIdx: number;
  TOTAL_SECTIONS: number;
  shadowScores: Record<number, number>;
  setShadowScores: React.Dispatch<React.SetStateAction<Record<number, number>>>;
  shadowDone: boolean;
  setShadowDone: React.Dispatch<React.SetStateAction<boolean>>;
  playTTS: (text: string, rate?: number) => void;
  goNext: () => void;
}

// Helper: detect specific missing English final consonants (codas) commonly deleted by Vietnamese learners
function detectMissingCodas(expected: string, actual: string): string[] {
  const missingWarnings: string[] = [];
  const cleanExpected = expected.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
  const cleanActual = actual.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();

  const expectedWords = cleanExpected.split(/\s+/);
  const actualWords = cleanActual.split(/\s+/);

  expectedWords.forEach((word) => {
    // Check if the expected word ends in a target coda sound
    if (word.endsWith("k") || word.endsWith("t") || word.endsWith("s") || word.endsWith("d") || word.endsWith("ce") || word.endsWith("se")) {
      // Find matching word base in actual spoken phrase
      const baseWordWithoutCoda = word.replace(/(k|t|s|d|ce|se)$/, "");
      
      // If user pronounced the base but omitted the ending
      const foundOmission = actualWords.some(
        (aWord) => aWord === baseWordWithoutCoda && aWord !== word
      );

      if (foundOmission) {
        let soundExplanation = "";
        if (word.endsWith("k")) soundExplanation = "âm /k/ (ví dụ: 'like' -> 'lai-kờ')";
        else if (word.endsWith("t")) soundExplanation = "âm /t/ (ví dụ: 'cat' -> 'ca-tờ')";
        else if (word.endsWith("s") || word.endsWith("ce") || word.endsWith("se")) soundExplanation = "âm /s/ (ví dụ: 'face' -> 'fây-sờ')";
        else if (word.endsWith("d")) soundExplanation = "âm /d/ (ví dụ: 'red' -> 're-dờ')";

        missingWarnings.push(`Từ "${word}" phát âm thiếu ${soundExplanation}`);
      }
    }
  });

  return missingWarnings;
}

export default function ShadowingSection({
  unit,
  sectionOrderIdx,
  TOTAL_SECTIONS,
  shadowScores,
  setShadowScores,
  shadowDone,
  setShadowDone,
  playTTS,
  goNext,
}: ShadowingSectionProps) {
  const [shadowDialogueIdx, setShadowDialogueIdx] = useState(0);
  const [shadowLineIdx, setShadowLineIdx] = useState(0);
  const [shadowSpeed, setShadowSpeed] = useState(1.0);
  const [shadowTranscripts, setShadowTranscripts] = useState<Record<number, string>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionObj | null>(null);
  const DIALOGUES = unit.dialogues;

  // S4-3: Phoneme-level feedback state — per line index
  const [phonemeData, setPhonemeData] = useState<Record<number, PhonemeError[]>>({});
  const [phonemeLoading, setPhonemeLoading] = useState<Record<number, boolean>>({});

  // Shadowing average
  const shadowValues = Object.values(shadowScores);
  const shadowAvg = shadowValues.length > 0
    ? Math.round(shadowValues.reduce((a, b) => a + b, 0) / shadowValues.length)
    : 100;

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch { /* ignore */ }
      }
    };
  }, []);

  const getSpeechRecognition = () => {
    if (typeof window === "undefined") return null;
    const w = window as unknown as Record<string, unknown>;
    return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? SpeechRecognitionFallback) as unknown as new () => SpeechRecognitionObj;
  };

  const startRecognition = (onResult: (text: string) => void) => {
    const SpeechRecognitionAPI = getSpeechRecognition();
    if (!SpeechRecognitionAPI) {
      toast.error("Trình duyệt không hỗ trợ nhận diện giọng nói");
      return;
    }

    const rec = new SpeechRecognitionAPI();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[0][0].transcript;
      onResult(text);
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error !== "aborted") {
        toast.error(`Lỗi nhận diện: ${e.error}`);
      }
      setIsRecording(false);
      setIsRecognizing(false);
    };

    rec.onend = () => {
      setIsRecording(false);
      setIsRecognizing(false);
    };

    rec.onstart = () => setIsRecognizing(true);
    recognitionRef.current = rec;
    rec.start();
  };

  const handleShadowRecord = () => {
    if (DIALOGUES.length === 0) return;
    const targetLine = DIALOGUES[shadowDialogueIdx].lines[shadowLineIdx];
    setIsRecording(true);
    startRecognition((text) => {
      const score = calcSpeechScore(targetLine.text, text);
      const missingCodas = detectMissingCodas(targetLine.text, text);
      setShadowScores((p) => ({ ...p, [shadowLineIdx]: score }));
      setShadowTranscripts((p) => ({ ...p, [shadowLineIdx]: text }));
      setIsRecording(false);
      if (score >= 70) {
        if (missingCodas.length > 0) {
          toast.warning(`Tốt! ${score}%. Lưu ý: ${missingCodas[0]}`);
        } else {
          toast.success(`Tốt lắm! ${score}%`);
        }
      } else {
        if (missingCodas.length > 0) {
          toast.error(`Chưa đạt (${score}%). Lỗi: ${missingCodas.join(", ")}`);
        } else {
          toast.info(`${score}% — Không sao, thử lại nhé!`);
        }
      }
      // S4-3: Request AI phoneme breakdown (non-blocking)
      setPhonemeLoading(p => ({ ...p, [shadowLineIdx]: true }));
      assessPronunciation({ target: targetLine.text, spoken: text })
        .then(res => {
          if (res.success && res.result.phoneme_errors.length > 0) {
            setPhonemeData(p => ({ ...p, [shadowLineIdx]: res.result.phoneme_errors }));
          }
        })
        .catch(() => { /* silent */ })
        .finally(() => setPhonemeLoading(p => ({ ...p, [shadowLineIdx]: false })));
    });
  };

  const handleShadowNext = () => {
    if (DIALOGUES.length === 0) return;
    const lines = DIALOGUES[shadowDialogueIdx].lines;
    if (shadowLineIdx < lines.length - 1) {
      setShadowLineIdx((p) => p + 1);
    } else {
      setShadowDone(true);
    }
  };

  return (
    <motion.div
      key="s6"
      initial={lessonSectionMotion.initial}
      animate={lessonSectionMotion.animate}
      exit={lessonSectionMotion.exit}
      transition={lessonSectionMotion.transition}
    >
      <LessonSectionHeader
        sectionId={6}
        sectionOrderIdx={sectionOrderIdx}
        totalSections={TOTAL_SECTIONS}
      />

      {DIALOGUES.length > 0 && !shadowDone ? (
        <div className="border border-border/60 bg-card rounded-2xl p-4 sm:p-6 shadow-lg">
          {/* Dialogue selector tabs */}
          {DIALOGUES.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {DIALOGUES.map((dlg, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (idx === shadowDialogueIdx) return;
                    setShadowDialogueIdx(idx);
                    setShadowLineIdx(0);
                    setShadowScores({});
                    setShadowTranscripts({});
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 ${
                    idx === shadowDialogueIdx
                      ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-600"
                      : "bg-muted border-border/60 text-muted-foreground hover:border-primary/60 hover:text-foreground"
                  }`}
                >
                  Hội thoại {idx + 1}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-between text-xs text-muted-foreground mb-2 font-bold">
            <span>Tiến độ dòng hội thoại</span>
            <span>
              {shadowLineIdx + 1}/{DIALOGUES[shadowDialogueIdx].lines.length}
            </span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{
                width: `${
                  (shadowLineIdx / DIALOGUES[shadowDialogueIdx].lines.length) * 100
                }%`,
              }}
            />
          </div>

          <div className="border border-border/60 bg-muted/40 rounded-2xl p-5 mb-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/3 to-transparent pointer-events-none" />
            <span className="absolute top-3 left-3 text-xs font-bold text-violet-600 bg-violet-500/10 border border-violet-500/30 px-2 py-0.5 rounded-full uppercase tracking-wide">
              {DIALOGUES[shadowDialogueIdx].lines[shadowLineIdx].speaker}
            </span>
            <p className="text-muted-foreground text-xs mb-3 uppercase tracking-widest font-black">
              Hãy nghe rồi nói lại
            </p>
            <p className="text-foreground text-base sm:text-xl font-bold mb-2 leading-snug">
              {DIALOGUES[shadowDialogueIdx].lines[shadowLineIdx].text}
            </p>
            <p className="text-muted-foreground text-sm italic">
              {DIALOGUES[shadowDialogueIdx].lines[shadowLineIdx].translation}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() =>
                playTTS(DIALOGUES[shadowDialogueIdx].lines[shadowLineIdx].text, shadowSpeed)
              }
              aria-label="Nghe mẫu"
              className="w-14 h-14 rounded-full bg-muted/40 hover:bg-muted/60 hover:scale-105 text-foreground flex items-center justify-center transition-all duration-200 border border-border/60 shadow-md active:scale-95"
            >
              <Volume2 size={22} />
            </button>

            <button
              onClick={
                isRecording
                  ? () => {
                      recognitionRef.current?.stop();
                      setIsRecording(false);
                    }
                  : handleShadowRecord
              }
              disabled={isRecognizing && !isRecording}
              aria-label={isRecording ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-emerald-600 hover:bg-emerald-500 hover:scale-105 text-white shadow-lg shadow-emerald-950/50"
              }`}
            >
              {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
            </button>

            <button
              onClick={() => setShadowSpeed((s) => (s === 1.0 ? 0.75 : 1.0))}
              className="px-4 py-2 rounded-xl bg-muted border border-border/60 text-xs font-bold text-foreground hover:bg-muted/60 transition-colors"
            >
              {shadowSpeed === 1.0 ? "Normal Speed" : "🐢 Chậm (0.75x)"}
            </button>
          </div>

          {shadowTranscripts[shadowLineIdx] && (
            <div className="border border-border/60 bg-muted/40 rounded-2xl p-4 mb-6 text-center shadow-sm">
              <p className="text-xs text-muted-foreground mb-1 font-bold">BẠN VỪA NÓI:</p>
              <p className="text-foreground text-sm font-semibold mb-2">
                &ldquo;{shadowTranscripts[shadowLineIdx]}&rdquo;
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/10 mb-3">
                Độ chính xác: {shadowScores[shadowLineIdx]}%
              </div>
              {/* S4-3: Phoneme feedback cards */}
              {phonemeLoading[shadowLineIdx] ? (
                <div className="flex items-center justify-center gap-2 mt-2 text-violet-400">
                  <Sparkles size={12} className="animate-pulse" />
                  <span className="text-xs">AI đang phân tích phát âm...</span>
                </div>
              ) : phonemeData[shadowLineIdx]?.length ? (
                <div className="space-y-2 mt-3 text-left">
                  <p className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={10} /> Phân tích phát âm chi tiết
                  </p>
                  {phonemeData[shadowLineIdx].map((err, i) => (
                    <div key={i} className="bg-violet-500/10 border border-violet-500/30 rounded-xl px-3 py-2.5 text-left">
                      <p className="text-xs font-bold text-violet-700 mb-0.5">
                        Từ: <span className="text-white">&ldquo;{err.word}&rdquo;</span>
                        <span className="ml-2 text-violet-400 font-mono text-xs">{err.ipa_target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mb-0.5">{err.common_mistake_vn}</p>
                      <p className="text-xs text-amber-300">💡 {err.tip_vn}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {shadowScores[shadowLineIdx] !== undefined && (
            <MinimalButton
              type="button"
              fullWidth
              className="!rounded-xl"
              onClick={handleShadowNext}
            >
              {shadowLineIdx < DIALOGUES[shadowDialogueIdx].lines.length - 1
                ? "Dòng tiếp theo"
                : "Hoàn thành phần Shadowing"}
              <ChevronRight size={16} />
            </MinimalButton>
          )}
        </div>
      ) : (
        <div className="text-center mb-4 sm:mb-6 border border-border/60 bg-card rounded-2xl p-5 sm:p-8 shadow-md">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-emerald-400 font-bold text-lg mb-1">Hoàn thành Shadowing!</p>
          <p className="text-muted-foreground text-sm mb-6">Điểm trung bình: {shadowAvg}%</p>
          <LessonContinueButton onClick={goNext}>Tiếp tục luyện nói</LessonContinueButton>
        </div>
      )}
    </motion.div>
  );
}
