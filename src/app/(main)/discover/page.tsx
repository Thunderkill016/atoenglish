import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, History, MonitorPlay, Play } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCatalog } from "@/content/catalog/videos";
import { VideoCard } from "@/components/video-card";
import { RightRail, WidgetCard } from "@/components/right-rail";
import { WeekStrip, currentWeekActivity } from "@/components/week-strip";
import { formatRelativeAge, formatTimestamp } from "@/lib/format";

import { DiscoverCatalog } from "./discover-catalog";
import { DiscoverSearch } from "./discover-search";

export const metadata: Metadata = {
  title: "Khám phá",
  description:
    "Dán link YouTube để học tiếng Anh với phụ đề từng câu, hoặc chọn video từ thư viện chọn sẵn.",
};

interface SourceRow {
  external_id: string;
  title: string | null;
  channel: string | null;
  duration_ms: number | null;
  last_position_ms: number;
  updated_at: string;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const CONTINUE_LIMIT = 7; // banner takes slot 1, strip shows the rest
const RECENT_LIMIT = 3;
const ACTIVITY_DATES_LIMIT = 50;
/** A stray <30 s touch doesn't earn a "Đang xem dở" slot (YouTube pattern). */
const RESUME_MIN_MS = 30_000;
/** Past this share the video counts as watched, not resumable. */
const WATCHED_PCT = 0.95;

function isResumable(s: SourceRow): boolean {
  if (s.last_position_ms < RESUME_MIN_MS) return false;
  if (s.duration_ms && s.last_position_ms / s.duration_ms >= WATCHED_PCT)
    return false;
  return true;
}

async function loadViewerData(): Promise<{
  signedIn: boolean;
  continueWatching: SourceRow[];
  recentSources: SourceRow[];
  videosThisWeek: number;
  totalSources: number;
  activityDates: string[];
}> {
  const guest = {
    signedIn: false,
    continueWatching: [],
    recentSources: [],
    videosThisWeek: 0,
    totalSources: 0,
    activityDates: [],
  };
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return guest;
    }

    const { data: sources } = await supabase
      .from("content_sources")
      .select(
        "external_id, title, channel, duration_ms, last_position_ms, updated_at",
      )
      .eq("user_id", user.id)
      .eq("kind", "youtube")
      .gt("last_position_ms", 0)
      .order("updated_at", { ascending: false })
      .limit(CONTINUE_LIMIT);
    const continueWatching = ((sources ?? []) as SourceRow[]).filter(
      isResumable,
    );

    const { data: recent } = await supabase
      .from("content_sources")
      .select(
        "external_id, title, channel, duration_ms, last_position_ms, updated_at",
      )
      .eq("user_id", user.id)
      .eq("kind", "youtube")
      .order("updated_at", { ascending: false })
      .limit(RECENT_LIMIT);

    const weekAgo = new Date(Date.now() - WEEK_MS).toISOString();
    const { data: weekRows, count } = await supabase
      .from("content_sources")
      .select("updated_at", { count: "exact" })
      .eq("user_id", user.id)
      .eq("kind", "youtube")
      .gte("updated_at", weekAgo)
      .order("updated_at", { ascending: false })
      .limit(ACTIVITY_DATES_LIMIT);

    const { count: totalCount } = await supabase
      .from("content_sources")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("kind", "youtube");

    return {
      signedIn: true,
      continueWatching,
      recentSources: (recent ?? []) as SourceRow[],
      videosThisWeek: count ?? 0,
      totalSources: totalCount ?? 0,
      activityDates: (weekRows ?? []).map((r) => r.updated_at as string),
    };
  } catch {
    // Missing Neon config (e.g. preview deploys without worker secrets) →
    // render the guest variant instead of failing the page.
    return guest;
  }
}

