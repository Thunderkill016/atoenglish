import { expect, test, type Page } from "@playwright/test";

async function findDuplicateIds(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const counts = new Map<string, number>();

    for (const element of document.querySelectorAll<HTMLElement>("[id]")) {
      const id = element.id.trim();
      if (!id) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    return [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([id]) => id)
      .sort();
  });
}

async function findUnnamedInteractiveElements(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const selector =
      "a[href], button, input:not([type='hidden']), select, textarea";

    const isVisible = (element: HTMLElement): boolean => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 0 &&
        rect.height > 0
      );
    };

    const labelledByText = (element: HTMLElement): string => {
      const ids =
        element.getAttribute("aria-labelledby")?.trim().split(/\s+/) ?? [];
      return ids
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? "")
        .filter(Boolean)
        .join(" ");
    };

    const nativeLabelText = (element: HTMLElement): string => {
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
      ) {
        return [...(element.labels ?? [])]
          .map((label) => label.textContent?.trim() ?? "")
          .filter(Boolean)
          .join(" ");
      }
      return "";
    };

    const hasAccessibleName = (element: HTMLElement): boolean => {
      const ariaLabel = element.getAttribute("aria-label")?.trim() ?? "";
      const title = element.getAttribute("title")?.trim() ?? "";
      const text = element.textContent?.trim() ?? "";
      const imageAlt = [
        ...element.querySelectorAll<HTMLImageElement>("img[alt]"),
      ]
        .map((image) => image.alt.trim())
        .filter(Boolean)
        .join(" ");

      return Boolean(
        ariaLabel ||
        labelledByText(element) ||
        nativeLabelText(element) ||
        text ||
        title ||
        imageAlt,
      );
    };

    return [...document.querySelectorAll<HTMLElement>(selector)]
      .filter(isVisible)
      .filter((element) => !hasAccessibleName(element))
      .map((element) => {
        const id = element.id ? `#${element.id}` : "";
        const classes = [...element.classList].slice(0, 3).join(".");
        const classSuffix = classes ? `.${classes}` : "";
        return `${element.tagName.toLowerCase()}${id}${classSuffix}`;
      });
  });
}

async function findNestedInteractiveElements(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const nestedSelector = [
      "a[href] a[href]",
      "a[href] button",
      "a[href] input:not([type='hidden'])",
      "a[href] select",
      "a[href] textarea",
      "button a[href]",
      "button button",
      "button input:not([type='hidden'])",
      "button select",
      "button textarea",
    ].join(", ");

    return [...document.querySelectorAll<HTMLElement>(nestedSelector)].map(
      (element) => {
        const parent = element.parentElement;
        const parentLabel = parent
          ? `${parent.tagName.toLowerCase()}${parent.id ? `#${parent.id}` : ""}`
          : "unknown";
        const childLabel = `${element.tagName.toLowerCase()}${
          element.id ? `#${element.id}` : ""
        }`;
        return `${parentLabel} > ${childLabel}`;
      },
    );
  });
}

test.describe("Public accessibility smoke", () => {
  test("landing exposes semantic structure and keyboard skip navigation", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/AtoEnglish/);
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Học tiếng Anh để nói được.*không chỉ để biết/i,
      }),
    ).toHaveCount(1);
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    await page.keyboard.press("Tab");

    const skipLink = page.getByRole("link", {
      name: "Chuyển đến nội dung chính",
    });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  test("landing has valid interactive structure and accessible names", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    expect(await findDuplicateIds(page)).toEqual([]);
    expect(await findUnnamedInteractiveElements(page)).toEqual([]);
    expect(await findNestedInteractiveElements(page)).toEqual([]);
  });

  test("landing does not overflow the mobile viewport horizontally", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.scrollWidth).toBeLessThanOrEqual(
      dimensions.clientWidth + 2,
    );
    await expect(page.getByRole("button", { name: "Mở menu" })).toBeVisible();
  });
});

test.describe("App accessibility smoke", () => {
  const guestOpenSurfaces = ["/learn", "/review", "/read"] as const;

  for (const path of guestOpenSurfaces) {
    test(`${path} has no duplicate ids or nested interactive elements`, async ({
      page,
    }) => {
      await page.goto(path);
      await expect(page.locator("main#main-content")).toBeVisible();

      expect(await findDuplicateIds(page)).toEqual([]);
      expect(await findNestedInteractiveElements(page)).toEqual([]);
    });

    test(`${path} does not overflow the mobile viewport horizontally`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(path);
      await expect(page.locator("main#main-content")).toBeVisible();

      const dimensions = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));

      expect(dimensions.scrollWidth).toBeLessThanOrEqual(
        dimensions.clientWidth + 2,
      );
    });
  }

  test("session start card has valid interactive structure", async ({
    page,
  }) => {
    await page.goto("/zero-path?lesson=legacy.unit-1");
    await expect(page.locator("main#main-content")).toBeVisible();

    expect(await findDuplicateIds(page)).toEqual([]);
    expect(await findUnnamedInteractiveElements(page)).toEqual([]);
    expect(await findNestedInteractiveElements(page)).toEqual([]);
  });
});
