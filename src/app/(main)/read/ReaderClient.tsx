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
import { distinctWords, tokenizeText, type ReadToken } from "@/lib/read/tokenize";
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
  const [counts, setCounts] = useState<{ known: number; learning: number } | null>(null);

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
      if (result.signedIn) setCounts({ known: result.known, learning: result.learning });
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
      if (result.signedIn) setCounts({ known: result.known, learning: result.learning });
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
          <h2 className="mb-2 text-sm font-medium text-stone-700">Bài đọc mẫu</h2>
          <ol className="flex flex-col gap-2">
            {starterTexts.map((starter) => (
              <li key={starter.id}>
                <button
                  type="button"
                  onClick={() => setText({ title: starter.title, body: starter.body })}
                  className="block w-full rounded-xl border border-stone-200 px-4 py-3 text-left text-sm transition-colors hover:border-stone-400"
                >
                  <span className="font-medium">{starter.title}</span>
                  <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
                    {starter.level}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </section>

        <section aria-label="Dán văn bản của bạn">
          <h2 className="mb-2 text-sm font-medium text-stone-700">Hoặc dán văn bản của bạn</h2>
          <textarea
            value={pasted}
            onChange={(event) => setPasted(event.target.value)}
            rows={5}
            placeholder="Paste an English text here…"
            className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-stone-400"
          />
          {pasteError ? <p className="mt-1 text-xs text-red-600">{pasteError}</p> : null}
          <button
            type="button"
            onClick={submitPaste}
            disabled={pasted.trim().length === 0}
            className="mt-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-40"
          >
            Đọc văn bản này
          </button>
          {!signedIn ? (
            <p className="mt-3 text-xs text-stone-500">
              Đăng nhập để đánh dấu từ bạn biết — lượt khách chỉ đọc được văn bản.
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
          <p className="text-xs text-stone-500">
            {counts.known} từ đã đánh dấu biết · {knownInText}/{words.length} từ trên trang
            <span className="block text-[10px] text-stone-400">tự đánh dấu — không phải điểm đánh giá</span>
          </p>
        ) : null}
      </div>

      <h2 className="text-lg font-semibold">{text.title}</h2>

      <p className="text-base leading-8" aria-label="Văn bản đọc">
        {tokens.map((token, index) => {
          if (token.type !== "word") {
            return <span key={index}>{token.text}</span>;
          }
          const status = signedIn ? states[token.normalized] : undefined;
          const classes =
            status === "known"
              ? "rounded-sm px-0.5 text-stone-800 underline decoration-emerald-300 decoration-2 underline-offset-4"
              : status === "learning"
                ? "rounded-sm bg-amber-100 px-0.5 text-amber-900"
                : signedIn
                  ? "rounded-sm bg-sky-100 px-0.5 text-sky-900"
                  : "rounded-sm px-0.5";
          return (
            <button
              key={index}
              type="button"
              onClick={() => setTapped(tapped === token.normalized ? null : token.normalized)}
              className={`${classes} cursor-pointer transition-colors hover:bg-stone-200`}
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
          className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold">{tapped}</p>
            {typeof window !== "undefined" && window.speechSynthesis ? (
              <button
                type="button"
                onClick={() => speak(tapped)}
                className="rounded-full border border-stone-200 px-3 py-1 text-xs text-stone-600 hover:border-stone-400"
                aria-label={`Nghe phát âm: ${tapped}`}
              >
                Nghe
              </button>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-stone-700">
            {tappedGloss ? tappedGloss.meaning_vn : "chưa có nghĩa"}
          </p>
          {tappedGloss?.phonetic ? (
            <p className="text-xs text-stone-400">{tappedGloss.phonetic}</p>
          ) : null}
          {tappedGloss?.example_en ? (
            <p className="mt-1 text-xs italic text-stone-500">{tappedGloss.example_en}</p>
          ) : null}

          {signedIn ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void mark(tapped, "known")}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  tappedStatus === "known"
                    ? "bg-emerald-600 text-white"
                    : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                Tôi biết từ này
              </button>
              <button
                type="button"
                onClick={() => void mark(tapped, "learning")}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  tappedStatus === "learning"
                    ? "bg-amber-500 text-white"
                    : "border border-amber-200 text-amber-700 hover:bg-amber-50"
                }`}
              >
                Đang học
              </button>
              {tappedStatus ? (
                <button
                  type="button"
                  onClick={() => void unmark(tapped)}
                  className="rounded-full border border-stone-200 px-3 py-1 text-xs text-stone-500 hover:bg-stone-50"
                >
                  Bỏ đánh dấu
                </button>
              ) : null}
              {tappedGloss ? (
                <button
                  type="button"
                  onClick={() => void saveWord(tapped)}
                  className="rounded-full border border-sky-200 px-3 py-1 text-xs text-sky-700 hover:bg-sky-50"
                >
                  Lưu vào flashcard
                </button>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-xs text-stone-500">
              Đăng nhập để đánh dấu và lưu từ vào flashcard.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
