import { describe, expect, it } from "vitest";

import {
  bottomNavItems,
  desktopMoreItems,
  desktopPrimaryNav,
  isSessionPath,
} from "./navigation";
import { meHubAccount, meHubMore, meHubPractice, meHubStudy } from "./me-hub";

// Phase 3 IA contract: one canonical 4-tab shell (HỌC/ÔN/LỘ TRÌNH/TÔI) shared
// by desktop and mobile; secondary surfaces live under /me; session-runner
// routes hide all chrome.
describe("canonical navigation", () => {
  it("exposes exactly four primary tabs in the approved order", () => {
    const hrefs = bottomNavItems.map((item) => item.href);
    expect(hrefs).toEqual(["/learn", "/review", "/roadmap", "/me"]);
  });

  it("keeps desktop and mobile primary nav identical", () => {
    expect(desktopPrimaryNav).toBe(bottomNavItems);
  });

  it("never points primary nav at legacy routes", () => {
    const legacy = ["/dashboard", "/flashcards", "/progress"];
    for (const item of bottomNavItems) {
      expect(legacy).not.toContain(item.href);
    }
  });

  it("puts secondary practice/reference surfaces under /me", () => {
    const secondary = [
      ...desktopMoreItems,
      ...meHubStudy,
      ...meHubPractice,
      ...meHubMore,
      ...meHubAccount,
    ];
    const outsideMe = secondary.filter(
      (item) =>
        !item.href.startsWith("/me") &&
        !["/roadmap", "/quiz"].includes(item.href),
    );
    expect(outsideMe).toEqual([]);
  });
});

describe("isSessionPath", () => {
  it.each([
    "/learn/unit-19",
    "/learn/unit-a0-1",
    "/checkpoint/trial",
    "/placement",
  ])("hides chrome for session route %s", (path) => {
    expect(isSessionPath(path)).toBe(true);
  });

  it.each(["/learn", "/review", "/roadmap", "/me", "/me/progress", "/quiz"])(
    "keeps chrome for non-session route %s",
    (path) => {
      expect(isSessionPath(path)).toBe(false);
    },
  );
});
