export type Irt2PlItem = {
  id: string;
  difficulty: number;
  discrimination: number;
};

export type IrtResponse = {
  item: Irt2PlItem;
  correct: boolean;
};

export type ThetaEstimate = {
  theta: number;
  posteriorSd: number;
  responseCount: number;
  method: "eap-grid-2pl";
};

const LOGISTIC_NORMAL_SCALING = 1.702;

/** Reference 2PL probability. This is a measurement utility, not a mastery policy. */
export function probabilityCorrect2Pl(theta: number, item: Irt2PlItem): number {
  if (!Number.isFinite(theta)) throw new Error("theta must be finite");
  if (!Number.isFinite(item.difficulty)) throw new Error("difficulty must be finite");
  if (!Number.isFinite(item.discrimination) || item.discrimination <= 0) {
    throw new Error("discrimination must be finite and > 0");
  }

  const logit = LOGISTIC_NORMAL_SCALING * item.discrimination * (theta - item.difficulty);
  if (logit >= 0) {
    const expNegative = Math.exp(-logit);
    return 1 / (1 + expNegative);
  }
  const expPositive = Math.exp(logit);
  return expPositive / (1 + expPositive);
}

export function itemInformation2Pl(theta: number, item: Irt2PlItem): number {
  const probability = probabilityCorrect2Pl(theta, item);
  const slope = LOGISTIC_NORMAL_SCALING * item.discrimination;
  return slope * slope * probability * (1 - probability);
}

/**
 * Small deterministic EAP estimator for offline/core tests and bounded CAT prototypes.
 * Production assessment still requires item calibration, fit/invariance checks and a frozen
 * population-specific benchmark before this estimate may affect learner authority.
 */
export function estimateThetaEap(
  responses: IrtResponse[],
  options: {
    minTheta?: number;
    maxTheta?: number;
    step?: number;
    priorMean?: number;
    priorSd?: number;
  } = {},
): ThetaEstimate {
  const minTheta = options.minTheta ?? -4;
  const maxTheta = options.maxTheta ?? 4;
  const step = options.step ?? 0.05;
  const priorMean = options.priorMean ?? 0;
  const priorSd = options.priorSd ?? 1;

  if (!(minTheta < maxTheta)) throw new Error("minTheta must be < maxTheta");
  if (!Number.isFinite(step) || step <= 0) throw new Error("step must be > 0");
  if (!Number.isFinite(priorSd) || priorSd <= 0) throw new Error("priorSd must be > 0");

  const grid: Array<{ theta: number; logPosterior: number }> = [];
  for (let theta = minTheta; theta <= maxTheta + step / 2; theta += step) {
    let logPosterior = gaussianLogDensity(theta, priorMean, priorSd);
    for (const response of responses) {
      const probability = clampProbability(probabilityCorrect2Pl(theta, response.item));
      logPosterior += response.correct ? Math.log(probability) : Math.log(1 - probability);
    }
    grid.push({ theta, logPosterior });
  }

  const maxLogPosterior = Math.max(...grid.map((point) => point.logPosterior));
  const weighted = grid.map((point) => ({
    theta: point.theta,
    weight: Math.exp(point.logPosterior - maxLogPosterior),
  }));
  const totalWeight = weighted.reduce((sum, point) => sum + point.weight, 0);
  const theta = weighted.reduce((sum, point) => sum + point.theta * point.weight, 0) / totalWeight;
  const variance =
    weighted.reduce((sum, point) => sum + (point.theta - theta) ** 2 * point.weight, 0) /
    totalWeight;

  return {
    theta,
    posteriorSd: Math.sqrt(Math.max(0, variance)),
    responseCount: responses.length,
    method: "eap-grid-2pl",
  };
}

function gaussianLogDensity(value: number, mean: number, sd: number): number {
  const z = (value - mean) / sd;
  return -0.5 * z * z - Math.log(sd) - 0.5 * Math.log(2 * Math.PI);
}

function clampProbability(value: number): number {
  return Math.min(1 - 1e-12, Math.max(1e-12, value));
}
