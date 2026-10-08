"use client";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  SHELL_TRANSLATION_PROFILE,
  type SubtitleMode,
  type ServerTranslationEngine,
} from "@/lib/video/translation";
const CACHE_PREFIX = "atoenglish.subtitle-vi.v1:";
const CACHE_MAX_ITEMS = 10; // Bounded per-account device cache; no DB persistence implied.
const CACHE_MAX_CHARS = 500_000; // Leave room for other localStorage users.
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const TRANSPORT_GRACE_MS = 5000; // Allow a server timeout response to arrive.
const BACKGROUND_YIELD_MS = 30; // Let playback/input render between low-priority device calls.
const BACKGROUND_PUBLISH_MS = 250; // Batch background paints/cache writes; near cues still publish immediately.
const PRIORITY_CHANGED = "playhead-priority-changed";
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
/** Native shell's JavascriptInterface: AtoTranslate.translate(id, text). */
type ShellBridge = { translate: (id: number, text: string) => void };
// Module-scoped: the native side exposes a single global callback —
// __atoShellTranslateResult — so pending ids must stay unique across
// remounts; a late result must never be attributed to another sentence.
const shellPending = new Map<number, (vi: string | null) => void>();
let shellNextId = 0;
// The bridge has no native cancel API; serialize ML Kit calls even after a
// caller aborts or a component remounts. Aborts still settle the UI promptly.
let shellIdle: Promise<void> = Promise.resolve();
/**
 * ML Kit bridge inside the Android WebView shell (mission 007). Presents the
 * same DeviceTranslator surface as Chrome's Translator API — free, on-device,
 * no activation or model-download UI needed from the page's perspective.
 * Results arrive through window.__atoShellTranslateResult(id, text|null).
 */
