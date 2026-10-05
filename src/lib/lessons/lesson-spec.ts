import type { IporPhase } from "@/lib/lessons/learning-flow";
import type { MissionSpecV1 } from "@/lib/missions/mission-spec";

export type CefrLevel = "A0" | "Pre-A1" | "A1" | "A2" | "B1" | "B2" | "IELTS";

export type LessonSkill =
  | "vocabulary"
  | "grammar"
  | "pronunciation"
  | "listening"
  | "reading"
  | "writing"
  | "speaking";

export type LessonQaStatus =
  | "draft"
  | "automated_pass"
  | "pedagogical_review"
  | "pilot"
  | "published";

export interface FeedbackEvidence {
  kind: "answer_match" | "asr_transcript_match" | "rubric" | "reviewer";
  summary: string;
}

export interface FeedbackError {
  code: string;
  messageVi: string;
  correction?: string;
}

export interface FeedbackResult {
  status: "scored" | "unscored" | "unavailable";
  score: number | null;
  source: "deterministic" | "asr_transcript" | "ai" | "human" | "none";
  evidence: FeedbackEvidence[];
  errors: FeedbackError[];
  evaluator: {
    name: string;
    version: string;
  };
}

export interface EvidenceScore {
  id: string;
  score: number | null;
  weight: number;
}

export interface LessonActivity {
  id: string;
  phase: IporPhase;
  skill: LessonSkill;
  promptVi: string;
  input: Record<string, unknown>;
  expected?: {
    answer?: string;
    alternatives?: string[];
  };
  feedback: {
    correctVi: string;
    incorrectVi: string;
    unavailableVi: string;
  };
  srsTargets: string[];
}

export interface LessonAssessment {
  activityIds: string[];
  passThreshold: number;
  canDoEvidence: string[];
}

export interface LessonAsset {
  id: string;
  type: "audio" | "image" | "video";
  path: string;
  transcript?: string;
}

export interface LessonSourceRef {
  id: string;
  title: string;
  url?: string;
  note?: string;
}

export interface VocabItem {
  id: number;
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
  example2?: string;
  collocation?: string;
  audio?: string;
  emoji?: string;
  image_url?: string;
  l1_interference_vn?: string;
  /**
   * True when this word was already taught as target vocabulary in an
   * earlier unit. Review words are recycled deliberately (spaced exposure)
   * but must never be presented to the learner as "new" — the compiled
   * contract renders them under an explicit review label.
   */
  review?: boolean;
}

export interface WarmupCard {
  id: string;
  word: string;
  phonetic?: string | null;
  meaning_vn: string;
  example_en?: string | null;
}

export interface DialogueLine {
  id: string;
  speaker: string;
  text: string;
  translation: string;
}

export interface Dialogue {
  id: number;
  title: string;
  audio: string;
  desc: string;
  lines: DialogueLine[];
}

export interface WarmupGreeting {
  emoji: string;
  en: string;
  vn: string;
  context: string;
}

export interface ListenAndChooseItem {
  id: string;
  audio_text: string;
  options: string[];
  answer: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options?: string[];
  answer: string;
  type: "multiple-choice" | "cloze" | "translate" | "true-false";
  explanation_vn?: string;
}

export interface SpeakingData {
  level1Prompt: string;
  level1Placeholder: string;
  level2Situation: string;
  level2Hint: string;
}

export interface GrammarPoint {
  title: string;
  rule: string;
  conjugation?: Array<{
    subject: string;
    form: string;
    example: string;
  }>;
  examples: Array<{
    en: string;
    vn: string;
  }>;
  tip?: string;
  vnNote?: string;
  dialogueExample?: {
    speaker: string;
    text: string;
    translation: string;
    highlight: string;
  };
  ccq?: {
    question: string;
    options: string[];
    answer: string;
    explanation?: string;
  };
}

export interface PronunciationFocus {
  phoneme: string;
  description: string;
  examples: Array<{
    word: string;
    ipa: string;
    tip: string;
  }>;
  minimalPairs?: Array<[string, string]>;
}

export interface FluencyDrill {
  title?: string;
  timeLimit?: number;
  items: Array<{
    en: string;
    vn: string;
  }>;
}

export interface MatchingPair {
  left: string;
  right: string;
}

