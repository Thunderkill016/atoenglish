"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { BookOpen, X, Sparkles, Volume2, Loader2, Play } from "lucide-react";
import { lookupGloss, GLOSS_SIZE } from "@/lib/read/gloss";
import { trapDialogFocus } from "@/lib/utils";
import { speakEnglish } from "@/lib/speech";
import type { GlossEntry } from "@/lib/read/gloss";
import { normalizeWord } from "@/lib/read/tokenize";

type Definition = GlossEntry & {
  part_of_speech?: string;
  explanation_vn?: string;
  example_vn?: string;
};
type Result = {
  term: string;
  source: "curated" | "ai";
  entry: Definition | null;
};
// Same bounded intake as the API; context is an optional source sentence.
const MAX_TERM_CHARS = 120;
const MAX_CONTEXT_CHARS = 1000;
const REQUEST_TIMEOUT_MS = 25_000; // Allow the API's 20s model timeout plus transport.
const ERROR_MESSAGES: Record<string, string> = {
  unauthorized: "Đăng nhập để tra nghĩa bằng AI.",
  auth_unavailable: "Chưa kiểm tra được đăng nhập. Thử lại sau.",
  ai_unavailable: "AI chưa được cấu hình. Bạn vẫn có thể tra từ điển có sẵn.",
  rate_limited: "Bạn tra AI quá nhanh. Đợi một phút rồi thử lại.",
  invalid_input: "Nhập từ hoặc cụm từ ngắn, tối đa 120 ký tự.",
  timeout: "AI phản hồi quá lâu. Thử lại hoặc dùng từ điển có sẵn.",
  ai_failed: "Chưa lấy được nghĩa từ AI. Thử lại sau.",
};

export interface DictionarySelection {
  term: string;
  context: string;
  returnFocus?: HTMLElement;
  source?: {
    title: string;
    sentence: string;
    timestamp: string | null;
    replay?: () => void;
  };
}
type LookupSelection = (selection: DictionarySelection) => void;
const DictionaryLookupContext = createContext<LookupSelection | null>(null);

/** Context consumer keeps lookup callbacks in event handlers, away from render-time refs. */
export function DictionaryContent({
  children,
}: {
  children: (lookup: LookupSelection) => ReactNode;
}) {
  const lookup = useContext(DictionaryLookupContext);
  if (!lookup) throw new Error("DictionaryContent requires DictionaryPanel");
  return children(lookup);
}

interface DictionaryPanelProps {
  /** Contextual surfaces reuse the same panel instead of creating another dictionary. */
  children?: ReactNode;
  onOpen?: () => void;
}

