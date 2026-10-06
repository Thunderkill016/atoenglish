"use client";

import { useRef, useState } from "react";
import { FileUp, Languages, Loader2, BookOpenText } from "lucide-react";

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
  onFetchYoutube: () => void;
  onParsed: (parsed: LoadedTranscript, raw: string) => void;
}

const FILE_ACCEPT = ".srt,.vtt,.txt,text/plain";

/**
 * SPEC §4.2 fallback surface — three explicit options:
 * fetch from YouTube / paste or upload a subtitle file / read without sync.
 * Parsing runs client-side; persistence is a separate signed-in action.
 */
export function EmptyTranscript({
  busy,
  errorMessage,
  loggedIn,
  onFetchYoutube,
  onParsed,
}: EmptyTranscriptProps) {
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const applyRaw = (raw: string) => {
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
        trackKind: "learner",
        saved: false,
      },
      raw,
    );
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="text-sm text-[#9d9da6]">
        {errorMessage ?? "Video này chưa có phụ đề trong phiên của bạn."}
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onFetchYoutube}
          className="flex items-center gap-2 rounded-lg bg-[#f5b50a] px-4 py-2 text-sm font-semibold text-[#0c0c0e] transition hover:bg-[#ffca3a] disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Languages className="h-4 w-4" />
          )}
          Lấy phụ đề từ YouTube
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setPasteOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-[#232327] bg-[#151518] px-4 py-2 text-sm text-[#e8e8ea] transition hover:border-[#3a3a40]"
        >
          <FileUp className="h-4 w-4" />
          Dán hoặc tải phụ đề
        </button>
      </div>

      {pasteOpen && (
        <div className="flex w-full max-w-sm flex-col gap-2 rounded-lg border border-[#232327] bg-[#151518] p-3 text-left">
          <textarea
            ref={textRef}
            rows={6}
            placeholder={
              "Dán phụ đề .srt / .vtt / [mm:ss] nội dung…\nHoặc văn bản thường để đọc không đồng bộ."
            }
            className="w-full resize-none rounded-md border border-[#232327] bg-[#0c0c0e] p-2 font-mono text-xs text-[#e8e8ea] outline-none placeholder:text-[#55555f] focus:border-[#f5b50a]/50"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => applyRaw(textRef.current?.value ?? "")}
              className="rounded-md bg-[#f5b50a] px-3 py-1.5 text-xs font-semibold text-[#0c0c0e] hover:bg-[#ffca3a]"
            >
              Dùng phụ đề này
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 rounded-md border border-[#232327] px-3 py-1.5 text-xs text-[#e8e8ea] hover:border-[#3a3a40]"
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
                if (f) applyRaw(await f.text());
                e.target.value = "";
              }}
            />
          </div>
          {pasteError && (
            <p className="text-xs text-destructive">{pasteError}</p>
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
