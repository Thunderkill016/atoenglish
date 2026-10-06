"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Play, Search } from "lucide-react";

import { parseYoutubeUrl } from "@/lib/video/youtube-url";

// Temporary starter videos until slice 6 lands the curated catalog
// (src/content/catalog/videos.json). All three are verified to have
// English captions — two also have manual + asr variants.
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

export default function DiscoverPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    const id = parseYoutubeUrl(url);
    if (!id) {
      setError("Link không hợp lệ — hỗ trợ youtube.com, youtu.be, shorts, live, embed.");
      return;
    }
    router.push(`/watch/${id}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-5">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          AtoEnglish
        </Link>
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Đăng nhập
        </Link>
      </header>

      <main
        id="main-content"
        className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-10"
      >
        <div>
          <h1 className="text-2xl font-bold">Khám phá</h1>
          <p className="mt-1 text-muted-foreground">
            Dán link YouTube bất kỳ để học với phụ đề song ngữ.
          </p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === "Enter" && open()}
              placeholder="https://www.youtube.com/watch?v=…"
              className="w-full rounded-lg border border-input bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            type="button"
            onClick={open}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Xem
          </button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Thử ngay
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STARTER_VIDEOS.map((v) => (
              <Link
                key={v.id}
                href={`/watch/${v.id}`}
                className="group overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/50"
              >
                <div className="relative aspect-video bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                    alt={v.title}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                    <Play className="h-8 w-8 text-white opacity-0 transition group-hover:opacity-100" />
                  </span>
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-medium leading-snug">
                    {v.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {v.channel} · {v.note}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
