"use client";

/**
 * "Luyện" — sentence-level practice on the same clip (spec §7). Replaces the
 * caption block while active; all audio goes through the official YouTube
 * iframe via the shared SentencePlayer (bounded `replay`).
 *
 * - dictation: hear the sentence, type it back, per-word đúng/sai/thiếu.
 * - shadowing: hear, then repeat — Web Speech transcript vs in-order
 *   subsequence match (§7 explicitly says NOT Levenshtein).
 * - speak_first: caption visible, speak before hearing the original.
 *
 * Shadowing/speak_first hide entirely without native SpeechRecognition.
 * Attempts log card-less (video_id + sentence_index anchor); FSRS is never
 * touched for practice on unsaved sentences.
 */

import {
  BookmarkPlus,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Turtle,
  Volume2,
  X,
} from "lucide-react";
import { useMemo, useRef, useState, useTransition } from "react";

import { recordPracticeAttempt } from "@/app/actions/review";
import { buttonVariants } from "@/components/ui/button";
import {
  alignWords,
  inOrderMatchRatio,
  tokenizeWords,
  wordAccuracy,
  type WordOp,
} from "@/lib/srs/practice";
import { cn } from "@/lib/utils";
import { getNativeSpeechRecognitionConstructor } from "@/lib/utils/native-speech-recognition";
import type { Sentence } from "@/lib/video/types";

/** The player's "slow" tier — YouTube's standard rate ladder has 0.75. */
const SLOW_RATE = 0.75;

type PracticeMode = "dictation" | "shadowing" | "speak_first";

export interface PracticePanelProps {
  videoId: string;
  sentence: Sentence;
  /** 0-based position inside the playable list + its size, for "Câu i/n". */
  index: number;
  total: number;
  /** Neighbouring sentence start times for nav — null at the list ends. */
  prevStartMs: number | null;
  nextStartMs: number | null;
  loggedIn: boolean;
  ready: boolean;
  playing: boolean;
  rate: number;
  /** Bounded replay of the active segment — pauses at sentence end. */
  onPlaySentence: () => void;
  /** Move the playhead without starting playback (controller.seek + pause). */
  onNavigate: (ms: number) => void;
  onRate: (rate: number) => void;
  /** The parent's saveStudyItem path, already bound to this sentence. */
  onSaveSentence: () => void;
  saved: boolean;
  onExit: () => void;
}

export function PracticePanel(props: PracticePanelProps) {
  const { sentence, loggedIn } = props;
  const [mode, setMode] = useState<PracticeMode>("dictation");
  const speechSupported =
    getNativeSpeechRecognitionConstructor(
      typeof window === "undefined"
        ? null
        : (window as unknown as Record<string, unknown>),
    ) != null;

  return (
    <div className="w-full max-w-2xl text-left" data-testid="practice-panel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          className="flex items-center gap-1 rounded-full bg-elevated p-1"
          role="tablist"
          aria-label="Kiểu luyện"
        >
          <ModeTab
            label="Chép chính tả"
            active={mode === "dictation"}
            onSelect={() => setMode("dictation")}
          />
          {speechSupported && (
            <>
              <ModeTab
                label="Shadowing"
                active={mode === "shadowing"}
                onSelect={() => setMode("shadowing")}
              />
              <ModeTab
                label="Nói trước"
                active={mode === "speak_first"}
                onSelect={() => setMode("speak_first")}
              />
            </>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <button
            type="button"
            onClick={props.onExit}
            aria-label="Thoát luyện tập"
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X aria-hidden className="size-4" />
            Thoát
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <NavButton
          direction="prev"
          disabled={props.index <= 0}
          onNavigate={() => props.onNavigate(props.prevStartMs!)}
        />
        <span className="text-xs text-muted-foreground">
          Câu {props.index + 1}/{props.total}
        </span>
        <NavButton
          direction="next"
          disabled={props.index >= props.total - 1}
          onNavigate={() => props.onNavigate(props.nextStartMs!)}
        />
      </div>

      {mode === "dictation" ? (
        <Dictation {...props} />
      ) : (
        <Shadowing {...props} speakFirst={mode === "speak_first"} key={mode} />
      )}
      {!loggedIn && (
        <p className="mt-3 text-xs text-muted-foreground">
          Đăng nhập để ghi nhận luyện tập và lưu câu.
        </p>
      )}
    </div>
  );
}

function ModeTab({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onSelect}
      className={cn(
        "min-h-11 rounded-full px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring",
        active
          ? "bg-surface font-medium text-foreground"
          : "text-muted-foreground",
      )}
    >
      {label}
    </button>
  );
}

function NavButton({
  direction,
  disabled,
  onNavigate,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onNavigate: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onNavigate}
      disabled={disabled}
      aria-label={direction === "prev" ? "Câu trước" : "Câu tiếp"}
      className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm text-muted-foreground hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-40"
    >
      {direction === "prev" && <Icon aria-hidden className="size-4" />}
      {direction === "prev" ? "Câu trước" : "Câu tiếp"}
      {direction === "next" && <Icon aria-hidden className="size-4" />}
    </button>
  );
}

