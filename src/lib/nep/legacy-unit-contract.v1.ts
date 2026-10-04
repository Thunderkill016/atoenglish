import { legacyUnitEntry } from "../lessons/legacy-unit-registry";
import type { UnitData } from "../lessons/lesson-spec";
import type { LessonAction, LessonContract } from "./lesson-contract";

/**
 * Legacy UnitData → session-contract compiler (Phase 4 wrap adapter).
 *
 * Maps the 44 legacy units onto the canonical Nếp lesson contract so they run
 * inside the zero-path session runtime instead of a parallel presentation
 * runner. Honesty rules:
 *
 * - Presentation-only content compiles to `context`/`notice` actions, which
 *   are never evaluated and mint nothing.
 * - Assessed actions are only compiled when the source data carries a real
 *   answer key (quiz options, translate targets, listen-and-choose answers).
 * - Open-ended speaking prompts stay self-reports (`collectsResponse`, no
 *   assessment) — there is no honest signal evaluator for free production.
 * - Interaction-bound sections (matching, scramble, word-bank, shadowing
 *   video, fluency drills) cannot be represented by the contract UI and are
 *   deliberately omitted rather than approximated.
 * - `sourceDerived` is empty: legacy units have no research trace, and
 *   fabricating principle/claim ids would be dishonest. This is flagged in
 *   `productInference.notes`.
 */

export const LEGACY_CONTRACT_ID_PREFIX = "legacy.";

export function legacyContractLessonId(unitSlug: string): string {
  return `${LEGACY_CONTRACT_ID_PREFIX}${unitSlug}`;
}

export function isLegacyContractLessonId(lessonId: string): boolean {
  return lessonId.startsWith(LEGACY_CONTRACT_ID_PREFIX);
}

/**
 * Legacy UnitData fields carry inline HTML highlight markup meant for
 * `dangerouslySetInnerHTML` in the old template (e.g.
 * `<span class="text-emerald-400">word</span>`). Session envelopes are
 * plain text — tags must be stripped or they render literally.
 */
export function stripLegacyHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function joinLines(parts: Array<string | undefined | null>): string {
  return parts
    .map((part) => (part ? stripLegacyHtml(part) : ""))
    .filter((part) => part.length > 0)
    .join(" · ");
}

const VOCAB_CHUNK_SIZE = 6;

