import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Headphones,
  Repeat2,
  Captions,
  MonitorPlay,
  Library,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCatalog } from "@/content/catalog/videos";
import { VideoCard } from "@/components/video-card";
import { RightRail, WidgetCard } from "@/components/right-rail";
import {
  ActivityGrid,
  activityDayKey,
  activityHistory,
  activityWindowStart,
} from "@/components/activity-grid";
import { WeekStrip, currentWeekActivity } from "@/components/week-strip";
import { formatRelativeAge, formatTimestamp } from "@/lib/format";
import { DiscoverCatalog } from "./discover-catalog";
import { DiscoverSearch, DiscoverSearchProvider } from "./discover-search";

export const metadata: Metadata = {
  title: "Khám phá",
  description:
    "Dán link YouTube hoặc chọn video để học tiếng Anh với phụ đề từng câu.",
};

interface SourceRow {
  external_id: string;
  title: string | null;
  channel: string | null;
  duration_ms: number | null;
  last_position_ms: number;
  updated_at: string;
}

interface LearningStats {
  dueCards: number;
  totalCards: number;
  weekAttempts: number;
  totalAttempts: number;
  /** ISO timestamps of real learning events — practice attempts + card saves. */
  activityDates: string[];
}

type ViewerData =
  | { status: "guest" }
  | { status: "unavailable" }
  | {
      status: "ready";
      continueWatching: SourceRow[];
      totalSources: number;
      learning: LearningStats;
    };

// Fetch a small recent-source window so completed videos do not crowd out resume slots.
const RECENT_SOURCE_LIMIT = 30;
const CONTINUE_LIMIT = 7;
// Skip incidental touches; these thresholds describe resume eligibility, not mastery.
const RESUME_MIN_MS = 30_000;
const WATCHED_PCT = 0.95;
const NO_SESSION_STATUS = 401;
// Fetch bound for the activity heatmap — a query cap, not a product limit.
const ACTIVITY_FETCH_LIMIT = 5000;

function isResumable(s: SourceRow): boolean {
  return (
    s.last_position_ms >= RESUME_MIN_MS &&
    (!s.duration_ms || s.last_position_ms / s.duration_ms < WATCHED_PCT)
  );
}