/** Shared controls: play the sentence segment + slow-rate toggle + counters. */
function PlayControls({
  ready,
  playing,
  rate,
  plays,
  onPlay,
  onRate,
}: {
  ready: boolean;
  playing: boolean;
  rate: number;
  plays: number;
  onPlay: () => void;
  onRate: (rate: number) => void;
}) {
  const slow = rate === SLOW_RATE;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onPlay}
        disabled={!ready}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "min-h-11 gap-2",
        )}
      >
        <Volume2 className="size-4" aria-hidden />
        {playing ? "Đang phát…" : plays > 0 ? "Nghe lại" : "Nghe câu"}
      </button>
      <button
        type="button"
        onClick={() => onRate(slow ? 1 : SLOW_RATE)}
        disabled={!ready}
        aria-pressed={slow}
        aria-label="Phát chậm"
        className={cn(
          "inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-sm focus-visible:outline-2 focus-visible:outline-ring",
          slow
            ? "bg-foreground/10 text-foreground"
            : "text-muted-foreground hover:bg-foreground/5",
        )}
      >
        <Turtle aria-hidden className="size-4" />
        Chậm
      </button>
      {plays > 0 && (
        <span className="text-xs text-muted-foreground">
          đã nghe {plays} lần
        </span>
      )}
    </div>
  );
}

