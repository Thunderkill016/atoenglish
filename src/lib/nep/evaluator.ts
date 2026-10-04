import type { LessonAction } from "./lesson-contract";

export type NếpEvaluationErrorTag =
  | "no-response"
  | "incorrect-choice"
  | "partial-target-coverage"
  | `missing-target-group:${number}`;

export type NếpEvaluationResult = {
  success: boolean;
  evaluator: "nep-evaluator-v2";
  observedResponse: boolean;
  matchedTargetGroupIndexes: number[];
  missingTargetGroupIndexes: number[];
  errorTags: NếpEvaluationErrorTag[];
};

export function normalizeNếpResponse(value: string) {
  return value
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' -]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(response: string, signals: string[]) {
  return signals.some((signal) =>
    response.includes(normalizeNếpResponse(signal)),
  );
}

/**
 * Deterministic language-coverage evaluator for the preview slice.
 * It emits only derived target-coverage/error signals. It never scores pronunciation,
 * acoustic quality, fluency, grammar outside the declared targets, or learner identity.
 */
export function evaluateNếpAction(
  action: LessonAction,
  response: string,
): NếpEvaluationResult {
  const normalized = normalizeNếpResponse(response);
  const observedResponse = normalized.length > 0;

  // Choice modality always resolves to a single submitted option — substring
  // matching would false-positive on options that contain the answer text
  // (e.g. picking "category" when the target is "cat"), so it exact-matches
  // regardless of action kind. All registry choice actions are `comprehend`,
  // so this preserves their semantics exactly.
  if (action.kind === "comprehend" || action.modality === "choice") {
    const success = (action.targetSignals ?? []).some(
      (signal) => normalized === normalizeNếpResponse(signal),
    );

    return {
      success,
      evaluator: "nep-evaluator-v2",
      observedResponse,
      matchedTargetGroupIndexes: success ? [0] : [],
      missingTargetGroupIndexes: success ? [] : [0],
      errorTags: success
        ? []
        : observedResponse
          ? ["incorrect-choice", "missing-target-group:0"]
          : ["no-response", "missing-target-group:0"],
    };
  }

  const groups =
    action.requiredSignalGroups ??
    (action.targetSignals && action.targetSignals.length > 0
      ? [action.targetSignals]
      : []);
  const matchedTargetGroupIndexes: number[] = [];
  const missingTargetGroupIndexes: number[] = [];

  groups.forEach((group, index) => {
    if (group.length > 0 && includesAny(normalized, group)) {
      matchedTargetGroupIndexes.push(index);
    } else {
      missingTargetGroupIndexes.push(index);
    }
  });

  const success = groups.length > 0 && missingTargetGroupIndexes.length === 0;
  const errorTags: NếpEvaluationErrorTag[] = [];
  if (!observedResponse) errorTags.push("no-response");
  if (
    matchedTargetGroupIndexes.length > 0 &&
    missingTargetGroupIndexes.length > 0
  ) {
    errorTags.push("partial-target-coverage");
  }
  for (const index of missingTargetGroupIndexes) {
    errorTags.push(`missing-target-group:${index}`);
  }

  return {
    success,
    evaluator: "nep-evaluator-v2",
    observedResponse,
    matchedTargetGroupIndexes,
    missingTargetGroupIndexes,
    errorTags,
  };
}

/** Backward-compatible boolean surface for existing callers/tests. */
export function evaluateNếpActionResponse(
  action: LessonAction,
  response: string,
): boolean {
  return evaluateNếpAction(action, response).success;
}

export function feedbackForNếpEvaluation(
  action: LessonAction,
  result: NếpEvaluationResult,
) {
  if (result.success) {
    if (action.kind === "comprehend") {
      return "Đúng. Bạn đã nhận ra đúng ý định hoặc loại thông tin mà prompt yêu cầu.";
    }
    return "Transcript đáp ứng đủ target language cần cho task. Đây là language/transcript feedback, không phải điểm phát âm.";
  }

  if (!result.observedResponse) {
    if (action.kind === "comprehend") return "Chưa có lựa chọn để đánh giá.";
    return "Chưa quan sát được câu trả lời. Lần này không nên tạo oral mastery evidence.";
  }

  if (action.kind === "comprehend") {
    return "Chưa đúng. Hãy xác định lại ý định hoặc loại thông tin mà prompt đang yêu cầu.";
  }

  if (action.kind === "transfer" || action.kind === "retry") {
    const missingRepair = result.missingTargetGroupIndexes.includes(0);
    const missingIntroduction = result.missingTargetGroupIndexes.includes(1);
    if (missingRepair && missingIntroduction) {
      return "Cần đủ hai phần: xin nhắc lại và tự giới thiệu tên.";
    }
    if (missingRepair) return "Thiếu bước xin nhắc lại trước khi tiếp tục.";
    if (missingIntroduction)
      return "Đã có repair move nhưng còn thiếu phần tự giới thiệu tên.";
  }

  if (action.kind === "repair")
    return "Chưa có repair move cần thiết để xin người đối thoại nhắc lại.";
  if (action.kind === "retrieve" || action.kind === "produce") {
    return "Câu trả lời chưa chứa đủ các cụm cần thiết cho task. Tự sửa rồi thử lại.";
  }

  return "Câu trả lời chưa đáp ứng đủ target language của task. Tự sửa rồi thử lại.";
}
