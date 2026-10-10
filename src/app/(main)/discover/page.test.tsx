import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createClient } from "@/lib/supabase/server";
import { catalogTopics, getCatalog } from "@/content/catalog/videos";
import DiscoverPage from "./page";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

type ReadResult = {
  data?: unknown[] | null;
  count?: number | null;
  error?: { message: string } | null;
};
interface TableData {
  sources?: ReadResult;
  sourcesCount?: ReadResult;
  dueCards?: ReadResult;
  totalCards?: ReadResult;
  attemptDates?: ReadResult;
  cardDates?: ReadResult;
  totalAttempts?: ReadResult;
}
function mockClient(
  user: { id: string } | null,
  tables: TableData = {},
  authError: { status: number } | null = null,
) {
  const queries: {
    table: string;
    head: boolean;
    orFilter?: string;
    eq: ReturnType<typeof vi.fn>;
  }[] = [];
  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: authError }),
    },
    from: vi.fn((table: string) => {
      const query: Record<string, unknown> = {
        table,
        head: false,
        usedOr: false,
      };
      const chain = {
        select: vi.fn((_cols: string, opts?: { head?: boolean }) => {
          if (opts?.head) query.head = true;
          return chain;
        }),
        eq: vi.fn().mockReturnThis(),
        or: vi.fn((filter: string) => {
          query.usedOr = true;
          query.orFilter = filter;
          return chain;
        }),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: (resolve: (value: ReadResult) => unknown) => {
          const key =
            table === "study_cards"
              ? query.usedOr
                ? "dueCards"
                : query.head
                  ? "totalCards"
                  : "cardDates"
              : table === "practice_attempts"
                ? query.head
                  ? "totalAttempts"
                  : "attemptDates"
                : table === "content_sources"
                  ? query.head
                    ? "sourcesCount"
                    : "sources"
                  : "sources";
          return Promise.resolve(
            (tables[key] ?? { data: [], count: 0, error: null }) as ReadResult,
          ).then(resolve);
        },
      };
      query.eq = chain.eq as ReturnType<typeof vi.fn>;
      queries.push(query as (typeof queries)[number]);
      return chain;
    }),
  };
  vi.mocked(createClient).mockResolvedValue(
    client as unknown as Awaited<ReturnType<typeof createClient>>,
  );
  return { client, queries };
}

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(() => {
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

async function renderHome() {
  document.body.innerHTML = renderToStaticMarkup(await DiscoverPage());
  return document.querySelector("aside")!;
}
function link(scope: ParentNode, text: string) {
  return [...scope.querySelectorAll("a")].find((a) =>
    a.textContent?.includes(text),
  );
}
function hasHeading(text: string) {
  return [...document.querySelectorAll("h1, h2")].some(
    (h) => h.textContent === text,
  );
}

describe("home viewer states", () => {
  it("renders every rail widget with honest guest states", async () => {
    mockClient(null);
    const rail = await renderHome();
    for (const title of [
      "Lịch tuần",
      "Flashcard",
      "Thống kê",
      "Tiến trình xem",
      "Activity",
      "Progress",
      "Học với video",
    ]) {
      expect(hasHeading(title)).toBe(true);
    }
    // Guests get real structure, not fabricated numbers.
    expect(rail.textContent).toContain("Đăng nhập để lưu từ, câu và ôn tập");
    expect(rail.textContent).toContain("Đăng nhập để ghi lại tiến độ");
    expect(rail.textContent).not.toContain("—");
    const stats = [...rail.querySelectorAll("section")].find(
      (section) => section.querySelector("h2")?.textContent === "Thống kê",
    )!;
    expect(
      [...stats.querySelectorAll("dd")].map((item) => item.textContent),
    ).toEqual([String(getCatalog().length), String(catalogTopics().length)]);
    // The week strip always marks today; guests have no active days.
    expect(rail.querySelectorAll('[aria-current="date"]')).toHaveLength(1);
    expect(rail.querySelectorAll(".bg-primary\\/15")).toHaveLength(0);
    expect(
      rail.querySelector('[role="img"][aria-label^="Lịch hoạt động"]'),
    ).not.toBeNull();
  });

  it("keeps guests in the public catalog without querying personal sources", async () => {
    const { client } = mockClient(null, {}, { status: 401 });
    const rail = await renderHome();
    expect(client.from).not.toHaveBeenCalled();
    expect(link(rail, "Đăng nhập")).toHaveAttribute("href", "/login");
    expect(rail.textContent).not.toContain("video đã mở");
    expect(hasHeading("Thư viện chọn sẵn")).toBe(true);
  });

  it("uses per-user resume data, excludes completed/incidental views and keeps millisecond links", async () => {
    const source = {
      external_id: "dQw4w9WgXcQ",
      title: "Saved video",
      channel: "Rick",
      duration_ms: 213000,
      updated_at: "2026-10-06T12:00:00Z",
      last_position_ms: 65000,
    };
    const { queries } = mockClient(
      { id: "learner-a" },
      {
        sources: {
          data: [
            {
              ...source,
              external_id: "done",
              title: "Finished",
              last_position_ms: 213000,
            },
            {
              ...source,
              external_id: "touch",
              title: "Incidental",
              last_position_ms: 1000,
            },
            source,
          ],
          error: null,
        },
        sourcesCount: { count: 12, error: null },
      },
    );
    const rail = await renderHome();
    expect(link(document, "Saved video")).toHaveAttribute(
      "href",
      "/watch/dQw4w9WgXcQ?t=65000",
    );
    expect(link(document, "Finished")).toBeUndefined();
    expect(link(document, "Incidental")).toBeUndefined();
    expect(rail.querySelector("span.tabular-nums")).toHaveTextContent("12");
    for (const q of queries)
      expect(q.eq).toHaveBeenCalledWith("user_id", "learner-a");
  });

  it("shows real study numbers and a review shortcut for signed-in learners", async () => {
    const { queries } = mockClient(
      { id: "learner-a" },
      {
        dueCards: { count: 7, error: null },
        totalCards: { count: 23, error: null },
        attemptDates: {
          data: [
            { created_at: new Date().toISOString() },
            { created_at: "2026-01-01T00:00:00Z" },
          ],
          error: null,
        },
        cardDates: {
          data: [{ created_at: "2026-06-01T00:00:00Z" }],
          error: null,
        },
        totalAttempts: { count: 41, error: null },
      },
    );
    const railEl = await renderHome();
    const flash = [...railEl.querySelectorAll("section")].find(
      (s) => s.querySelector("h2")?.textContent === "Flashcard",
    )!;
    expect(flash.textContent).toContain("7");
    expect(flash.textContent).toContain("23");
    const progress = [...railEl.querySelectorAll("section")].find(
      (s) => s.querySelector("h2")?.textContent === "Progress",
    )!;
    expect(progress.textContent).toContain("Ôn tuần này");
    expect(progress.textContent).toContain("41");
    expect(link(railEl, "Ôn tập →")).toHaveAttribute("href", "/review");
    // Real activity lights the heatmap — at least one active cell.
    expect(
      railEl.querySelectorAll('[role="img"][aria-label*="có hoạt động"]'),
    ).toHaveLength(1);
    // Due cards use the same null-or-past-due rule as the review queue.
    const dueQuery = queries.find(
      (q) => q.table === "study_cards" && q.orFilter,
    );
    expect(dueQuery?.orFilter).toContain("due.is.null");
    expect(dueQuery?.orFilter).toContain("due.lte.");
  });

  it("shows a verified empty personal library without inventing learning progress", async () => {
    mockClient({ id: "learner-a" });
    const rail = await renderHome();
    expect(rail.querySelector("span.tabular-nums")).toHaveTextContent("0");
    expect(hasHeading("Tiếp tục xem")).toBe(false);
    expect(rail.textContent).not.toContain("PDF");
    // Empty-but-loaded study stats render as zeros, not placeholders.
    const flash = [...rail.querySelectorAll("section")].find(
      (s) => s.querySelector("h2")?.textContent === "Flashcard",
    )!;
    expect(flash.textContent).toContain("Cần ôn");
  });

  it.each(["source", "count", "missing-count"])(
    "reports %s read failure instead of an empty library",
    async (failure) => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      mockClient(
        { id: "learner-a" },
        {
          sources: {
            data: [],
            error: failure === "source" ? { message: "offline" } : null,
          },
          sourcesCount: {
            count: failure === "missing-count" ? null : 0,
            error: failure === "count" ? { message: "offline" } : null,
          },
        },
      );
      const rail = await renderHome();
      expect(rail.textContent).toContain("Chưa tải được tiến trình xem");
      expect(rail.textContent).toContain("Chưa tải được dữ liệu thẻ ôn tập");
      expect(rail.textContent).toContain("Chưa tải được dữ liệu luyện tập");
      expect(rail.textContent).toContain("Chưa tải được lịch hoạt động");
      expect(rail.textContent).not.toContain("video đã mở");
      expect(link(rail, "Thử tải lại")).toHaveAttribute("href", "/discover");
    },
  );

  it("does not treat an auth outage as a signed-out visitor", async () => {
    mockClient(null, {}, { status: 503 });
    const rail = await renderHome();
    expect(rail.textContent).toContain("Chưa tải được tiến trình xem");
    expect(link(rail, "Đăng nhập")).toBeUndefined();
  });

  it("isolates a failed data client while preserving catalog and recovery", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(createClient).mockRejectedValueOnce(
      new Error("missing client configuration"),
    );
    const rail = await renderHome();
    expect(link(rail, "Thử tải lại")).toBeDefined();
    expect(hasHeading("Thư viện chọn sẵn")).toBe(true);
  });
});