export interface MatchingExercise {
  title?: string;
  pairs: MatchingPair[];
}

export interface SentenceScramble {
  id: string;
  prompt_vn: string;
  words: string[];
  answer: string;
}

export interface WordBankQuestion {
  id: string;
  prompt_vn: string;
  words: string[];
  answer: string;
  hint?: string;
}

export interface SentenceCorrectionExercise {
  id: string;
  sentence: string;
  errorWord: string;
  correction: string;
  explanation_vn: string;
  distractors?: string[];
}

export interface ListenArrangeItem {
  id: string;
  audio_text: string;
  prompt_vn: string;
  words: string[];
  answer: string;
}

export interface ReadingQuestion {
  id: string;
  question_vn: string;
  options: string[];
  answer: string;
  explanation_vn?: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  title_vn?: string;
  text: string;
  level: "A0" | "A1" | "A2" | "B1" | "B2";
  questions: ReadingQuestion[];
}

export interface UnitData {
  unitId: string;
  title: string;
  level: string;
  xp: number;
  estimatedTime: number;
  description: string;
  badgeName: string;
  badgeEmoji: string;
  warmupGreetings: WarmupGreeting[];
  culturalNote: string;
  vocab: VocabItem[];
  grammar?: GrammarPoint;
  matchingExercise?: MatchingExercise;
  scrambleExercises?: SentenceScramble[];
  wordBankExercises?: WordBankQuestion[];
  sentenceCorrectionExercises?: SentenceCorrectionExercise[];
  listenAndArrangeExercises?: ListenArrangeItem[];
  practiceQuiz?: QuizQuestion[];
  practiceTranslate?: Array<{ id: string; prompt_vn: string; answer: string }>;
  dialogues: Dialogue[];
  dialogues_list?: Dialogue[];
  listenAndChoose: ListenAndChooseItem[];
  speaking: SpeakingData;
  quiz: QuizQuestion[];
  cumulativeReviewQuestions?: QuizQuestion[];
  situation?: string;
  learningOutcomes?: string[];
  pronunciationFocus?: PronunciationFocus;
  fluencyDrill?: FluencyDrill;
  readingPassage?: ReadingPassage;
  shadowingVideoId?: string;
  jobScenarios?: Array<{
    id: number;
    title: string;
    focus?: string;
    context?: string;
    l1Note?: string;
    example?: string;
  }>;
}

export interface LessonSpecV1 extends UnitData {
  schemaVersion: 1;
  id: string;
  version: number;
  cefr: CefrLevel;
  canDo: string[];
  prerequisites: string[];
  activities: LessonActivity[];
  assessment: LessonAssessment;
  assets: LessonAsset[];
  sourceRefs: LessonSourceRef[];
  qaStatus: LessonQaStatus;
  /** Optional until each legacy lesson has been converted and piloted. */
  mission?: MissionSpecV1;
}

export function unavailableFeedback(
  evaluatorName: string,
  evaluatorVersion: string,
  reasonVi: string,
): FeedbackResult {
  return {
    status: "unavailable",
    score: null,
    source: "none",
    evidence: [],
    errors: [{ code: "assessment_unavailable", messageVi: reasonVi }],
    evaluator: { name: evaluatorName, version: evaluatorVersion },
  };
}

export function combineEvidenceScores(
  scores: EvidenceScore[],
  evaluatorVersion = "1.0.0",
): FeedbackResult {
  const assessed = scores.filter(
    (item): item is EvidenceScore & { score: number } =>
      item.score !== null && Number.isFinite(item.score) && item.weight > 0,
  );
  const totalWeight = assessed.reduce((sum, item) => sum + item.weight, 0);

  if (assessed.length === 0 || totalWeight === 0) {
    return {
      status: "unscored",
      score: null,
      source: "none",
      evidence: [],
      errors: [],
      evaluator: { name: "weighted-evidence", version: evaluatorVersion },
    };
  }

  const score = Math.round(
    assessed.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight,
  );

  return {
    status: "scored",
    score,
    source: "deterministic",
    evidence: assessed.map((item) => ({
      kind: "answer_match",
      summary: `${item.id}:${item.score}`,
    })),
    errors: [],
    evaluator: { name: "weighted-evidence", version: evaluatorVersion },
  };
}
