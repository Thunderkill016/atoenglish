"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ArrowRight,
  X,
  MonitorPlay,
  Users,
  Languages,
} from "lucide-react";
import {
  getCatalog,
  TOPIC_LABELS,
  type CatalogTopic,
} from "@/content/catalog/videos";
import { parseYoutubeUrl } from "@/lib/video/youtube-url";
import { formatTimestamp } from "@/lib/format";
import { trapDialogFocus } from "@/lib/utils";
import { DictionaryPanel } from "@/components/dictionary-panel";

const SearchContext = createContext<{
  showTitleVi: boolean;
  setShowTitleVi: (value: boolean) => void;
  query: string;
  setQuery: (query: string) => void;
  channel: string | null;
  setChannel: (channel: string | null) => void;
  topic: string | null;
  setTopic: (topic: string | null) => void;
} | null>(null);
// Preview six videos; a text action reveals the full filtered catalog.
const PICKER_RESULT_LIMIT = 6;

export function DiscoverSearchProvider({ children }: { children: ReactNode }) {
  const [showTitleVi, setShowTitleVi] = useState(false);
  const [query, updateQuery] = useState("");
  const [channel, setChannel] = useState<string | null>(null);
  const setQuery = (value: string) => {
    updateQuery(value);
    setChannel(null);
  };
  const [topic, setTopic] = useState<string | null>(null);
  return (
    <SearchContext.Provider
      value={{
        showTitleVi,
        setShowTitleVi,
        query,
        setQuery,
        channel,
        setChannel,
        topic,
        setTopic,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}
export function useDiscoverQuery() {
  const value = useContext(SearchContext);
  if (!value) throw new Error("Discover search requires its provider");
  return value;
}
/** One shared display setting for the catalog and search preview. */
export function TitleTranslationToggle({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { showTitleVi, setShowTitleVi } = useDiscoverQuery();
  return (
    <button
      type="button"
      aria-label="Hiện nghĩa Việt"
      aria-pressed={showTitleVi}
      title={
        showTitleVi
          ? "Ẩn nghĩa Việt của tiêu đề"
          : "Hiện nghĩa Việt của tiêu đề"
      }
      onClick={() => setShowTitleVi(!showTitleVi)}
      className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-2 text-xs text-muted-foreground hover:bg-muted aria-pressed:bg-primary/10 aria-pressed:text-primary focus-visible:outline-2 focus-visible:outline-ring"
    >
      <Languages aria-hidden className="size-4" />
      <span className={compact ? "sr-only" : "hidden sm:inline"}>
        Hiện nghĩa Việt
      </span>
    </button>
  );
}

export const normalizeDiscoverQuery = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .trim();

/** Compact launcher, one input in a native modal; no remote YouTube search is implied. */
export function DiscoverSearch() {
  const { showTitleVi, query, setQuery, channel, setChannel, topic, setTopic } =
    useDiscoverQuery();
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();
  const titleId = useId();
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"videos" | "channels">("channels");
  const [open, setOpen] = useState(false);
  const catalog = getCatalog();
  const key = normalizeDiscoverQuery(query);
  const filtered = catalog.filter(
    (video) =>
      (!channel || video.channel === channel) &&
      (!topic || video.topic === topic) &&
      (!key ||
        normalizeDiscoverQuery(
          `${video.title} ${video.titleVi} ${video.channel} ${TOPIC_LABELS[video.topic]}`,
        ).includes(key)),
  );
  const channels = [...new Set(filtered.map((video) => video.channel))];
  const videoId = parseYoutubeUrl(query);
  const urlLike = /^(https?:\/\/|www\.)|youtu(be\.com|\.be)/i.test(
    query.trim(),
  );

  const show = useCallback(() => {
    if (document.querySelector("dialog[open]") && !dialogRef.current?.open)
      return;
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
    setView(query.trim() ? "videos" : "channels");
    setOpen(true);
    inputRef.current?.focus();
  }, [query]);
  const close = () => dialogRef.current?.close();
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        show();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
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

  const submit = () => {
    if (videoId) {
      close();
      router.push(`/watch/${videoId}`);
    } else if (urlLike) {
      setError(
        "Link không hợp lệ — hỗ trợ youtube.com, youtu.be, shorts, live, embed.",
      );
    } else {
      close();
    }
  };

  return (
    <>
      <div className="flex w-full max-w-sm items-center gap-2">
        <button
          ref={triggerRef}
          type="button"
          onClick={show}
          aria-label="Tìm kiếm và khám phá"
          aria-haspopup="dialog"
          className="flex min-h-11 w-full max-w-sm items-center gap-2 rounded-full border border-input bg-card px-3 text-left text-sm text-muted-foreground hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Search aria-hidden className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            {query || "Tìm kiếm và khám phá…"}
          </span>
          <kbd
            aria-hidden
            className="hidden shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] sm:block"
          >
            Ctrl K
          </kbd>
        </button>
        <DictionaryPanel />
      </div>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            close();
          } else {
            trapDialogFocus(event, event.currentTarget);
          }
        }}
        onClose={() => {
          setOpen(false);
          setError(null);
          triggerRef.current?.focus();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              close();
          }
        }}
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-2xl max-h-[min(680px,85dvh)] overflow-y-auto rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/60"
      >
        <h2 id={titleId} className="sr-only">
          Tìm kiếm và khám phá
        </h2>
        <div className="sticky top-0 z-10 border-b border-border bg-card">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
            role="search"
            className="flex items-center gap-3 px-4"
          >
            <Search
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground"
            />
            <input
              ref={inputRef}
              type="search"
              aria-label="Tìm video, kênh hoặc dán link YouTube"
              placeholder="Tìm video, kênh hoặc dán link YouTube…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setView(event.target.value.trim() ? "videos" : "channels");
                setError(null);
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/30"
            />
            <button
              type="button"
              onClick={close}
              aria-label="Đóng tìm kiếm"
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
            >
              <X aria-hidden className="size-4" />
            </button>
          </form>
          {error && (
            <p
              id={errorId}
              role="alert"
              className="px-4 pb-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          {!urlLike && (
            <div
              className="flex items-center justify-between gap-2 px-4"
              aria-label="Loại kết quả"
            >
              <div className="flex gap-5">
                {(["channels", "videos"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={view === mode}
                    onClick={() => setView(mode)}
                    className="inline-flex min-h-11 items-center gap-2 border-b-2 border-transparent text-sm text-muted-foreground hover:text-foreground aria-pressed:border-primary aria-pressed:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {mode === "channels" ? (
                      <Users aria-hidden className="size-4" />
                    ) : (
                      <MonitorPlay aria-hidden className="size-4" />
                    )}
                    {mode === "channels" ? "Kênh" : "Video"}
                  </button>
                ))}
              </div>
              <TitleTranslationToggle compact />
            </div>
          )}
        </div>
        {urlLike ? (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              {videoId
                ? "Link YouTube hợp lệ. Nhấn Enter để mở video."
                : "Dán link của một video YouTube để mở."}
            </p>
            {videoId && (
              <Link
                href={`/watch/${videoId}`}
                onClick={close}
                className="mt-3 flex min-h-11 items-center gap-3 rounded-lg p-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
                  alt=""
                  className="aspect-video w-24 rounded-md object-cover"
                />
                <span className="text-sm font-medium">Mở video YouTube</span>
                <ArrowRight
                  aria-hidden
                  className="ml-auto size-4 text-muted-foreground"
                />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-[minmax(0,1fr)_148px]">
            <nav
              aria-label="Chủ đề khám phá"
              className="flex flex-wrap gap-1 border-b border-border p-3 sm:col-start-2 sm:row-start-1 sm:block sm:border-b-0 sm:border-l"
            >
              <button
                type="button"
                aria-pressed={!topic}
                onClick={() => setTopic(null)}
                className="min-h-10 rounded-md px-2 text-left text-xs text-muted-foreground hover:bg-muted aria-pressed:bg-muted aria-pressed:text-primary focus-visible:outline-2 focus-visible:outline-ring sm:w-full sm:px-3"
              >
                Tất cả
              </button>
              {Object.entries(TOPIC_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={topic === value}
                  onClick={() => setTopic(value as CatalogTopic)}
                  className="min-h-10 rounded-md px-2 text-left text-xs text-muted-foreground hover:bg-muted aria-pressed:bg-muted aria-pressed:text-primary focus-visible:outline-2 focus-visible:outline-ring sm:w-full sm:px-3"
                >
                  {label}
                </button>
              ))}
            </nav>
            <div className="min-w-0 p-3 sm:col-start-1 sm:row-start-1">
              <p
                role="status"
                className="mb-2 px-2 text-xs text-muted-foreground"
              >
                {view === "videos"
                  ? `${filtered.length} video phù hợp`
                  : `${channels.length} kênh trong thư viện`}
              </p>
              {view === "channels" ? (
                <ul>
                  {channels.map((channel) => {
                    const videos = catalog.filter(
                      (video) => video.channel === channel,
                    );
                    const cover = videos[0];
                    return (
                      <li key={channel}>
                        <button
                          type="button"
                          onClick={() => {
                            setQuery(channel);
                            setChannel(channel);
                            setTopic(null);
                            setView("videos");
                          }}
                          className="flex min-h-16 w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                        >
                          {/* A representative video image, not an invented channel avatar. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://i.ytimg.com/vi/${cover.id}/hqdefault.jpg`}
                            alt=""
                            loading="lazy"
                            title={`Ảnh video: ${cover.title}`}
                            className="size-11 shrink-0 rounded-full bg-muted object-cover"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {channel}
                            </span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {videos.length} video trong thư viện
                            </span>
                          </span>
                          <ArrowRight
                            aria-hidden
                            className="size-4 shrink-0 text-muted-foreground"
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul>
                  {filtered.slice(0, PICKER_RESULT_LIMIT).map((video) => (
                    <li key={video.id}>
                      <Link
                        href={`/watch/${video.id}`}
                        onClick={close}
                        className="flex min-h-18 items-center gap-3 rounded-lg p-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                          alt=""
                          loading="lazy"
                          className="aspect-video w-20 shrink-0 rounded-md bg-muted object-cover sm:w-24"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block line-clamp-2 text-sm font-medium leading-snug">
                            {video.title}
                          </span>
                          {showTitleVi && (
                            <span
                              lang="vi"
                              className="mt-1 block line-clamp-2 text-xs leading-5 text-muted-foreground"
                            >
                              {video.titleVi}
                            </span>
                          )}
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {video.channel} ·{" "}
                            {formatTimestamp(video.durationSec * 1000)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {filtered.length === 0 && (
                <p className="px-2 py-5 text-sm text-muted-foreground">
                  Không có kết quả. Thử từ khóa khác hoặc dán link YouTube.
                </p>
              )}
              {view === "videos" && filtered.length > PICKER_RESULT_LIMIT && (
                <button
                  type="button"
                  onClick={submit}
                  className="mt-2 inline-flex min-h-11 items-center gap-2 px-2 text-xs font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  Xem kết quả trong thư viện{" "}
                  <ArrowRight aria-hidden className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
        <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
          Dán link YouTube để mở video ngoài thư viện.
        </p>
      </dialog>
    </>
  );
}
