import type { LessonContract } from "./lesson-contract";

const answerSignals = ["i'm from", "i am from", "i live in", "i work in"];
const repairSignals = ["could you say that again", "say that again", "sorry"];

/**
 * CAP-006 vertical slice: give a short relevant answer about yourself.
 * The mirror of CAP-005 — the partner asks, the learner answers, then
 * recovers once when the question is hard to catch.
 */
export const answerInformationLessonV1: LessonContract = {
  id: "LESSON-CAP006-ANSWER-INFO-V1",
  version: 1,
  capabilityId: "CAP-006",
  embeddedCapabilityIds: ["CAP-003"],
  prerequisites: ["CAP-002", "CAP-005"],
  mission: "A partner asks where you are from — give a short clear answer, recover once when the question is hard to catch, then answer a different question at a visa counter.",
  learnerCanDo: "Give a short relevant answer about myself.",
  newItems: ["I'm …", "I'm from …", "I work in …", "Sorry?"],
  reviewTargets: ["I'm …", "I'm from …", "I work in …", "Sorry, could you say that again?"],
  evidenceChannels: ["comprehension", "retrieval", "production", "repair", "transfer", "retention"],
  sourceDerived: {
    principleIds: ["PRN-003", "PRN-054", "PRN-001", "PRN-002", "PRN-050"],
    claimIds: ["CLM-VOC-001", "CLM-SPK-002", "CLM-FND-001", "CLM-TRN-001", "CLM-SCF-001"],
  },
  productInference: {
    maxNewItems: 4,
    notes: [
      "Answer frames are kept whole; be-verb agreement analysis is deferred.",
      "Transcript matching is language feedback only; it is not pronunciation scoring.",
      "Text fallback can demonstrate flow but cannot count as speaking evidence.",
      "Retry after answer-bearing feedback is attempt-only evidence.",
    ],
  },
  actions: [
    {
      id: "context",
      kind: "context",
      title: "A partner asks where you are from",
      instruction: "Listen to the question you will need to answer.",
      modality: "listen",
      model: "Where are you from?",
      supportVi: "Bối cảnh: người đối thoại hỏi quê quán của bạn — bạn cần trả lời ngắn gọn.",
    },
    {
      id: "comprehend",
      kind: "comprehend",
      title: "What does this question ask for?",
      instruction: "Choose the information the question is asking for.",
      modality: "choice",
      prompt: "Where are you from?",
      choices: ["your origin", "your name", "the time"],
      supportLadder: ["Câu hỏi bắt đầu bằng 'Where' — nó hỏi về thông tin gì?"],
      targetSignals: ["your origin"],
      assessment: {
        targetCapabilityId: "CAP-006",
        evidenceType: "recognition",
        contextId: "answer-info:question-meaning:v1",
        evaluator: "nep-choice-v1",
      },
    },
    {
      id: "notice",
      kind: "notice",
      title: "Keep the answer frames whole",
      instruction: "Notice the answer frames; do not open a grammar chapter.",
      modality: "read",
      model: "I'm … / I'm from … / I work in …",
      revealsAnswer: false,
    },
    {
      id: "retrieve",
      kind: "retrieve",
      title: "Pull the answer out before seeing a full answer",
      instruction: "From the Vietnamese cue, say the English answer from memory.",
      modality: "speech",
      prompt: "Tôi đến từ Việt Nam.",
      supportLadder: [
        "Cụm trả lời đã xuất hiện ở bước 'Để ý mẫu câu' — nhớ lại rồi nói.",
        "Gợi ý cấu trúc: [cụm mở đầu câu trả lời] + [nơi chốn].",
      ],
      targetSignals: answerSignals,
      requiredSignalGroups: [answerSignals],
      assessment: {
        targetCapabilityId: "CAP-006",
        evidenceType: "retrieval",
        contextId: "answer-info:vi-cue-answer:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "produce",
      kind: "produce",
      title: "Answer the question aloud",
      instruction: "Say your answer aloud. Browser transcript is used only to check target-language coverage.",
      modality: "speech",
      prompt: "Where are you from?",
      supportLadder: [
        "Bạn vừa trả lời câu này ở bước Nhớ lại — dùng cùng cụm đó.",
      ],
      targetSignals: answerSignals,
      requiredSignalGroups: [answerSignals],
      assessment: {
        targetCapabilityId: "CAP-006",
        evidenceType: "production",
        contextId: "answer-info:question-meaning:v1",
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
      model: "Try: I'm from Vietnam.",
    },
    {
      id: "repair",
      kind: "repair",
      title: "You did not catch the question",
      instruction: "The question was hard to catch. Ask for repetition before answering.",
      modality: "speech",
      prompt: "[Your partner's question was too fast to catch.]",
      supportLadder: [
        "Nhiệm vụ: xin người đối thoại nói lại câu hỏi.",
        "Gợi ý mở đầu: 'Could you…'",
      ],
      targetSignals: repairSignals,
      requiredSignalGroups: [repairSignals],
      assessment: {
        targetCapabilityId: "CAP-003",
        evidenceType: "repair",
        contextId: "answer-info:missed-question:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "retry",
      kind: "retry",
      title: "Retry the exchange",
      instruction: "Ask for repetition, then give your answer.",
      modality: "speech",
      prompt: "The question came through unclear — ask for repetition, then answer where you are from.",
      supportLadder: [
        "Cần đủ hai phần: xin nhắc lại trước, rồi trả lời.",
      ],
      targetSignals: [...repairSignals, ...answerSignals],
      requiredSignalGroups: [repairSignals, answerSignals],
      assessment: {
        targetCapabilityId: "CAP-006",
        evidenceType: null,
        contextId: "answer-info:repair-answer-retry:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "Changed situation: a visa counter, a different question",
      instruction: "This time the officer asks what you do — the question was hard to catch, so repair it then answer.",
      modality: "speech",
      prompt: "At a visa counter, the officer asks: 'What do you do?' [The question was hard to catch.]",
      supportLadder: [
        "Câu hỏi đã đổi — vẫn cần xin nhắc rồi trả lời ngắn gọn.",
      ],
      targetSignals: [...repairSignals, ...answerSignals],
      requiredSignalGroups: [repairSignals, answerSignals],
      changedContext: true,
      assessment: {
        targetCapabilityId: "CAP-006",
        evidenceType: "transfer",
        contextId: "answer-info:changed-question:v1",
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
        "Tôi trả lời được một câu hỏi đơn giản về bản thân",
        "Tôi làm được nhưng còn chậm",
        "Tôi cần luyện lại buổi này",
      ],
      collectsResponse: true,
    },
  ],
};
