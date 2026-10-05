import { UNIT_A0_1_CHECKPOINT } from "@/lib/missions/checkpoint-banks";
import type { MissionSpecV1 } from "@/lib/missions/mission-spec";

export const GOLD_MISSION_01: MissionSpecV1 = {
  schemaVersion: 1,
  id: "mission-meet-new-colleague",
  lessonId: "unit-a0-1",
  titleVi: "Gặp đồng nghiệp mới",
  canDoVi:
    "Trong một cuộc hội thoại ngắn, người học có thể nói tên và công việc, hỏi tên đối phương và yêu cầu nhắc lại khi chưa nghe rõ.",
  estimatedMinutes: 15,
  scenarioVi:
    "Bạn vừa tham gia một cuộc họp online với đồng nghiệp nước ngoài lần đầu. Hai người cần giới thiệu nhanh trước khi bắt đầu công việc.",
  learnerRoleVi: "Nhân viên Việt Nam mới tham gia nhóm.",
  partnerName: "Alex",
  partnerRoleVi: "Đồng nghiệp ở một văn phòng khác.",
  targetChunks: [
    {
      id: "introduce-name",
      english: "Hi, I'm ...",
      vietnamese: "Chào, tôi là ...",
      useWhenVi: "Mở đầu và nói tên của bạn.",
    },
    {
      id: "state-role",
      english: "I work as a ...",
      vietnamese: "Tôi làm ...",
      useWhenVi: "Nói nghề nghiệp hoặc vai trò.",
    },
    {
      id: "ask-name",
      english: "What's your name?",
      vietnamese: "Bạn tên gì?",
      useWhenVi: "Hỏi tên người đối diện.",
    },
    {
      id: "nice-to-meet",
      english: "Nice to meet you.",
      vietnamese: "Rất vui được gặp bạn.",
      useWhenVi: "Phản hồi lịch sự khi gặp lần đầu.",
    },
    {
      id: "repeat",
      english: "Could you say that again?",
      vietnamese: "Bạn có thể nói lại không?",
      useWhenVi: "Bạn không nghe rõ và cần người kia nhắc lại.",
    },
    {
      id: "did-not-catch",
      english: "Sorry, I didn't catch that.",
      vietnamese: "Xin lỗi, tôi chưa nghe rõ.",
      useWhenVi: "Báo hiệu lịch sự rằng bạn chưa hiểu.",
    },
  ],
  intents: [
    {
      id: "introduce_name",
      descriptionVi: "Nói tên của mình.",
      required: true,
      interactional: false,
      examples: ["Hi, I'm Minh.", "My name is Lan."],
      matchers: ["\\b(?:i am|i'm)\\s+[a-z]+", "\\bmy name is\\s+[a-z]+"],
    },
    {
      id: "state_role",
      descriptionVi: "Nói nghề nghiệp hoặc vai trò.",
      required: true,
      interactional: false,
      examples: ["I work as a designer.", "I'm a developer."],
      matchers: [
        "\\bi work as(?: an?| the)?\\s+[a-z]+",
        "\\b(?:i am|i'm)(?: an?)?\\s+(?:designer|developer|engineer|teacher|student|manager|accountant|marketer|salesperson|assistant)\\b",
      ],
    },
    {
      id: "ask_name",
      descriptionVi: "Hỏi tên người đối diện.",
      required: true,
      interactional: true,
      examples: ["What's your name?", "What is your name?"],
      matchers: ["\\bwhat(?:'s| is) your name\\b"],
    },
    {
      id: "repair_request",
      descriptionVi: "Yêu cầu nhắc lại hoặc báo chưa nghe rõ.",
      required: true,
      interactional: true,
      examples: ["Could you say that again?", "Sorry, I didn't catch that."],
      matchers: [
        "\\b(?:could|can) you say (?:that|it) again\\b",
        "\\bi did not catch that\\b",
        "\\bi didn't catch that\\b",
      ],
    },
  ],
  feedbackRules: [
    {
      code: "missing_be_after_my_name",
      pattern: "\\bmy name\\s+[a-z]+\\b",
      suggestion: "My name is Minh.",
      explanationVi: "Tiếng Anh cần động từ 'is' sau 'My name'.",
    },
    {
      code: "missing_work_as",
      pattern:
        "\\bi work\\s+(?:designer|developer|engineer|teacher|student|manager|accountant|marketer|salesperson|assistant)\\b",
      suggestion: "I work as a designer.",
      explanationVi: "Dùng 'work as' trước nghề nghiệp hoặc vai trò.",
    },
  ],
  roleplayTurns: [
    {
      id: "turn-introduction",
      partnerLine: "Hi, welcome to the team. What's your name?",
      partnerLineVi: "Chào, chào mừng bạn đến với nhóm. Bạn tên gì?",
      expectedIntentIds: ["introduce_name"],
      hintVi: "Nói: Hi, I'm ... hoặc My name is ...",
    },
    {
      id: "turn-role",
      partnerLine: "Nice to meet you. What do you do?",
      partnerLineVi: "Rất vui được gặp bạn. Bạn làm công việc gì?",
      expectedIntentIds: ["state_role"],
      hintVi: "Nói vai trò bằng I work as a/an ...",
    },
    {
      id: "turn-ask-name",
      partnerLine: "We will work together on the new project.",
      partnerLineVi: "Chúng ta sẽ làm cùng nhau trong dự án mới.",
      expectedIntentIds: ["ask_name"],
      hintVi: "Bạn vẫn chưa biết tên người đối diện. Hãy hỏi tên họ.",
    },
    {
      id: "turn-repair",
      partnerLine: "I'm Alex from customer success operations.",
      partnerLineVi: "Người đối diện nói tên kèm một cụm dài và khó nghe.",
      expectedIntentIds: ["repair_request"],
      hintVi: "Đừng đoán. Hãy báo chưa nghe rõ hoặc yêu cầu nói lại.",
    },
  ],
  checkpoint: UNIT_A0_1_CHECKPOINT,
  evaluation: {
    requiredIntentPassRatio: 1,
    maxCorrections: 2,
    pronunciationFromTranscript: false,
  },
  retry: {
    requiredAfterFeedback: true,
    maxAttemptsPerSession: 3,
  },
  review: {
    transferAfterDays: [1, 7, 30],
  },
  transferVariants: [
    {
      id: "transfer-day-1-cafe",
      dueAfterDays: 1,
      scenarioVi: "Bạn gặp một thành viên mới của nhóm tại quán cà phê.",
      changedConditions: ["Người đối diện khác", "Không có cuộc họp online"],
      partnerLines: [
        "Hi, I don't think we've met. What's your name?",
        "What do you do on the team?",
        "We may work together next week.",
        "I'm Maya from international partnerships.",
      ],
    },
    {
      id: "transfer-day-7-call",
      dueAfterDays: 7,
      scenarioVi:
        "Bạn tham gia cuộc gọi âm thanh với một đồng nghiệp nói nhanh hơn.",
      changedConditions: [
        "Không nhìn thấy khuôn mặt",
        "Tốc độ nói tự nhiên hơn",
      ],
      partnerLines: [
        "Hello, this is operations. Who am I speaking with?",
        "And what is your role?",
        "I haven't introduced myself yet.",
        "I'm Jordan from regional operations.",
      ],
    },
    {
      id: "transfer-day-30-client",
      dueAfterDays: 30,
      scenarioVi:
        "Bạn gặp một khách hàng lần đầu và phải tự duy trì cuộc nói chuyện.",
      changedConditions: ["Vai trò người đối diện khác", "Không có câu gợi ý"],
      partnerLines: [
        "Good morning. I don't think we've met before. Could you introduce yourself?",
        "What do you do at your company?",
        "You can ask me one question before we begin.",
        "I'm Christopher from procurement.",
      ],
    },
  ],
};
