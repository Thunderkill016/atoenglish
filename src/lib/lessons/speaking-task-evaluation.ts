import {
  getSpeakingInteraction,
  type SpeakingInteractionCriterion,
  type SpeakingTaskCriterionId,
} from "@/lib/lessons/speaking-interactions";

export interface SpeakingTaskCriterionResult {
  id: SpeakingTaskCriterionId;
  labelVi: string;
  met: boolean;
}

export interface SpeakingTransferEvaluation {
  criteria: SpeakingTaskCriterionResult[];
  metCount: number;
  total: number;
  accomplished: boolean;
}

export interface SpeakingTaskEvaluation {
  unitId: string;
  criteria: SpeakingTaskCriterionResult[];
  transfer?: SpeakingTransferEvaluation;
  metCount: number;
  total: number;
  accomplished: boolean;
  /** Practice feedback only. This must never be promoted to CEFR mastery evidence. */
  evidenceKind: "practice-task-feedback";
}

const normalize = (transcript: string) =>
  transcript
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/[^a-z'?\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const evaluateCriteria = (
  criteria: SpeakingInteractionCriterion[],
  transcript: string
): SpeakingTaskCriterionResult[] => {
  const text = normalize(transcript);
  return criteria.map((criterion) => ({
    id: criterion.id,
    labelVi: criterion.labelVi,
    met: criterion.patterns.some((pattern) => pattern.test(text)),
  }));
};

/**
 * Returns task-accomplishment feedback only for units with an explicitly authored interaction contract.
 * Undefined means the unit must continue using its existing practice feedback until a rubric is authored.
 *
 * `learnerTurns` preserves per-turn evidence. When a contract authors transfer criteria,
 * the changed-context turn must pass on its own; guided evidence cannot substitute for it.
 */
export function evaluateSpeakingTask(
  unitId: string,
  transcript: string,
  learnerTurns?: string[]
): SpeakingTaskEvaluation | undefined {
  const interaction = getSpeakingInteraction(unitId);
  if (!interaction) return undefined;

  const criteria = evaluateCriteria(interaction.criteria, transcript);
  const baseMetCount = criteria.filter((criterion) => criterion.met).length;

  const transferTurnIndex = interaction.turns.findIndex((turn) => turn.phase === "transfer");
  const transferCriteria = interaction.transferCriteria;

  let transfer: SpeakingTransferEvaluation | undefined;
  if (transferCriteria && transferTurnIndex >= 0) {
    const transferResults = evaluateCriteria(
      transferCriteria,
      learnerTurns?.[transferTurnIndex] ?? ""
    );
    const transferMetCount = transferResults.filter((criterion) => criterion.met).length;
    transfer = {
      criteria: transferResults,
      metCount: transferMetCount,
      total: transferResults.length,
      accomplished: transferMetCount === transferResults.length,
    };
  }

  const metCount = baseMetCount + (transfer?.metCount ?? 0);
  const total = criteria.length + (transfer?.total ?? 0);
  const accomplished =
    baseMetCount === criteria.length && (transfer ? transfer.accomplished : true);

  return {
    unitId,
    criteria,
    transfer,
    metCount,
    total,
    accomplished,
    evidenceKind: "practice-task-feedback",
  };
}
