import type { Metadata } from "next";
import Link from "next/link";
import {
  BookMarked,
  CalendarDays,
  History,
  MonitorPlay,
  Play,
  TextQuote,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCatalog, TOPIC_LABELS, type CatalogTopic } from "@/content/catalog/videos";
import { VideoCard } from "@/components/video-card";
import { RightRail, WidgetCard } from "@/components/right-rail";
import { WeekStrip, currentWeekActivity } from "@/components/week-strip";
import { ActivityGrid, monthActivity } from "@/components/activity-grid";
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
/** Month-grid window — covers the current month plus a few overflow days. */
const ACTIVITY_WINDOW_MS = 40 * 24 * 60 * 60 * 1000;
const CONTINUE_LIMIT = 7; // banner takes slot 1, strip shows the rest
const ACTIVITY_DATES_LIMIT = 200;
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
  videosThisWeek: number;
  totalSources: number;
  activityDates: string[];
}> {
  const guest = {
    signedIn: false,
    continueWatching: [],
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

    const weekAgo = new Date(Date.now() - WEEK_MS).toISOString();
    const activityAgo = new Date(Date.now() - ACTIVITY_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from("content_sources")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("kind", "youtube")
      .gte("updated_at", weekAgo);
    const { data: weekRows } = await supabase
      .from("content_sources")
      .select("updated_at")
      .eq("user_id", user.id)
      .eq("kind", "youtube")
      .gte("updated_at", activityAgo)
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
    videosThisWeek,
    totalSources,
    activityDates,
  } = await loadViewerData();

  const hero = continueWatching[0] ?? null;
  const strip = hero ? continueWatching.slice(1) : [];
  const week = currentWeekActivity(activityDates);
  const month = monthActivity(activityDates);
  const catalog = getCatalog();
  const catalogSize = catalog.length;
  const topicCount = new Set(catalog.map((v) => v.topic)).size;
  const topics = [...catalog]
    .reduce((map, v) => {
      map.set(v.topic, (map.get(v.topic) ?? 0) + 1);
      return map;
    }, new Map<CatalogTopic, number>())
    .entries()
    .toArray()
    .map(([topic, count]) => ({ label: TOPIC_LABELS[topic], count }));
  const easyCount = catalog.filter((v) => v.level === "easy").length;
  const totalMin = Math.round(
    catalog.reduce((s, v) => s + v.durationSec, 0) / 60,
  );

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

      <RightRail className="xl:-mr-4 xl:top-0 xl:max-h-dvh xl:py-5 xl:pl-2 xl:pr-4">
        {/* Trancy rail order: Calendar → Flashcard-ish → tiles → Activity. */}
        <WidgetCard
          title="Lịch"
          action={
            signedIn ? (
              <span className="text-xs text-muted-foreground">
                {videosThisWeek} video tuần này
              </span>
            ) : undefined
          }
        >
          <WeekStrip
            days={week.days}
            activeDays={week.activeDays}
            todayIndex={week.todayIndex}
          />
          {!signedIn && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Đăng nhập để lịch ghi lại ngày bạn học.
            </p>
          )}
        </WidgetCard>

        <WidgetCard title="Ôn tập">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted p-3">
              <BookMarked className="h-4 w-4 text-state-learning" />
              <p className="mt-1.5 text-lg font-bold leading-none">0</p>
              <p className="mt-1 text-xs text-muted-foreground">Từ vựng</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <TextQuote className="h-4 w-4 text-state-known" />
              <p className="mt-1.5 text-lg font-bold leading-none">0</p>
              <p className="mt-1 text-xs text-muted-foreground">Câu đã lưu</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Lưu từ và câu ngay trong transcript — tính năng sắp ra mắt.
          </p>
        </WidgetCard>

        <WidgetCard title={signedIn ? "Bộ sưu tập" : "Thư viện"}>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted p-3">
              <MonitorPlay className="h-4 w-4 text-primary" />
              <p className="mt-1.5 text-lg font-bold leading-none">
                {signedIn ? totalSources : catalogSize}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {signedIn ? "Video đã mở" : "Video"}
              </p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <History className="h-4 w-4 text-state-due" />
              <p className="mt-1.5 text-lg font-bold leading-none">
                {signedIn ? continueWatching.length : topicCount}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {signedIn ? "Đang xem dở" : "Chủ đề"}
              </p>
            </div>
            {!signedIn && (
              <>
                <div className="rounded-lg bg-muted p-3">
                  <BookMarked className="h-4 w-4 text-state-known" />
                  <p className="mt-1.5 text-lg font-bold leading-none">
                    {easyCount}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Mức dễ</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <Play className="h-4 w-4 text-state-learning" />
                  <p className="mt-1.5 text-lg font-bold leading-none">
                    {totalMin}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Phút nội dung
                  </p>
                </div>
              </>
            )}
          </div>
        </WidgetCard>

        <WidgetCard title="Hoạt động" action={
          <span className="text-xs capitalize text-muted-foreground">
            {month.monthLabel}
          </span>
        }>
          <ActivityGrid cells={month.cells} />
          {!signedIn && (
            <p className="mt-3 text-xs text-muted-foreground">
              Đăng nhập để ngày học được tô màu ở đây.
            </p>
          )}
        </WidgetCard>

        {!signedIn && (
          <>
            <WidgetCard title="Bắt đầu từ đây">
              <ul className="space-y-2">
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
            <WidgetCard title="Chủ đề">
              <ul className="space-y-2">
                {topics.map((t) => (
                  <li
                    key={t.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{t.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {t.count} video
                    </span>
                  </li>
                ))}
              </ul>
            </WidgetCard>
          </>
        )}
      </RightRail>
    </div>
  );
}
