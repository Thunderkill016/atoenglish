import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, History, LibraryBig } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCatalog } from "@/content/catalog/videos";
import { VideoCard } from "@/components/video-card";
import { RightRail, WidgetCard } from "@/components/right-rail";
import { formatRelativeAge, formatTimestamp } from "@/lib/format";

import { DiscoverCatalog } from "./discover-catalog";
import { DiscoverSearch } from "./discover-search";

export const metadata: Metadata = {
  title: "Khám phá",
  description:
    "Dán link YouTube để học tiếng Anh với phụ đề từng câu, hoặc chọn video từ thư viện chọn sẵn.",
};

interface ContinueItem {
  external_id: string;
  title: string | null;
  channel: string | null;
  duration_ms: number | null;
  last_position_ms: number;
  updated_at: string;
}

interface RecentSource {
  external_id: string;
  title: string | null;
  updated_at: string;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const CONTINUE_LIMIT = 6;
const RECENT_LIMIT = 3;

async function loadViewerData(): Promise<{
  signedIn: boolean;
  continueWatching: ContinueItem[];
  recentSources: RecentSource[];
  videosThisWeek: number;
}> {
  const guest = {
    signedIn: false,
    continueWatching: [],
    recentSources: [],
    videosThisWeek: 0,
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
    const continueWatching = (sources ?? []) as ContinueItem[];

    const { data: recent } = await supabase
      .from("content_sources")
      .select("external_id, title, updated_at")
      .eq("user_id", user.id)
      .eq("kind", "youtube")
      .order("updated_at", { ascending: false })
      .limit(RECENT_LIMIT);
    const recentSources = (recent ?? []) as RecentSource[];

    const { count } = await supabase
      .from("content_sources")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("kind", "youtube")
      .gte("updated_at", new Date(Date.now() - WEEK_MS).toISOString());

    return {
      signedIn: true,
      continueWatching,
      recentSources,
      videosThisWeek: count ?? 0,
    };
  } catch {
    // Missing Neon config (e.g. preview deploys without worker secrets) →
    // render the guest variant instead of failing the page.
    return guest;
  }
}

export default async function DiscoverPage() {
  const { signedIn, continueWatching, recentSources, videosThisWeek } =
    await loadViewerData();

  return (
    <div className="flex flex-col gap-8 xl:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        {/* Floating search row — replaces the old top header (REDESIGN §4.3). */}
        <section className="space-y-3">
          <h1 className="text-xl font-bold tracking-tight">Khám phá</h1>
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

        {continueWatching.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <History className="h-4 w-4" />
              Đang xem dở
            </h2>
            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {continueWatching.map((v) => (
                <VideoCard
                  key={v.external_id}
                  videoId={v.external_id}
                  title={v.title ?? "Video YouTube"}
                  channel={v.channel}
                  durationMs={v.duration_ms}
                  positionMs={v.last_position_ms}
                  className="w-60 shrink-0 sm:w-72"
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <LibraryBig className="h-4 w-4" />
            Thư viện chọn sẵn
          </h2>
          <DiscoverCatalog videos={getCatalog()} />
        </section>

        <p className="text-xs text-muted-foreground">
          Thư viện được chọn tay và sẽ tiếp tục lớn dần — mọi video YouTube có
          phụ đề tiếng Anh đều học được, chỉ cần dán link vào ô phía trên.
        </p>
      </div>

      {signedIn && (
        <RightRail>
          {continueWatching.length > 0 && (
            <WidgetCard title="Đang xem dở">
              <Link
                href={`/watch/${continueWatching[0].external_id}?t=${continueWatching[0].last_position_ms}`}
                className="line-clamp-2 text-sm font-medium text-primary hover:underline"
              >
                {continueWatching[0].title ?? "Video YouTube"}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                Còn lại từ{" "}
                {formatTimestamp(continueWatching[0].last_position_ms)}
                {" · "}
                {formatRelativeAge(continueWatching[0].updated_at)}
              </p>
            </WidgetCard>
          )}
          <WidgetCard title="Tuần này">
            <p className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{videosThisWeek}</span>
              <span className="text-sm text-muted-foreground">video đã mở</span>
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              Ôn tập từ vựng sẽ hiện ở đây khi bạn lưu từ đầu tiên.
            </p>
          </WidgetCard>
          {recentSources.length > 0 && (
            <WidgetCard title="Hoạt động">
              <ul className="space-y-2.5">
                {recentSources.map((s) => (
                  <li key={s.external_id}>
                    <Link
                      href={`/watch/${s.external_id}`}
                      className="line-clamp-1 text-sm font-medium hover:text-primary hover:underline"
                    >
                      {s.title ?? "Video YouTube"}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeAge(s.updated_at)}
                    </p>
                  </li>
                ))}
              </ul>
            </WidgetCard>
          )}
        </RightRail>
      )}
    </div>
  );
}