function Dictation(props: PracticePanelProps) {
  const { sentence, videoId, loggedIn, onSaveSentence, saved } = props;
  const [typed, setTyped] = useState("");
  const [hints, setHints] = useState(0);
  const [plays, setPlays] = useState(0);
  const [result, setResult] = useState<{
    ops: WordOp[];
    accuracy: number;
  } | null>(null);
  const [logFailed, setLogFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  const listen = () => {
    setPlays((p) => p + 1);
    props.onPlaySentence();
  };

  // First-letter hint scaffold — same shape as review AudioCard (spec §7
  // "gợi ý mở chữ cái đầu"): each press reveals one more leading letter.
  const scaffold = useMemo(
    () =>
      tokenizeWords(sentence.text)
        .map(
          (w) => w.slice(0, hints) + "·".repeat(Math.max(0, w.length - hints)),
        )
        .join(" "),
    [sentence.text, hints],
  );

  const submit = () => {
    if (pending || result || !typed.trim()) return;
    const accuracy = wordAccuracy(sentence.text, typed);
    const ops = alignWords(sentence.text, typed);
    setResult({ ops, accuracy });
    if (!loggedIn) return;
    startTransition(async () => {
      const outcome = await recordPracticeAttempt({
        video_id: videoId,
        sentence_index: sentence.i,
        mode: "sentence_dictation",
        word_accuracy: accuracy,
        hints_used: hints,
        plays,
        learner_text: typed,
      });
      if (!outcome.ok) setLogFailed(true);
    });
  };

  return (
    <div className="mt-3">
      <PlayControls
        ready={props.ready}
        playing={props.playing}
        rate={props.rate}
        plays={plays}
        onPlay={listen}
        onRate={props.onRate}
      />

      {sentence.vi && (
        <p lang="vi" className="mt-3 text-sm text-muted-foreground">
          {sentence.vi}
        </p>
      )}

      {!result ? (
        <>
          {hints > 0 && (
            <p
              lang="en"
              className="mt-3 font-mono text-sm tracking-wide text-muted-foreground"
              data-testid="dictation-scaffold"
            >
              {scaffold}
            </p>
          )}
          <textarea
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Gõ lại câu bạn nghe được…"
            lang="en"
            rows={3}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            className="mt-3 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setHints((h) => h + 1)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "min-h-11",
              )}
            >
              Gợi ý{hints > 0 ? ` (${hints})` : ""}
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={pending || !typed.trim()}
              className={cn(buttonVariants({ size: "sm" }), "min-h-11")}
            >
              Kiểm tra
            </button>
          </div>
        </>
      ) : (
        <div className="mt-3" data-testid="dictation-result">
          <p lang="en" className="text-base leading-relaxed">
            {result.ops.map((op, k) => (
              <span
                key={k}
                className={cn(
                  op.status === "correct" && "text-foreground",
                  op.status === "wrong" &&
                    "rounded bg-state-learning/25 px-0.5 text-foreground",
                  op.status === "missing" &&
                    "rounded bg-destructive/15 px-0.5 text-destructive",
                  op.status === "extra" && "text-muted-foreground line-through",
                )}
                title={
                  op.status === "wrong"
                    ? `Bạn gõ: ${op.typed}`
                    : op.status === "missing"
                      ? "Thiếu từ này"
                      : op.status === "extra"
                        ? "Từ bạn gõ thêm"
                        : undefined
                }
              >
                {op.word}{" "}
              </span>
            ))}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Độ chính xác: {Math.round(result.accuracy * 100)}%
            {hints > 0 ? ` · ${hints} gợi ý` : ""} · nghe {plays} lần
          </p>
          {logFailed && (
            <p className="mt-1 text-xs text-destructive">
              Chưa ghi nhận được lượt luyện — kết quả vẫn hiển thị ở đây.
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {loggedIn && !saved && (
              <button
                type="button"
                onClick={onSaveSentence}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "min-h-11 gap-2",
                )}
              >
                <BookmarkPlus className="size-4" aria-hidden />
                Lưu câu này để ôn
              </button>
            )}
            {saved && (
              <span className="inline-flex items-center gap-1 text-sm text-primary">
                <BookmarkPlus className="size-4" aria-hidden />
                Đã lưu
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type SpeechState =
  | { phase: "idle" }
  | { phase: "listening" }
  | { phase: "done"; transcript: string; similarity: number }
  | { phase: "failed"; reason: "unsupported" | "error" };

function Shadowing(props: PracticePanelProps & { speakFirst: boolean }) {
  const { sentence, videoId, loggedIn, speakFirst } = props;
  const [plays, setPlays] = useState(0);
  const [speech, setSpeech] = useState<SpeechState>({ phase: "idle" });
  const logged = useRef(false);
  const [pending, startTransition] = useTransition();

  const listen = () => {
    setPlays((p) => p + 1);
    props.onPlaySentence();
  };

  const begin = () => {
    const Ctor = getNativeSpeechRecognitionConstructor<SpeechRecognition>(
      window as unknown as Record<string, unknown>,
    );
    if (!Ctor) {
      setSpeech({ phase: "failed", reason: "unsupported" });
      return;
    }
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setSpeech({ phase: "listening" });
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      if (!transcript) {
        setSpeech({ phase: "failed", reason: "error" });
        return;
      }
      // Spec §7: one-way in-order subsequence, never Levenshtein.
      const similarity = inOrderMatchRatio(sentence.text, transcript);
      setSpeech({ phase: "done", transcript, similarity });
      if (logged.current || !loggedIn) return;
      logged.current = true;
      startTransition(async () => {
        await recordPracticeAttempt({
          video_id: videoId,
          sentence_index: sentence.i,
          mode: "speak_repeat",
          similarity,
          learner_text: transcript,
          plays,
        });
      });
    };
    recognition.onerror = () => setSpeech({ phase: "failed", reason: "error" });
    recognition.onnomatch = () =>
      setSpeech({ phase: "failed", reason: "error" });
    recognition.start();
  };

  return (
    <div className="mt-3">
      <PlayControls
        ready={props.ready}
        playing={props.playing}
        rate={props.rate}
        plays={plays}
        onPlay={listen}
        onRate={props.onRate}
      />

      {/* speak_first keeps the caption visible up front; shadowing hides the
          target until after the attempt so the ear does the work first. */}
      {speakFirst && (
        <p lang="en" className="mt-3 text-balance text-base text-foreground">
          {sentence.text}
        </p>
      )}

      <div className="mt-3">
        {speech.phase === "idle" && (
          <button
            type="button"
            onClick={begin}
            disabled={pending}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "min-h-11 gap-2",
            )}
          >
            <Mic className="size-4" aria-hidden />
            {speakFirst ? "Nói câu này trước" : "Nói theo"}
          </button>
        )}
        {speech.phase === "listening" && (
          <p className="text-sm text-muted-foreground">
            Đang nghe… nói câu gốc.
          </p>
        )}
        {speech.phase === "done" && (
          <div data-testid="speech-result">
            <p lang="en" className="text-sm [overflow-wrap:anywhere]">
              Bạn nói: {speech.transcript}
            </p>
            {!speakFirst && (
              <p
                lang="en"
                className="mt-2 text-balance text-base text-foreground"
              >
                {sentence.text}
              </p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">
              Độ khớp nhận dạng: {Math.round(speech.similarity * 100)}% — không
              phải điểm phát âm
            </p>
            <button
              type="button"
              onClick={begin}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-2 min-h-11 gap-2",
              )}
            >
              <Mic className="size-4" aria-hidden />
              Nói lại
            </button>
          </div>
        )}
        {speech.phase === "failed" && (
          <div>
            <p className="text-sm text-muted-foreground">
              {speech.reason === "unsupported"
                ? "Trình duyệt này không hỗ trợ nhận dạng giọng nói."
                : "Không nghe rõ — thử lại."}
            </p>
            {speech.reason === "error" && (
              <button
                type="button"
                onClick={begin}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "mt-2 min-h-11 gap-2",
                )}
              >
                <MicOff className="size-4" aria-hidden />
                Thử lại
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
