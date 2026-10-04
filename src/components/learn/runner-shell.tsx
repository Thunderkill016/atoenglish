"use client";

import {
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { AlertTriangle, ArrowRight, Mic } from "lucide-react";
import { toast } from "sonner";

import { MinimalButton } from "@/components/design-system";

interface SpeechRecognitionEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionErrorEventLike {
  error?: string;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export type StartRecognition = (
  onTranscript: (transcript: string) => void,
) => void;

const subscribeToBrowserCapability = () => () => {};

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const browserWindow = window as unknown as Record<string, unknown>;
  return (browserWindow.SpeechRecognition ??
    browserWindow.webkitSpeechRecognition ??
    null) as SpeechRecognitionConstructor | null;
}

/** Shared ASR lifecycle for every session runner (lesson, transfer, checkpoint). */
export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const speechSupported = useSyncExternalStore(
    subscribeToBrowserCapability,
    () => getSpeechRecognitionConstructor() !== null,
    () => false,
  );

  const startRecognition: StartRecognition = (onTranscript) => {
    const Constructor = getSpeechRecognitionConstructor();
    if (!Constructor) return;

    recognitionRef.current?.abort();
    const recognition = new Constructor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      setIsListening(false);
      onTranscript(event.results[0]?.[0]?.transcript?.trim() ?? "");
    };
    recognition.onerror = (event) => {
      setIsListening(false);
      toast.error(
        event.error === "not-allowed"
          ? "Microphone đang bị chặn. Hãy cấp quyền rồi thử lại."
          : "Chưa nhận được giọng nói. Hãy thử lại.",
      );
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  return { speechSupported, isListening, startRecognition };
}

interface RunnerShellProps {
  onBack: () => void;
  backLabel: string;
  /** 0–100 progress; when set, the center slot is a progress bar. */
  progress?: number;
  /** Right-side status (e.g. "3/7", "Transfer"). */
  status?: ReactNode;
  /** Title mode (no progress bar): center shows title + subtitle. */
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

/** One session chrome for every runner: sticky header + narrow column. */
export function RunnerShell({
  onBack,
  backLabel,
  progress,
  status,
  title,
  subtitle,
  children,
}: RunnerShellProps) {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={onBack}
            className="min-h-11 shrink-0 rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:bg-muted"
          >
            {backLabel}
          </button>
          {progress !== undefined ? (
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black">{title}</p>
              {subtitle ? (
                <p className="truncate text-xs text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
            </div>
          )}
          {status}
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">{children}</div>
    </div>
  );
}

interface RunnerSpeechInputProps {
  speechSupported: boolean;
  isListening: boolean;
  fallbackText: string;
  setFallbackText: Dispatch<SetStateAction<string>>;
  startRecognition: StartRecognition;
  onSubmit: (value: string) => void;
  placeholder?: string;
}

/** Mic-or-typing input. Typed text is flow evidence only — never pronunciation. */
export function RunnerSpeechInput({
  speechSupported,
  isListening,
  fallbackText,
  setFallbackText,
  startRecognition,
  onSubmit,
  placeholder = "Nhập lại câu bạn vừa tự nói...",
}: RunnerSpeechInputProps) {
  if (speechSupported) {
    return (
      <MinimalButton
        fullWidth
        disabled={isListening}
        onClick={() => startRecognition(onSubmit)}
      >
        <Mic className="size-4" />
        {isListening ? "Đang nghe..." : "Bắt đầu nói"}
      </MinimalButton>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
      <div className="flex gap-2 text-sm text-warning">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <p>
          Trình duyệt chưa hỗ trợ nhận diện giọng nói. Hãy tự nói thành tiếng
          rồi nhập lại điều vừa nói. Nội dung nhập chỉ kiểm tra mục tiêu giao
          tiếp, không phải phát âm.
        </p>
      </div>
      <textarea
        value={fallbackText}
        onChange={(event) => setFallbackText(event.target.value)}
        rows={3}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        placeholder={placeholder}
      />
      <MinimalButton fullWidth onClick={() => onSubmit(fallbackText)}>
        Gửi câu vừa nói <ArrowRight className="size-4" />
      </MinimalButton>
    </div>
  );
}
