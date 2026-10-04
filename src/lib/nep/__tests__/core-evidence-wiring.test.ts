import { describe, expect, it } from "vitest";

import { buildEnglishOntologyV1 } from "../../core/ontology-seed";
import { projectLearnerState } from "../../core/learner-state";
import { readConstructFromLearnerState } from "../../learning/learner-state-read";
import { evaluateNếpAction } from "../evaluator";
import { firstMeetingLessonV1, type LessonAction } from "../lesson-contract";
import {
  sessionEvidenceBatch,
  toCoreEvidenceTriple,
  toLearnerStateEvidence,
} from "../core-evidence-wiring.v1";

const lesson = firstMeetingLessonV1;

const buildResult = buildEnglishOntologyV1();
if (!buildResult.ok) throw new Error("ontology build failed");
const ontology = buildResult.graph;

function action(id: string): LessonAction {
  const found = lesson.actions.find((item) => item.id === id);
  if (!found) throw new Error(`fixture action missing: ${id}`);
  return found;
}

function evaluated(
  actionId: string,
  response: string,
  occurredAt: string,
  options: { responseSource?: "speech" | "text" | null; supportLevelUsed?: number; sequence?: number } = {},
) {
  const lessonAction = action(actionId);
  return {
    lesson,
    action: lessonAction,
    response,
    responseSource: options.responseSource ?? "speech",
    evaluation: evaluateNếpAction(lessonAction, response),
    supportLevelUsed: options.supportLevelUsed ?? 0,
    latencyMs: 1500,
    occurredAt,
    sequence: options.sequence,
  };
}

