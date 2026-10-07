import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Headphones,
  Repeat2,
  Captions,
  BookMarked,
  TextQuote,
  MonitorPlay,
  Library,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCatalog } from "@/content/catalog/videos";
import { VideoCard } from "@/components/video-card";
import { RightRail, WidgetCard, ProgressChart } from "@/components/right-rail";
import { WeekStrip, currentWeekActivity } from "@/components/week-strip";
import { ActivityGrid, activityHistory } from "@/components/activity-grid";
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

type ViewerData =
  | { status: "guest" }
  | { status: "unavailable" }
  | { status: "ready"; continueWatching: SourceRow[]; totalSources: number };

// Fetch a small recent-source window so completed videos do not crowd out resume slots.
const RECENT_SOURCE_LIMIT = 30;
const CONTINUE_LIMIT = 7;
// Skip incidental touches; these thresholds describe resume eligibility, not mastery.
const RESUME_MIN_MS = 30_000;
const WATCHED_PCT = 0.95;
const NO_SESSION_STATUS = 401;

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
    const [sourcesResult, countResult] = await Promise.all([
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
    ]);
    // A failed read is not an empty library. Keep the public catalog usable.
    if (sourcesResult.error || countResult.error || countResult.count == null) {
      console.error("[discover] Could not load viewer sources");
      return { status: "unavailable" };
    }
    return {
      status: "ready",
      continueWatching: ((sourcesResult.data ?? []) as SourceRow[])
        .filter(isResumable)
        .slice(0, CONTINUE_LIMIT),
      totalSources: countResult.count,
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
  // Resume snapshots are not a learning-event history. Show a neutral week with today only.
  const week = currentWeekActivity([]);
  const activity = activityHistory([]);
  const catalog = getCatalog();
  const topicCount = new Set(catalog.map((video) => video.topic)).size;

  return (
    <DiscoverSearchProvider>
      <div className="discover-home grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6 rounded-xl bg-background p-2 md:px-6 md:py-5">
          <header>
            <h1 className="sr-only">Khám phá</h1>
            <DiscoverSearch />
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
          <WidgetCard
            title="Lịch tuần"
            className="bg-transparent p-0"
            action={
              <span className="text-xs text-muted-foreground">Hôm nay</span>
            }
          >
            <WeekStrip
              days={week.days}
              activeDays={week.activeDays}
              todayIndex={week.todayIndex}
            />
          </WidgetCard>
          <WidgetCard
            title="Flashcard"
            info="Thống kê thẻ và lượt ôn sẽ xuất hiện khi dữ liệu ôn tập được kết nối."
          >
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-muted-foreground">Cần ôn</dt>
                <dd
                  className="mt-2 text-xl font-semibold"
                  aria-label="Cần ôn: chưa có dữ liệu"
                >
                  —
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Đang học</dt>
                <dd
                  className="mt-2 text-xl font-semibold"
                  aria-label="Đang học: chưa có dữ liệu"
                >
                  —
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Dữ liệu ôn tập chưa kết nối.
            </p>
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
              <div className="rounded-xl bg-card p-3">
                <BookMarked
                  aria-hidden
                  className="float-right size-5 text-state-due"
                />
                <dt className="text-xs text-muted-foreground">
                  Từ vựng đã lưu
                </dt>
                <dd
                  className="mt-2 text-xl font-semibold"
                  aria-label="Từ vựng đã lưu: chưa có dữ liệu"
                >
                  —
                </dd>
              </div>
              <div className="rounded-xl bg-card p-3">
                <TextQuote
                  aria-hidden
                  className="float-right size-5 text-state-known"
                />
                <dt className="text-xs text-muted-foreground">Câu đã lưu</dt>
                <dd
                  className="mt-2 text-xl font-semibold"
                  aria-label="Câu đã lưu: chưa có dữ liệu"
                >
                  —
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Dấu —: chưa có dữ liệu cá nhân được kết nối.
            </p>
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
          <WidgetCard
            title="Activity"
            info="Lịch hoạt động học tập; vị trí xem gần nhất không thay thế lịch sử học."
            className="bg-transparent p-0"
          >
            <ActivityGrid activity={activity} />
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              {viewer.status === "guest"
                ? "Đăng nhập để lưu hoạt động cá nhân. "
                : ""}
              Chưa có dữ liệu lịch sử học được kết nối.
            </p>
          </WidgetCard>
          <WidgetCard
            title="Progress"
            info="Tiến độ dựa trên kết quả ôn tập, không suy từ số video đã mở."
            className="bg-transparent p-0"
          >
            <ProgressChart />
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
