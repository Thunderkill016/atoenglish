import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, History } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { YoutubeLinkInput } from "@/components/youtube-link-input";
import { VideoCard } from "@/components/video-card";
import { RightRail, WidgetCard } from "@/components/right-rail";
import { formatRelativeAge, formatTimestamp } from "@/lib/format";

export const metadata: Metadata = {
  title: "Khám phá",
  description:
    "Dán link YouTube để học tiếng Anh với phụ đề từng câu, hoặc chọn video gợi ý bên dưới.",
};

// Interim starter set — slice 6 replaces this with src/content/catalog
// (≥30 owner-curated videos with topic/level). All three verified to carry
// English captions.
const STARTER_VIDEOS = [
  {
    id: "8jPQjjsBbIc",
    title: "How to stay calm when you know you'll be stressed",
    channel: "TED",
    note: "Phụ đề thủ công + tiếng Việt",
  },
  {
    id: "UF8uR6Z6KLc",
    title: "Steve Jobs' 2005 Stanford Commencement Address",
    channel: "Stanford",
    note: "Phụ đề thủ công",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Rick Astley — Never Gonna Give You Up",
    channel: "Rick Astley",
    note: "Phụ đề tự động",
  },
];

interface ContinueItem {
  external_id: string;
  title: string | null;
  channel: string | null;
  duration_ms: number | null;
  last_position_ms: number;
  updated_at: string;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const CONTINUE_LIMIT = 6;

async function loadViewerData(): Promise<{
  signedIn: boolean;
  continueWatching: ContinueItem[];
  videosThisWeek: number;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { signedIn: false, continueWatching: [], videosThisWeek: 0 };
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

    const { count } = await supabase
      .from("content_sources")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("kind", "youtube")
      .gte("updated_at", new Date(Date.now() - WEEK_MS).toISOString());

    return {
      signedIn: true,
      continueWatching,
      videosThisWeek: count ?? 0,
    };
  } catch {
    // Missing Neon config (e.g. preview deploys without worker secrets) →
    // render the guest variant instead of failing the page.
    return { signedIn: false, continueWatching: [], videosThisWeek: 0 };
  }
}

export default async function DiscoverPage() {
  const { signedIn, continueWatching, videosThisWeek } = await loadViewerData();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          AtoEnglish
        </Link>
        {!signedIn && (
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Đăng nhập
          </Link>
        )}
      </header>

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 xl:flex-row"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <section className="space-y-3">
            <h1 className="text-2xl font-bold">Khám phá</h1>
            <YoutubeLinkInput large autoFocus />
            {!signedIn && (
              <p className="text-sm text-muted-foreground">
                Xem được ngay, không cần tài khoản —{" "}
                <Link href="/login" className="text-primary hover:underline">
                  đăng nhập
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
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {continueWatching.map((v) => (
                  <VideoCard
                    key={v.external_id}
                    videoId={v.external_id}
                    title={v.title ?? "Video YouTube"}
                    channel={v.channel}
                    durationMs={v.duration_ms}
                    positionMs={v.last_position_ms}
                  />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              Thử ngay
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {STARTER_VIDEOS.map((v) => (
                <VideoCard
                  key={v.id}
                  videoId={v.id}
                  title={v.title}
                  channel={v.channel}
                  note={v.note}
                />
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Thư viện chọn sẵn đang được xây — mọi video YouTube có phụ đề
              tiếng Anh đều học được qua ô dán link phía trên.
            </p>
          </section>
        </div>

        {signedIn && (
          <RightRail>
            {continueWatching.length > 0 && (
              <WidgetCard title="Đang xem dở">
                <Link
                  href={`/watch/${continueWatching[0].external_id}?t=${continueWatching[0].last_position_ms}`}
                  className="text-sm font-medium text-primary hover:underline"
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
                <span className="text-sm text-muted-foreground">
                  video đã mở
                </span>
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                Ôn tập từ vựng sẽ hiện ở đây khi bạn lưu từ đầu tiên.
              </p>
            </WidgetCard>
          </RightRail>
        )}
      </main>
    </div>
  );
}