export default async function DiscoverPage() {
  const {
    signedIn,
    continueWatching,
    recentSources,
    videosThisWeek,
    totalSources,
    activityDates,
  } = await loadViewerData();

  const hero = continueWatching[0] ?? null;
  const strip = hero ? continueWatching.slice(1) : [];
  const week = currentWeekActivity(activityDates);
  const catalog = getCatalog();
  const catalogSize = catalog.length;
  const topicCount = new Set(catalog.map((v) => v.topic)).size;

  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {/* Floating search row — Trancy-style: the paste field is the
            page header (greeting/H1 removed to match Trancy home). */}
        <section className="max-w-xl space-y-3">
          <DiscoverSearch />
          {!signedIn && (
            <p className="text-sm text-muted-foreground">
              Xem được ngay, không cần tài khoản —{" "}
              <Link href="/login" className="text-primary hover:underline">
                Đăng nhập
              </Link>{" "}
              để lưu tiến trình xem.
            </p>
          )}
        </section>

        {/* Single "next action" CTA for returning learners — the resume
            banner (Anki Study Now / Drops last-topic pattern). */}
        {hero && (
          <Link
            href={`/watch/${hero.external_id}?t=${hero.last_position_ms}`}
            className="group flex items-center gap-4 rounded-xl border border-border bg-card p-3 transition hover:border-primary/50"
          >
            <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-muted sm:w-36">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://i.ytimg.com/vi/${hero.external_id}/hqdefault.jpg`}
                alt={hero.title ?? "Video YouTube"}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                <Play className="h-6 w-6 text-white" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-muted-foreground">
                Đang xem dở
              </p>
              <p className="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug">
                {hero.title ?? "Video YouTube"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Xem tiếp từ {formatTimestamp(hero.last_position_ms)}
                {hero.duration_ms != null &&
                  hero.duration_ms > hero.last_position_ms &&
                  ` · còn ~${Math.ceil((hero.duration_ms - hero.last_position_ms) / 60_000)}′`}
              </p>
            </div>
          </Link>
        )}

        {strip.length > 0 && (
          <section>
            <h2 className="mb-3 text-base font-semibold tracking-tight">
              Đang xem dở
            </h2>
            <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1">
              {strip.map((v) => (
                <VideoCard
                  key={v.external_id}
                  videoId={v.external_id}
                  title={v.title ?? "Video YouTube"}
                  channel={v.channel}
                  durationMs={v.duration_ms}
                  positionMs={v.last_position_ms}
                  ageLabel={formatRelativeAge(v.updated_at)}
                  className="w-56 shrink-0 sm:w-64"
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-base font-semibold tracking-tight">
            Thư viện chọn sẵn
          </h2>
          <DiscoverCatalog videos={getCatalog()} />
        </section>

        <p className="text-xs text-muted-foreground">
          Thư viện được chọn tay và sẽ tiếp tục lớn dần — mọi video YouTube có
          phụ đề tiếng Anh đều học được, chỉ cần dán link vào ô phía trên.
        </p>
      </div>

      <RightRail>
        {signedIn ? (
          <>
            <WidgetCard
              title="Tuần này"
              action={
                <span className="text-xs text-muted-foreground">
                  {videosThisWeek} video
                </span>
              }
            >
              <WeekStrip
                days={week.days}
                activeDays={week.activeDays}
                todayIndex={week.todayIndex}
              />
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                Ôn tập từ vựng sẽ hiện ở đây khi bạn lưu từ đầu tiên.
              </p>
            </WidgetCard>
            <WidgetCard title="Bộ sưu tập">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-muted p-3">
                  <MonitorPlay className="h-4 w-4 text-primary" />
                  <p className="mt-1.5 text-lg font-bold leading-none">
                    {totalSources}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Video đã mở
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <History className="h-4 w-4 text-primary" />
                  <p className="mt-1.5 text-lg font-bold leading-none">
                    {continueWatching.length}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Đang xem dở
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Từ vựng và câu đã lưu sẽ hiện ở đây khi tính năng lưu ra mắt.
              </p>
            </WidgetCard>
            {recentSources.length > 0 && (
              <WidgetCard title="Hoạt động">
                <ul className="space-y-2.5">
                  {recentSources.map((s) => (
                    <li key={s.external_id}>
                      <Link
                        href={`/watch/${s.external_id}${
                          isResumable(s) ? `?t=${s.last_position_ms}` : ""
                        }`}
                        className="line-clamp-1 text-sm font-medium hover:text-primary hover:underline"
                      >
                        {s.title ?? "Video YouTube"}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {isResumable(s)
                          ? `Xem đến ${formatTimestamp(s.last_position_ms)} · `
                          : ""}
                        {formatRelativeAge(s.updated_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              </WidgetCard>
            )}
          </>
        ) : (
          <>
            <WidgetCard title="Bắt đầu từ đây">
              <p className="text-xs text-muted-foreground">
                Dán link YouTube → xem phụ đề từng câu → luyện lại ngay trên
                video. Không cần tài khoản.
              </p>
              <ul className="mt-3 space-y-2">
                {getCatalog()
                  .filter((v) => v.level === "easy")
                  .slice(0, 3)
                  .map((v) => (
                    <li key={v.id}>
                      <Link
                        href={`/watch/${v.id}`}
                        className="line-clamp-1 text-sm font-medium hover:text-primary hover:underline"
                      >
                        {v.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {v.channel} · {formatTimestamp(v.durationSec * 1000)}
                      </p>
                    </li>
                  ))}
              </ul>
            </WidgetCard>
            <WidgetCard title="Lịch">
              <WeekStrip
                days={week.days}
                activeDays={week.activeDays}
                todayIndex={week.todayIndex}
              />
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                Đăng nhập để lịch ghi lại ngày bạn học.
              </p>
            </WidgetCard>
            <WidgetCard title="Thư viện">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-muted p-3">
                  <MonitorPlay className="h-4 w-4 text-primary" />
                  <p className="mt-1.5 text-lg font-bold leading-none">
                    {catalogSize}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Video</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <History className="h-4 w-4 text-primary" />
                  <p className="mt-1.5 text-lg font-bold leading-none">
                    {topicCount}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Chủ đề</p>
                </div>
              </div>
            </WidgetCard>
          </>
        )}
      </RightRail>
    </div>
  );
}
