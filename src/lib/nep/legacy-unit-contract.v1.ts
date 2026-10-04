import {
  legacyUnitEntry,
  legacyUnitSlugs,
} from "../lessons/legacy-unit-registry";
import type { UnitData } from "../lessons/lesson-spec";
import {
  surfaceLeaksTargetSignal,
  type LessonAction,
  type LessonContract,
} from "./lesson-contract";

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
 * - Answer-keyed sections that fit text/choice modality compile to assessed
 *   actions: reading passages, matching pairs, sentence correction, and
 *   word-bank arrange tasks (scramble / wordBank / listenAndArrange).
 * - Oral-only sections (pronunciation focus, fluency drills, shadowing
 *   video) stay omitted: there is no honest speech evaluator in v1.
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
 * `<span class="text-primary">word</span>`). Session envelopes are
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

/**
 * Matching-pair MCQs need wrong-but-plausible options. Distractors are the
 * right-hand values of neighbouring pairs, picked deterministically so the
 * server re-compiles byte-identical contracts.
 */
function matchingDistractors(
  rights: readonly string[],
  selfIndex: number,
): string[] {
  const seen = new Set<string>([
    stripLegacyHtml(rights[selfIndex]).toLowerCase(),
  ]);
  const picked: string[] = [];
  for (let step = 1; step < rights.length && picked.length < 2; step += 1) {
    const candidate = stripLegacyHtml(
      rights[(selfIndex + step) % rights.length],
    );
    if (!seen.has(candidate.toLowerCase())) {
      seen.add(candidate.toLowerCase());
      picked.push(candidate);
    }
  }
  return picked;
}

/** Rotate the correct option's slot so "position 0 = correct" never leaks. */
function insertRotated(
  distractors: readonly string[],
  answer: string,
  slot: number,
): string[] {
  const choices = [...distractors];
  choices.splice(slot % (choices.length + 1), 0, answer);
  return choices;
}

/**
 * Legacy word banks are authored in answer order with distractors appended —
 * displaying them raw would spell out the answer. Alphabetical order is a
 * deterministic scramble independent of the authored sequence.
 */
function displayWordBank(words: readonly string[]): string {
  return [...words]
    .sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }))
    .map(stripLegacyHtml)
    .join(" · ");
}

type WordBankSource = {
  id: string;
  prompt_vn: string;
  words: string[];
  answer: string;
  hint?: string;
};

