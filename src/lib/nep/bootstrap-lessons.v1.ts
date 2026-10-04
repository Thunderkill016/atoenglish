import type { LessonContract } from "./lesson-contract";

const greetingSignals = ["hi", "hello"];
const acknowledgementSignals = ["nice to meet you", "good to meet you"];
const closingSignals = ["see you", "bye", "goodbye"];

/**
 * Small prerequisite lesson that gives a new learner a legitimate path into the adaptive catalog.
 * It is intentionally narrower than the CAP-002 vertical slice: no repair/transfer claims are made.
 */
export const greetCloseLessonV1: LessonContract = {
  id: "LESSON-CAP001-GREET-CLOSE-V1",
  version: 1,
  capabilityId: "CAP-001",
  embeddedCapabilityIds: [],
  prerequisites: [],
  mission: "Meet a colleague, greet them naturally, acknowledge the meeting, and close the short interaction.",
  learnerCanDo: "Start and end a short first interaction without freezing.",
  newItems: ["Hi.", "Nice to meet you.", "See you."],
  reviewTargets: ["Hi.", "Nice to meet you.", "See you."],
  evidenceChannels: ["comprehension", "retrieval", "production", "retention"],
  sourceDerived: {
    principleIds: ["PRN-001", "PRN-002", "PRN-050"],
    claimIds: ["CLM-FND-001", "CLM-SPK-001"],
  },
  productInference: {
    maxNewItems: 4,
    notes: [
      "This bootstrap exists to close the CAP-001 prerequisite gap in the adaptive catalog.",
      "Recognition, retrieval and production remain separate evidence channels.",
      "Transcript matching checks declared language coverage only; it does not score pronunciation.",
    ],
  },
  actions: [
    {
      id: "context",
      kind: "context",
      title: "A colleague greets you at the start of the day",
      instruction: "Listen for the social job of the short exchange.",
      modality: "listen",
      model: "Hi. Nice to meet you.",
      supportVi: "Bối cảnh: gặp đồng nghiệp mới và chào nhau ngắn gọn.",
    },
    {
      id: "comprehend",
      kind: "comprehend",
      title: "What is the colleague doing?",
      instruction: "Choose the social job of the turn.",
      modality: "choice",
      prompt: "Hi. Nice to meet you.",
      choices: ["greeting", "asking for help", "closing"],
      targetSignals: ["greeting"],
      assessment: {
        targetCapabilityId: "CAP-001",
        evidenceType: "recognition",
        contextId: "greet-close:greeting-recognition:v1",
        evaluator: "nep-choice-v1",
      },
    },
    {
      id: "notice",
      kind: "notice",
      title: "Keep three short social chunks",
      instruction: "Notice the chunks as complete moves; no grammar explanation is needed.",
      modality: "read",
      model: "Hi. / Nice to meet you. / See you.",
      revealsAnswer: false,
    },
    {
      id: "retrieve",
      kind: "retrieve",
      title: "Pull the greeting from memory",
      instruction: "From the Vietnamese cue, say the short English greeting and acknowledgement aloud.",
      modality: "speech",
      prompt: "Chào. Rất vui được gặp bạn.",
      supportLadder: [
        "Hai cụm cần nói đều đã xuất hiện ở bước 'Để ý mẫu câu'.",
        "Nhịp: [chào ngắn] + [câu cảm ơn khi gặp].",
      ],
      targetSignals: [...greetingSignals, ...acknowledgementSignals],
      requiredSignalGroups: [greetingSignals, acknowledgementSignals],
      assessment: {
        targetCapabilityId: "CAP-001",
        evidenceType: "retrieval",
        contextId: "greet-close:vi-cue:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "produce",
      kind: "produce",
      title: "Open and close the interaction aloud",
      instruction: "Greet Maya, acknowledge the meeting, then close the short interaction.",
      modality: "speech",
      prompt: "Maya: Hi, I'm Maya. Nice to meet you. [A moment later, you both leave.]",
      supportLadder: [
        "Cần đủ ba phần: chào lại + đáp lời gặp + chào tạm biệt.",
      ],
      targetSignals: [...greetingSignals, ...acknowledgementSignals, ...closingSignals],
      requiredSignalGroups: [greetingSignals, acknowledgementSignals, closingSignals],
      assessment: {
        targetCapabilityId: "CAP-001",
        evidenceType: "production",
        contextId: "greet-close:first-meeting:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "feedback",
      kind: "feedback",
      title: "Check the compact social sequence",
      instruction: "Use this only after attempting retrieval/production.",
      modality: "read",
      revealsAnswer: true,
      model: "Hi. Nice to meet you. See you.",
    },
  ],
};
