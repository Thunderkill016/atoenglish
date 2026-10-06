export const SUPPORTED_SCOPES = ["feature", "cleanup"];

const featureManualReview = [
  "Confirm the change matches the active direction in docs/project/PROJECT_STATE.md and the bounded task contract.",
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

export function buildVerificationPlan({
  scope = "feature",
  fast = false,
} = {}) {
  if (!SUPPORTED_SCOPES.includes(scope)) {
    throw new Error(
      `Unsupported verification scope: ${scope}. Supported scopes: ${SUPPORTED_SCOPES.join(", ")}`,
    );
  }

  const checks = [];

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
    manualReview:
      scope === "cleanup" ? cleanupManualReview : featureManualReview,
  };
}
