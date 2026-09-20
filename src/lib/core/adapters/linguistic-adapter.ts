export type LinguisticToken = {
  readonly text: string;
  readonly lemma: string;
  readonly pos: string;
  readonly tag: string;
  readonly dep: string;
  readonly headIndex: number;
};

export type GrammarDiagnostic = {
  readonly ruleId: string;
  readonly message: string;
  readonly offset: number;
  readonly length: number;
  readonly replacements: readonly string[];
  readonly category: string;
};

export type LinguisticAnalysisRequest = {
  readonly text: string;
  readonly occurredAt: string;
  readonly language?: string;
  readonly enableGrammarCheck?: boolean;
};

export type LinguisticAnnotationRawPayload = {
  readonly kind: "linguistic-annotation";
  readonly text: string;
  readonly tokens: readonly LinguisticToken[];
  readonly grammarDiagnostics?: readonly GrammarDiagnostic[];
  readonly engine: string;
  readonly occurredAt: string;
};

/** @deprecated Alias for LinguisticAnnotationRawPayload for transition compatibility */
export type LinguisticAnnotationObservation = LinguisticAnnotationRawPayload;

export type LinguisticAdapterResult =
  | { readonly ok: true; readonly payload: LinguisticAnnotationRawPayload; readonly observation?: LinguisticAnnotationRawPayload }
  | { readonly ok: false; readonly error: string; readonly code: "empty-text" | "service-unavailable" | "invalid-timestamp" };

export interface LinguisticAdapterContract {
  readonly engineName: string;
  analyze(request: LinguisticAnalysisRequest): Promise<LinguisticAdapterResult>;
}

export function createMockLinguisticAdapter(
  engineName = "mock-spacy-languagetool"
): LinguisticAdapterContract {
  return {
    engineName,
    async analyze(request: LinguisticAnalysisRequest): Promise<LinguisticAdapterResult> {
      if (!request.occurredAt || typeof request.occurredAt !== "string" || Number.isNaN(Date.parse(request.occurredAt))) {
        return Object.freeze({
          ok: false,
          error: "Valid occurredAt ISO timestamp is required",
          code: "invalid-timestamp",
        });
      }

      if (!request.text || !request.text.trim()) {
        return Object.freeze({
          ok: false,
          error: "Text cannot be empty",
          code: "empty-text",
        });
      }

      const words = request.text.trim().split(/\s+/);
      const tokens: LinguisticToken[] = words.map((w, idx) =>
        Object.freeze({
          text: w,
          lemma: w.toLowerCase(),
          pos: idx === 0 ? "NOUN" : "VERB",
          tag: idx === 0 ? "NN" : "VB",
          dep: idx === 0 ? "nsubj" : "ROOT",
          headIndex: 0,
        })
      );

      const grammarDiagnostics: GrammarDiagnostic[] = [];
      if (request.enableGrammarCheck && request.text.includes("she go")) {
        const offset = request.text.indexOf("she go");
        grammarDiagnostics.push(
          Object.freeze({
            ruleId: "SUBJECT_VERB_AGREEMENT",
            message: "Third person singular requires 'goes'",
            offset,
            length: 6,
            replacements: Object.freeze(["she goes"]),
            category: "Grammar",
          })
        );
      }

      const payload: LinguisticAnnotationRawPayload = Object.freeze({
        kind: "linguistic-annotation",
        text: request.text,
        tokens: Object.freeze(tokens),
        grammarDiagnostics: Object.freeze(grammarDiagnostics),
        engine: engineName,
        occurredAt: request.occurredAt,
      });

      return Object.freeze({
        ok: true,
        payload,
        observation: payload,
      });
    },
  };
}

