"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  ChevronRight,
  Lightbulb,
  Mic,
  MicOff,
  PenLine,
  PlayCircle,
  Volume2,
} from "lucide-react";

import {
  recordPracticeAttempt,
  requestReuseFeedback,
} from "@/app/actions/review";
import type { ReviewQueueItem } from "@/app/actions/review";
import {
  answersMatch,
  blankTargetInSentence,
  inOrderMatchRatio,
  tokenizeWords,
  wordAccuracy,
  type PracticeMode,
} from "@/lib/srs/practice";
import { useYouTubePlayer } from "@/lib/video/use-youtube-player";
import { getNativeSpeechRecognitionConstructor } from "@/lib/utils/native-speech-recognition";
import { EmptyState } from "@/components/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Review session (SPEC 005 §8): one card at a time — cue on the front, answer
 * + rating on the back. Self-rated modes (`recall`, `sentence_meaning`) flip
 * then take a 1–4 rating; audio modes (`listen_fill`, `sentence_dictation`)
 * replay the source segment through the embedded YouTube player and submit
 * typed evidence for server-side auto-grading. Every rep posts one
 * practice_attempts row; graded modes also move FSRS.
 */

const RATINGS = [
  { value: 1, label: "Quên", hint: "không nhớ" },
  { value: 2, label: "Khó", hint: "nhớ một phần" },
  { value: 3, label: "Nhớ", hint: "nhớ được" },
  { value: 4, label: "Dễ", hint: "nhớ ngay" },
] as const;

const KIND_LABEL: Record<ReviewQueueItem["kind"], string> = {
  word: "Từ",
  phrase: "Cụm từ",
  sentence: "Câu",
};

const MODE_LABEL: Record<PracticeMode, string> = {
  recall: "Nhớ lại từ",
  sentence_meaning: "Nhớ lại câu",
  listen_fill: "Nghe điền từ",
  sentence_dictation: "Nghe chép câu",
  speak_repeat: "Nói lại",
  write_reuse: "Viết lại",
};

const AUDIO_MODES: ReadonlySet<PracticeMode> = new Set([
  "listen_fill",
  "sentence_dictation",
]);

function CueSentence({ item }: { item: ReviewQueueItem }) {
  const text = item.context?.sentence_text;
  if (!text) return null;
  // recall/listen_fill blank: hide the saved word/phrase inside its sentence.
  if (item.kind !== "sentence") {
    const blank = blankTargetInSentence(text, item.display);
    if (blank) {
      return (
        <p
          lang="en"
          className="text-lg leading-relaxed [overflow-wrap:anywhere]"
        >
          {blank.before}
          <span
            aria-label={`Chỗ trống cho “${item.display}”`}
            className="mx-1 inline-block min-w-16 rounded border-b-2 border-primary px-1 text-primary"
          >
            {" ".repeat(Math.max(2, Math.min(item.display.length, 24)))}
          </span>
          {blank.after}
        </p>
      );
    }
  }
  return (
    <p lang="en" className="text-lg leading-relaxed [overflow-wrap:anywhere]">
      {text}
    </p>
  );
}

/**
 * Plays just the card's source segment: seeks to start_ms on each press and
 * auto-pauses when the polled clock reaches end_ms. The iframe stays mounted
 * small-but-visible — playback only ever goes through the official API.
 */
function SegmentAudio({
  videoId,
  startMs,
  endMs,
  onPlay,
}: {
  videoId: string;
  startMs: number;
  endMs: number | null;
  onPlay: () => void;
}) {
  const player = useYouTubePlayer(videoId, startMs);
  const {
    containerRef,
    loadError,
    nowMs,
    pause,
    play,
    playing,
    ready,
    seekToMs,
  } = player;

  useEffect(() => {
    if (endMs != null && playing && nowMs >= endMs) pause();
  }, [pause, nowMs, playing, endMs]);

  return (
    <div>
      <div
        ref={containerRef}
        className="aspect-video w-full max-w-sm overflow-hidden rounded-xl bg-black"
      />
      {loadError ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          Không tải được trình phát video.
        </p>
      ) : (
        <button
          type="button"
          onClick={() => {
            seekToMs(startMs);
            play();
            onPlay();
          }}
          disabled={!ready}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "mt-3 min-h-11 gap-2",
          )}
        >
          <Volume2 className="h-4 w-4" aria-hidden />
          {playing ? "Đang phát…" : "Nghe đoạn này"}
        </button>
      )}
    </div>
  );
}

