"use client";

import { useMemo, useState } from "react";
import { SearchX, SlidersHorizontal, Clock3 } from "lucide-react";

import {
  CAPTION_LABELS,
  LEVEL_LABELS,
  TOPIC_LABELS,
  type CatalogLevel,
  type CatalogTopic,
  type CatalogVideo,
} from "@/content/catalog/videos";
import { EmptyState } from "@/components/empty-state";
import { FilterChips } from "@/components/filter-chips";
import { LevelSegment } from "@/components/level-segment";
import { VideoCard } from "@/components/video-card";
import {
  useDiscoverQuery,
  normalizeDiscoverQuery,
  TitleTranslationToggle,
} from "./discover-search";

/**
 * "Thư viện chọn sẵn" — client-side topic chips + level segment filtering the
 * curated catalog (REDESIGN §5.1). Filtering stays in the browser so the
 * chips respond instantly; the page itself remains a server component.
 */
// A ten-minute option helps learners choose a short session, not a proficiency level.
const SHORT_VIDEO_SECONDS = 10 * 60;

export function DiscoverCatalog({ videos }: { videos: CatalogVideo[] }) {
  const { showTitleVi, query, setQuery, channel, topic, setTopic } =
    useDiscoverQuery();
  const [shortOnly, setShortOnly] = useState(false);
  const [level, setLevel] = useState<string | null>(null);

  const topicOptions = useMemo(() => {
    const seen = new Set<CatalogTopic>();
    for (const v of videos) seen.add(v.topic);
    return [...seen].map((t) => ({ value: t, label: TOPIC_LABELS[t] }));
  }, [videos]);

  const levelOptions = useMemo(() => {
    const order: CatalogLevel[] = ["easy", "medium", "hard"];
    return order
      .filter((l) => videos.some((v) => v.level === l))
      .map((l) => ({ value: l, label: LEVEL_LABELS[l] }));
  }, [videos]);

  const normalizedQuery = normalizeDiscoverQuery(query);
  const hasFilters = Boolean(topic || level || shortOnly || normalizedQuery);
  const filtered = videos.filter(
    (v) =>
      (!channel || v.channel === channel) &&
      (!topic || v.topic === topic) &&
      (!level || v.level === level) &&
      (!shortOnly || v.durationSec <= SHORT_VIDEO_SECONDS) &&
      (!normalizedQuery ||
        normalizeDiscoverQuery(
          `${v.title} ${v.titleVi} ${v.channel} ${TOPIC_LABELS[v.topic]}`,
        ).includes(normalizedQuery)),
  );
  const reset = () => {
    setTopic(null);
    setLevel(null);
    setQuery("");
    setShortOnly(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Thư viện chọn sẵn
        </h2>
        <div className="flex items-center gap-2">
          <p role="status" className="text-xs text-muted-foreground">
            {filtered.length} video{hasFilters ? ` / ${videos.length}` : ""}
          </p>
          <TitleTranslationToggle />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <FilterChips
          options={topicOptions}
          value={topic}
          onChange={setTopic}
          allLabel="Tất cả"
          className="flex-wrap gap-x-4 overflow-visible"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={shortOnly}
            onClick={() => setShortOnly(!shortOnly)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-ring ${shortOnly ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}
          >
            <Clock3 aria-hidden className="size-4" />
            ≤10 phút
          </button>
          <details className="group contents">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
              <SlidersHorizontal aria-hidden className="size-4" />
              Mức độ{level ? ` · ${LEVEL_LABELS[level as CatalogLevel]}` : ""}
            </summary>
            <div className="order-last w-full rounded-xl bg-card p-3">
              <LevelSegment
                options={levelOptions}
                value={level}
                onChange={setLevel}
                allLabel="Tất cả"
              />
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Mức độ do thư viện ước lượng, chỉ để chọn video.
              </p>
            </div>
          </details>
          {hasFilters && (
            <button
              type="button"
              onClick={reset}
              className="min-h-11 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            >
              Xoá bộ lọc
            </button>
          )}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div>
          <EmptyState
            icon={SearchX}
            title="Không có video phù hợp"
            body="Thử chọn chủ đề hoặc mức độ khác."
          />
        </div>
      ) : (
        <div className="grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((v) => (
            <VideoCard
              key={v.id}
              videoId={v.id}
              title={v.title}
              titleVi={showTitleVi ? v.titleVi : undefined}
              channel={v.channel}
              topicLabel={TOPIC_LABELS[v.topic]}
              level={v.level}
              levelLabel={LEVEL_LABELS[v.level]}
              captionLabel={CAPTION_LABELS[v.captions]}
              durationMs={v.durationSec * 1000}
            />
          ))}
        </div>
      )}
    </div>
  );
}
