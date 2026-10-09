"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  ChevronRight,
  Lightbulb,
  PlayCircle,
  Volume2,
} from "lucide-react";

import { recordPracticeAttempt } from "@/app/actions/review";
import type { ReviewQueueItem } from "@/app/actions/review";
import {
  answersMatch,
  blankTargetInSentence,
  tokenizeWords,
  wordAccuracy,
  type PracticeMode,
} from "@/lib/srs/practice";
import { useYouTubePlayer } from "@/lib/video/use-youtube-player";
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
        <p lang="en" className="text-lg leading-relaxed [overflow-wrap:anywhere]">
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

/** listen_fill / sentence_dictation — auto-graded from typed evidence. */
function AudioCard({ item, onDone, onError }: CardProps) {
  const [typed, setTyped] = useState("");
  const [hints, setHints] = useState(0);
  const [plays, setPlays] = useState(0);
  const [result, setResult] = useState<{ correct: boolean; accuracy: number | null } | null>(null);
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
    const accuracy = isDictation && sentence ? wordAccuracy(sentence, typed) : null;
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
        <p lang="vi" className="mt-3 text-sm leading-relaxed text-muted-foreground">
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
        <p lang="vi" className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {item.context.sentence_vi}
        </p>
      )}
      {item.kind !== "sentence" && item.meaning_vi && (
        <p lang="vi" className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {item.meaning_vi}
        </p>
      )}

      {flipped && (
        <div className="mt-6 border-t border-border pt-4" data-testid="answer">
          <p className="text-lg font-semibold text-primary" lang="en">
            {item.display}
          </p>
          {item.context && item.kind === "sentence" && (
            <p lang="en" className="mt-2 leading-relaxed [overflow-wrap:anywhere]">
              {item.context.sentence_text}
            </p>
          )}
          {item.meaning_vi && item.kind === "sentence" && (
            <p lang="vi" className="mt-2 text-sm text-muted-foreground">
              {item.meaning_vi}
            </p>
          )}
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

  if (finished) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-16 text-center">
        <BookOpenCheck className="h-10 w-10 text-primary" aria-hidden />
        <h1 className="text-xl font-bold">Hết hàng đợi</h1>
        <p className="text-sm text-muted-foreground">
          Bạn đã ôn {done} thẻ trong phiên này. Lịch ôn tiếp theo được FSRS sắp
          lại theo kết quả từng thẻ.
        </p>
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
