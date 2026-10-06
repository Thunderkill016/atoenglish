"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";

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

/**
 * "Thư viện chọn sẵn" — client-side topic chips + level segment filtering the
 * curated catalog (REDESIGN §5.1). Filtering stays in the browser so the
 * chips respond instantly; the page itself remains a server component.
 */
export function DiscoverCatalog({ videos }: { videos: CatalogVideo[] }) {
  const [topic, setTopic] = useState<string | null>(null);
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

  const filtered = videos.filter(
    (v) => (!topic || v.topic === topic) && (!level || v.level === level),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <FilterChips
          options={topicOptions}
          value={topic}
          onChange={setTopic}
          allLabel="Tất cả"
          className="min-w-0 flex-1"
        />
        <LevelSegment
          options={levelOptions}
          value={level}
          onChange={setLevel}
          allLabel="Tất cả"
        />
      </div>

      {filtered.length === 0 ? (
        <div>
          <EmptyState
            icon={SearchX}
            title="Không có video phù hợp"
            body="Thử chọn chủ đề hoặc mức độ khác."
          />
          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => {
                setTopic(null);
                setLevel(null);
              }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Xoá bộ lọc
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((v) => (
            <VideoCard
              key={v.id}
              videoId={v.id}
              title={v.title}
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
