"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bookmark,
  BookOpenText,
  Languages,
  Loader2,
  SquarePen,
} from "lucide-react";

import {
  DictionaryContent,
  DictionaryPanel,
} from "@/components/dictionary-panel";
import {
  SentenceText,
  type PhraseStart,
} from "@/components/sentence-text";
import { normalizeWord } from "@/lib/read/tokenize";
import {
  getSavedWordStates,
  saveStudyItem,
  saveTextSource,
} from "@/app/actions/study";
import { cn } from "@/lib/utils";
import type { Sentence } from "@/lib/video/types";

/**
 * `/read` client (SPEC §5.4 "dán văn bản → đọc, tra, dịch câu, lưu cùng cơ
 * chế với /watch"):
 * - Paste English text → `Intl.Segmenter` splits it into sentences.
 * - Word/phrase lookup and saved-word highlighting reuse the exact
 *   watch-page machinery (`SentenceText` + `DictionaryPanel`).
 * - "Dịch" translates one sentence at a time through `/api/translate`.
 * - "Lưu câu" and the panel's save button anchor contexts to a `kind:'text'`
 *   content_sources row created lazily on the first save.
 */

const MAX_TEXT_CHARS = 40_000; // Matches saveTextSource's intake bound.
const KEY_MAX = 200;
const DISPLAY_MAX = 300;

const TRANSLATE_ERRORS: Record<string, string> = {
  unauthorized: "Đăng nhập để dùng bộ dịch này.",
  ai_unavailable: "Bộ dịch chưa được bật.",
  rate_limited: "Bạn dịch quá nhanh. Đợi một phút rồi thử lại.",
  timeout: "Dịch phản hồi quá lâu. Thử lại.",
};
const TRANSLATE_FALLBACK = "Chưa dịch được câu này. Thử lại sau.";

/** Sentence segmentation — `Intl.Segmenter` with a punctuation fallback. */
export function splitSentences(text: string): Sentence[] {
  const segmenter =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? new Intl.Segmenter("en", { granularity: "sentence" })
      : null;
  const parts = segmenter
    ? [...segmenter.segment(text)]
        .map((part) => part.segment.trim())
        .filter(Boolean)
    : (text.match(/[^.!?…]+(?:[.!?…]+|$)/g) ?? [])
        .map((part) => part.trim())
        .filter(Boolean);
  return parts.map((part, i) => ({
    i,
    start_ms: null,
    end_ms: null,
    text: part,
  }));
}