interface CardProps {
  item: ReviewQueueItem;
  onDone: () => void;
  onError: () => void;
}

/**
 * speak_repeat (spec §8 — evidence only, never touches FSRS): the learner
 * repeats the source sentence aloud; the browser transcript is compared
 * word-by-word. The number is labeled "độ khớp nhận dạng" — speech
 * recognition agreement, never a pronunciation score.
 */
function SpeakRepeat({ item }: { item: ReviewQueueItem }) {
  const [state, setState] = useState<
    | { phase: "idle" }
    | { phase: "listening" }
    | { phase: "done"; transcript: string; similarity: number }
    | { phase: "failed"; reason: "unsupported" | "error" }
  >({ phase: "idle" });
  const [logging, setLogging] = useState(false);
  const logged = useRef(false);

  const target = item.context?.sentence_text ?? item.display;
  const speechWindow =
    typeof window === "undefined"
      ? null
      : (window as unknown as Record<string, unknown>);
  const supported = getNativeSpeechRecognitionConstructor(speechWindow) != null;

  const begin = () => {
    const Ctor =
      getNativeSpeechRecognitionConstructor<SpeechRecognition>(speechWindow);
    if (!Ctor) {
      setState({ phase: "failed", reason: "unsupported" });
      return;
    }
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setState({ phase: "listening" });
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() ?? "";
      if (!transcript) {
        setState({ phase: "failed", reason: "error" });
        return;
      }
      // Spec §8: "độ khớp nhận dạng có nhãn như mục 7" — same one-way
      // in-order subsequence as shadowing, never edit distance.
      const similarity = inOrderMatchRatio(target, transcript);
      setState({ phase: "done", transcript, similarity });
      // Log once per card view — the attempt is evidence, not a schedule.
      if (logged.current) return;
      logged.current = true;
      setLogging(true);
      void recordPracticeAttempt({
        card_id: item.card_id,
        mode: "speak_repeat",
        similarity,
        learner_text: transcript,
      }).finally(() => setLogging(false));
    };
    recognition.onerror = () => setState({ phase: "failed", reason: "error" });
    recognition.onnomatch = () =>
      setState({ phase: "failed", reason: "error" });
    recognition.start();
  };

  return (
    <div
      className="mt-4 border-t border-border pt-3"
      data-testid="speak-repeat"
    >
      {state.phase === "idle" && (
        <button
          type="button"
          onClick={begin}
          disabled={!supported}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "min-h-11 gap-2",
          )}
        >
          {supported ? (
            <Mic className="h-4 w-4" aria-hidden />
          ) : (
            <MicOff className="h-4 w-4" aria-hidden />
          )}
          Nói lại câu này
        </button>
      )}
      {state.phase === "listening" && (
        <p className="text-sm text-muted-foreground">Đang nghe… nói câu gốc.</p>
      )}
      {state.phase === "done" && (
        <div className="text-sm">
          <p lang="en" className="[overflow-wrap:anywhere]">
            Bạn nói: {state.transcript}
          </p>
          <p className="mt-1 text-muted-foreground">
            Độ khớp nhận dạng: {Math.round(state.similarity * 100)}%
            {logging ? " · đang lưu…" : ""}
          </p>
        </div>
      )}
      {state.phase === "failed" && (
        <p className="text-sm text-muted-foreground">
          {state.reason === "unsupported"
            ? "Trình duyệt này không hỗ trợ nhận dạng giọng nói."
            : "Không nghe rõ — thử lại."}
        </p>
      )}
    </div>
  );
}

/**
 * write_reuse (spec §8): once per session, word/phrase cards only — the
 * learner writes a fresh sentence using the saved item; Gemini feedback is
 * labeled AI and the attempt logs as evidence, never reschedules.
 */