describe("zero-path → core evidence wiring", () => {
  it("maps recognition evidence to meaning-recognition on reading-reception", () => {
    const triple = toCoreEvidenceTriple(evaluated("comprehend", "name", "2026-09-21T10:00:00.000Z"));
    expect(triple).not.toBeNull();
    expect(triple!.claim).toBe("understand_written");
    expect(triple!.task.activity).toBe("reading-reception");
    expect(triple!.candidate.role).toBe("meaning-recognition");
    expect(triple!.candidate.targetId).toBe("nep.en.v1.communication-activity.reading-reception");
    expect(triple!.task.transferDistance).toBe("same-context");
    expect(triple!.task.contextTags).toContain("cap:CAP-002");
  });

  it("maps retrieval evidence to controlled-production carrying the cue as supportLevel", () => {
    const triple = toCoreEvidenceTriple(
      evaluated("retrieve", "my name is hoang", "2026-09-21T10:01:00.000Z", { supportLevelUsed: 1 }),
    );
    expect(triple!.claim).toBe("retrieve_form");
    expect(triple!.candidate.role).toBe("controlled-production");
    expect(triple!.task.activity).toBe("spoken-production");
    expect(triple!.candidate.attempt.supportLevel).toBe(1);
    expect(triple!.candidate.attempt.responseModality).toBe("speech");
  });

  it("maps repair evidence to interactional-repair on spoken-interaction", () => {
    const triple = toCoreEvidenceTriple(
      evaluated("repair", "sorry could you say that again", "2026-09-21T10:02:00.000Z"),
    );
    expect(triple!.claim).toBe("interactional_repair");
    expect(triple!.candidate.role).toBe("interactional-repair");
    expect(triple!.task.activity).toBe("spoken-interaction");
    expect(triple!.candidate.targetId).toBe("nep.en.v1.communication-activity.spoken-interaction");
  });

  it("pairs transfer evidence with near-transfer role and distance", () => {
    const triple = toCoreEvidenceTriple(
      evaluated("transfer", "could you say that again my name is hoang", "2026-09-21T10:03:00.000Z"),
    );
    expect(triple!.claim).toBe("use_novel_context");
    expect(triple!.candidate.role).toBe("near-transfer");
    expect(triple!.task.transferDistance).toBe("near-transfer");
    expect(triple!.candidate.attempt.contextId).not.toBeNull();
  });

  it("returns null for attempt-only actions (retry and unassessed actions mint no evidence)", () => {
    expect(toCoreEvidenceTriple(evaluated("retry", "my name is hoang", "2026-09-21T10:04:00.000Z"))).toBeNull();
    expect(toCoreEvidenceTriple(evaluated("context", "", "2026-09-21T10:04:30.000Z"))).toBeNull();
    expect(toCoreEvidenceTriple(evaluated("notice", "", "2026-09-21T10:04:45.000Z"))).toBeNull();
    expect(toCoreEvidenceTriple(evaluated("feedback", "", "2026-09-21T10:04:50.000Z"))).toBeNull();
  });

  it("keeps an unobserved response as unknown (responseCorrect null), not a failure", () => {
    const triple = toCoreEvidenceTriple(evaluated("produce", "   ", "2026-09-21T10:05:00.000Z"));
    expect(triple!.observation.payload.kind).toBe("comprehension");
    if (triple!.observation.payload.kind === "comprehension") {
      expect(triple!.observation.payload.responseCorrect).toBeNull();
    }
  });

  it("never persists raw learner text across the boundary", () => {
    const serialized = JSON.stringify(
      toCoreEvidenceTriple(evaluated("produce", "my name is hoang", "2026-09-21T10:06:00.000Z")),
    );
    expect(serialized).not.toContain("my name is hoang");
    expect(serialized).not.toContain("hoang");
  });

  it("produces repository-reference evidence that passes reference validation", () => {
    const result = toLearnerStateEvidence(
      evaluated("produce", "my name is hoang", "2026-09-21T10:07:00.000Z"),
    );
    expect(result).not.toBeNull();
    expect(result!.ok).toBe(true);
    if (result!.ok) {
      expect(result!.evidence.authorityScope).toBe("repository-reference");
      expect(result!.evidence.grantId).toBeNull();
      expect(result!.evidence.calibrationBenchmarkId).toBeNull();
    }
  });

  it("projects a full session into separated construct projections", () => {
    const session = [
      evaluated("comprehend", "name", "2026-09-21T10:10:00.000Z", { responseSource: null }),
      evaluated("retrieve", "my name is hoang", "2026-09-21T10:11:00.000Z"),
      evaluated("produce", "my name is hoang", "2026-09-21T10:12:00.000Z"),
      evaluated("repair", "sorry could you say that again", "2026-09-21T10:13:00.000Z"),
      evaluated("retry", "my name is hoang", "2026-09-21T10:14:00.000Z"),
      evaluated("transfer", "could you say that again my name is hoang", "2026-09-21T10:15:00.000Z"),
    ];

    const batch = sessionEvidenceBatch(session);
    expect(batch.skippedAttemptOnly).toBe(1);
    expect(batch.rejected).toHaveLength(0);
    expect(batch.evidence).toHaveLength(5);

    const projection = projectLearnerState(ontology, batch.evidence);
    expect(projection.rejectedEvents).toHaveLength(0);

    const reading = projection.constructs["nep.en.v1.communication-activity.reading-reception"];
    const spoken = projection.constructs["nep.en.v1.communication-activity.spoken-production"];
    const interaction = projection.constructs["nep.en.v1.communication-activity.spoken-interaction"];

    expect(reading.statistics.totalEvents).toBe(1);
    expect(reading.statistics.byRole["meaning-recognition"].positive).toBe(1);

    expect(spoken.statistics.totalEvents).toBe(3);
    expect(spoken.statistics.byRole["controlled-production"].positive).toBe(2);
    expect(spoken.statistics.byRole["near-transfer"].positive).toBe(1);

    expect(interaction.statistics.totalEvents).toBe(1);
    expect(interaction.statistics.byRole["interactional-repair"].positive).toBe(1);

    // An untouched construct stays unknown — never zero-inflated.
    const untouched = readConstructFromLearnerState(
      projection,
      "nep.en.v1.communication-activity.listening-reception",
    );
    expect(untouched.status).toBe("unknown");
    expect(untouched.estimate).toBeNull();
    expect(untouched.evidenceCount).toBe(0);
  });

  it("rejects transfer evidence when no same-context baseline precedes it", () => {
    const batch = sessionEvidenceBatch([
      evaluated("transfer", "could you say that again my name is hoang", "2026-09-21T10:20:00.000Z"),
    ]);
    expect(batch.evidence).toHaveLength(1);
    const projection = projectLearnerState(ontology, batch.evidence);
    expect(projection.rejectedEvents.length).toBeGreaterThan(0);
  });

  it("routes text-modality repair to written-interaction", () => {
    const triple = toCoreEvidenceTriple(
      evaluated("repair", "sorry could you say that again", "2026-09-21T10:21:00.000Z", {
        responseSource: "text",
      }),
    );
    expect(triple!.task.activity).toBe("written-interaction");
    expect(triple!.candidate.attempt.responseModality).toBe("text");
  });
});
