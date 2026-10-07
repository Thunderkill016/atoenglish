"use client";

import { useRef, useState } from "react";
import { FileUp, Languages, Loader2, BookOpenText, Puzzle } from "lucide-react";

import { SEGMENTATION_VERSION } from "@/lib/video/segment";
import { parseSubtitleFile } from "@/lib/video/subtitle-file";
import type { LoadedTranscript } from "@/app/actions/captions";

export type TranscriptSource =
  | { type: "youtube" }
  | { type: "paste"; raw: string }
  | { type: "plain"; raw: string };

interface EmptyTranscriptProps {
  busy: boolean;
  errorMessage: string | null;
  loggedIn: boolean;
  /** True when the AtoEnglish extension marked this page (dataset flag). */
  extensionReady?: boolean;
  onFetchYoutube: () => void;
  /** Opens the video on YouTube so the extension can stream captions back. */
  onExtensionFetch?: () => void;
  onParsed: (parsed: LoadedTranscript, raw: string) => void;
}

const FILE_ACCEPT = ".srt,.vtt,.txt,text/plain";
// Mirrors the server-side 1MB cap — rejects oversized input client-side
// before it can stall the tab on read/parse.
const MAX_TRANSCRIPT_BYTES = 1_000_000;

/**
 * SPEC §4.2 fallback surface — three explicit options:
 * fetch from YouTube / paste or upload a subtitle file / read without sync.
 * Parsing runs client-side; persistence is a separate signed-in action.
 */
export function EmptyTranscript({
  busy,
  errorMessage,
  loggedIn,
  extensionReady = false,
  onFetchYoutube,
  onExtensionFetch,
  onParsed,
}: EmptyTranscriptProps) {
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const applyRaw = (raw: string) => {
    if (raw.length > MAX_TRANSCRIPT_BYTES) {
      setPasteError("Phụ đề quá lớn (tối đa 1MB).");
      return;
    }
    const parsed = parseSubtitleFile(raw);
    if (parsed.kind === "invalid" || parsed.sentences.length === 0) {
      setPasteError(
        "Không đọc được phụ đề này. Hỗ trợ .srt, .vtt, hoặc mỗi dòng dạng [mm:ss] nội dung.",
      );
      return;
    }
    setPasteError(null);
    onParsed(
      {
        sentences: parsed.sentences,
        origin:
          parsed.kind === "plain"
            ? "plain_text"
            : parsed.kind === "timed_paste"
              ? "learner_paste"
              : "learner_upload",
        language: "en",
        segmentationVersion: SEGMENTATION_VERSION,
        trackKind: "learner",
        saved: false,
      },
      raw,
    );
  };

  return (
    <div className="flex flex-col items-center gap-5 px-5 py-8 text-center">
      <div className="space-y-2">
        <BookOpenText
          className="mx-auto h-8 w-8 text-[#f5b50a]"
          aria-hidden="true"
        />
        <h3 className="text-base font-medium">Học cùng phụ đề</h3>
        <p
          className="text-sm leading-relaxed text-[#9d9da6]"
          role={errorMessage ? "alert" : "status"}
        >
          {errorMessage ??
            (busy
              ? "Đang tự lấy phụ đề tiếng Anh…"
              : "Lấy phụ đề tiếng Anh để nghe lại từng câu và theo dõi nội dung video.")}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {busy ? (
          <Loader2
            aria-label="Đang tự lấy phụ đề"
            className="mx-auto h-5 w-5 animate-spin text-[#f5b50a]"
          />
        ) : (
          <button
            type="button"
            onClick={onFetchYoutube}
            className="flex items-center gap-2 rounded-lg bg-[#f5b50a] min-h-11 px-4 py-2 text-sm font-semibold text-[#0c0c0e] transition hover:bg-[#ffca3a] disabled:opacity-60"
          >
            <Languages className="h-4 w-4" />
            Thử lấy lại phụ đề
          </button>
        )}
        {extensionReady && onExtensionFetch && (
          <button
            type="button"
            disabled={busy}
            onClick={onExtensionFetch}
            className="flex items-center gap-2 rounded-lg border border-[#f5b50a]/40 bg-[#151518] min-h-11 px-4 py-2 text-sm text-[#f5b50a] transition hover:bg-[#f5b50a]/10 disabled:opacity-60"
          >
            <Puzzle className="h-4 w-4" />
            Lấy qua extension
          </button>
        )}
        <button
          type="button"
          aria-expanded={pasteOpen}
          onClick={() => setPasteOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-[#232327] bg-[#151518] min-h-11 px-4 py-2 text-sm text-[#e8e8ea] transition hover:border-[#3a3a40]"
        >
          <FileUp className="h-4 w-4" />
          Dán hoặc tải phụ đề
        </button>
      </div>

      {pasteOpen && (
        <div className="flex w-full max-w-sm flex-col gap-2 rounded-lg border border-[#232327] bg-[#151518] p-3 text-left">
          <textarea
            ref={textRef}
            aria-label="Nội dung phụ đề"
            rows={6}
            placeholder={
              "Dán phụ đề .srt / .vtt / [mm:ss] nội dung…\nHoặc văn bản thường để đọc không đồng bộ."
            }
            className="w-full resize-none rounded-md border border-[#232327] bg-[#0c0c0e] p-2 font-mono text-xs text-[#e8e8ea] outline-none placeholder:text-[#55555f] focus:border-[#f5b50a]/50"
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyRaw(textRef.current?.value ?? "")}
              className="rounded-md bg-[#f5b50a] min-h-11 px-3 py-1.5 text-xs font-semibold text-[#0c0c0e] hover:bg-[#ffca3a]"
            >
              Dùng phụ đề này
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 rounded-md border border-[#232327] min-h-11 px-3 py-1.5 text-xs text-[#e8e8ea] hover:border-[#3a3a40]"
            >
              <BookOpenText className="h-3.5 w-3.5" />
              Chọn file .srt/.vtt
            </button>
            <input
              ref={fileRef}
              type="file"
              accept={FILE_ACCEPT}
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  if (f.size > MAX_TRANSCRIPT_BYTES) {
                    setPasteError("Tệp quá lớn (tối đa 1MB).");
                  } else {
                    applyRaw(await f.text());
                  }
                }
                e.target.value = "";
              }}
            />
          </div>
          {pasteError && (
            <p role="alert" className="text-xs text-destructive">
              {pasteError}
            </p>
          )}
        </div>
      )}

      {!loggedIn && (
        <p className="text-xs text-[#6d6d78]">
          Đăng nhập để lưu phụ đề và tiếp tục xem dở ở lần sau.
        </p>
      )}
    </div>
  );
}