function compileWordBankActions(
  unitSlug: string,
  capabilityId: string,
  idPrefix: string,
  items: readonly WordBankSource[],
): LessonAction[] {
  return items.map((item) => {
    const answer = stripLegacyHtml(item.answer);
    const hint = item.hint ? stripLegacyHtml(item.hint) : undefined;
    // Some authored hints restate the answer verbatim — only scaffold-below-
    // the-answer hints may surface as support.
    const safeHint =
      hint && !surfaceLeaksTargetSignal(hint, [answer]) ? hint : undefined;
    return {
      id: `${idPrefix}-${item.id}`,
      kind: "retrieve" as const,
      modality: "text" as const,
      title: "Sắp câu",
      instruction:
        "Dùng các từ cho sẵn — có cả từ thừa — sắp thành câu đúng nghĩa rồi gõ lại nguyên câu.",
      prompt: `${stripLegacyHtml(item.prompt_vn)}\nTừ cho sẵn: ${displayWordBank(item.words)}`,
      supportLadder: safeHint ? [safeHint] : undefined,
      targetSignals: [answer],
      assessment: {
        targetCapabilityId: capabilityId,
        evidenceType: "retrieval",
        contextId: `${unitSlug}:arrange:${item.id}`,
        evaluator: "nep-target-signal-v1",
      },
    };
  });
}

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

  for (const [index, scenario] of (unit.jobScenarios ?? []).entries()) {
    actions.push({
      id: `ctx-job-${index + 1}`,
      kind: "context",
      modality: "read",
      title: stripLegacyHtml(scenario.title),
      instruction: "Đọc tình huống — đây là nơi bạn sẽ dùng mẫu câu của bài.",
      model: joinLines([scenario.context, scenario.example, scenario.l1Note]),
    });
  }

  const matchPairs = unit.matchingExercise?.pairs ?? [];
  for (const [index, pair] of matchPairs.entries()) {
    const left = stripLegacyHtml(pair.left);
    const right = stripLegacyHtml(pair.right);
    const distractors = matchingDistractors(
      matchPairs.map((p) => p.right),
      index,
    );
    if (distractors.length === 0) continue;
    actions.push({
      id: `match-${index + 1}`,
      kind: "comprehend",
      modality: "choice",
      title: "Nối nghĩa",
      instruction: "Chọn nghĩa tiếng Việt đúng của từ/cụm bên dưới.",
      prompt: left,
      choices: insertRotated(distractors, right, index),
      targetSignals: [right],
      assessment: {
        targetCapabilityId: capabilityId,
        evidenceType: "recognition",
        contextId: contextId("match", String(index)),
        evaluator: "nep-choice-v1",
      },
    });
  }

  for (const item of unit.sentenceCorrectionExercises ?? []) {
    const sentence = stripLegacyHtml(item.sentence);
    const correction = stripLegacyHtml(item.correction);
    const distractors = (item.distractors ?? []).map(stripLegacyHtml);
    // errorWord is never named: it can contain the correction verbatim
    // (e.g. "more taller" → "taller"), which would leak the answer.
    // explanation_vn restates the correction — never used as support.
    if (distractors.length > 0) {
      actions.push({
        id: `corr-${item.id}`,
        kind: "comprehend",
        modality: "choice",
        title: "Sửa lỗi",
        instruction: "Câu này có một lỗi. Chọn từ/cụm đúng thay cho phần sai.",
        prompt: sentence,
        choices: insertRotated(distractors, correction, item.id.length),
        targetSignals: [correction],
        assessment: {
          targetCapabilityId: capabilityId,
          evidenceType: "recognition",
          contextId: contextId("correction", item.id),
          evaluator: "nep-choice-v1",
        },
      });
    } else {
      actions.push({
        id: `corr-${item.id}`,
        kind: "retrieve",
        modality: "text",
        title: "Sửa lỗi",
        instruction: "Câu này có một lỗi. Gõ từ/cụm đúng thay cho phần sai.",
        prompt: sentence,
        targetSignals: [correction],
        assessment: {
          targetCapabilityId: capabilityId,
          evidenceType: "retrieval",
          contextId: contextId("correction", item.id),
          evaluator: "nep-target-signal-v1",
        },
      });
    }
  }

  const passage = unit.readingPassage;
  if (passage) {
    actions.push({
      id: `ctx-reading-${passage.id}`,
      kind: "context",
      modality: "read",
      title: stripLegacyHtml(passage.title_vn ?? passage.title),
      instruction: "Đọc kỹ đoạn văn — các câu hỏi bên dưới hỏi về đoạn này.",
      prompt: stripLegacyHtml(passage.title),
      model: stripLegacyHtml(passage.text),
    });
    for (const question of passage.questions) {
      actions.push({
        id: `read-${question.id}`,
        kind: "comprehend",
        modality: "choice",
        title: "Đọc hiểu",
        instruction: "Chọn đáp án đúng theo đoạn văn vừa đọc.",
        prompt: stripLegacyHtml(question.question_vn),
        choices: question.options.map(stripLegacyHtml),
        targetSignals: [stripLegacyHtml(question.answer)],
        assessment: {
          targetCapabilityId: capabilityId,
          evidenceType: "recognition",
          contextId: contextId("reading", question.id),
          evaluator: "nep-choice-v1",
        },
      });
    }
  }

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

  // listenAndArrange has no audio in the session runtime — audio_text is the
  // answer, so it is never surfaced; the honest task is arrange-the-bank.
  const arrangeItems: WordBankSource[] = [
    ...(unit.scrambleExercises ?? []),
    ...(unit.listenAndArrangeExercises ?? []).map((item) => ({
      id: item.id,
      prompt_vn: item.prompt_vn,
      words: item.words,
      answer: item.answer,
    })),
    ...(unit.wordBankExercises ?? []),
  ];
  actions.push(
    ...compileWordBankActions(unitSlug, capabilityId, "arr", arrangeItems),
  );

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

  // Typed edges: the registry's `next` links are the authored curriculum
  // order; reverse-lookup gives this unit's prerequisite. Only explicit
  // links are used — no inferred ordering is fabricated.
  const predecessorSlug = legacyUnitSlugs().find(
    (slug) => legacyUnitEntry(slug)?.next === `/learn/${unitSlug}`,
  );

  return {
    id: legacyContractLessonId(unitSlug),
    version: 1,
    capabilityId: `legacy.${unitSlug}`,
    embeddedCapabilityIds: [],
    prerequisites: predecessorSlug
      ? [legacyContractLessonId(predecessorSlug)]
      : [],
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
        "Oral-only sections (pronunciation focus, fluency drills, shadowing video) are omitted honestly: v1 has no speech evaluator.",
        "listenAndArrange audio_text is never surfaced (it is the answer); arrange tasks compile to scaffolded retrieval with an alphabetized word bank.",
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
