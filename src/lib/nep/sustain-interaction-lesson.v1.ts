import type { LessonContract } from "./lesson-contract";

const askSignals = ["what's your name", "where are you from", "what do you do"];
const answerSignals = ["i'm from", "i am from", "i live in", "i work in"];
const repairSignals = ["could you say that again", "say that again", "sorry"];
const confirmSignals = ["so that's", "you mean", "right"];
const closeSignals = ["got it", "thanks", "thank you"];

/**
 * CAP-008 capstone: sustain one short interaction end-to-end.
 * One continuous scenario — the learner answers a partner turn, recovers from
 * one breakdown, continues the exchange, and closes it — recycling earlier
 * capabilities instead of introducing a new inventory.
 */
export const sustainInteractionLessonV1: LessonContract = {
  id: "LESSON-CAP008-SUSTAIN-INTERACTION-V1",
  version: 1,
  capabilityId: "CAP-008",
  embeddedCapabilityIds: ["CAP-003", "CAP-004", "CAP-005", "CAP-006"],
  prerequisites: ["CAP-002", "CAP-003", "CAP-004", "CAP-005", "CAP-006", "CAP-007"],
  mission: "At your first class, hold a short exchange with the coordinator: answer a turn, recover from one missed detail, keep the conversation going, and close it.",
  learnerCanDo: "Keep a short conversation going, fix one misunderstanding, and finish it.",
  newItems: ["Got it.", "Thanks."],
  reviewTargets: ["Got it.", "Thanks.", "Sorry, could you say that again?", "So, that's …?"],
  evidenceChannels: ["comprehension", "retrieval", "production", "repair", "transfer", "retention"],
  sourceDerived: {
    principleIds: ["PRN-040", "PRN-045", "PRN-056", "PRN-058", "PRN-002", "PRN-016"],
    claimIds: ["CLM-TRN-001", "CLM-TRN-006", "CLM-SPK-006", "CLM-SPK-008", "CLM-VOC-005", "CLM-SCF-001"],
  },
  productInference: {
    maxNewItems: 4,
    notes: [
      "Most frames are recycled from prerequisite lessons; only closing items are new.",
      "Transcript matching is language feedback only; it is not pronunciation scoring.",
      "Text fallback can demonstrate flow but cannot count as speaking evidence.",
      "Retry after answer-bearing feedback is attempt-only evidence.",
    ],
  },
  actions: [
    {
      id: "context",
      kind: "context",
      title: "First day, first exchange",
      instruction: "Listen to how the coordinator opens the conversation before class.",
      modality: "listen",
      model: "Hi! Welcome to your first class. I'm Anna, the coordinator.",
      supportVi: "Bối cảnh: ngày đầu đến lớp — điều phối viên Anna bắt đầu một cuộc trao đổi ngắn với bạn.",
    },
    {
      id: "comprehend",
      kind: "comprehend",
      title: "Follow the partner's turn",
      instruction: "Choose what Anna asks you in her first turn.",
      modality: "choice",
      prompt: "Before we start — where are you from?",
      choices: ["where you are from", "your class schedule", "your phone number"],
      supportLadder: ["Anna hỏi về loại thông tin nào của bạn?"],
      targetSignals: ["where you are from"],
      assessment: {
        targetCapabilityId: "CAP-006",
        evidenceType: "recognition",
        contextId: "sustain:coordinator-opening:v1",
        evaluator: "nep-choice-v1",
      },
    },
    {
      id: "notice",
      kind: "notice",
      title: "Keep the frames that hold a conversation together",
      instruction: "Notice the repair, confirm and close frames — they are the glue of this exchange.",
      modality: "read",
      model: "Sorry, could you say that again? / So, that's …? / Got it. / Thanks.",
      revealsAnswer: false,
    },
    {
      id: "retrieve",
      kind: "retrieve",
      title: "Pull a reciprocal question out from memory",
      instruction: "From the Vietnamese cue, say the English question from memory.",
      modality: "speech",
      prompt: "Và bạn thì sao — bạn đến từ đâu?",
      supportLadder: [
        "Đây là câu hỏi thông tin bạn đã học — nhớ lại cấu trúc rồi nói.",
        "Gợi ý nhịp câu: từ hỏi + 'are you' + nơi chốn.",
      ],
      targetSignals: askSignals,
      requiredSignalGroups: [askSignals],
      assessment: {
        targetCapabilityId: "CAP-005",
        evidenceType: "retrieval",
        contextId: "sustain:reciprocal-question:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "produce",
      kind: "produce",
      title: "Answer Anna's turn",
      instruction: "Answer her question aloud. Browser transcript is used only to check target-language coverage.",
      modality: "speech",
      prompt: "Anna asks: 'Where are you from?'",
      supportLadder: [
        "Dùng cụm trả lời xuất thân bạn đã học — chủ ngữ + 'from' + nơi chốn.",
      ],
      targetSignals: answerSignals,
      requiredSignalGroups: [answerSignals],
      assessment: {
        targetCapabilityId: "CAP-008",
        evidenceType: "production",
        contextId: "sustain:coordinator-opening:v1",
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
      title: "Repair the missed detail",
      instruction: "Anna said something important but too fast. Ask her to repeat it.",
      modality: "speech",
      prompt: "[Anna tells you the room number very quickly — you missed it.]",
      supportLadder: [
        "Nhiệm vụ: xin Anna nói lại phần chưa rõ.",
        "Gợi ý mở đầu: 'Could you…'",
      ],
      targetSignals: repairSignals,
      requiredSignalGroups: [repairSignals],
      assessment: {
        targetCapabilityId: "CAP-003",
        evidenceType: "repair",
        contextId: "sustain:missed-room:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "retry",
      kind: "retry",
      title: "Recover and keep the exchange going",
      instruction: "Ask Anna to repeat the detail, then confirm what you heard.",
      modality: "speech",
      prompt: "The room number was unclear — ask for a repeat, then confirm it back.",
      supportLadder: [
        "Cần đủ hai phần: xin nhắc lại trước, rồi xác nhận thông tin nghe được.",
      ],
      targetSignals: [...repairSignals, ...confirmSignals],
      requiredSignalGroups: [repairSignals, confirmSignals],
      assessment: {
        targetCapabilityId: "CAP-008",
        evidenceType: null,
        contextId: "sustain:repair-confirm-retry:v1",
        evaluator: "nep-target-signal-v1",
      },
    },
    {
      id: "transfer",
      kind: "transfer",
      title: "Changed situation: a second exchange at reception",
      instruction: "A different staff member asks where you are from, then the exchange must close. Answer and close politely.",
      modality: "speech",
      prompt: "[At reception, another staff member asks: 'And where are you from?' — then the exchange must finish.]",
      supportLadder: [
        "Người và bối cảnh đều mới — vẫn cần hai phần: trả lời xuất thân rồi kết thúc lịch sự.",
      ],
      targetSignals: [...answerSignals, ...closeSignals],
      requiredSignalGroups: [answerSignals, closeSignals],
      changedContext: true,
      assessment: {
        targetCapabilityId: "CAP-008",
        evidenceType: "transfer",
        contextId: "sustain:reception-close:v1",
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
        "Tôi giữ được một cuộc trao đổi ngắn và sửa được khi nghe không rõ",
        "Tôi làm được nhưng còn chậm",
        "Tôi cần luyện lại buổi này",
      ],
      collectsResponse: true,
    },
  ],
};
