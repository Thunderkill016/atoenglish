export type SpeakingTaskCriterionId =
  | "greeting"
  | "identity"
  | "spelling"
  | "personal-info"
  | "repair"
  | "interaction"
  | "closing";

export interface SpeakingInteractionTurn {
  speaker: string;
  text: string;
  goalVi: string;
  /** Optional language scaffold. The learner must explicitly reveal it. */
  hint?: string;
  /** Deterministic transcript used only by test/dev call sites; never evidence by itself. */
  fallback: string;
  /** Transfer is practice in a changed context, not a mastery/proficiency claim. */
  phase?: "guided" | "transfer";
}

export interface SpeakingInteractionCriterion {
  id: SpeakingTaskCriterionId;
  labelVi: string;
  patterns: RegExp[];
}

export interface SpeakingInteractionConfig {
  unitId: string;
  title: string;
  turns: SpeakingInteractionTurn[];
  criteria: SpeakingInteractionCriterion[];
  /** Criteria evaluated only against the authored transfer turn. */
  transferCriteria?: SpeakingInteractionCriterion[];
}

const UNIT_A0_1_INTERACTION: SpeakingInteractionConfig = {
  unitId: "unit-a0-1",
  title: "Episode 1 · Meet Alex",
  turns: [
    {
      speaker: "Alex",
      text: "Hi! I'm Alex. What's your name?",
      goalVi: "Chào Alex và nói tên của bạn.",
      hint: "Hello! My name is Minh.",
      fallback: "Hello! My name is Minh.",
      phase: "guided",
    },
    {
      speaker: "Alex",
      text: "Nice to meet you. How do you spell your name?",
      goalVi: "Đánh vần tên của bạn bằng từng chữ cái.",
      hint: "M-I-N-H.",
      fallback: "M-I-N-H.",
      phase: "guided",
    },
    {
      speaker: "Alex",
      text: "Sorry, what do you do?",
      goalVi: "Giả sử bạn chưa hiểu câu hỏi. Hãy yêu cầu Alex nói lại hoặc nói chậm hơn.",
      hint: "I don't understand. Can you say that again, please?",
      fallback: "I don't understand. Can you say that again, please?",
      phase: "guided",
    },
    {
      speaker: "Alex",
      text: "No problem. Where are you from?",
      goalVi: "Nói bạn đến từ đâu.",
      hint: "I'm from Vietnam.",
      fallback: "I'm from Vietnam.",
      phase: "guided",
    },
    {
      speaker: "Alex",
      text: "Thanks! Nice to meet you.",
      goalVi: "Kết thúc cuộc gặp một cách lịch sự.",
      hint: "Nice to meet you too.",
      fallback: "Nice to meet you too.",
      phase: "guided",
    },
    {
      speaker: "Receptionist",
      text: "Good morning. Can I have your name, please?",
      goalVi: "Chuyển cảnh: không có câu mẫu. Tự chào, nói tên và đánh vần tên cho lễ tân.",
      fallback: "Good morning. My name is Minh. M-I-N-H.",
      phase: "transfer",
    },
  ],
  criteria: [
    {
      id: "greeting",
      labelVi: "Mở đầu bằng lời chào phù hợp.",
      patterns: [/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/],
    },
    {
      id: "identity",
      labelVi: "Tự giới thiệu tên.",
      patterns: [/\bmy name is\b/, /\bi(?:'m| am)\s+(?!from\b)[a-z]+\b/],
    },
    {
      id: "spelling",
      labelVi: "Đánh vần tên bằng ít nhất ba chữ cái tách rời.",
      patterns: [/(?:\b[a-z]\b\s*){3,}/],
    },
    {
      id: "repair",
      labelVi: "Dùng một chiến lược sửa chữa khi chưa hiểu.",
      patterns: [
        /\bi don'?t understand\b/,
        /\b(?:say that again|say it again|repeat(?: that)?|speak more slowly|speak slower)\b/,
      ],
    },
    {
      id: "personal-info",
      labelVi: "Nói bạn đến từ đâu.",
      patterns: [/\bi(?:'m| am) from\b/],
    },
    {
      id: "closing",
      labelVi: "Kết thúc cuộc gặp lịch sự.",
      patterns: [/\b(nice to meet you too|nice meeting you|goodbye|bye|see you|see you later)\b/],
    },
  ],
  transferCriteria: [
    {
      id: "greeting",
      labelVi: "Ở bối cảnh mới, tự mở đầu bằng lời chào phù hợp.",
      patterns: [/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/],
    },
    {
      id: "identity",
      labelVi: "Ở bối cảnh mới, tự nói tên của bạn.",
      patterns: [/\bmy name is\b/, /\bi(?:'m| am)\s+(?!from\b)[a-z]+\b/],
    },
    {
      id: "spelling",
      labelVi: "Ở bối cảnh mới, tự đánh vần tên bằng ít nhất ba chữ cái tách rời.",
      patterns: [/(?:\b[a-z]\b\s*){3,}/],
    },
  ],
};

const LEGACY_UNIT_1_INTERACTION: SpeakingInteractionConfig = {
  unitId: "unit-1",
  title: "Meet Alex",
  turns: [
    {
      speaker: "Alex",
      text: "Hi! I'm Alex. What's your name?",
      goalVi: "Chào Alex và nói tên của bạn.",
      hint: "Hi! My name is Minh.",
      fallback: "Hi! My name is Minh.",
      phase: "guided",
    },
    {
      speaker: "Alex",
      text: "Nice to meet you. Where are you from?",
      goalVi: "Trả lời bạn đến từ đâu.",
      hint: "I'm from Vietnam.",
      fallback: "I'm from Vietnam.",
      phase: "guided",
    },
    {
      speaker: "Alex",
      text: "I'm from Canada. Now ask me how I am.",
      goalVi: "Hỏi thăm Alex bằng một câu đơn giản.",
      hint: "How are you?",
      fallback: "How are you?",
      phase: "guided",
    },
    {
      speaker: "Alex",
      text: "I'm good, thank you! It was nice meeting you.",
      goalVi: "Kết thúc cuộc gặp một cách lịch sự.",
      hint: "Nice meeting you too. Goodbye.",
      fallback: "Nice meeting you too. Goodbye.",
      phase: "guided",
    },
  ],
  criteria: [
    {
      id: "greeting",
      labelVi: "Mở đầu bằng lời chào phù hợp.",
      patterns: [/\b(hi|hello|hey|good morning|good afternoon|good evening)\b/],
    },
    {
      id: "identity",
      labelVi: "Tự giới thiệu tên.",
      patterns: [/\bmy name is\b/, /\bi(?:'m| am)\s+(?!from\b)[a-z]+\b/],
    },
    {
      id: "personal-info",
      labelVi: "Nói ít nhất một thông tin cá nhân đơn giản.",
      patterns: [
        /\bi(?:'m| am) from\b/,
        /\bi (?:live|work|study) (?:in|at)\b/,
        /\bi(?:'m| am) (?:a|an)\s+[a-z]+\b/,
      ],
    },
    {
      id: "interaction",
      labelVi: "Hỏi người đối thoại ít nhất một câu đơn giản.",
      patterns: [
        /\b(where are you from|what(?:'s| is) your name|how are you|and you|how about you|what about you)\b/,
        /\b(?:where|what|how|do|are|can)\b[^?]{0,50}\b(?:you|your)\b\??/,
      ],
    },
    {
      id: "closing",
      labelVi: "Kết thúc cuộc gặp lịch sự.",
      patterns: [/\b(goodbye|bye|see you|see you later|have a nice day|nice meeting you)\b/],
    },
  ],
};

const INTERACTIONS = new Map<string, SpeakingInteractionConfig>([
  [UNIT_A0_1_INTERACTION.unitId, UNIT_A0_1_INTERACTION],
  [LEGACY_UNIT_1_INTERACTION.unitId, LEGACY_UNIT_1_INTERACTION],
]);

export function getSpeakingInteraction(unitId: string): SpeakingInteractionConfig | undefined {
  return INTERACTIONS.get(unitId);
}