function WriteReuse({
  item,
  onDone,
}: {
  item: ReviewQueueItem;
  onDone: () => void;
}) {
  const [sentence, setSentence] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (pending || !sentence.trim()) return;
    startTransition(async () => {
      // Evidence log first — a feedback outage must not lose the rep.
      const attempt = await recordPracticeAttempt({
        card_id: item.card_id,
        mode: "write_reuse",
        learner_text: sentence.trim(),
      });
      if (!attempt.ok) {
        setNote("Chưa lưu được lượt viết. Thử lại.");
        return;
      }
      const ai = await requestReuseFeedback({
        target: item.display,
        sentence: sentence.trim(),
        attempt_id: attempt.attempt_id,
      });
      setFeedback(ai.ok ? ai.feedback : null);
      setNote(ai.ok ? null : "Câu đã lưu — phản hồi AI hiện không có.");
    });
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 text-left">
      <p className="text-sm font-medium">
        Viết một câu mới dùng{" "}
        <span lang="en" className="font-semibold text-primary">
          {item.display}
        </span>
      </p>
      {!feedback && !note?.startsWith("Câu đã lưu") ? (
        <>
          <textarea
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            lang="en"
            rows={3}
            placeholder="Ví dụ: She showed great resilience after the failure."
            className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          {note && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              {note}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={pending || !sentence.trim()}
              className={cn(buttonVariants(), "min-h-11 flex-1")}
            >
              Gửi câu
            </button>
            <button
              type="button"
              onClick={onDone}
              className={cn(buttonVariants({ variant: "outline" }), "min-h-11")}
            >
              Bỏ qua
            </button>
          </div>
        </>
      ) : (
        <>
          <p lang="en" className="mt-3 [overflow-wrap:anywhere]">
            {sentence}
          </p>
          {feedback && (
            <p
              lang="vi"
              className="mt-3 rounded-lg bg-muted p-3 text-sm leading-relaxed"
            >
              {feedback}
              <span className="mt-1 block text-[10px] uppercase tracking-wide text-muted-foreground">
                Phản hồi AI
              </span>
            </p>
          )}
          {note && !feedback && (
            <p className="mt-2 text-sm text-muted-foreground">{note}</p>
          )}
          <button
            type="button"
            onClick={onDone}
            className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}
          >
            Xong
          </button>
        </>
      )}
    </div>
  );
}

