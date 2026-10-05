import type { MissionSpecV1 } from "@/lib/missions/mission-spec";

/**
 * Canonical checkpoint question banks — the single authored source for
 * unit checkpoint content. The mission spec embeds this definition, the
 * legacy trial-checkpoint adapter derives from it, and the database's
 * trusted answer keys in `private.unit_checkpoint_definitions` mirror it
 * (checkpoint-parity test enforces the mirror).
 *
 * Server-side consumers may read `answer`/`explanationVi`; learner-facing
 * payloads must strip them — answers are revealed only post-attempt.
 */
export const UNIT_A0_1_CHECKPOINT: MissionSpecV1["checkpoint"] = {
  passThreshold: 4,
  questions: [
    {
      id: "name",
      questionVi: "Câu nào trả lời đúng khi người khác hỏi tên bạn?",
      options: ["I am fine.", "My name is Lan.", "I am ten.", "Good morning."],
      answer: "My name is Lan.",
      explanationVi: "Dùng 'My name is...' hoặc 'I'm...' để nói tên.",
      evidenceIntentIds: ["introduce_name"],
    },
    {
      id: "role",
      questionVi: "Câu nào nói đúng nghề nghiệp?",
      options: [
        "I work designer.",
        "I work as a designer.",
        "I am work designer.",
        "My work at designer.",
      ],
      answer: "I work as a designer.",
      explanationVi: "Dùng 'work as a/an + nghề nghiệp'.",
      evidenceIntentIds: ["state_role"],
    },
    {
      id: "ask-name",
      questionVi: "Bạn chưa biết tên đồng nghiệp. Bạn hỏi thế nào?",
      options: [
        "What is your name?",
        "How much is it?",
        "Where is it?",
        "Are you name?",
      ],
      answer: "What is your name?",
      explanationVi: "'What is your name?' dùng để hỏi tên.",
      evidenceIntentIds: ["ask_name"],
    },
    {
      id: "repair",
      questionVi: "Bạn nên nói gì khi không nghe rõ?",
      options: [
        "Could you say that again?",
        "I work at Ato.",
        "What do you work?",
        "Nice yesterday.",
      ],
      answer: "Could you say that again?",
      explanationVi: "Yêu cầu nhắc lại giúp duy trì hội thoại thay vì đoán.",
      evidenceIntentIds: ["repair_request"],
    },
  ],
};
