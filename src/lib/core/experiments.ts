export type BinaryDecisionCase = {
  id: string;
  goldPositive: boolean;
  predictedPositive: boolean;
  latencyMs?: number | null;
};

export type BinaryMetrics = {
  sampleSize: number;
  truePositive: number;
  falsePositive: number;
  trueNegative: number;
  falseNegative: number;
  precision: number | null;
  recall: number | null;
  f05: number | null;
  falseDiscoveryRate: number | null;
  falsePositiveRate: number | null;
  p50LatencyMs: number | null;
  p95LatencyMs: number | null;
};

export function evaluateBinaryDecisions(cases: BinaryDecisionCase[]): BinaryMetrics {
  let truePositive = 0;
  let falsePositive = 0;
  let trueNegative = 0;
  let falseNegative = 0;

  for (const item of cases) {
    if (item.goldPositive && item.predictedPositive) truePositive += 1;
    else if (!item.goldPositive && item.predictedPositive) falsePositive += 1;
    else if (!item.goldPositive && !item.predictedPositive) trueNegative += 1;
    else falseNegative += 1;
  }

  const precision = safeRatio(truePositive, truePositive + falsePositive);
  const recall = safeRatio(truePositive, truePositive + falseNegative);
  const falseDiscoveryRate = safeRatio(falsePositive, truePositive + falsePositive);
  const falsePositiveRate = safeRatio(falsePositive, falsePositive + trueNegative);
  const latencies = cases
    .map((item) => item.latencyMs)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0)
    .sort((a, b) => a - b);

  return {
    sampleSize: cases.length,
    truePositive,
    falsePositive,
    trueNegative,
    falseNegative,
    precision,
    recall,
    f05: fBeta(precision, recall, 0.5),
    falseDiscoveryRate,
    falsePositiveRate,
    p50LatencyMs: percentile(latencies, 0.5),
    p95LatencyMs: percentile(latencies, 0.95),
  };
}

export type GecDecisionCase = {
  id: string;
  /** Whether the reference annotation says the sentence contains a correction-worthy error. */
  referenceHasError: boolean;
  /** Whether the system proposed any edit. */
  proposedEdit: boolean;
  /** Human/reference adjudication of the proposed edit; false means over/incorrect correction. */
  proposedEditAccepted: boolean;
  latencyMs?: number | null;
};

export type GecMetrics = {
  sampleSize: number;
  proposalCount: number;
  acceptedEdits: number;
  rejectedEdits: number;
  editPrecision: number | null;
  falseDiscoveryRate: number | null;
  cleanSentenceOvercorrectionRate: number | null;
  missedErrorRate: number | null;
  p50LatencyMs: number | null;
  p95LatencyMs: number | null;
};

/**
 * Evaluation harness for Experiment 2. It deliberately distinguishes "model proposed an edit"
 * from "the edit was accepted by the reference/human adjudicator" so a rewrite cannot receive
 * credit merely for noticing that a sentence was imperfect.
 */
export function evaluateGecDecisions(cases: GecDecisionCase[]): GecMetrics {
  const proposals = cases.filter((item) => item.proposedEdit);
  const acceptedEdits = proposals.filter((item) => item.proposedEditAccepted).length;
  const rejectedEdits = proposals.length - acceptedEdits;
  const cleanCases = cases.filter((item) => !item.referenceHasError);
  const cleanOvercorrections = cleanCases.filter((item) => item.proposedEdit).length;
  const errorCases = cases.filter((item) => item.referenceHasError);
  const missedErrors = errorCases.filter(
    (item) => !item.proposedEdit || !item.proposedEditAccepted,
  ).length;
  const latencies = cases
    .map((item) => item.latencyMs)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0)
    .sort((a, b) => a - b);

  return {
    sampleSize: cases.length,
    proposalCount: proposals.length,
    acceptedEdits,
    rejectedEdits,
    editPrecision: safeRatio(acceptedEdits, proposals.length),
    falseDiscoveryRate: safeRatio(rejectedEdits, proposals.length),
    cleanSentenceOvercorrectionRate: safeRatio(cleanOvercorrections, cleanCases.length),
    missedErrorRate: safeRatio(missedErrors, errorCases.length),
    p50LatencyMs: percentile(latencies, 0.5),
    p95LatencyMs: percentile(latencies, 0.95),
  };
}

export function passesPronunciationPromotionGate(metrics: BinaryMetrics): boolean {
  return (
    metrics.precision !== null &&
    metrics.precision >= 0.9 &&
    metrics.recall !== null &&
    metrics.recall >= 0.6 &&
    metrics.sampleSize >= 100
  );
}

export function passesGecPromotionGate(metrics: GecMetrics): boolean {
  return (
    metrics.falseDiscoveryRate !== null &&
    metrics.falseDiscoveryRate <= 0.02 &&
    metrics.cleanSentenceOvercorrectionRate !== null &&
    metrics.cleanSentenceOvercorrectionRate <= 0.02 &&
    metrics.p95LatencyMs !== null &&
    metrics.p95LatencyMs < 100
  );
}

function safeRatio(numerator: number, denominator: number): number | null {
  return denominator > 0 ? numerator / denominator : null;
}

function fBeta(precision: number | null, recall: number | null, beta: number): number | null {
  if (precision === null || recall === null) return null;
  if (precision === 0 && recall === 0) return 0;
  const betaSquared = beta * beta;
  return ((1 + betaSquared) * precision * recall) / (betaSquared * precision + recall);
}

function percentile(sortedValues: number[], percentileValue: number): number | null {
  if (sortedValues.length === 0) return null;
  const index = Math.ceil(percentileValue * sortedValues.length) - 1;
  return sortedValues[Math.max(0, Math.min(sortedValues.length - 1, index))] ?? null;
}