/** listen_fill / sentence_dictation — auto-graded from typed evidence. */
function AudioCard({ item, onDone, onError }: CardProps) {
  const [typed, setTyped] = useState("");
  const [hints, setHints] = useState(0);
  const [plays, setPlays] = useState(0);
  const [result, setResult] = useState<{
    correct: boolean;
    accuracy: number | null;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  const context = item.context;
  const videoId = context?.video_id ?? null;
  const startMs = context?.start_ms ?? 0;
  const isDictation = item.mode === "sentence_dictation";
  const sentence = isDictation ? context?.sentence_text : null;

  // Dictation scaffold: each hint press unlocks one more leading letter per
  // word ("gợi ý mở chữ cái đầu" — spec §8). Level 0 still shows word count.
  const scaffold = useMemo(() => {
    if (!isDictation || !sentence) return null;
    return tokenizeWords(sentence)
      .map((w) => w.slice(0, hints) + "·".repeat(Math.max(0, w.length - hints)))
      .join(" ");
  }, [isDictation, sentence, hints]);

  const submit = () => {
    if (pending || result) return;
    const correct = isDictation ? null : answersMatch(typed, item.display);
    const accuracy =
      isDictation && sentence ? wordAccuracy(sentence, typed) : null;
    startTransition(async () => {
      const outcome = await recordPracticeAttempt({
        card_id: item.card_id,
        mode: item.mode,
        correct: correct ?? undefined,
        word_accuracy: accuracy ?? undefined,
        hints_used: hints,
        plays,
        learner_text: typed,
      });
      if (!outcome.ok) {
        onError();
        return;
      }
      setResult({ correct: correct ?? (accuracy ?? 0) >= 0.9, accuracy });
    });
  };

  return (
    <>
      {item.kind !== "sentence" && <CueSentence item={item} />}
      {isDictation && context?.sentence_vi && (
        <p lang="vi" className="text-sm leading-relaxed text-muted-foreground">
          {context.sentence_vi}
        </p>
      )}
      {!isDictation && item.meaning_vi && (
        <p
          lang="vi"
          className="mt-3 text-sm leading-relaxed text-muted-foreground"
        >
          {item.meaning_vi}
        </p>
      )}

      <div className="mt-4">
        {videoId ? (
          <SegmentAudio
            videoId={videoId}
            startMs={startMs}
            endMs={context?.end_ms ?? null}
            onPlay={() => setPlays((n) => n + 1)}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Thẻ này không còn đoạn video nguồn — trả lời theo trí nhớ.
          </p>
        )}
      </div>

      {scaffold && (
        <p className="mt-3 font-mono text-sm tracking-wider text-muted-foreground">
          {scaffold}
        </p>
      )}

      {!result ? (
        <div className="mt-4">
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder={
              isDictation ? "Gõ lại cả câu bạn nghe được…" : "Gõ từ còn thiếu…"
            }
            lang="en"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="mt-3 flex gap-2">
            {isDictation && (
              <button
                type="button"
                onClick={() => setHints((n) => n + 1)}
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "min-h-11 gap-2",
                )}
              >
                <Lightbulb className="h-4 w-4" aria-hidden />
                Gợi ý ({hints})
              </button>
            )}
            <button
              type="button"
              onClick={submit}
              disabled={pending || !typed.trim()}
              className={cn(buttonVariants(), "min-h-11 flex-1")}
            >
              Kiểm tra
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 border-t border-border pt-4" data-testid="answer">
          <p
            className={cn(
              "text-sm font-medium",
              result.correct ? "text-primary" : "text-destructive",
            )}
          >
            {result.correct
              ? "Chính xác!"
              : isDictation && result.accuracy != null
                ? `Đúng ${Math.round(result.accuracy * 100)}%`
                : "Chưa đúng."}
          </p>
          <p lang="en" className="mt-2 text-lg font-semibold text-primary">
            {isDictation ? sentence : item.display}
          </p>
          {isDictation && (
            <p lang="en" className="mt-1 text-sm text-muted-foreground">
              Bạn gõ: {typed}
            </p>
          )}
          <SpeakRepeat item={item} />
          <button
            type="button"
            onClick={onDone}
            className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full")}
          >
            Tiếp
          </button>
        </div>
      )}
    </>
  );
}

