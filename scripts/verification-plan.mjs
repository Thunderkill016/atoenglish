export const SUPPORTED_SCOPES = ["curriculum", "cleanup"];

const focusedLessonTests = [
  "src/components/learn/UnitTemplate.test.tsx",
  "src/components/learn/lesson-sections.test.ts",
  "src/components/learn/lesson-ui/lesson-presentation.test.tsx",
];

const curriculumManualReview = [
  "Confirm the changed lesson still matches its task-level can-do outcome.",
  "Open the changed lesson and one neighboring unit in the preview; compare title, step count, section labels, and navigation.",
  "Review the changed-file list against the approved scope and explain every shared-file change.",
  "Confirm no learner audio, transcript, name, employer, email, or free-text content was added to analytics payloads.",
  "Record any unavailable check instead of claiming it passed.",
];

const cleanupManualReview = [
  "Confirm removed code is outside the active product direction and has no replacement feature added.",
  "Review the changed-file list for accidental curriculum, completion, SRS, assessment, auth, security, or database changes.",
  "Confirm no active route or import points to a removed module.",
  "Record any unavailable check instead of claiming it passed.",
];

export function buildVerificationPlan({ scope = "curriculum", fast = false } = {}) {
  if (!SUPPORTED_SCOPES.includes(scope)) {
    throw new Error(
      `Unsupported verification scope: ${scope}. Supported scopes: ${SUPPORTED_SCOPES.join(", ")}`,
    );
  }

  const checks = [];

  if (scope === "curriculum") {
    checks.push(
      {
        id: "focused-lesson-tests",
        label: "Focused lesson regression tests",
        command: "npm",
        args: ["exec", "--", "vitest", "run", ...focusedLessonTests],
      },
      {
        id: "content-standard",
        label: "Lesson content standards",
        command: "npm",
        args: ["run", "test:content-standard"],
      },
    );
  }

  checks.push({
    id: "typecheck",
    label: "TypeScript",
    command: "npm",
    args: ["exec", "--", "tsc", "--noEmit"],
  });

  if (!fast) {
    checks.push(
      {
        id: "lint",
        label: "Full ESLint",
        command: "npm",
        args: ["run", "lint"],
      },
      {
        id: "unit-tests",
        label: "Full unit suite",
        command: "npm",
        args: ["run", "test"],
      },
      {
        id: "production-build",
        label: "Production build",
        command: "npm",
        args: ["run", "build"],
      },
    );
  }

  return {
    scope,
    mode: fast ? "fast" : "full",
    technicalChecks: checks,
    manualReview: scope === "cleanup" ? cleanupManualReview : curriculumManualReview,
  };
}
