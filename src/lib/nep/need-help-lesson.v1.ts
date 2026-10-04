import type { LessonContract } from "./lesson-contract";

const needSignals = ["i need", "i can't", "i cant"];
const helpSignals = ["can you help", "help me"];
const repairSignals = ["could you say that again", "say that again", "sorry"];

/**
 * CAP-007 vertical slice: state an immediate need and request help.
 * Same action spine as the earlier lessons — the learner states a need at a
 * help desk, recovers once when the reply is unclear, then reuses the frames
 * when the situation changes.
 */
export const needHelpLessonV1: LessonContract = {
  id: "LESSON-CAP007-NEED-HELP-V1",
  version: 1,
  capabilityId: "CAP-007",
  embeddedCapabilityIds: ["CAP-003"],
  prerequisites: ["CAP-003", "CAP-006"],
  mission: "You are at the help desk of your new school. State what you need, recover once when the reply is unclear, then do it again in a different situation.",
  learnerCanDo: "State what I need and ask for help in a simple exchange.",
  newItems: ["I need …", "I can't …", "Can you help me?"],
  reviewTargets: ["I need …", "I can't …", "Can you help me?"],
  evidenceChannels: ["comprehension", "retrieval", "production", "repair", "transfer", "retention"],
  sourceDerived: {
    principleIds: ["PRN-050", "PRN-054", "PRN-058", "PRN-002", "PRN-016"],
    claimIds: ["CLM-SPK-001", "CLM-SPK-002", "CLM-SPK-008", "CLM-TRN-001", "CLM-SCF-001", "CLM-VOC-005"],
  },
  productInference: {
    maxNewItems: 4,
    notes: [
      "Need/request chunks are kept as complete frames; grammar analysis is deferred.",
      "Transcript matching is language feedback only; it is not pronunciation scoring.",
      "Text fallback can demonstrate flow but cannot count as speaking evidence.",
      "Retry after answer-bearing feedback is attempt-only evidence.",
    ],
  },
  actions: [
    {
      id: "context",
      kind: "context",
      title: "First day at a new school",
      instruction: "Listen to how the staff member opens the conversation.",
      modality: "listen",
      model: "Good morning! How can I help you today?",
      supportVi: "Bối cảnh: ngày đầu ở trường mới, bạn đứng trước quầy hỗ trợ học viên.",
    },
    {
      id: "comprehend",
      kind: "comprehend",
      title: "What does the staff member want to know?",
      instruction: "Choose what the staff member is asking you for.",
      modality: "choice",
      prompt: "Good morning! How can I help you today?",
      choices: ["what you need", "your home address", "your class schedule"],
      supportLadder: ["Câu mở của nhân viên là lời mời bạn nói điều gì?"],
      targetSignals: ["what you need"],
      assessment: {
        targetCapabilityId: "CAP-007",
        evidenceType: "recognition",
        contextId: "need-help:desk-opening:v1",
        evaluator: "nep-choice-v1",
      },
    },
    {
      id: "notice",
      kind: "notice",
      title: "Keep the frames for stating a need",
      instruction: "Notice the need and request frames; do not open a grammar chapter.",
      modality: "read",
      model: "I need … / I can't … / Can you help me?",
      revealsAnswer: false,
    },
    {
      id: "retrieve",
      kind: "retrieve",
      title: "Pull the need-statement out before seeing a full answer",
      instruction: "From the Vietnamese cue, say the English sentence from memory.",
      modality: "speech",
      prompt: "Tôi cần thẻ học viên.",
      supportLadder: [
        "Cụm nói nhu cầu đã xuất hiện ở bước 'Để ý mẫu câu' — nhớ lại cấu trúc rồi nói.",
        "Gợi ý nhịp câu: chủ ngữ + động từ 'cần' + vật bạn cần.",
      ],
      targetSignals: needSignals,
      requiredSignalGroups: [needSignals],
      assessment: {
        targetCapabilityId: "CAP-007",
        evidenceType: "retrieval",
        contextId: "need-help:vi-cue-need:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "produce",
      kind: "produce",
      title: "State your need at the desk",
      instruction: "Tell the staff member what you need. Browser transcript is used only to check target-language coverage.",
      modality: "speech",
      prompt: "The staff member waits: 'Yes?'",
      supportLadder: [
        "Bạn vừa nói câu này ở bước Nhớ lại — dùng cùng cụm nhu cầu đó.",
      ],
      targetSignals: [...needSignals, ...helpSignals],
      requiredSignalGroups: [[...needSignals, ...helpSignals]],
      assessment: {
        targetCapabilityId: "CAP-007",
        evidenceType: "production",
        contextId: "need-help:desk-opening:v1",
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
      model: "Try: I need a student card, please.",
    },
    {
      id: "repair",
      kind: "repair",
      title: "Repair the unclear reply",
      instruction: "The staff member's reply was unclear. Ask them to repeat it.",
      modality: "speech",
      prompt: "[The staff member answers quickly — you did not catch it.]",
      supportLadder: [
        "Nhiệm vụ: xin người đối thoại nói lại phần chưa rõ.",
        "Gợi ý mở đầu: 'Could you…'",
      ],
      targetSignals: repairSignals,
      requiredSignalGroups: [repairSignals],
      assessment: {
        targetCapabilityId: "CAP-003",
        evidenceType: "repair",
        contextId: "need-help:unclear-reply:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "retry",
      kind: "retry",
      title: "Retry the exchange",
      instruction: "Ask the staff member to repeat, then state your need once more.",
      modality: "speech",
      prompt: "The reply was unclear — ask for a repeat, then say what you need again.",
      supportLadder: [
        "Cần đủ hai phần: xin nhắc lại trước, rồi nói lại nhu cầu của bạn.",
      ],
      targetSignals: [...repairSignals, ...needSignals],
      requiredSignalGroups: [repairSignals, needSignals],
      assessment: {
        targetCapabilityId: "CAP-007",
        evidenceType: null,
        contextId: "need-help:repair-need-retry:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "Changed situation: a different problem in the street",
      instruction: "New situation — you cannot find the station. State the problem and ask for help.",
      modality: "speech",
      prompt: "[A stranger stops and offers directions.]",
      supportLadder: [
        "Tình huống đã đổi — vẫn cần hai phần: nêu vấn đề rồi nhờ giúp.",
      ],
      targetSignals: [...needSignals, ...helpSignals],
      requiredSignalGroups: [needSignals, helpSignals],
      changedContext: true,
      assessment: {
        targetCapabilityId: "CAP-007",
        evidenceType: "transfer",
        contextId: "need-help:street-directions:v1",
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
        "Tôi nêu được nhu cầu và nhờ giúp đỡ",
        "Tôi làm được nhưng còn chậm",
        "Tôi cần luyện lại buổi này",
      ],
      collectsResponse: true,
    },
  ],
};
