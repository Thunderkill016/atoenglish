export type BktModelParameters = {
  readonly pInit: number; // P(L0)
  readonly pTransit: number; // P(T)
  readonly pGuess: number; // P(G)
  readonly pSlip: number; // P(S)
  readonly pForget?: number; // P(F) default 0
};

export type BktStepRawPayload = {
  readonly kind: "bkt-comparator";
  readonly constructId: string;
  readonly priorMastery: number;
  readonly posteriorMastery: number;
  readonly pNextState: number;
  readonly predictedCorrectProbability: number;
  readonly correct: boolean;
  readonly parameters: BktModelParameters;
  readonly engine: string;
  readonly occurredAt: string;
};

/** @deprecated Alias for BktStepRawPayload for transition compatibility */
export type BktStepObservation = BktStepRawPayload;

export type BktStepRequest = {
  readonly constructId: string;
  readonly priorMastery: number;
  readonly correct: boolean;
  readonly occurredAt: string;
  readonly params?: Partial<BktModelParameters>;
};

export type BktForwardResult = {
  readonly posteriorMastery: number;
  readonly pNextState: number;
  readonly predictedCorrectProbability: number;
};

export function computeBktForwardStep(
  priorMastery: number,
  correct: boolean,
  params: BktModelParameters
): BktForwardResult {
  const pL = Math.min(1, Math.max(0, priorMastery));
  const pT = Math.min(1, Math.max(0, params.pTransit));
  const pG = Math.min(0.99, Math.max(0.01, params.pGuess));
  const pS = Math.min(0.99, Math.max(0.01, params.pSlip));
  const pF = Math.min(1, Math.max(0, params.pForget ?? 0));

  // P(C) = P(L) * (1 - S) + (1 - P(L)) * G
  const pCorrect = pL * (1 - pS) + (1 - pL) * pG;

  let posterior: number;
  if (correct) {
    // P(L | correct) = (P(L) * (1 - S)) / P(C)
    posterior = (pL * (1 - pS)) / Math.max(1e-9, pCorrect);
  } else {
    // P(L | incorrect) = (P(L) * S) / (1 - P(C))
    const pIncorrect = 1 - pCorrect;
    posterior = (pL * pS) / Math.max(1e-9, pIncorrect);
  }

  posterior = Math.min(1, Math.max(0, posterior));

  // P(L_{t+1}) = P(L_t | obs) * (1 - F) + (1 - P(L_t | obs)) * T
  const pNextState = Math.min(1, Math.max(0, posterior * (1 - pF) + (1 - posterior) * pT));

  return Object.freeze({
    posteriorMastery: posterior,
    pNextState,
    predictedCorrectProbability: pCorrect,
  });
}

export interface BktAdapterContract {
  readonly engineName: string;
  step(
    constructId: string,
    priorMastery: number,
    correct: boolean,
    occurredAt: string,
    params?: Partial<BktModelParameters>
  ): BktStepRawPayload;
  step(request: BktStepRequest): BktStepRawPayload;
}

export function createBktBaselineComparator(
  defaultParams: BktModelParameters = {
    pInit: 0.1,
    pTransit: 0.2,
    pGuess: 0.25,
    pSlip: 0.1,
    pForget: 0.0,
  },
  engineName = "pybkt-reference"
): BktAdapterContract {
  return {
    engineName,
    step(
      constructIdOrRequest: string | BktStepRequest,
      priorMasteryArg?: number,
      correctArg?: boolean,
      occurredAtArg?: string,
      paramsOverrideArg?: Partial<BktModelParameters>
    ): BktStepRawPayload {
      let constructId: string;
      let priorMastery: number;
      let correct: boolean;
      let occurredAt: string;
      let paramsOverride: Partial<BktModelParameters> | undefined;

      if (typeof constructIdOrRequest === "object" && constructIdOrRequest !== null) {
        constructId = constructIdOrRequest.constructId;
        priorMastery = constructIdOrRequest.priorMastery;
        correct = constructIdOrRequest.correct;
        occurredAt = constructIdOrRequest.occurredAt;
        paramsOverride = constructIdOrRequest.params;
      } else {
        constructId = constructIdOrRequest;
        priorMastery = priorMasteryArg!;
        correct = correctArg!;
        occurredAt = occurredAtArg!;
        paramsOverride = paramsOverrideArg;
      }

      if (!occurredAt || typeof occurredAt !== "string" || Number.isNaN(Date.parse(occurredAt))) {
        throw new Error("Valid occurredAt ISO timestamp is required for BKT step");
      }

      const mergedParams: BktModelParameters = Object.freeze({
        ...defaultParams,
        ...paramsOverride,
      });

      const forward = computeBktForwardStep(priorMastery, correct, mergedParams);

      return Object.freeze({
        kind: "bkt-comparator",
        constructId,
        priorMastery,
        posteriorMastery: forward.posteriorMastery,
        pNextState: forward.pNextState,
        predictedCorrectProbability: forward.predictedCorrectProbability,
        correct,
        parameters: mergedParams,
        engine: engineName,
        occurredAt,
      });
    },
  };
}