function compileLegacyActions(
  unitSlug: string,
  unit: UnitData,
): LessonAction[] {
  const capabilityId = `legacy.${unitSlug}`;
  const contextId = (kind: string, id: string) => `${unitSlug}:${kind}:${id}`;
  const actions: LessonAction[] = [];

  const warmupText = joinLines(
    unit.warmupGreetings?.map(
      (greeting) => `${greeting.en} — ${greeting.vn}`,
    ) ?? [],
  );
  if (warmupText || unit.culturalNote) {
    actions.push({
      id: "ctx-warmup",
      kind: "context",
      modality: "read",
      title: "Khởi động",
      instruction: "Đọc tình huống và lời chào mẫu trước khi vào bài.",
      prompt: warmupText || undefined,
      model: unit.culturalNote ? stripLegacyHtml(unit.culturalNote) : undefined,
    });
  }

  const vocab = unit.vocab ?? [];
  for (let i = 0; i < vocab.length; i += VOCAB_CHUNK_SIZE) {
    const chunk = vocab.slice(i, i + VOCAB_CHUNK_SIZE);
    actions.push({
      id: `notice-vocab-${i / VOCAB_CHUNK_SIZE + 1}`,
      kind: "notice",
      modality: "read",
      title: "Từ vựng mới",
      instruction:
        "Đọc kỹ từng từ, nghĩa và ví dụ. Đây là từ mục tiêu của bài.",
      model: joinLines(
        chunk.map(
          (item) =>
            `${item.word} — ${item.meaning}${item.example ? ` (${item.example})` : ""}`,
        ),
      ),
    });
  }

  if (unit.grammar) {
    const grammar = unit.grammar;
    actions.push({
      id: "notice-grammar",
      kind: "notice",
      modality: "read",
      title: stripLegacyHtml(grammar.title),
      instruction: "Đọc mẫu câu và quy tắc — không cần ghi nhớ thuật ngữ.",
      prompt: stripLegacyHtml(grammar.rule),
      model: joinLines([
        ...grammar.examples.map((example) => `${example.en} — ${example.vn}`),
        grammar.tip,
      ]),
      supportVi: grammar.vnNote ? stripLegacyHtml(grammar.vnNote) : undefined,
    });
  }

  const dialogues = unit.dialogues.length
    ? unit.dialogues
    : (unit.dialogues_list ?? []);
  dialogues.forEach((dialogue, index) => {
    actions.push({
      id: `ctx-dialogue-${index + 1}`,
      kind: "context",
      modality: "read",
      title: dialogue.title ? stripLegacyHtml(dialogue.title) : "Hội thoại",
      instruction:
        "Đọc hội thoại mẫu — chú ý cách người ta dùng mẫu câu mục tiêu.",
      model: joinLines(
        dialogue.lines.map(
          (line) => `${line.speaker}: ${line.text} (${line.translation})`,
        ),
      ),
    });
  });

  // listenAndChoose items have no audio in the session runtime — presented
  // honestly as reading comprehension, never labeled as listening.
  for (const item of unit.listenAndChoose ?? []) {
    actions.push({
      id: `cmp-${item.id}`,
      kind: "comprehend",
      modality: "choice",
      title: "Đọc hiểu",
      instruction: "Đọc nội dung rồi chọn đáp án đúng.",
      prompt: stripLegacyHtml(item.audio_text),
      choices: item.options.map(stripLegacyHtml),
      targetSignals: [stripLegacyHtml(item.answer)],
      assessment: {
        targetCapabilityId: capabilityId,
        evidenceType: "recognition",
        contextId: contextId("comprehend", item.id),
        evaluator: "nep-choice-v1",
      },
    });
  }

  const quizItems = [
    ...(unit.practiceQuiz ?? []),
    ...(unit.quiz ?? []),
    ...(unit.cumulativeReviewQuestions ?? []),
  ];
  for (const question of quizItems) {
    const isChoice = question.type === "multiple-choice" && question.options;
    actions.push({
      id: `ret-${question.id}`,
      kind: "retrieve",
      modality: isChoice ? "choice" : "text",
      title: "Nhớ lại",
      instruction: isChoice
        ? "Chọn đáp án đúng từ trí nhớ — chưa xem lại từ vựng."
        : "Gõ câu trả lời từ trí nhớ.",
      prompt: stripLegacyHtml(question.question),
      choices: isChoice ? question.options!.map(stripLegacyHtml) : undefined,
      targetSignals: [stripLegacyHtml(question.answer)],
      // explanation_vn is deliberately NOT used as support: it restates the
      // answer, which would break attempt-before-reveal.
      assessment: {
        targetCapabilityId: capabilityId,
        evidenceType: isChoice ? "recognition" : "retrieval",
        contextId: contextId("retrieve", question.id),
        evaluator: isChoice ? "nep-choice-v1" : "nep-target-signal-v1",
      },
    });
  }

  // Written translation compiles to retrieval, not production: the evidence
  // schema classifies production/repair/transfer as oral-only channels
  // (speech modality required). Recall of the written target form is the
  // honest available mapping.
  for (const item of unit.practiceTranslate ?? []) {
    actions.push({
      id: `tr-${item.id}`,
      kind: "retrieve",
      modality: "text",
      title: "Tự dịch",
      instruction:
        "Dịch câu sang tiếng Anh — gõ nguyên câu, không nhìn đáp án.",
      prompt: stripLegacyHtml(item.prompt_vn),
      targetSignals: [stripLegacyHtml(item.answer)],
      assessment: {
        targetCapabilityId: capabilityId,
        evidenceType: "retrieval",
        contextId: contextId("produce", item.id),
        evaluator: "nep-target-signal-v1",
      },
    });
  }

  if (unit.speaking?.level1Prompt) {
    actions.push({
      id: "speak-1",
      kind: "produce",
      modality: "text",
      title: "Nói hoặc viết tự do",
      instruction: stripLegacyHtml(unit.speaking.level1Prompt),
      prompt: unit.speaking.level1Placeholder
        ? stripLegacyHtml(unit.speaking.level1Placeholder)
        : undefined,
      collectsResponse: true,
    });
  }
  if (unit.speaking?.level2Situation) {
    actions.push({
      id: "speak-2",
      kind: "produce",
      modality: "text",
      title: "Tình huống tự do",
      instruction: stripLegacyHtml(unit.speaking.level2Situation),
      supportVi: unit.speaking.level2Hint
        ? stripLegacyHtml(unit.speaking.level2Hint)
        : undefined,
      collectsResponse: true,
    });
  }

  actions.push({
    id: "reflect",
    kind: "reflect",
    modality: "text",
    title: "Tự đánh giá",
    instruction: "Bạn cảm thấy bài này thế nào? Điều gì còn khó?",
    collectsResponse: true,
  });

  return actions;
}

export function compileLegacyUnitContract(
  unitSlug: string,
): LessonContract | null {
  const entry = legacyUnitEntry(unitSlug);
  if (!entry) return null;
  // Mission lessons keep their own runtime — they are already contract-shaped.
  if ("schemaVersion" in entry.data) return null;
  const unit = entry.data as UnitData;

  const actions = compileLegacyActions(unitSlug, unit);
  const hasComprehension = actions.some(
    (action) => action.kind === "comprehend",
  );
  const hasRetrieval = actions.some((action) => action.kind === "retrieve");

  return {
    id: legacyContractLessonId(unitSlug),
    version: 1,
    capabilityId: `legacy.${unitSlug}`,
    embeddedCapabilityIds: [],
    prerequisites: [],
    mission: stripLegacyHtml(unit.title),
    learnerCanDo: stripLegacyHtml(
      unit.learningOutcomes?.[0] ?? unit.description,
    ),
    newItems: (unit.vocab ?? []).map((item) => stripLegacyHtml(item.word)),
    reviewTargets: [],
    evidenceChannels: [
      ...(hasComprehension ? (["comprehension"] as const) : []),
      ...(hasRetrieval ? (["retrieval"] as const) : []),
    ],
    sourceDerived: { principleIds: [], claimIds: [] },
    productInference: {
      maxNewItems: Math.max((unit.vocab ?? []).length, 1),
      notes: [
        "Compiled from legacy UnitData — no research trace.",
        "Interaction-bound sections (matching, scramble, word-bank, sentence-correction, listen-and-arrange, shadowing video, fluency drills) are not representable by the contract runtime and are omitted honestly.",
        "Open-ended speaking prompts stay self-reports: no evaluator can honestly score free production at this level.",
      ],
    },
    actions,
  };
}

/** Resolve a `legacy.<slug>` contract id back to its compiled contract. */
export function resolveLegacyContract(lessonId: string): LessonContract | null {
  if (!isLegacyContractLessonId(lessonId)) return null;
  return compileLegacyUnitContract(
    lessonId.slice(LEGACY_CONTRACT_ID_PREFIX.length),
  );
}
