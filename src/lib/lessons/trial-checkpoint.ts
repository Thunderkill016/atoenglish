import { UNIT_A0_1_CHECKPOINT } from "@/lib/missions/checkpoint-banks";

export interface TrialCheckpointQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

/**
 * The trial checkpoint IS the unit-a0-1 checkpoint — one authored
 * definition (`UNIT_A0_1_CHECKPOINT`), adapted here to the legacy field
 * names the claim path uses. Keeping a second handwritten set is what
 * allowed the trial (3 questions, threshold 2) to drift away from the
 * mission checkpoint (4 questions, threshold 4) for the same unit.
 */
export const TRIAL_CHECKPOINT_PASS_THRESHOLD =
  UNIT_A0_1_CHECKPOINT.passThreshold;

export const TRIAL_CHECKPOINT_QUESTIONS: TrialCheckpointQuestion[] =
  UNIT_A0_1_CHECKPOINT.questions.map((question) => ({
    id: question.id,
    question: question.questionVi,
    options: question.options,
    answer: question.answer,
    explanation: question.explanationVi,
  }));

export function scoreTrialCheckpoint(answers: Record<string, string>) {
  const correctCount = TRIAL_CHECKPOINT_QUESTIONS.filter(
    (question) => answers[question.id] === question.answer,
  ).length;

  return {
    correctCount,
    passed: correctCount >= TRIAL_CHECKPOINT_PASS_THRESHOLD,
  };
}
