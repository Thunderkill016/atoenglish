import type {
  MissionIntent,
  MissionLearnerSpecV1,
  MissionTransferVariant,
} from "@/lib/missions/mission-spec";

export interface MissionCorrection {
  code: string;
  original?: string;
  suggestion: string;
  explanationVi: string;
}

export interface MissionEvaluationResult {
  status: "scored" | "unscored";
  taskCompleted: boolean;
  taskScore: number | null;
  completedIntentIds: string[];
  missingIntentIds: string[];
  corrections: MissionCorrection[];
  retryRequired: boolean;
  retryInstructionVi: string;
  rubric: {
    taskCompletion: number | null;
    interaction: number | null;
    languageControl: number | null;
    comprehensibility: null;
    pronunciation: null;
  };
  evidence: {
    transcriptAvailable: boolean;
    acousticEvidenceAvailable: false;
    evaluator: "deterministic-intent-match";
    evaluatorVersion: "2.0.0";
  };
}

function normalizeTranscript(value: string) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\bi'm\b/g, "i am")
    .replace(/\bi'll\b/g, "i will")
    .replace(/\bi've\b/g, "i have")
    .replace(/\bdidn't\b/g, "did not")
    .replace(/\bwhat's\b/g, "what is")
    .replace(/[.,!?;:"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesIntent(transcript: string, intent: MissionIntent) {
  return intent.matchers.some((source) => {
    try {
      return new RegExp(source, "i").test(transcript);
    } catch {
      return transcript.includes(source.toLowerCase());
    }
  });
}

function applyFeedbackRules(
  mission: MissionLearnerSpecV1,
  transcript: string,
): MissionCorrection[] {
  return mission.feedbackRules.flatMap((rule) => {
    try {
      const match = transcript.match(new RegExp(rule.pattern, "i"));
      if (!match) return [];
      return [
        {
          code: rule.code,
          original: match[0],
          suggestion: rule.suggestion,
          explanationVi: rule.explanationVi,
        },
      ];
    } catch {
      return [];
    }
  });
}

function missingIntentCorrection(intent: MissionIntent): MissionCorrection {
  return {
    code: `missing_intent:${intent.id}`,
    suggestion: intent.examples[0] ?? "Hãy thử nói lại ý còn thiếu.",
    explanationVi: `Bạn chưa thể hiện rõ mục tiêu: ${intent.descriptionVi}`,
  };
}

function completedIntentsFromTurns(
  mission: MissionLearnerSpecV1,
  transcripts: string[],
): MissionIntent[] {
  const completedIds = new Set<string>();

  mission.roleplayTurns.forEach((turn, index) => {
    const transcript = normalizeTranscript(transcripts[index] ?? "");
    if (!transcript) return;

    for (const intentId of turn.expectedIntentIds) {
      const intent = mission.intents.find(
        (candidate) => candidate.id === intentId,
      );
      if (intent && matchesIntent(transcript, intent))
        completedIds.add(intent.id);
    }
  });

  const combined = normalizeTranscript(transcripts.join(" "));
  for (const intent of mission.intents.filter(
    (candidate) => !candidate.required,
  )) {
    if (matchesIntent(combined, intent)) completedIds.add(intent.id);
  }

  return mission.intents.filter((intent) => completedIds.has(intent.id));
}

function completedIntentsFromFullTask(
  mission: MissionLearnerSpecV1,
  transcript: string,
): MissionIntent[] {
  return mission.intents.filter((intent) => matchesIntent(transcript, intent));
}

export function evaluateMissionTranscript(
  mission: MissionLearnerSpecV1,
  transcripts: string[],
): MissionEvaluationResult {
  const isRetry = transcripts.length > mission.roleplayTurns.length;
  const evidenceTranscripts = isRetry
    ? [transcripts[transcripts.length - 1]]
    : transcripts.slice(0, mission.roleplayTurns.length);
  const combined = normalizeTranscript(
    evidenceTranscripts.filter(Boolean).join(" "),
  );

  if (!combined) {
    return {
      status: "unscored",
      taskCompleted: false,
      taskScore: null,
      completedIntentIds: [],
      missingIntentIds: mission.intents
        .filter((intent) => intent.required)
        .map((intent) => intent.id),
      corrections: [],
      retryRequired: true,
      retryInstructionVi:
        "Chưa có transcript đáng tin cậy. Hãy nói lại thành tiếng hoặc dùng trình duyệt hỗ trợ nhận diện giọng nói.",
      rubric: {
        taskCompletion: null,
        interaction: null,
        languageControl: null,
        comprehensibility: null,
        pronunciation: null,
      },
      evidence: {
        transcriptAvailable: false,
        acousticEvidenceAvailable: false,
        evaluator: "deterministic-intent-match",
        evaluatorVersion: "2.0.0",
      },
    };
  }

  const completedIntents = isRetry
    ? completedIntentsFromFullTask(mission, combined)
    : completedIntentsFromTurns(mission, evidenceTranscripts);
  const completedIds = new Set(completedIntents.map((intent) => intent.id));
  const requiredIntents = mission.intents.filter((intent) => intent.required);
  const missingRequired = requiredIntents.filter(
    (intent) => !completedIds.has(intent.id),
  );
  const completionRatio =
    requiredIntents.length === 0
      ? 1
      : (requiredIntents.length - missingRequired.length) /
        requiredIntents.length;
  const taskCompleted =
    completionRatio >= mission.evaluation.requiredIntentPassRatio;

  const languageCorrections = applyFeedbackRules(mission, combined);
  const corrections = [
    ...languageCorrections,
    ...missingRequired.map(missingIntentCorrection),
  ].slice(0, mission.evaluation.maxCorrections);

  const requiredInteractional = requiredIntents.filter(
    (intent) => intent.interactional,
  );
  const completedInteractional = requiredInteractional.filter((intent) =>
    completedIds.has(intent.id),
  );
  const interactionRatio =
    requiredInteractional.length === 0
      ? 1
      : completedInteractional.length / requiredInteractional.length;

  return {
    status: "scored",
    taskCompleted,
    taskScore: Math.round(completionRatio * 100),
    completedIntentIds: completedIntents.map((intent) => intent.id),
    missingIntentIds: missingRequired.map((intent) => intent.id),
    corrections,
    retryRequired: mission.retry.requiredAfterFeedback,
    retryInstructionVi:
      corrections.length > 0
        ? `Hãy thực hiện lại toàn bộ nhiệm vụ và sửa các điểm sau: ${corrections
            .map((correction) => correction.suggestion)
            .join(" / ")}`
        : "Hãy thực hiện lại toàn bộ nhiệm vụ một lần nữa mà không nhìn câu mẫu.",
    rubric: {
      taskCompletion: Math.round(completionRatio * 4),
      interaction: Math.round(interactionRatio * 4),
      languageControl: languageCorrections.length === 0 ? 4 : 2,
      comprehensibility: null,
      pronunciation: null,
    },
    evidence: {
      transcriptAvailable: true,
      acousticEvidenceAvailable: false,
      evaluator: "deterministic-intent-match",
      evaluatorVersion: "2.0.0",
    },
  };
}

export function listDueTransferVariants(
  mission: MissionLearnerSpecV1,
  completedAt: Date,
  now: Date,
): MissionTransferVariant[] {
  const elapsedDays = Math.floor(
    (now.getTime() - completedAt.getTime()) / (24 * 60 * 60 * 1000),
  );

  return [...mission.transferVariants]
    .filter((variant) => elapsedDays >= variant.dueAfterDays)
    .sort((left, right) => left.dueAfterDays - right.dueAfterDays);
}

export function selectDueTransferVariant(
  mission: MissionLearnerSpecV1,
  completedAt: Date,
  now: Date,
): MissionTransferVariant | null {
  return listDueTransferVariants(mission, completedAt, now).at(-1) ?? null;
}