export function ReadClient({ loggedIn }: { loggedIn: boolean }) {
  const [draft, setDraft] = useState("");
  const [sentences, setSentences] = useState<Sentence[] | null>(null);
  const [sourceId, setSourceId] = useState<number | null>(null);
  const sourcePromise = useRef<Promise<number | null> | null>(null);
  const [translations, setTranslations] = useState<Record<number, string>>({});
  const [translating, setTranslating] = useState<number | null>(null);
  const [savedSentences, setSavedSentences] = useState<Set<number>>(new Set());
  const [savingSentence, setSavingSentence] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [phraseMode, setPhraseMode] = useState(false);
  const [phraseStart, setPhraseStart] = useState<PhraseStart | null>(null);
  const [phraseError, setPhraseError] = useState<string | null>(null);
  const [savedWords, setSavedWords] = useState<ReadonlyMap<
    string,
    number
  > | null>(null);

  useEffect(() => {
    if (!loggedIn) return;
    let disposed = false;
    void getSavedWordStates().then((result) => {
      if (!disposed && result.ok)
        setSavedWords(new Map(result.states.map((i) => [i.key, i.state])));
    });
    return () => {
      disposed = true;
    };
  }, [loggedIn]);

  /**
   * The text source row is created on the first save, not on "Đọc" — a
   * read-only session should not write anything. One in-flight promise keeps
   * a sentence save and a panel save from racing the upsert.
   */
  const ensureSource = useCallback(async (): Promise<number | null> => {
    if (sourceId != null) return sourceId;
    if (!sourcePromise.current) {
      sourcePromise.current = saveTextSource({ text: draft }).then(
        (result) => {
          // A failed upsert must not poison later saves — clear so the next
          // call retries instead of reusing a resolved-null promise.
          if (!result.ok) sourcePromise.current = null;
          return result.ok ? result.source_id : null;
        },
      );
    }
    const id = await sourcePromise.current;
    if (id != null) setSourceId(id);
    return id;
  }, [draft, sourceId]);

  const startReading = () => {
    const text = draft.trim();
    if (!text) return;
    setSentences(splitSentences(text));
    setTranslations({});
    setSavedSentences(new Set());
    setSourceId(null);
    sourcePromise.current = null;
    setNotice(null);
  };

  const resetToInput = () => {
    setSentences(null);
    setPhraseStart(null);
    setPhraseError(null);
    setNotice(null);
  };

  const translateSentence = async (sentence: Sentence) => {
    if (translating != null) return;
    setTranslating(sentence.i);
    setNotice(null);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "vi",
          // Anchors the per-account server cache to this text source.
          videoId: sourceId != null ? `text:${sourceId}` : undefined,
          lines: [{ i: sentence.i, text: sentence.text }],
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        lines?: { i: number; vi: string | null }[];
      };
      const vi = payload.lines?.find((line) => line.i === sentence.i)?.vi;
      if (payload.ok && vi) {
        setTranslations((prev) => ({ ...prev, [sentence.i]: vi }));
      } else {
        setNotice(
          TRANSLATE_ERRORS[payload.error ?? ""] ?? TRANSLATE_FALLBACK,
        );
      }
    } catch {
      setNotice(TRANSLATE_FALLBACK);
    } finally {
      setTranslating(null);
    }
  };

  const saveSentence = async (sentence: Sentence) => {
    if (savingSentence != null) return;
    setSavingSentence(sentence.i);
    setNotice(null);
    try {
      const source = await ensureSource();
      if (source == null) {
        setNotice("Chưa lưu được nguồn văn bản. Thử lại.");
        return;
      }
      const key = normalizeWord(sentence.text).slice(0, KEY_MAX);
      const result = await saveStudyItem({
        kind: "sentence",
        key,
        display: sentence.text.slice(0, DISPLAY_MAX),
        meaning_vi: translations[sentence.i],
        meaning_origin: translations[sentence.i] ? "ai" : undefined,
        context: {
          source_id: source,
          sentence_index: sentence.i,
          sentence_text: sentence.text,
          sentence_vi: translations[sentence.i],
          origin: "read_lookup",
        },
      });
      if (result.ok) {
        setSavedSentences((prev) => new Set(prev).add(sentence.i));
      } else if (result.error === "unauthorized") {
        setNotice("Đăng nhập để lưu câu vào bộ ôn tập.");
      } else {
        setNotice("Chưa lưu được câu này. Thử lại.");
      }
    } finally {
      setSavingSentence(null);
    }
  };

  if (!sentences) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <BookOpenText className="size-5" aria-hidden /> Đọc
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dán một đoạn tiếng Anh — đọc từng câu, tra từ, dịch và lưu lại để ôn.
        </p>
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={MAX_TEXT_CHARS}
          rows={10}
          placeholder="Paste English text here…"
          className="mt-4 w-full rounded-xl border border-border bg-surface p-4 text-base leading-relaxed outline-none focus:border-ring"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {draft.length.toLocaleString()}/{MAX_TEXT_CHARS.toLocaleString()}
          </span>
          <button
            type="button"
            onClick={startReading}
            disabled={!draft.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            Đọc bài này
          </button>
        </div>
      </div>
    );
  }

  return (
    <DictionaryPanel
      onSaved={(key, state) =>
        setSavedWords((prev) => new Map(prev ?? []).set(key, state))
      }
    >
      <DictionaryContent>
        {(openLookup) => (
          <div className="mx-auto max-w-2xl px-4 py-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="flex items-center gap-2 text-xl font-bold">
                <BookOpenText className="size-5" aria-hidden /> Đọc
              </h1>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-pressed={phraseMode}
                  onClick={() => {
                    setPhraseMode((on) => !on);
                    setPhraseStart(null);
                    setPhraseError(null);
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm",
                    phraseMode
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground",
                  )}
                >
                  Chọn cụm
                </button>
                <button
                  type="button"
                  onClick={resetToInput}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground"
                >
                  <SquarePen className="size-4" aria-hidden /> Văn bản mới
                </button>
              </div>
            </div>
            {(notice || phraseError) && (
              <p role="status" className="mt-3 text-sm text-destructive">
                {notice ?? phraseError}
              </p>
            )}
            <ol className="mt-5 space-y-5">
              {sentences.map((sentence) => (
                <li key={sentence.i} className="group">
                  <p className="text-base leading-relaxed">
                    <SentenceText
                      sentence={sentence}
                      nowMs={0}
                      active={false}
                      savedWords={savedWords ?? undefined}
                      phraseMode={phraseMode}
                      phraseStart={phraseStart}
                      onPhraseStart={setPhraseStart}
                      onPhraseError={setPhraseError}
                      onLookup={(term, sentence_, trigger) => {
                        // Anchor first, then open — a word save must attach
                        // to the text source even before "Lưu câu" ran.
                        void (async () =>
                          openLookup({
                            term,
                            context: sentence_.text,
                            returnFocus: trigger,
                            source: {
                              title: "Văn bản đã dán",
                              sentence: sentence_.text,
                              timestamp: null,
                              source_id:
                                (loggedIn
                                  ? await ensureSource()
                                  : null) ?? undefined,
                              sentence_index: sentence_.i,
                              sentence_vi: translations[sentence_.i],
                            },
                          }))();
                      }}
                    />
                  </p>
                  {translations[sentence.i] && (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {translations[sentence.i]}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => void translateSentence(sentence)}
                      disabled={translating === sentence.i}
                      className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      {translating === sentence.i ? (
                        <Loader2
                          className="size-3.5 animate-spin"
                          aria-hidden
                        />
                      ) : (
                        <Languages className="size-3.5" aria-hidden />
                      )}
                      {translations[sentence.i] ? "Dịch lại" : "Dịch"}
                    </button>
                    {loggedIn && (
                      <button
                        type="button"
                        onClick={() => void saveSentence(sentence)}
                        disabled={
                          savingSentence === sentence.i ||
                          savedSentences.has(sentence.i)
                        }
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
                      >
                        {savingSentence === sentence.i ? (
                          <Loader2
                            className="size-3.5 animate-spin"
                            aria-hidden
                          />
                        ) : (
                          <Bookmark className="size-3.5" aria-hidden />
                        )}
                        {savedSentences.has(sentence.i)
                          ? "Đã lưu"
                          : "Lưu câu"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-8 text-xs text-muted-foreground">
              {sentences.length} câu · bản dịch và phân tích do AI tạo, chỉ để
              tham khảo.
            </p>
          </div>
        )}
      </DictionaryContent>
    </DictionaryPanel>
  );
}
