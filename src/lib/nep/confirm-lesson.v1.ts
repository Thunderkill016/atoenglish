import type { LessonContract } from "./lesson-contract";

const confirmSignals = ["so that's", "you mean", "right"];
const repairSignals = ["could you say that again", "say that again", "sorry"];

/**
 * CAP-004 vertical slice: confirm a short piece of shared information.
 * Follows the same action spine as the first-meeting lesson — a partner detail
 * is shared, checked, recovered once when unclear, then confirmed again when
 * the information changes.
 */
export const confirmUnderstandingLessonV1: LessonContract = {
  id: "LESSON-CAP004-CONFIRM-INFO-V1",
  version: 1,
  capabilityId: "CAP-004",
  embeddedCapabilityIds: ["CAP-003"],
  prerequisites: ["CAP-003"],
  mission: "A colleague tells you a detail about their work — check you heard it correctly, recover once when it is unclear, then confirm again when the detail changes.",
  learnerCanDo: "Confirm a short piece of information and ask for repetition when I need it.",
  newItems: ["So, that's …?", "You mean …?", "Right?", "Sorry?"],
  reviewTargets: ["So, that's …?", "You mean …?", "Right?", "Sorry, could you say that again?"],
  evidenceChannels: ["comprehension", "retrieval", "production", "repair", "transfer", "retention"],
  sourceDerived: {
    principleIds: ["PRN-054", "PRN-058", "PRN-002", "PRN-050", "PRN-016"],
    claimIds: ["CLM-SPK-002", "CLM-SPK-008", "CLM-VOC-005", "CLM-TRN-001", "CLM-SCF-001"],
  },
  productInference: {
    maxNewItems: 4,
    notes: [
      "Confirmation chunks are kept as complete frames; grammar analysis is deferred.",
      "Transcript matching is language feedback only; it is not pronunciation scoring.",
      "Text fallback can demonstrate flow but cannot count as speaking evidence.",
      "Retry after answer-bearing feedback is attempt-only evidence.",
    ],
  },
  actions: [
    {
      id: "context",
      kind: "context",
      title: "A colleague shares one detail about their work",
      instruction: "Listen for the detail you may want to confirm back.",
      modality: "listen",
      model: "I work on the data team.",
      supportVi: "Bối cảnh: đồng nghiệp chia sẻ một thông tin — nhiệm vụ của bạn là xác nhận lại cho chắc.",
    },
    {
      id: "comprehend",
      kind: "comprehend",
      title: "What information did Maya share?",
      instruction: "Choose the information type she just gave you.",
      modality: "choice",
      prompt: "I work on the data team.",
      choices: ["her name", "her team", "the date"],
      supportLadder: ["Đọc kỹ câu của Maya — cô ấy vừa chia sẻ loại thông tin gì?"],
      targetSignals: ["her team"],
      assessment: {
        targetCapabilityId: "CAP-004",
        evidenceType: "recognition",
        contextId: "confirm-info:shared-detail:v1",
        evaluator: "nep-choice-v1",
      },
    },
    {
      id: "notice",
      kind: "notice",
      title: "Keep the frames for checking information",
      instruction: "Notice the confirmation frames; do not open a grammar chapter.",
      modality: "read",
      model: "So, that's …? / You mean …? / Right?",
      revealsAnswer: false,
    },
    {
      id: "retrieve",
      kind: "retrieve",
      title: "Pull the confirmation out before seeing a full answer",
      instruction: "From the Vietnamese cue, say the English confirmation from memory.",
      modality: "speech",
      prompt: "Đội của cô ấy là đội dữ liệu đúng không?",
      supportLadder: [
        "Cụm xác nhận đã xuất hiện ở bước 'Để ý mẫu câu' — nhớ lại cấu trúc rồi nói.",
        "Gợi ý nhịp câu: [cụm hỏi xác nhận] + thông tin vừa nghe.",
      ],
      targetSignals: confirmSignals,
      requiredSignalGroups: [confirmSignals],
      assessment: {
        targetCapabilityId: "CAP-004",
        evidenceType: "retrieval",
        contextId: "confirm-info:vi-cue-confirm:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "produce",
      kind: "produce",
      title: "Confirm the detail aloud",
      instruction: "Say the confirmation aloud. Browser transcript is used only to check target-language coverage.",
      modality: "speech",
      prompt: "I work on the data team.",
      supportLadder: [
        "Bạn vừa nói câu này ở bước Nhớ lại — dùng cùng cụm xác nhận đó.",
      ],
      targetSignals: confirmSignals,
      requiredSignalGroups: [confirmSignals],
      assessment: {
        targetCapabilityId: "CAP-004",
        evidenceType: "production",
        contextId: "confirm-info:shared-detail:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "feedback",
      kind: "feedback",
      title: "Get one actionable language cue",
      instruction: "Feedback identifies missing target language; it does not score pronunciation.",
      modality: "read",
      revealsAnswer: true,
      model: "Try: So, that's the data team?",
    },
    {
      id: "repair",
      kind: "repair",
      title: "Repair the unclear detail",
      instruction: "The last part was unclear. Ask for repetition before confirming.",
      modality: "speech",
      prompt: "[You missed the last part of the sentence.]",
      supportLadder: [
        "Nhiệm vụ: xin người đối thoại nói lại phần chưa rõ.",
        "Gợi ý mở đầu: 'Could you…'",
      ],
      targetSignals: repairSignals,
      requiredSignalGroups: [repairSignals],
      assessment: {
        targetCapabilityId: "CAP-003",
        evidenceType: "repair",
        contextId: "confirm-info:missed-detail:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "retry",
      kind: "retry",
      title: "Retry the check",
      instruction: "Ask for repetition, then confirm the detail you heard.",
      modality: "speech",
      prompt: "Once more — the detail came through unclear, then confirm it.",
      supportLadder: [
        "Cần đủ hai phần: xin nhắc lại trước, rồi xác nhận thông tin.",
      ],
      targetSignals: [...repairSignals, ...confirmSignals],
      requiredSignalGroups: [repairSignals, confirmSignals],
      assessment: {
        targetCapabilityId: "CAP-004",
        evidenceType: null,
        contextId: "confirm-info:repair-confirm-retry:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "Changed situation: the detail itself changes",
      instruction: "This time the information is different and the first part was unclear — repair first, then confirm the new detail.",
      modality: "speech",
      prompt: "Maya corrects you: 'Actually, I work on the design team.' [The correction was unclear at first.]",
      supportLadder: [
        "Thông tin đã đổi — vẫn cần xin nhắc rồi xác nhận chi tiết mới.",
      ],
      targetSignals: [...repairSignals, ...confirmSignals],
      requiredSignalGroups: [repairSignals, confirmSignals],
      changedContext: true,
      assessment: {
        targetCapabilityId: "CAP-004",
        evidenceType: "transfer",
        contextId: "confirm-info:changed-detail:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "reflect",
      kind: "reflect",
      title: "Tự đánh giá cuối buổi",
      instruction: "Chọn mức mô tả đúng nhất — tự đánh giá không có đáp án đúng và không tạo bằng chứng.",
      modality: "choice",
      choices: [
        "Tôi xác nhận được thông tin ngắn và xin nhắc lại khi cần",
        "Tôi làm được nhưng còn chậm",
        "Tôi cần luyện lại buổi này",
      ],
      collectsResponse: true,
    },
  ],
};