/** Source-labelled quick/context dictionary; AI remains an explicit action. */
export function DictionaryPanel({
  children,
  onOpen,
}: DictionaryPanelProps = {}) {
  const launcher = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const [source, setSource] =
    useState<DictionarySelection["source"]>(undefined);
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const show = useCallback(
    (origin?: HTMLElement) => {
      if (document.querySelector("dialog[open]") && !dialog.current?.open)
        return;
      if (!dialog.current?.open) {
        returnFocus.current =
          origin ??
          (document.activeElement instanceof HTMLElement
            ? document.activeElement
            : launcher.current);
        onOpen?.();
        dialog.current?.showModal();
      }
      setOpen(true);
      if (origin) {
        // Keep contextual meaning visible; focusing the lower edit form would scroll it away.
        if (dialog.current) dialog.current.scrollTop = 0;
        closeButton.current?.focus({ preventScroll: true });
      } else input.current?.focus();
    },
    [onOpen],
  );
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => {
      window.removeEventListener("keydown", shortcut);
      requestRef.current?.abort();
    };
  }, [show]);
  useEffect(() => {
    if (!open) return;
    const previousBody = document.body.style.overflow;
    const previousRoot = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousBody;
      document.documentElement.style.overflow = previousRoot;
    };
  }, [open]);
  const resetPending = () => {
    requestRef.current?.abort();
    requestRef.current = null;
    setBusy(false);
    setError(null);
    setNeedsLogin(false);
    setResult(null);
  };
  const lookup = () => {
    resetPending();
    const value = normalizeWord(term.trim());
    if (!value) {
      setError("Nhập từ hoặc cụm từ bạn muốn tra.");
      return;
    }
    setResult({ term: value, source: "curated", entry: lookupGloss(value) });
  };
  const lookupAI = async () => {
    resetPending();
    const value = term.trim();
    if (!value) {
      setError("Nhập từ hoặc cụm từ bạn muốn tra.");
      return;
    }
    const controller = new AbortController();
    requestRef.current = controller;
    setBusy(true);
    try {
      const response = await fetch("/api/dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term: value, context, mode: "ai" }),
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        ]),
      });
      const data = await response.json();
      if (requestRef.current !== controller) return;
      if (!response.ok || !data.ok) {
        setError(ERROR_MESSAGES[data.error] ?? ERROR_MESSAGES.ai_failed);
        setNeedsLogin(data.error === "unauthorized");
      } else {
        setResult({ term: value, source: "ai", entry: data.entry });
      }
    } catch (cause) {
      if (controller.signal.aborted || requestRef.current !== controller)
        return;
      setError(
        cause instanceof Error && cause.name === "TimeoutError"
          ? ERROR_MESSAGES.timeout
          : "Không kết nối được. Kiểm tra mạng và thử lại.",
      );
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setBusy(false);
      }
    }
  };

  const lookupSelection = (selection: DictionarySelection) => {
    if (document.querySelector("dialog[open]") && !dialog.current?.open) return;
    resetPending();
    setTerm(selection.term);
    setContext(selection.context.slice(0, MAX_CONTEXT_CHARS));
    setSource(selection.source);
    setResult({
      term: selection.term,
      source: "curated",
      entry: lookupGloss(normalizeWord(selection.term)),
    });
    show(selection.returnFocus);
  };

  const resultContent = result && (
    <section aria-label="Kết quả tra từ" className="space-y-5">
      <div>
        <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          {result.source === "ai"
            ? "AI · cần kiểm tra theo ngữ cảnh"
            : source
              ? "Từ điển có sẵn · nghĩa chung"
              : "Từ điển có sẵn"}
        </span>
        <h3 className="mt-4 break-words text-2xl font-semibold">
          {result.entry?.word ?? result.term}
        </h3>
      </div>
      {result.entry ? (
        <>
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {result.entry.phonetic}
            </p>
            <button
              type="button"
              onClick={() => speakEnglish(result.entry!.word)}
              aria-label="Nghe cách đọc từ"
              title="Giọng đọc trên thiết bị"
              className="flex size-10 items-center justify-center rounded-full bg-muted text-primary focus-visible:outline-2 focus-visible:outline-ring"
            >
              <Volume2 aria-hidden className="size-4" />
            </button>
          </div>
          {result.entry.part_of_speech && (
            <p className="text-xs text-primary">
              {result.entry.part_of_speech}
            </p>
          )}
          <p className="text-lg leading-7">{result.entry.meaning_vn}</p>
          {result.entry.explanation_vn && (
            <p className="text-sm leading-6 text-muted-foreground">
              {result.entry.explanation_vn}
            </p>
          )}
          {result.entry.example_en && (
            <blockquote className="border-l-2 border-primary pl-4">
              <p className="text-sm leading-6">{result.entry.example_en}</p>
              {result.entry.example_vn && (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {result.entry.example_vn}
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                {result.source === "ai"
                  ? "Ví dụ do AI tạo"
                  : "Ví dụ từ từ điển"}
              </p>
            </blockquote>
          )}
          {result.entry.word !== result.term.toLowerCase() && (
            <p className="text-xs text-muted-foreground">
              Tra dạng gốc của “{result.term}”.
            </p>
          )}
        </>
      ) : (
        <p className="rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
          {result.source === "ai"
            ? "AI chưa xác định được nghĩa phù hợp. Kiểm tra từ hoặc thêm câu ngữ cảnh."
            : "Chưa có nghĩa trong từ điển có sẵn. Bạn có thể thêm câu ngữ cảnh rồi tra bằng AI."}
        </p>
      )}
    </section>
  );

  return (
    <DictionaryLookupContext.Provider value={lookupSelection}>
      {children ?? (
        <button
          ref={launcher}
          type="button"
          onClick={() => show()}
          aria-label="Tra từ"
          aria-haspopup="dialog"
          title="Tra từ · Ctrl/⌘ D"
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-input bg-card text-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
        >
          <BookOpen aria-hidden className="size-4" />
        </button>
      )}
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            dialog.current?.close();
          } else {
            trapDialogFocus(event, event.currentTarget);
          }
        }}
        onClose={() => {
          requestRef.current?.abort();
          requestRef.current = null;
          setBusy(false);
          setOpen(false);
          if (returnFocus.current?.isConnected) returnFocus.current.focus();
          else launcher.current?.focus();
        }}
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-md overflow-y-auto border-l border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <header className="flex items-center justify-between border-b border-border p-4">
          <h2 id={titleId} className="flex items-center gap-2 font-semibold">
            <BookOpen aria-hidden className="size-5 text-primary" />
            Tra từ
          </h2>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            ref={closeButton}
            aria-label="Đóng tra từ"
            className="flex size-10 items-center justify-center rounded-full hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X aria-hidden className="size-4" />
          </button>
        </header>
        <div className="space-y-6 p-5">
          {source && (
            <section
              aria-label="Câu nguồn"
              className="space-y-3 rounded-xl border border-border bg-muted/40 p-4"
            >
              <p className="text-xs font-medium text-muted-foreground">
                Câu đang học
                {source.timestamp
                  ? ` · ${source.timestamp}`
                  : " · không có timestamp"}
              </p>
              <blockquote className="text-sm leading-6 [overflow-wrap:anywhere]">
                {source.sentence}
              </blockquote>
              <p
                className="truncate text-xs text-muted-foreground"
                title={source.title}
              >
                {source.title}
              </p>
              {source.replay && (
                <button
                  type="button"
                  onClick={() => {
                    dialog.current?.close();
                    source.replay?.();
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-3 text-xs font-medium text-primary"
                >
                  <Play aria-hidden className="size-4" />
                  Nghe lại câu nguồn
                </button>
              )}
              {source.sentence.length > MAX_CONTEXT_CHARS && (
                <p className="text-xs text-muted-foreground">
                  AI chỉ nhận {MAX_CONTEXT_CHARS} ký tự đầu của câu này.
                </p>
              )}
            </section>
          )}
          {source && resultContent}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              lookup();
            }}
            className="space-y-3"
          >
            <label
              htmlFor={`${titleId}-term`}
              className="block text-sm font-medium"
            >
              Từ hoặc cụm từ tiếng Anh
            </label>
            <input
              ref={input}
              id={`${titleId}-term`}
              value={term}
              onChange={(event) => {
                resetPending();
                setTerm(event.target.value);
              }}
              maxLength={MAX_TERM_CHARS}
              placeholder="Ví dụ: hello, take a break…"
              className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            <details className="text-sm">
              <summary className="min-h-10 cursor-pointer text-muted-foreground">
                {source ? "Ngữ cảnh gửi AI" : "Thêm câu ngữ cảnh cho AI"}
              </summary>
              <label
                className="mt-2 block text-xs text-muted-foreground"
                htmlFor={`${titleId}-context`}
              >
                Câu chứa từ bạn muốn hiểu
              </label>
              <textarea
                id={`${titleId}-context`}
                value={context}
                maxLength={MAX_CONTEXT_CHARS}
                onChange={(event) => {
                  resetPending();
                  setContext(event.target.value);
                }}
                rows={3}
                className="mt-2 w-full rounded-xl border border-input bg-background p-3 outline-none focus:border-primary"
                placeholder="Dán câu từ phụ đề…"
              />
            </details>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="min-h-11 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                Tra từ
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void lookupAI()}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-ring"
              >
                {busy ? (
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                ) : (
                  <Sparkles aria-hidden className="size-4 text-primary" />
                )}
                Tra bằng AI
              </button>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Tra nhanh từ điển có sẵn. AI chỉ nhận từ và câu ngữ cảnh khi bạn
              bấm “Tra bằng AI”.
            </p>
          </form>
          {busy && (
            <p role="status" className="text-sm text-muted-foreground">
              Đang tra nghĩa bằng AI…
            </p>
          )}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-border p-4 text-sm"
            >
              <p>{error}</p>
              {needsLogin && (
                <Link
                  href="/login"
                  className="mt-3 inline-flex min-h-11 items-center font-medium text-primary underline"
                >
                  Đăng nhập
                </Link>
              )}
            </div>
          )}
          {!result && !busy && !error && (
            <div className="rounded-xl bg-muted p-4 text-sm leading-6 text-muted-foreground">
              Từ điển có {GLOSS_SIZE} mục từ và cụm từ. Nhập từ rồi nhấn Enter
              để xem nghĩa, phiên âm và ví dụ có sẵn.
            </div>
          )}
          {!source && resultContent}
        </div>
      </dialog>
    </DictionaryLookupContext.Provider>
  );
}