function shellAPI(): DeviceTranslator | undefined {
  const g = globalThis as typeof globalThis & {
    AtoTranslate?: ShellBridge;
    __atoShellTranslateResult?: (id: number, vi: string | null) => void;
  };
  const bridge = g.AtoTranslate;
  if (!bridge || typeof bridge.translate !== "function") return undefined;
  g.__atoShellTranslateResult = (id, vi) => {
    const settle = shellPending.get(id);
    shellPending.delete(id);
    settle?.(vi);
  };
  return {
    translate: async (text, { signal }) => {
      await shellIdle;
      if (signal.aborted) throw signal.reason;
      return new Promise<string>((resolve, reject) => {
        const id = ++shellNextId;
        let settleNative!: () => void;
        shellIdle = new Promise<void>((done) => {
          settleNative = done;
        });
        const onAbort = () => reject(signal.reason);
        // An abort cancels the caller's result, not ML Kit's in-flight work.
        // Retain the native callback to release the barrier before another call.
        shellPending.set(id, (vi) => {
          settleNative();
          signal.removeEventListener("abort", onAbort);
          if (signal.aborted) reject(signal.reason);
          else resolve(vi ?? "");
        });
        signal.addEventListener("abort", onAbort, { once: true });
        try {
          bridge.translate(id, text);
        } catch (cause) {
          shellPending.delete(id);
          settleNative();
          signal.removeEventListener("abort", onAbort);
          reject(cause instanceof Error ? cause : new Error(String(cause)));
        }
      });
    },
    destroy: () => {},
  };
}
type CacheItem = {
  key: string;
  at: number;
  lines: { i: number; vi: string }[];
};
const ERRORS: Record<string, string> = {
  unauthorized: "Đăng nhập để dùng bộ dịch này trên máy chủ.",
  auth_unavailable: "Không kiểm tra được phiên đăng nhập. Thử lại sau.",
  forbidden: "Yêu cầu bị từ chối. Tải lại trang rồi thử lại.",
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
  {
    automatic = false,
    videoId,
  }: { automatic?: boolean; videoId?: string } = {},
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
  // The shell bridge needs no setup — it either exists or it doesn't.
  const [shell] = useState<DeviceTranslator | null>(() => shellAPI() ?? null);
  // Resolver order (ATO-TRANSLATE-MOBILE-01): persisted cache → shell bridge →
  // Chrome Translator (feature-detected) → server fallback → retry/error.
  // Inside the native shell the on-device bridge always wins; the server is
  // reached only as a fallback, never for its own sake. Gemini stays explicit
  // (operator-billed) and is never auto-selected.
  const [provider, setProvider] = useState<"device" | "server" | "shell">(() =>
    shell ? "shell" : "device",
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
  const deviceTask = useRef<{
    controller: AbortController;
    background: boolean;
    promise: Promise<string>;
  } | null>(null);
  const setup = useRef<AbortController | null>(null);
  const alive = useRef(true);
  // Lines already produced by the device path survive a mid-run step-down to
  // the server instead of vanishing while the new profile re-translates them.
  const carryOver = useRef<{
    sentences: Sentence[];
    lines: Record<number, string>;
  } | null>(null);
  useEffect(() => {
    if (active.current !== activeIndex && deviceTask.current?.background)
      deviceTask.current.controller.abort(PRIORITY_CHANGED);
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
  // Automatic server fallback: no usable device path (mobile browser, WebView
  // without the shell bridge, unsupported Chrome) or a failed device setup
  // steps down to the configured server engine — billed Gemini never does.
  const serverAvailable = Boolean(
    serverTranslation && serverTranslation.kind !== "gemini",
  );
  // Derived, not stored: a preferred-device provider with no usable path
  // reads as "server" — but only after the learner (or `automatic`) has
  // asked for translation. Without that gate every watch-page load would
  // spend server budget uninvited on mobile.
  const resolvedProvider: "device" | "server" | "shell" =
    provider === "device" &&
    serverAvailable &&
    (Boolean(setupError) || (automatic && availability === "unavailable"))
      ? "server"
      : provider;
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
      resolvedProvider !== "device" ||
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
    resolvedProvider,
    device,
    setupError,
    availability,
    needsActivation,
    enableDevice,
  ]);
  const serverProfile = serverTranslation?.profile ?? TRANSLATION_MODEL;
  const profile =
    resolvedProvider === "device"
      ? DEVICE_TRANSLATION_PROFILE
      : resolvedProvider === "shell"
        ? SHELL_TRANSLATION_PROFILE
        : serverProfile;
  const batchSize =
    resolvedProvider === "server"
      ? (serverTranslation?.batchSize ?? TRANSLATION_BATCH_SIZE)
      : DEVICE_TRANSLATION_BATCH_SIZE;
  const maxChars =
    resolvedProvider === "server"
      ? (serverTranslation?.maxChars ?? 0)
      : undefined;
  const timeoutMs =
    resolvedProvider === "server"
      ? (serverTranslation?.timeoutMs ?? TRANSLATION_TIMEOUT_MS)
      : TRANSLATION_TIMEOUT_MS;
  const serverModel = serverTranslation?.model;
  useEffect(() => {
    if (
      !enabled ||
      !sentences.length ||
      (resolvedProvider === "device" && !device) ||
      (resolvedProvider === "shell" && !shell) ||
      (resolvedProvider === "server" && !serverModel)
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
      let lastPublishedAt = 0;
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
        if (carryOver.current) {
          // Server-profile cache still wins any overlapping cue. The ref
          // clears only after a successful merge — a corrupt localStorage
          // read must not silently drop the carried lines.
          if (carryOver.current.sentences === sentences)
            translated = { ...carryOver.current.lines, ...translated };
          carryOver.current = null;
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
        ...sentences.filter((s) => s.noise).map((s) => s.i),
      ]);
      const persistCache = () => {
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
      };
      while (!disposed) {
        let selected = translationBatch(
          sentences,
          completed,
          active.current,
          batchSize,
          maxChars,
          outsideTranslationWindow(sentences, active.current),
        );
        const background =
          resolvedProvider !== "server" && selected.length === 0;
        if (background) {
          selected = translationBatch(
            sentences,
            completed,
            active.current,
            DEVICE_TRANSLATION_BATCH_SIZE,
          );
          if (selected.length) {
            const selectedFor = active.current;
            await new Promise<void>((resolve) =>
              setTimeout(resolve, BACKGROUND_YIELD_MS),
            );
            if (disposed) return;
            if (active.current !== selectedFor) continue; // Re-evaluate priority before starting work.
          }
        }
        if (!selected.length) {
          if (sentences.every((s) => completed.has(s.i) || s.noise)) break;
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
        let taskController: AbortController | undefined;
        try {
          const input = translationPayload(sentences, selected, maxChars, {
            title,
            known: { ...translated, ...human },
            videoId,
          });
          let lines;
          const local = resolvedProvider === "shell" ? shell : device;
          if (
            (resolvedProvider === "device" || resolvedProvider === "shell") &&
            local
          ) {
            // Expert translator has no context parameter. One sentence per call preserves IDs without separator heuristics.
            lines = [];
            for (const line of selected) {
              // Cleanup aborts an old run. Await its settlement before starting a
              // new source/provider run: there is never a second device task in flight.
              if (deviceTask.current)
                await Promise.allSettled([deviceTask.current.promise]);
              if (disposed) return;
              taskController = new AbortController();
              const signal = AbortSignal.any([
                controller.signal,
                taskController.signal,
                AbortSignal.timeout(TRANSLATION_TIMEOUT_MS),
              ]);
              const promise = local.translate(line.text, { signal });
              const task = { controller: taskController, background, promise };
              deviceTask.current = task;
              let vi: string;
              try {
                vi = await promise;
              } finally {
                if (deviceTask.current === task) deviceTask.current = null;
              }
              if (disposed) return;
              if (taskController.signal.reason === PRIORITY_CHANGED)
                throw PRIORITY_CHANGED;
              const validated = validateTranslations(
                [{ i: line.i, vi: vi.trim() || null }],
                [line],
              )[0];
              lines.push(validated);
              if (vi.trim())
                translated = { ...translated, [line.i]: vi.trim() };
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
          // A 3,000-line Read document must remain interactive while the device
          // translates the remainder. The final state below flushes every line.
          if (
            background &&
            Date.now() - lastPublishedAt < BACKGROUND_PUBLISH_MS
          )
            continue;
          lastPublishedAt = Date.now();
          persistCache();
          const publish = () =>
            setState({
              ...result,
              lines: translated,
              busy: true,
              error: null,
              finished: false,
            });
          if (background) startTransition(publish);
          else publish();
        } catch (cause) {
          if (disposed || controller.signal.aborted) return;
          if (taskController?.signal.reason === PRIORITY_CHANGED) continue;
          // A failed on-device path (Translator or the native bridge) steps
          // down to the server once — the provider change re-enters this
          // effect and retries there.
          if (resolvedProvider !== "server" && serverAvailable) {
            carryOver.current = { sentences, lines: translated };
            // Commit a handoff state under the server profile so the
            // already-translated lines keep displaying — and `pending`
            // stays true — while the new profile's first state resolves.
            setState({
              sentences,
              scope,
              provider: serverProfile,
              title,
              lines: translated,
              busy: true,
              error: null,
              finished: false,
            });
            setProvider("server");
            return;
          }
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
      if (!disposed) {
        persistCache();
        setState({
          ...result,
          lines: translated,
          busy: false,
          error: null,
          finished: true,
        });
      }
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
    resolvedProvider,
    device,
    profile,
    batchSize,
    maxChars,
    timeoutMs,
    serverModel,
    serverProfile,
    shell,
    serverAvailable,
    videoId,
  ]);
  // Reject the previous transcript/account/provider immediately, including the SHA preparation window.
  const current =
    state.sentences === sentences &&
    state.scope === scope &&
    state.provider === profile &&
    state.title === title;
  // A cue is "pending" while some provider can still deliver it — the UI
  // must not say "no translation" for a cue that's merely queued.
  const providerViable =
    resolvedProvider === "shell"
      ? Boolean(shell)
      : resolvedProvider === "server"
        ? Boolean(serverModel)
        : availability !== "unavailable";
  return {
    // Human lines show even before any translator is activated.
    lines: { ...(current ? state.lines : {}), ...human },
    humanCount: Object.keys(human).length,
    busy: enabled && current && state.busy,
    error: current ? state.error : null,
    finished: current && state.finished,
    cacheNotice,
    // True while an untranslated cue can still be delivered — queued,
    // fingerprinting, or in flight — so the UI shows "Đang dịch…" instead of
    // "Chưa có bản dịch". The mount→first-state gap (`!current`) counts as
    // queued; a parked loop (`current` + not busy) does not — out-of-window
    // cues are not being delivered until the playhead seeks.
    pending:
      enabled &&
      needsMachine &&
      !(current && state.finished) &&
      !(current && state.error) &&
      !setupError &&
      (state.busy || (providerViable && !current)),
    availability,
    downloading,
    progress,
    setupError,
    needsActivation: needsActivation || availability === "downloadable",
    deviceReady: Boolean(device) || resolvedProvider === "shell",
    provider: resolvedProvider,
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