async function loadViewerData(): Promise<ViewerData> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        status:
          !authError || authError.status === NO_SESSION_STATUS
            ? "guest"
            : "unavailable",
      };
    }
    const activitySince = activityWindowStart().toISOString();
    const nowIso = new Date().toISOString();
    const [
      sourcesResult,
      countResult,
      dueResult,
      cardsResult,
      attemptsResult,
      cardDatesResult,
      totalAttemptsResult,
    ] = await Promise.all([
      supabase
        .from("content_sources")
        .select(
          "external_id, title, channel, duration_ms, last_position_ms, updated_at",
        )
        .eq("user_id", user.id)
        .eq("kind", "youtube")
        .gte("last_position_ms", RESUME_MIN_MS)
        .order("updated_at", { ascending: false })
        .limit(RECENT_SOURCE_LIMIT),
      supabase
        .from("content_sources")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("kind", "youtube"),
      // Same due rule as getReviewQueue: unscheduled (null) or past-due cards.
      supabase
        .from("study_cards")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .or(`due.is.null,due.lte.${nowIso}`),
      supabase
        .from("study_cards")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("practice_attempts")
        .select("created_at")
        .eq("user_id", user.id)
        .gte("created_at", activitySince)
        .order("created_at", { ascending: false })
        .limit(ACTIVITY_FETCH_LIMIT),
      // Real event timestamps only — resume snapshots (updated_at) cannot
      // reconstruct a history and must not paint activity days.
      supabase
        .from("study_cards")
        .select("created_at")
        .eq("user_id", user.id)
        .gte("created_at", activitySince),
      supabase
        .from("practice_attempts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);
    const results = [
      sourcesResult,
      countResult,
      dueResult,
      cardsResult,
      attemptsResult,
      cardDatesResult,
      totalAttemptsResult,
    ];
    // A failed read is not an empty library. Keep the public catalog usable.
    if (
      results.some((r) => r.error) ||
      countResult.count == null ||
      dueResult.count == null ||
      cardsResult.count == null ||
      totalAttemptsResult.count == null
    ) {
      console.error("[discover] Could not load viewer data");
      return { status: "unavailable" };
    }
    const attemptDates = (
      (attemptsResult.data ?? []) as {
        created_at: string;
      }[]
    ).map((row) => row.created_at);
    const weekStartKey = currentWeekActivity([]).weekStartKey;
    const learning: LearningStats = {
      dueCards: dueResult.count,
      totalCards: cardsResult.count,
      weekAttempts: attemptDates.filter(
        (date) => activityDayKey(date) >= weekStartKey,
      ).length,
      totalAttempts: totalAttemptsResult.count,
      activityDates: [
        ...attemptDates,
        ...((cardDatesResult.data ?? []) as { created_at: string }[]).map(
          (row) => row.created_at,
        ),
      ],
    };
    return {
      status: "ready",
      continueWatching: ((sourcesResult.data ?? []) as SourceRow[])
        .filter(isResumable)
        .slice(0, CONTINUE_LIMIT),
      totalSources: countResult.count,
      learning,
    };
  } catch {
    // Isolate auth/Data API failures to the personal panel, without logging credentials.
    console.error("[discover] Viewer data unavailable");
    return { status: "unavailable" };
  }
}

export default async function DiscoverPage() {
  const viewer = await loadViewerData();
  const continueWatching =
    viewer.status === "ready" ? viewer.continueWatching : [];
  const hero = continueWatching[0] ?? null;
  const strip = continueWatching.slice(1);
  const learning = viewer.status === "ready" ? viewer.learning : null;
  const week = currentWeekActivity(learning?.activityDates ?? []);
  const activity = activityHistory(learning?.activityDates ?? []);
  const catalog = getCatalog();
  const topicCount = new Set(catalog.map((video) => video.topic)).size;

  return (
    <DiscoverSearchProvider>
      <div className="discover-home grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6 rounded-xl bg-background p-2 md:px-6 md:py-5">
          <header>
            <h1 className="sr-only">Khám phá</h1>
            {/* Remote YouTube search exists in the UI only when the server
                holds the key — SPEC §10 hidden-without-key contract. */}
            <DiscoverSearch
              youtubeSearchEnabled={Boolean(process.env.YOUTUBE_DATA_API_KEY)}
            />
          </header>

          {hero && (
            <section aria-label="Tiếp tục xem">
              <h2 className="mb-3 text-lg font-semibold">Tiếp tục xem</h2>
              <Link
                href={`/watch/${hero.external_id}?t=${hero.last_position_ms}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
              >
                <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:w-40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${hero.external_id}/hqdefault.jpg`}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <Play aria-hidden className="h-6 w-6 text-white" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[15px] font-semibold leading-snug">
                    {hero.title ?? "Video YouTube"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {hero.channel ?? "YouTube"}
                  </p>
                  <p className="mt-2 text-xs font-medium text-primary">
                    Xem tiếp từ {formatTimestamp(hero.last_position_ms)}
                  </p>
                </div>
                <ArrowRight
                  aria-hidden
                  className="hidden size-5 shrink-0 text-primary sm:block"
                />
              </Link>
              {strip.length > 0 && (
                <details className="mt-4">
                  <summary className="w-fit cursor-pointer text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring">
                    {strip.length} video khác đang xem dở
                  </summary>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {strip.map((v) => (
                      <VideoCard
                        key={v.external_id}
                        videoId={v.external_id}
                        title={v.title ?? "Video YouTube"}
                        channel={v.channel}
                        durationMs={v.duration_ms}
                        positionMs={v.last_position_ms}
                        ageLabel={formatRelativeAge(v.updated_at)}
                        href={`/watch/${v.external_id}?t=${v.last_position_ms}`}
                      />
                    ))}
                  </div>
                </details>
              )}
            </section>
          )}

          <section
            id="video-library"
            aria-label="Thư viện chọn sẵn"
            className="scroll-mt-6"
          >
            <DiscoverCatalog videos={getCatalog()} />
          </section>
          <p className="text-xs leading-5 text-muted-foreground">
            Không tìm thấy video bạn muốn? Dán link phía trên. Nếu chưa lấy được
            phụ đề, bạn có thể thêm bản chép lời trong player.
          </p>
        </div>

        <RightRail>
          <WidgetCard title="Lịch tuần" className="bg-transparent p-0">
            {viewer.status === "unavailable" ? (
              <p className="px-3 pb-3 text-sm text-muted-foreground">
                Chưa tải được lịch hoạt động.
              </p>
            ) : (
              <WeekStrip
                days={week.days}
                activeDays={week.activeDays}
                todayIndex={week.todayIndex}
              />
            )}
          </WidgetCard>
          <WidgetCard
            title="Flashcard"
            action={
              learning ? (
                <Link
                  href="/review"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Ôn tập →
                </Link>
              ) : undefined
            }
          >
            {learning ? (
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Cần ôn</dt>
                  <dd className="mt-2 text-xl font-semibold tabular-nums">
                    {learning.dueCards}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Đang học</dt>
                  <dd className="mt-2 text-xl font-semibold tabular-nums">
                    {learning.totalCards}
                  </dd>
                </div>
              </dl>
            ) : viewer.status === "unavailable" ? (
              <p className="text-sm leading-6 text-muted-foreground">
                Chưa tải được dữ liệu thẻ ôn tập.
              </p>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Đăng nhập để lưu từ, câu và ôn tập theo lịch.
              </p>
            )}
          </WidgetCard>
          <WidgetCard title="Thống kê" className="bg-transparent p-0">
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-card p-3">
                <MonitorPlay
                  aria-hidden
                  className="float-right size-5 text-primary"
                />
                <dt className="text-xs text-muted-foreground">
                  Video chọn sẵn
                </dt>
                <dd className="mt-2 text-xl font-semibold">{catalog.length}</dd>
              </div>
              <div className="rounded-xl bg-card p-3">
                <Library
                  aria-hidden
                  className="float-right size-5 text-state-learning"
                />
                <dt className="text-xs text-muted-foreground">Chủ đề</dt>
                <dd className="mt-2 text-xl font-semibold">{topicCount}</dd>
              </div>
            </dl>
          </WidgetCard>
          <WidgetCard title="Tiến trình xem">
            {viewer.status === "guest" ? (
              <>
                <p className="text-xs leading-5 text-muted-foreground">
                  Đăng nhập để lưu vị trí và xem tiếp lần sau.
                </p>
                <Link
                  href="/login"
                  className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  Đăng nhập
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </>
            ) : viewer.status === "unavailable" ? (
              <div role="status">
                <p className="text-sm font-medium">
                  Chưa tải được tiến trình xem
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Bạn vẫn có thể chọn video hoặc dán link để xem.
                </p>
                <a
                  href="/discover"
                  className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-primary underline underline-offset-4"
                >
                  Thử tải lại
                </a>
              </div>
            ) : (
              <>
                <p className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tabular-nums">
                    {viewer.totalSources}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    video đã mở
                  </span>
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {hero
                    ? "Video đang xem dở nằm ngay phía trên thư viện. Bạn có thể tiếp tục từ vị trí đã lưu."
                    : "Chọn một video để bắt đầu. Vị trí xem sẽ được lưu khi bạn quay lại."}
                </p>
              </>
            )}
          </WidgetCard>
          <WidgetCard title="Activity" className="bg-transparent p-0">
            {viewer.status === "unavailable" ? (
              <p className="px-3 pb-3 text-sm text-muted-foreground">
                Chưa tải được lịch hoạt động.
              </p>
            ) : (
              <ActivityGrid activity={activity} />
            )}
          </WidgetCard>
          <WidgetCard title="Progress">
            {learning ? (
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Ôn tuần này</dt>
                  <dd className="mt-2 text-xl font-semibold tabular-nums">
                    {learning.weekAttempts}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Tổng lượt ôn
                  </dt>
                  <dd className="mt-2 text-xl font-semibold tabular-nums">
                    {learning.totalAttempts}
                  </dd>
                </div>
              </dl>
            ) : viewer.status === "unavailable" ? (
              <p className="text-sm leading-6 text-muted-foreground">
                Chưa tải được dữ liệu luyện tập.
              </p>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                Đăng nhập để ghi lại tiến độ luyện tập.
              </p>
            )}
          </WidgetCard>
          <WidgetCard title="Học với video" className="bg-transparent p-0">
            <ol className="space-y-5">
              <li className="flex gap-3">
                <Headphones
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-primary"
                />
                <div>
                  <p className="text-sm font-medium">Nghe từng câu</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Bật tự dừng để có thời gian đọc phụ đề.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Repeat2
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-primary"
                />
                <div>
                  <p className="text-sm font-medium">Nghe lại đoạn khó</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Lặp câu hoặc giảm tốc độ ngay trong player.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <Captions
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-primary"
                />
                <div>
                  <p className="text-sm font-medium">Đọc theo nhịp của bạn</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Chuyển sang chế độ đọc để xem phụ đề liền mạch.
                  </p>
                </div>
              </li>
            </ol>
          </WidgetCard>
        </RightRail>
      </div>
    </DiscoverSearchProvider>
  );
}
