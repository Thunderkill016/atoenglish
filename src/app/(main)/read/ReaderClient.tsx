"use client";

import { useEffect, useMemo, useState } from "react";

import {
  clearReadWordStatus,
  getReadWordCounts,
  getReadWordStates,
  setReadWordStatus,
  type WordStatus,
} from "@/app/actions/read";
import { saveCardToSRS } from "@/app/actions/cards";
import { lookupGloss } from "@/lib/read/gloss";
import {
  distinctWords,
  tokenizeText,
  type ReadToken,
} from "@/lib/read/tokenize";
import type { StarterText } from "@/lib/read/starter-texts";

const PASTE_MAX_CHARS = 5000;

type SelectedText = { title: string; body: string };

export function ReaderClient({
  signedIn,
  starterTexts,
}: {
  signedIn: boolean;
  starterTexts: readonly StarterText[];
}) {
  const [text, setText] = useState<SelectedText | null>(null);
  const [states, setStates] = useState<Record<string, WordStatus>>({});
  const [tapped, setTapped] = useState<string | null>(null);
  const [pasted, setPasted] = useState("");
  const [pasteError, setPasteError] = useState<string | null>(null);
  const [counts, setCounts] = useState<{
    known: number;
    learning: number;
  } | null>(null);

  const tokens = useMemo(() => (text ? tokenizeText(text.body) : []), [text]);
  const words = useMemo(() => (text ? distinctWords(text.body) : []), [text]);

  // Load stored word state whenever the visible text changes. Anonymous
  // readers skip the lookup — their render is fully neutral (spec US1).
  useEffect(() => {
    if (!signedIn || !text) return;
    void getReadWordStates(words).then((result) => {
      if (result.signedIn) setStates(result.states);
    });
    void getReadWordCounts().then((result) => {
      if (result.signedIn)
        setCounts({ known: result.known, learning: result.learning });
    });
  }, [signedIn, text, words]);

  const knownInText = useMemo(
    () => words.filter((w) => states[w] === "known").length,
    [words, states],
  );

  function submitPaste() {
    const trimmed = pasted.trim();
    if (trimmed.length === 0) return;
    if (trimmed.length > PASTE_MAX_CHARS) {
      setPasteError(`Văn bản dài quá — tối đa ${PASTE_MAX_CHARS} ký tự.`);
      return;
    }
    setPasteError(null);
    setStates({});
    setTapped(null);
    setText({ title: "Văn bản của bạn", body: trimmed });
  }

  function refreshCounts() {
    void getReadWordCounts().then((result) => {
      if (result.signedIn)
        setCounts({ known: result.known, learning: result.learning });
    });
  }

  async function mark(word: string, status: WordStatus) {
    if (!signedIn) return;
    const result = await setReadWordStatus(word, status);
    if (result.ok) {
      setStates((prev) => ({ ...prev, [word]: status }));
      refreshCounts();
    }
  }

  async function unmark(word: string) {
    if (!signedIn) return;
    const result = await clearReadWordStatus(word);
    if (result.ok) {
      setStates((prev) => {
        const next = { ...prev };
        delete next[word];
        return next;
      });
      refreshCounts();
    }
  }

  async function saveWord(word: string) {
    if (!signedIn) return;
    const gloss = lookupGloss(word);
    if (!gloss) return; // can't save a card without a meaning — honest miss
    const result = await saveCardToSRS({
      word,
      phonetic: gloss.phonetic ?? null,
      meaning_vn: gloss.meaning_vn,
      example_en: gloss.example_en ?? null,
      topic: "Đọc",
    });
    if (result.success) {
      // Saved ≠ known: the FSRS card carries the review state; the word
      // itself stays at "learning" (spec FR-004).
      await mark(word, "learning");
      setTapped(null);
    }
  }

  function speak(word: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  // ─── Text picker ─────────────────────────────────────────────────────────
  if (!text) {
    return (
      <div className="space-y-6">
        <section aria-label="Bài đọc mẫu">
          <h2 className="mb-2 text-sm font-medium text-foreground">
            Bài đọc mẫu
          </h2>
          <ol className="flex flex-col gap-2">
            {starterTexts.map((starter) => (
              <li key={starter.id}>
                <button
                  type="button"
                  onClick={() =>
                    setText({ title: starter.title, body: starter.body })
                  }
                  className="block w-full rounded-xl border border-border px-4 py-3 text-left text-sm transition-colors hover:border-foreground/40"
                >
                  <span className="font-medium">{starter.title}</span>
                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {starter.level}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>

        <section aria-label="Dán văn bản của bạn">
          <h2 className="mb-2 text-sm font-medium text-foreground">
            Hoặc dán văn bản của bạn
          </h2>
          <textarea
            aria-label="Dán văn bản tiếng Anh của bạn"
            value={pasted}
            onChange={(event) => setPasted(event.target.value)}
            rows={5}
            placeholder="Dán đoạn văn tiếng Anh vào đây…"
            className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-foreground/40"
          />
          {pasteError ? (
            <p className="mt-1 text-xs text-destructive">{pasteError}</p>
          ) : null}
          <button
            type="button"
            onClick={submitPaste}
            disabled={pasted.trim().length === 0}
            className="mt-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-40"
          >
            Đọc văn bản này
          </button>
          {!signedIn ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Đăng nhập để đánh dấu từ bạn biết — lượt khách chỉ đọc được văn
              bản.
            </p>
          ) : null}
        </section>
      </div>
    );
  }

  // ─── Reader ──────────────────────────────────────────────────────────────
  const tappedGloss = tapped ? lookupGloss(tapped) : null;
  const tappedStatus = tapped ? states[tapped] : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setText(null);
            setTapped(null);
            setStates({});
          }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Chọn văn bản khác
        </button>
        {signedIn && counts ? (
          <p className="text-xs text-muted-foreground">
            {counts.known} từ đã đánh dấu biết · {knownInText}/{words.length} từ
            trên trang
            <span className="block text-xs text-muted-foreground">
              tự đánh dấu — không phải điểm đánh giá
            </span>
          </p>
        ) : null}
      </div>

      <h2 className="text-lg font-semibold">{text.title}</h2>

      <p className="text-base leading-8" aria-label="Văn bản đọc" lang="en">
        {tokens.map((token, index) => {
          if (token.type !== "word") {
            return <span key={index}>{token.text}</span>;
          }
          const status = signedIn ? states[token.normalized] : undefined;
          const classes =
            status === "known"
              ? "rounded-sm px-0.5 underline decoration-state-known decoration-2 underline-offset-4"
              : status === "learning"
                ? "rounded-sm bg-state-learning/15 px-0.5 text-foreground"
                : signedIn
                  ? "rounded-sm bg-state-new/15 px-0.5 text-foreground"
                  : "rounded-sm px-0.5";
          return (
            <button
              key={index}
              type="button"
              onClick={() =>
                setTapped(tapped === token.normalized ? null : token.normalized)
              }
              className={`${classes} cursor-pointer transition-colors hover:bg-muted`}
            >
              {token.text}
            </button>
          );
        })}
      </p>

      {tapped ? (
        <div
          role="dialog"
          aria-label={`Từ: ${tapped}`}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold">{tapped}</p>
            {typeof window !== "undefined" && window.speechSynthesis ? (
              <button
                type="button"
                onClick={() => speak(tapped)}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-foreground/40"
                aria-label={`Nghe phát âm: ${tapped}`}
              >
                Nghe
              </button>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-foreground/90">
            {tappedGloss ? tappedGloss.meaning_vn : "chưa có nghĩa"}
          </p>
          {tappedGloss?.phonetic ? (
            <p className="text-xs text-muted-foreground">
              {tappedGloss.phonetic}
            </p>
          ) : null}
          {tappedGloss?.example_en ? (
            <p className="mt-1 text-xs italic text-muted-foreground">
              {tappedGloss.example_en}
            </p>
          ) : null}

          {signedIn ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void mark(tapped, "known")}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  tappedStatus === "known"
                    ? "bg-state-known text-primary-foreground"
                    : "border border-state-known/40 text-state-known hover:bg-state-known/10"
                }`}
              >
                Tôi biết từ này
              </button>
              <button
                type="button"
                onClick={() => void mark(tapped, "learning")}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  tappedStatus === "learning"
                    ? "bg-state-learning text-primary-foreground"
                    : "border border-state-learning/40 text-state-learning hover:bg-state-learning/10"
                }`}
              >
                Đang học
              </button>
              {tappedStatus ? (
                <button
                  type="button"
                  onClick={() => void unmark(tapped)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted/60"
                >
                  Bỏ đánh dấu
                </button>
              ) : null}
              {tappedGloss ? (
                <button
                  type="button"
                  onClick={() => void saveWord(tapped)}
                  className="rounded-full border border-state-new/40 px-3 py-1 text-xs text-state-new hover:bg-state-new/10"
                >
                  Lưu vào flashcard
                </button>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              Đăng nhập để đánh dấu và lưu từ vào flashcard.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
