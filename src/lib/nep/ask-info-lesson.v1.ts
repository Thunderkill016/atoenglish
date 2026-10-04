import type { LessonContract } from "./lesson-contract";

const askSignals = ["what's your name", "where are you from", "what do you do"];
const repairSignals = ["could you say that again", "say that again", "sorry"];

/**
 * CAP-005 vertical slice: ask one clear question for basic information.
 * The learner is on the asking side this time — at a welcome desk, eliciting
 * name/origin/work from a partner, then recovering when the answer is unclear.
 */
export const askInformationLessonV1: LessonContract = {
  id: "LESSON-CAP005-ASK-INFO-V1",
  version: 1,
  capabilityId: "CAP-005",
  embeddedCapabilityIds: ["CAP-003"],
  prerequisites: ["CAP-002", "CAP-003"],
  mission: "At a welcome desk, ask a partner simple questions — their name and where they are from — and recover once when you miss the answer.",
  learnerCanDo: "Ask simple questions to get basic personal information.",
  newItems: ["What's your name?", "Where are you from?", "What do you do?", "Sorry?"],
  reviewTargets: ["What's your name?", "Where are you from?", "What do you do?", "Sorry, could you say that again?"],
  evidenceChannels: ["comprehension", "retrieval", "production", "repair", "transfer", "retention"],
  sourceDerived: {
    principleIds: ["PRN-003", "PRN-054", "PRN-001", "PRN-002", "PRN-050"],
    claimIds: ["CLM-VOC-001", "CLM-SPK-007", "CLM-FND-001", "CLM-TRN-001", "CLM-SCF-001"],
  },
  productInference: {
    maxNewItems: 4,
    notes: [
      "Question frames are kept whole; wh-question grammar analysis is deferred.",
      "Transcript matching is language feedback only; it is not pronunciation scoring.",
      "Text fallback can demonstrate flow but cannot count as speaking evidence.",
      "Retry after answer-bearing feedback is attempt-only evidence.",
    ],
  },
  actions: [
    {
      id: "context",
      kind: "context",
      title: "At a welcome desk, you want to know who your partner is",
      instruction: "Listen to the question you will need to ask.",
      modality: "listen",
      model: "What's your name?",
      supportVi: "Bối cảnh: bạn ở quầy đón tiếp, muốn hỏi thông tin của người đối thoại.",
    },
    {
      id: "comprehend",
      kind: "comprehend",
      title: "What does this question ask for?",
      instruction: "Choose the information the question is asking for.",
      modality: "choice",
      prompt: "What's your name?",
      choices: ["asking for a name", "asking for a place", "asking for a time"],
      supportLadder: ["Câu hỏi bắt đầu bằng 'What' — nó hỏi về thông tin gì?"],
      targetSignals: ["asking for a name"],
      assessment: {
        targetCapabilityId: "CAP-005",
        evidenceType: "recognition",
        contextId: "ask-info:question-meaning:v1",
        evaluator: "nep-choice-v1",
      },
    },
    {
      id: "notice",
      kind: "notice",
      title: "Keep the question frames whole",
      instruction: "Notice the question frames; do not open a grammar chapter.",
      modality: "read",
      model: "What's your name? / Where are you from? / What do you do?",
      revealsAnswer: false,
    },
    {
      id: "retrieve",
      kind: "retrieve",
      title: "Pull the question out before seeing a full answer",
      instruction: "From the Vietnamese cue, ask the English question from memory.",
      modality: "speech",
      prompt: "Hỏi tên của người đối thoại.",
      supportLadder: [
        "Cụm câu hỏi đã xuất hiện ở bước 'Để ý mẫu câu' — nhớ lại rồi hỏi.",
        "Gợi ý cấu trúc: What + 's + your + …?",
      ],
      targetSignals: askSignals,
      requiredSignalGroups: [askSignals],
      assessment: {
        targetCapabilityId: "CAP-005",
        evidenceType: "retrieval",
        contextId: "ask-info:vi-cue-question:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "produce",
      kind: "produce",
      title: "Ask the question aloud",
      instruction: "Ask your partner's name aloud. Browser transcript is used only to check target-language coverage.",
      modality: "speech",
      prompt: "You want to know your partner's name.",
      supportLadder: [
        "Bạn vừa hỏi câu này ở bước Nhớ lại — dùng cùng cụm đó.",
      ],
      targetSignals: askSignals,
      requiredSignalGroups: [askSignals],
      assessment: {
        targetCapabilityId: "CAP-005",
        evidenceType: "production",
        contextId: "ask-info:question-meaning:v1",
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
      model: "Try: What's your name?",
    },
    {
      id: "repair",
      kind: "repair",
      title: "You missed the partner's answer",
      instruction: "The reply was too fast to catch. Ask for repetition.",
      modality: "speech",
      prompt: "[Your partner answered too quickly for you to catch.]",
      supportLadder: [
        "Nhiệm vụ: xin người đối thoại nói lại câu trả lời.",
        "Gợi ý mở đầu: 'Could you…'",
      ],
      targetSignals: repairSignals,
      requiredSignalGroups: [repairSignals],
      assessment: {
        targetCapabilityId: "CAP-003",
        evidenceType: "repair",
        contextId: "ask-info:missed-answer:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "retry",
      kind: "retry",
      title: "Retry the exchange",
      instruction: "Ask the question again, then recover the answer you missed.",
      modality: "speech",
      prompt: "Ask for your partner's name — the first answer was unclear, so ask for repetition too.",
      supportLadder: [
        "Cần đủ hai phần: câu hỏi + xin nhắc lại.",
      ],
      targetSignals: [...askSignals, ...repairSignals],
      requiredSignalGroups: [askSignals, repairSignals],
      assessment: {
        targetCapabilityId: "CAP-005",
        evidenceType: null,
        contextId: "ask-info:question-repair-retry:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "Changed situation: a new question, an unclear answer",
      instruction: "This time ask where your partner is from — and their answer is unclear, so repair it.",
      modality: "speech",
      prompt: "At the welcome desk: ask where your partner is from. [Their answer is unclear.]",
      supportLadder: [
        "Câu hỏi đã đổi — vẫn cần hỏi rồi xin nhắc lại.",
      ],
      targetSignals: [...askSignals, ...repairSignals],
      requiredSignalGroups: [askSignals, repairSignals],
      changedContext: true,
      assessment: {
        targetCapabilityId: "CAP-005",
        evidenceType: "transfer",
        contextId: "ask-info:changed-question:v1",
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
        "Tôi hỏi được một câu hỏi đơn giản để lấy thông tin",
        "Tôi làm được nhưng còn chậm",
        "Tôi cần luyện lại buổi này",
      ],
      collectsResponse: true,
    },
  ],
};
