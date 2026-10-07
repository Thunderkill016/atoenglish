"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Sentence } from "@/lib/video/types";
import {
  outsideTranslationWindow,
  translationBatch,
  translationPayload,
  translationFingerprint,
  validateTranslations,
  TRANSLATION_TIMEOUT_MS,
  TRANSLATION_VERSION,
  TRANSLATION_MODEL,
  DEVICE_TRANSLATION_PROFILE,
  TRANSLATION_BATCH_SIZE,
  DEVICE_TRANSLATION_BATCH_SIZE,
  type SubtitleMode,
  type ServerTranslationEngine,
} from "@/lib/video/translation";
const CACHE_PREFIX = "atoenglish.subtitle-vi.v1:";
const CACHE_MAX_ITEMS = 10; // Bounded per-account device cache; no DB persistence implied.
const CACHE_MAX_CHARS = 500_000; // Leave room for other localStorage users.
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const TRANSPORT_GRACE_MS = 5000; // Allow a server timeout response to arrive.
const PAIR = { sourceLanguage: "en", targetLanguage: "vi" } as const;
type DeviceTranslator = {
  translate: (
    text: string,
    options: { signal: AbortSignal },
  ) => Promise<string>;
  destroy: () => void;
};
type TranslatorAPI = {
  availability: (options: typeof PAIR) => Promise<string>;
  create: (
    options: typeof PAIR & {
      signal: AbortSignal;
      monitor: (monitor: {
        addEventListener: (
          name: "downloadprogress",
          handler: (event: { loaded: number }) => void,
        ) => void;
      }) => void;
    },
  ) => Promise<DeviceTranslator>;
};
function deviceAPI(): TranslatorAPI | undefined {
  return (globalThis as typeof globalThis & { Translator?: TranslatorAPI })
    .Translator;
}
type CacheItem = {
  key: string;
  at: number;
  lines: { i: number; vi: string }[];
};
const ERRORS: Record<string, string> = {
  unauthorized: "Đăng nhập để dùng bộ dịch trên máy chủ.",
  ai_unavailable: "Bộ dịch trên máy chủ chưa được bật.",
  rate_limited: "Đã chạm giới hạn dịch. Đợi một phút rồi thử tiếp.",
  invalid_input: "Một câu quá dài để dịch; tiếng Anh vẫn được giữ nguyên.",
  invalid_output:
    "Bản dịch không khớp câu nguồn; tiếng Anh vẫn được giữ nguyên.",
  timeout: "Dịch phản hồi quá lâu. Bạn vẫn có thể tiếp tục xem.",
  ai_failed: "Chưa dịch được phụ đề. Bạn vẫn có thể tiếp tục xem.",
};
type Result = {
  sentences: Sentence[] | null;
  scope: string;
  provider: string;
  title?: string;
  lines: Record<number, string>;
  busy: boolean;
  error: string | null;
  finished: boolean;
};
export function useTranslations(
  sentences: Sentence[],
  scope: string,
  segmentationVersion: number,
  mode: SubtitleMode,
  activeIndex: number,
  sourceLanguage: string,
  serverTranslation: ServerTranslationEngine | null,
  /** Video title — whole-video context for the server model. */
  title?: string,
  { automatic = false }: { automatic?: boolean } = {},
) {
  // Uploader-authored Vietnamese wins over any machine output and is never
  // re-translated; it also anchors pronouns for neighbouring machine cues.
  const human = useMemo(() => {
    const lines: Record<number, string> = {};
    for (const s of sentences) if (s.vi) lines[s.i] = s.vi;
    return lines;
  }, [sentences]);
  // Resolves the idle wait when the playhead moves (window slides forward).
  const wake = useRef<(() => void) | null>(null);
  const [device, setDevice] = useState<DeviceTranslator | null>(null);
  // Only an operator-configured free engine may start without a separate choice.
  // Gemini remains explicit; guest server requests are not authorized by this API.
  const [provider, setProvider] = useState<"device" | "server">(() =>
    automatic &&
    scope !== "guest" &&
    serverTranslation &&
    serverTranslation.kind !== "gemini"
      ? "server"
      : "device",
  );
  const [availability, setAvailability] = useState("checking");
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [needsActivation, setNeedsActivation] = useState(false);
  const autoPrepared = useRef(false);
  const [state, setState] = useState<Result>({
    sentences: null,
    scope: "",
    provider: "",
    lines: {},
    busy: false,
    error: null,
    finished: false,
  });
  const [retry, setRetry] = useState(0);
  const [cacheNotice, setCacheNotice] = useState<string | null>(null);
  const active = useRef(activeIndex);
  const setup = useRef<AbortController | null>(null);
  const alive = useRef(true);
  useEffect(() => {
    active.current = activeIndex;
    wake.current?.();
  }, [activeIndex]);
  useEffect(() => {
    let disposed = false;
    const availabilityCheck =
      deviceAPI()?.availability(PAIR) ?? Promise.resolve("unavailable");
    void availabilityCheck
      .then((value) => {
        if (!disposed) setAvailability(value);
      })
      .catch(() => {
        if (!disposed) setAvailability("unavailable");
      });
    return () => {
      disposed = true;
    };
  }, []);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      setup.current?.abort();
    };
  }, []);
  useEffect(() => () => device?.destroy(), [device]);
  // Available models prepare automatically. Downloads resume from a normal
  // player/page gesture because Chrome requires transient user activation.
  const enableDevice = useCallback(async () => {
    if (setup.current || device) return;
    const api = deviceAPI();
    if (!api) return;
    const controller = new AbortController();
    setup.current = controller;
    setDownloading(true);
    setProgress(null);
    setSetupError(null);
    setNeedsActivation(false);
    try {
      const translator = await api.create({
        ...PAIR,
        signal: controller.signal,
        monitor: (monitor) => {
          monitor.addEventListener("downloadprogress", (event) => {
            if (alive.current)
              setProgress(
                Math.round(Math.max(0, Math.min(1, event.loaded)) * 100),
              );
          });
        },
      });
      if (!alive.current || controller.signal.aborted) {
        translator.destroy();
        return;
      }
      setDevice(translator);
      setProvider("device");
    } catch (cause) {
      if (!alive.current || controller.signal.aborted) return;
      if (
        (cause instanceof DOMException || cause instanceof Error) &&
        cause.name === "NotAllowedError"
      ) {
        setNeedsActivation(true);
      } else {
        console.warn("Device subtitle translation setup failed", cause);
        setSetupError(
          "Không tải được bộ dịch trên thiết bị. Kiểm tra kết nối rồi thử lại.",
        );
      }
    } finally {
      if (setup.current === controller) setup.current = null;
      if (alive.current && !controller.signal.aborted) setDownloading(false);
    }
  }, [device]);
  const enabled =
    (mode === "bilingual" || mode === "reveal" || mode === "vi") &&
    /^en(?:-|$)/i.test(sourceLanguage);
  const needsMachine =
    !sentences.length || sentences.some((s) => !s.noise && !s.vi);
  useEffect(() => {
    if (
      !automatic ||
      !enabled ||
      !needsMachine ||
      provider !== "device" ||
      device ||
      setupError
    )
      return;
    // Queue setup outside the effect; cleanup prevents a stale preparation on unmount.
    let disposed = false;
    if (
      availability === "available" &&
      !autoPrepared.current &&
      !needsActivation
    ) {
      void Promise.resolve().then(() => {
        if (disposed) return;
        autoPrepared.current = true;
        void enableDevice();
      });
    }
    const prepareOnGesture = () => {
      if (availability !== "checking" && availability !== "unavailable")
        void enableDevice();
    };
    document.addEventListener("pointerdown", prepareOnGesture, {
      capture: true,
    });
    document.addEventListener("keydown", prepareOnGesture, { capture: true });
    return () => {
      disposed = true;
      document.removeEventListener("pointerdown", prepareOnGesture, true);
      document.removeEventListener("keydown", prepareOnGesture, true);
    };
  }, [
    automatic,
    enabled,
    needsMachine,
    provider,
    device,
    setupError,
    availability,
    needsActivation,
    enableDevice,
  ]);
  const profile =
    provider === "device"
      ? DEVICE_TRANSLATION_PROFILE
      : (serverTranslation?.profile ?? TRANSLATION_MODEL);
  const batchSize =
    provider === "server"
      ? (serverTranslation?.batchSize ?? TRANSLATION_BATCH_SIZE)
      : DEVICE_TRANSLATION_BATCH_SIZE;
  const maxChars =
    provider === "server" ? (serverTranslation?.maxChars ?? 0) : undefined;
  const timeoutMs =
    provider === "server"
      ? (serverTranslation?.timeoutMs ?? TRANSLATION_TIMEOUT_MS)
      : TRANSLATION_TIMEOUT_MS;
  const serverModel = serverTranslation?.model;
  useEffect(() => {
    if (
      !enabled ||
      !sentences.length ||
      (provider === "device" && !device) ||
      (provider === "server" && !serverModel)
    )
      return;
    const controller = new AbortController();
    let disposed = false;
    let cached: CacheItem[] = [];
    const storageKey = CACHE_PREFIX + scope;
    const result = { sentences, scope, provider: profile, title };
    const run = async () => {
      const fingerprint = await translationFingerprint(
        sentences,
        segmentationVersion,
        profile,
        title,
      );
      if (disposed) return;
      let translated: Record<number, string> = {};
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const data: unknown = JSON.parse(raw);
          if (!Array.isArray(data)) throw new Error("Invalid cache");
          cached = data
            .filter(
              (item): item is CacheItem =>
                typeof item?.key === "string" &&
                typeof item?.at === "number" &&
                Array.isArray(item?.lines) &&
                Date.now() - item.at < CACHE_TTL_MS,
            )
            .slice(-CACHE_MAX_ITEMS);
        }
        const hit = cached.find((item) => item.key === fingerprint);
        // Cached transcripts can exceed one request batch; validate in bounded chunks.
        if (hit)
          for (let n = 0; n < hit.lines.length; n += TRANSLATION_BATCH_SIZE)
            for (const line of validateTranslations(
              hit.lines.slice(n, n + TRANSLATION_BATCH_SIZE),
              sentences,
            ))
              if (line.vi) translated[line.i] = line.vi;
      } catch {
        cached = [];
        translated = {};
        setCacheNotice(
          "Không đọc được cache trên thiết bị; phụ đề gốc vẫn dùng được.",
        );
      }
      setState({
        ...result,
        lines: translated,
        busy: true,
        error: null,
        finished: false,
      });
      const completed = new Set([
        ...Object.keys(translated).map(Number),
        ...Object.keys(human).map(Number),
      ]);
      while (!disposed) {
        const selected = translationBatch(
          sentences,
          completed,
          active.current,
          batchSize,
          maxChars,
          outsideTranslationWindow(sentences, active.current),
        );
        if (!selected.length) {
          if (sentences.every((s) => completed.has(s.i))) break;
          // Window done, rest of the video not reached yet: idle until seek.
          setState({
            ...result,
            lines: translated,
            busy: false,
            error: null,
            finished: false,
          });
          await new Promise<void>((resolve) => {
            wake.current = resolve;
          });
          wake.current = null;
          continue;
        }
        try {
          const input = translationPayload(sentences, selected, maxChars, {
            title,
            known: { ...translated, ...human },
          });
          let lines;
          if (provider === "device" && device) {
            // Expert translator has no context parameter. One sentence per call preserves IDs without separator heuristics.
            lines = [];
            for (const line of selected) {
              const vi = await device.translate(line.text, {
                signal: AbortSignal.any([
                  controller.signal,
                  AbortSignal.timeout(TRANSLATION_TIMEOUT_MS),
                ]),
              });
              if (disposed) return;
              const validated = validateTranslations(
                [{ i: line.i, vi: vi.trim() || null }],
                [line],
              )[0];
              lines.push(validated);
              if (vi.trim())
                translated = { ...translated, [line.i]: vi.trim() };
              setState({
                ...result,
                lines: translated,
                busy: true,
                error: null,
                finished: false,
              });
            }
          } else {
            const response = await fetch("/api/translate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(input),
              signal: AbortSignal.any([
                controller.signal,
                AbortSignal.timeout(timeoutMs + TRANSPORT_GRACE_MS),
              ]),
            });
            const data = await response.json();
            if (disposed) return;
            if (!response.ok || !data.ok) {
              setState({
                ...result,
                lines: translated,
                busy: false,
                error: ERRORS[data.error] ?? ERRORS.ai_failed,
                finished: false,
              });
              return;
            }
            if (
              data.source !== "ai" ||
              data.model !== serverModel ||
              data.profile !== profile ||
              data.version !== TRANSLATION_VERSION
            )
              throw new Error("Invalid provenance");
            lines = data.lines;
          }
          for (const line of validateTranslations(lines, selected))
            if (line.vi) translated = { ...translated, [line.i]: line.vi };
          selected.forEach((line) => completed.add(line.i)); // Null/missing outputs wait for an explicit retry, not an endless request loop.
          try {
            const entry = {
              key: fingerprint,
              at: Date.now(),
              lines: Object.entries(translated).map(([i, vi]) => ({
                i: Number(i),
                vi,
              })),
            };
            cached = [
              ...cached.filter((item) => item.key !== fingerprint),
              entry,
            ].slice(-CACHE_MAX_ITEMS);
            while (
              cached.length > 1 &&
              JSON.stringify(cached).length > CACHE_MAX_CHARS
            )
              cached.shift();
            const serialized = JSON.stringify(cached);
            if (serialized.length > CACHE_MAX_CHARS)
              throw new Error("Oversized cache");
            localStorage.setItem(storageKey, serialized);
          } catch {
            setCacheNotice(
              "Không lưu được cache trên thiết bị; bản dịch hiện tại vẫn dùng được.",
            );
          }
          setState({
            ...result,
            lines: translated,
            busy: true,
            error: null,
            finished: false,
          });
        } catch (cause) {
          if (disposed || controller.signal.aborted) return;
          setState({
            ...result,
            lines: translated,
            busy: false,
            error:
              cause instanceof Error && cause.name === "TimeoutError"
                ? ERRORS.timeout
                : ERRORS.ai_failed,
            finished: false,
          });
          return;
        }
      }
      if (!disposed)
        setState({
          ...result,
          lines: translated,
          busy: false,
          error: null,
          finished: true,
        });
    };
    void run().catch(() => {
      if (!disposed)
        setState({
          ...result,
          lines: {},
          busy: false,
          error: ERRORS.ai_failed,
          finished: false,
        });
    });
    return () => {
      disposed = true;
      controller.abort();
      wake.current?.();
    };
  }, [
    enabled,
    sentences,
    human,
    title,
    scope,
    segmentationVersion,
    retry,
    provider,
    device,
    profile,
    batchSize,
    maxChars,
    timeoutMs,
    serverModel,
  ]);
  // Reject the previous transcript/account/provider immediately, including the SHA preparation window.
  const current =
    state.sentences === sentences &&
    state.scope === scope &&
    state.provider === profile &&
    state.title === title;
  return {
    // Human lines show even before any translator is activated.
    lines: { ...(current ? state.lines : {}), ...human },
    humanCount: Object.keys(human).length,
    busy: enabled && current && state.busy,
    error: current ? state.error : null,
    finished: current && state.finished,
    cacheNotice,
    availability,
    downloading,
    progress,
    setupError,
    needsActivation: needsActivation || availability === "downloadable",
    deviceReady: Boolean(device),
    provider,
    enableDevice,
    useServer: () => {
      if (!serverModel) return;
      // A late device download must not override a deliberate engine choice.
      setup.current?.abort();
      setDownloading(false);
      setProvider("server");
    },
    retry: () => setRetry((value) => value + 1),
  };
}
