export type AcousticFormants = {
  f1Hz: number | null;
  f2Hz: number | null;
  f3Hz: number | null;
};

export type PhonemeAlignmentDetail = {
  expectedPhoneme: string;
  observedPhoneme: string | null;
  startTimeSec: number;
  endTimeSec: number;
  durationMs: number;
  /** Provider/model-specific log-likelihood or GOP-family score. Never assumed comparable across models. */
  acousticScore: number | null;
  confidence: number | null;
  operation: "match" | "substitution" | "deletion" | "insertion";
  articulatoryFeatures?: {
    expected: string[];
    observed: string[];
  };
  formants?: AcousticFormants;
};

export type AcousticDiagnosticPayload = {
  kind: "acoustic";
  utteranceDurationSec: number;
  speechDurationSec: number;
  snrDb: number | null;
  clippingDetected: boolean;
  articulationRateSyllablesPerSec: number | null;
  pairwiseVariabilityIndex: number | null;
  voiceOnsetLatencyMs: number | null;
  phonemeAlignments: PhonemeAlignmentDetail[];
  suspectedFinalConsonantDeletions: string[];
  epentheticVowelDetected: boolean | null;
};

export const GRAMMATICAL_ERROR_CATEGORIES = [
  "VERB:TENSE",
  "VERB:SVA",
  "NOUN:NUM",
  "MORPH:COPULA",
  "DET:ART",
  "PREP:COLL",
  "SYNTAX:TOPIC",
  "OTHER",
] as const;

export type GrammaticalErrorCategory = (typeof GRAMMATICAL_ERROR_CATEGORIES)[number];

export type GrammaticalErrorDetail = {
  startTokenIndex: number;
  endTokenIndex: number;
  originalText: string;
  correctedText: string;
  errorCategory: GrammaticalErrorCategory;
  confidence: number | null;
  /** Hypothesis only until independently validated on Vietnamese-English learner data. */
  l1TransferHypothesis: boolean;
};

export type SyntaxDiagnosticPayload = {
  kind: "syntax";
  tokens: string[];
  lemmas: string[];
  posTags: string[];
  dependencies: Array<{
    id: number;
    head: number;
    deprel: string;
  }>;
  detectedErrors: GrammaticalErrorDetail[];
  syntacticComplexity: Record<string, number>;
};

export type LexicalDiagnosticPayload = {
  kind: "lexical";
  lemma: string;
  frequencyZipf: number | null;
  collocations: Array<{
    expression: string;
    logDice: number | null;
    corpusId: string;
  }>;
};

export type ComprehensionDiagnosticPayload = {
  kind: "comprehension";
  taskId: string;
  responseCorrect: boolean | null;
  responseLatencyMs: number | null;
  supportLevel: number;
  targetedConstructs: string[];
};

export type ControlledResponseDiagnosticPayload = {
  kind: "controlled-response";
  taskId: string;
  observedResponse: boolean;
  responseCorrect: boolean | null;
  matchedTargetIds: string[];
  missingTargetIds: string[];
  /** Raw learner text is transient evaluator input and never enters this payload. */
  evaluatorRuleId: string;
};

export type DiscoursePragmaticDiagnosticPayload = {
  kind: "discourse-pragmatic";
  speechActs: string[];
  cohesionFeatures: Record<string, number>;
  appropriatenessFlags: Array<{
    code: string;
    confidence: number | null;
  }>;
};

/**
 * Only explicitly modeled diagnostic payloads may cross the core boundary.
 * New model families must add a new discriminated member instead of falling back to unknown maps.
 */
export type DiagnosticPayload =
  | AcousticDiagnosticPayload
  | SyntaxDiagnosticPayload
  | LexicalDiagnosticPayload
  | ComprehensionDiagnosticPayload
  | ControlledResponseDiagnosticPayload
  | DiscoursePragmaticDiagnosticPayload;
