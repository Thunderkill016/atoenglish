"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  BookMarked,
  Clapperboard,
  Film,
  Pencil,
  Quote,
  Trash2,
} from "lucide-react";

import {
  deleteLibrarySource,
  deleteStudyCard,
  updateCardMeaning,
  type LibraryItem,
  type LibraryVideo,
} from "@/app/actions/library";
import { EmptyState } from "@/components/empty-state";
import { formatRelativeAge, formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";

const CARD_STATE_LABELS = ["Mới", "Đang học", "Ôn tập", "Học lại"] as const;

type Tab = "video" | "words" | "sentences";

const TABS: { id: Tab; label: string }[] = [
  { id: "video", label: "Video" },
  { id: "words", label: "Từ & cụm" },
  { id: "sentences", label: "Câu" },
];

/**
 * `/library` client — three tabs over the learner's content. Words and
 * sentences can be filtered by the source they were saved from; every saved
 * item offers a deep link back to the exact segment, meaning edit and delete
 * (spec §3 "mở lại đúng đoạn; xoá dữ liệu của mình").
 */
export function LibraryClient({
  videos: initialVideos,
  words: initialWords,
  sentences: initialSentences,
}: {
  videos: LibraryVideo[];
  words: LibraryItem[];
  sentences: LibraryItem[];
}) {
  const [tab, setTab] = useState<Tab>("video");
  const [sourceFilter, setSourceFilter] = useState<number | null>(null);
  const [videos, setVideos] = useState(initialVideos);
  const [words, setWords] = useState(initialWords);
  const [sentences, setSentences] = useState(initialSentences);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const items = tab === "sentences" ? sentences : words;

  // Source chips list only sources that actually anchor items in this tab.
  const sourceChips = useMemo(() => {
    const seen = new Map<number, string>();
    for (const item of items) {
      const s = item.context;
      if (s?.source_id != null)
        seen.set(s.source_id, s.source_title ?? "Video");
    }
    return [...seen.entries()].map(([id, title]) => ({ id, title }));
  }, [items]);

  const visibleItems =
    sourceFilter == null
      ? items
      : items.filter((i) => i.context?.source_id === sourceFilter);

  function removeCard(tabKind: Tab, cardId: number) {
    startTransition(async () => {
      const result = await deleteStudyCard(cardId);
      if (!result.ok) {
        setError("Chưa xoá được. Thử lại.");
        return;
      }
      setError(null);
      if (tabKind === "sentences")
        setSentences((s) => s.filter((i) => i.card_id !== cardId));
      else setWords((w) => w.filter((i) => i.card_id !== cardId));
    });
  }

  function saveMeaning(tabKind: Tab, cardId: number, meaning: string) {
    startTransition(async () => {
      const result = await updateCardMeaning({
        card_id: cardId,
        meaning_vi: meaning,
      });
      if (!result.ok) {
        setError("Chưa lưu được nghĩa. Thử lại.");
        return;
      }
      setError(null);
      const patch = (list: LibraryItem[]) =>
        list.map((i) =>
          i.card_id === cardId ? { ...i, meaning_vi: meaning } : i,
        );
      if (tabKind === "sentences") setSentences(patch);
      else setWords(patch);
    });
  }

  function removeSource(sourceId: number) {
    startTransition(async () => {
      const result = await deleteLibrarySource(sourceId);
      if (!result.ok) {
        setError("Chưa xoá được nguồn. Thử lại.");
        return;
      }
      setError(null);
      setVideos((v) => v.filter((i) => i.source_id !== sourceId));
      // Contexts of the deleted source cascade server-side — drop the
      // stale deep links on items still anchored elsewhere.
      const strip = (list: LibraryItem[]) =>
        list.map((i) =>
          i.context?.source_id === sourceId ? { ...i, context: null } : i,
        );
      setWords(strip);
      setSentences(strip);
      if (sourceFilter === sourceId) setSourceFilter(null);
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-xl font-bold">Thư viện</h1>

      <div className="mt-4 flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setSourceFilter(null);
            }}
            className={cn(
              "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {tab === "video" ? (
        <VideoList videos={videos} onDelete={removeSource} />
      ) : (
        <>
          {sourceChips.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              <FilterChip
                active={sourceFilter == null}
                label="Tất cả"
                onClick={() => setSourceFilter(null)}
              />
              {sourceChips.map((chip) => (
                <FilterChip
                  key={chip.id}
                  active={sourceFilter === chip.id}
                  label={chip.title}
                  onClick={() => setSourceFilter(chip.id)}
                />
              ))}
            </div>
          )}
          {visibleItems.length === 0 ? (
            <EmptyState
              className="mt-6"
              icon={BookMarked}
              title={
                tab === "sentences"
                  ? "Chưa có câu nào được lưu"
                  : "Chưa có từ hoặc cụm nào được lưu"
              }
              body="Tra từ trong phụ đề khi xem video rồi bấm Lưu — mục đó sẽ hiện ở đây."
              action={{ label: "Khám phá video", href: "/discover" }}
            />
          ) : (
            <ul className="mt-4 space-y-2">
              {visibleItems.map((item) => (
                <ItemRow
                  key={item.card_id}
                  item={item}
                  onDelete={() => removeCard(tab, item.card_id)}
                  onSaveMeaning={(meaning) =>
                    saveMeaning(tab, item.card_id, meaning)
                  }
                />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "max-w-48 truncate rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/50",
      )}
    >
      {label}
    </button>
  );
}

function VideoList({
  videos,
  onDelete,
}: {
  videos: LibraryVideo[];
  onDelete: (sourceId: number) => void;
}) {
  const [confirming, setConfirming] = useState<number | null>(null);

  if (videos.length === 0) {
    return (
      <EmptyState
        className="mt-6"
        icon={Clapperboard}
        title="Chưa có video nào đã xem"
        body="Mở một video YouTube bất kỳ để xem với phụ đề song ngữ — lịch sử xem sẽ hiện ở đây."
        action={{ label: "Khám phá video", href: "/discover" }}
      />
    );
  }

  return (
    <ul className="mt-4 space-y-2">
      {videos.map((video) => (
        <li
          key={video.source_id}
          className="rounded-xl border border-border bg-card p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link
                href={`/watch/${video.external_id}?t=${video.last_position_ms}`}
                className="block truncate text-sm font-semibold hover:text-primary"
              >
                {video.title ?? `Video ${video.external_id}`}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {video.channel && `${video.channel} · `}
                {video.last_position_ms > 0
                  ? `Xem tiếp từ ${formatTimestamp(video.last_position_ms)}`
                  : "Chưa xem"}{" "}
                · {formatRelativeAge(video.updated_at)}
                {video.saved_count > 0 && ` · ${video.saved_count} mục đã lưu`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Link
                href={`/watch/${video.external_id}?t=${video.last_position_ms}`}
                className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
              >
                Xem tiếp
              </Link>
              <button
                type="button"
                aria-label={`Xoá ${video.title ?? "video"}`}
                onClick={() =>
                  setConfirming((c) =>
                    c === video.source_id ? null : video.source_id,
                  )
                }
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          {confirming === video.source_id && (
            <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs">
              <span>
                Xoá video khỏi thư viện? Các mục đã lưu từ nguồn khác được giữ
                lại.
              </span>
              <button
                type="button"
                onClick={() => onDelete(video.source_id)}
                className="shrink-0 rounded-md bg-destructive px-2.5 py-1 font-medium text-destructive-foreground"
              >
                Xoá
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function ItemRow({
  item,
  onDelete,
  onSaveMeaning,
}: {
  item: LibraryItem;
  onDelete: () => void;
  onSaveMeaning: (meaning: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.meaning_vi ?? "");
  const [confirming, setConfirming] = useState(false);
  const deepLink =
    item.context?.video_id != null
      ? `/watch/${item.context.video_id}?t=${item.context.start_ms ?? 0}`
      : null;

  return (
    <li className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span lang="en" className="text-sm font-semibold">
              {item.display}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {CARD_STATE_LABELS[item.state] ?? "Mới"}
            </span>
          </div>
          {!editing && item.meaning_vi && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {item.meaning_vi}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={`Sửa nghĩa ${item.display}`}
            onClick={() => {
              setDraft(item.meaning_vi ?? "");
              setEditing((e) => !e);
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`Xoá ${item.display}`}
            onClick={() => setConfirming((c) => !c)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {editing && (
        <div className="mt-2 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Nghĩa tiếng Việt…"
            className="min-w-0 flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm"
          />
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={() => {
              onSaveMeaning(draft.trim());
              setEditing(false);
            }}
            className="rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            Lưu
          </button>
        </div>
      )}

      {item.context && (
        <div className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
          <Quote className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
          <span lang="en" className="line-clamp-2">
            {item.context.sentence_text}
          </span>
        </div>
      )}

      <div className="mt-2 flex items-center gap-3 text-xs">
        {deepLink && (
          <Link
            href={deepLink}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            <Film className="h-3.5 w-3.5" aria-hidden />
            Mở đoạn gốc
          </Link>
        )}
        {item.context?.source_title && (
          <span className="truncate text-muted-foreground">
            {item.context.source_title}
          </span>
        )}
      </div>

      {confirming && (
        <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs">
          <span>Xoá mục này khỏi thư viện?</span>
          <button
            type="button"
            onClick={onDelete}
            className="shrink-0 rounded-md bg-destructive px-2.5 py-1 font-medium text-destructive-foreground"
          >
            Xoá
          </button>
        </div>
      )}
    </li>
  );
}