/** recall / sentence_meaning — flip, then self-rate. */
function SelfRatedCard({ item, onDone, onError }: CardProps) {
  const [flipped, setFlipped] = useState(false);
  const [pending, startTransition] = useTransition();

  const rate = (rating: number) => {
    if (pending) return;
    startTransition(async () => {
      const outcome = await recordPracticeAttempt({
        card_id: item.card_id,
        mode: item.mode,
        rating,
      });
      if (!outcome.ok) {
        onError();
        return;
      }
      onDone();
    });
  };

  return (
    <>
      {item.context && <CueSentence item={item} />}
      {!item.context && (
        <p lang="en" className="text-lg font-medium">
          {item.display}
        </p>
      )}

      {item.mode === "sentence_meaning" && item.context?.sentence_vi && (
        <p
          lang="vi"
          className="mt-3 text-sm leading-relaxed text-muted-foreground"
        >
          {item.context.sentence_vi}
        </p>
      )}
      {item.kind !== "sentence" && item.meaning_vi && (
        <p
          lang="vi"
          className="mt-3 text-sm leading-relaxed text-muted-foreground"
        >
          {item.meaning_vi}
        </p>
      )}

      {flipped && (
        <div className="mt-6 border-t border-border pt-4" data-testid="answer">
          <p className="text-lg font-semibold text-primary" lang="en">
            {item.display}
          </p>
          {item.context && item.kind === "sentence" && (
            <p
              lang="en"
              className="mt-2 leading-relaxed [overflow-wrap:anywhere]"
            >
              {item.context.sentence_text}
            </p>
          )}
          {item.meaning_vi && item.kind === "sentence" && (
            <p lang="vi" className="mt-2 text-sm text-muted-foreground">
              {item.meaning_vi}
            </p>
          )}
          <SpeakRepeat item={item} />
        </div>
      )}

      <div className="mt-6">
        {!flipped ? (
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            Lật thẻ
          </button>
        ) : (
          <div
            className="grid grid-cols-4 gap-2"
            role="group"
            aria-label="Tự chấm mức nhớ"
          >
            {RATINGS.map((r) => (
              <button
                key={r.value}
                type="button"
                data-rating={r.value}
                disabled={pending}
                onClick={() => rate(r.value)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "flex-col gap-0.5",
                )}
              >
                <span>{r.label}</span>
                <span className="text-[10px] font-normal text-muted-foreground">
                  {r.hint}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function ReviewSession({ items }: { items: ReviewQueueItem[] }) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0);
  const [failed, setFailed] = useState(false);
  // write_reuse: "cuối phiên, tối đa một lượt" — one offer after the queue,
  // on the first word/phrase card reviewed.
  const [reuseStep, setReuseStep] = useState<"offered" | "done">("offered");

  const item = items[index];
  const finished = index >= items.length;

  const advance = useCallback(() => {
    setDone((n) => n + 1);
    setIndex((i) => i + 1);
    setFailed(false);
  }, []);
  const fail = useCallback(() => setFailed(true), []);

  const deepLink = useMemo(() => {
    if (!item?.context?.video_id || item.context.start_ms == null) return null;
    return `/watch/${item.context.video_id}?t=${item.context.start_ms}`;
  }, [item]);

  if (!items.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={BookOpenCheck}
          title="Chưa có thẻ nào đến hạn"
          body="Lưu từ hoặc câu từ video đang xem — chúng sẽ xuất hiện ở đây để ôn lại."
          action={{ label: "Khám phá video", href: "/discover" }}
        />
      </div>
    );
  }

  const reuseCard = items.find((i) => i.kind !== "sentence");

  if (finished) {
    const showReuse = reuseStep === "offered" && reuseCard;
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-16 text-center">
        <BookOpenCheck className="h-10 w-10 text-primary" aria-hidden />
        <h1 className="text-xl font-bold">Hết hàng đợi</h1>
        <p className="text-sm text-muted-foreground">
          Bạn đã ôn {done} thẻ trong phiên này. Lịch ôn tiếp theo được FSRS sắp
          lại theo kết quả từng thẻ.
        </p>
        {showReuse && (
          <WriteReuse item={reuseCard} onDone={() => setReuseStep("done")} />
        )}
        <Link href="/discover" className={cn(buttonVariants(), "mt-2")}>
          Xem video tiếp
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    );
  }

  const audioMode = AUDIO_MODES.has(item.mode) && item.context?.video_id;

  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-xl flex-col px-4 py-8">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {index + 1} / {items.length} · {KIND_LABEL[item.kind]} ·{" "}
          {MODE_LABEL[item.mode]}
        </span>
        {deepLink && (
          <Link
            href={deepLink}
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 hover:bg-muted"
          >
            <PlayCircle className="h-4 w-4" aria-hidden />
            Xem đoạn gốc
          </Link>
        )}
      </div>

      <div className="mt-6 flex-1 rounded-2xl border border-border bg-card p-6">
        {audioMode ? (
          <AudioCard
            key={item.card_id}
            item={item}
            onDone={advance}
            onError={fail}
          />
        ) : (
          <SelfRatedCard
            key={item.card_id}
            item={item}
            onDone={advance}
            onError={fail}
          />
        )}
      </div>

      {failed && (
        <p role="alert" className="mt-3 text-center text-sm text-destructive">
          Chưa ghi được lượt ôn. Thử lại.
        </p>
      )}
    </div>
  );
}
