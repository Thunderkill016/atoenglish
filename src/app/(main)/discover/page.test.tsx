import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createClient } from "@/lib/supabase/server";
import DiscoverPage from "./page";

vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

type ReadResult = {
  data?: unknown[] | null;
  count?: number | null;
  error?: { message: string } | null;
};
function mockClient(
  user: { id: string } | null,
  sources: ReadResult = { data: [], error: null },
  count: ReadResult = { count: 0, error: null },
  authError: { status: number } | null = null,
) {
  const queries: { eq: ReturnType<typeof vi.fn> }[] = [];
  const client = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: authError }),
    },
    from: vi.fn(() => {
      const result = queries.length === 0 ? sources : count;
      const query = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: (resolve: (value: ReadResult) => unknown) =>
          Promise.resolve(result).then(resolve),
      };
      queries.push(query);
      return query;
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
  it("keeps statistics, flashcards, Activity and Progress visible without fabricating personal totals", async () => {
    mockClient(null);
    const rail = await renderHome();
    for (const title of ["Thống kê", "Flashcard", "Activity", "Progress"]) {
      expect(hasHeading(title)).toBe(true);
    }
    const stats = [...rail.querySelectorAll("section")].find(
      (section) => section.querySelector("h2")?.textContent === "Thống kê",
    )!;
    expect(
      [...stats.querySelectorAll("dd")].map((item) => item.textContent),
    ).toEqual(["18", "5", "—", "—"]);
    expect(
      rail.querySelector(
        'figure[aria-label="Tiến độ ôn tập: chưa có dữ liệu"]',
      ),
    ).toBeInTheDocument();
    expect(rail.textContent).toContain(
      "Chưa có dữ liệu lịch sử học được kết nối.",
    );
  });

  it("keeps guests in the public catalog without querying personal sources", async () => {
    const { client } = mockClient(null, undefined, undefined, { status: 401 });
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
      { count: 12, error: null },
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

  it("shows a verified empty personal library without inventing learning progress", async () => {
    mockClient({ id: "learner-a" });
    const rail = await renderHome();
    expect(rail.querySelector("span.tabular-nums")).toHaveTextContent("0");
    expect(hasHeading("Tiếp tục xem")).toBe(false);
    expect(rail.textContent).not.toContain("PDF");
  });

  it.each(["source", "count", "missing-count"])(
    "reports %s read failure instead of an empty library",
    async (failure) => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      mockClient(
        { id: "learner-a" },
        {
          data: [],
          error: failure === "source" ? { message: "offline" } : null,
        },
        {
          count: failure === "missing-count" ? null : 0,
          error: failure === "count" ? { message: "offline" } : null,
        },
      );
      const rail = await renderHome();
      expect(rail.textContent).toContain("Chưa tải được tiến trình xem");
      expect(rail.textContent).not.toContain("video đã mở");
      expect(link(rail, "Thử tải lại")).toHaveAttribute("href", "/discover");
    },
  );

  it("does not treat an auth outage as a signed-out visitor", async () => {
    mockClient(null, undefined, undefined, { status: 503 });
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
