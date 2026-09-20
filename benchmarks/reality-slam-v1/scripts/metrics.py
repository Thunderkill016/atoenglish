from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Sequence

from sklearn.metrics import f1_score, log_loss, roc_auc_score


@dataclass(frozen=True)
class MetricBundle:
    auc: float
    f1_at_05: float
    log_loss: float
    token_count: int
    positive_count: int
    positive_prevalence: float


def evaluate_binary_probabilities(labels: Sequence[int], probabilities: Sequence[float]) -> MetricBundle:
    if len(labels) != len(probabilities):
        raise ValueError("labels and probabilities must have equal length")
    if not labels:
        raise ValueError("cannot evaluate an empty prediction set")
    if any(label not in {0, 1} for label in labels):
        raise ValueError("labels must be binary 0/1")
    if any(not math.isfinite(probability) or probability < 0.0 or probability > 1.0 for probability in probabilities):
        raise ValueError("probabilities must be finite and within [0, 1]")
    if len(set(labels)) < 2:
        raise ValueError("AUC is undefined when only one class is present")

    hard = [1 if probability >= 0.5 else 0 for probability in probabilities]
    positive_count = sum(labels)
    return MetricBundle(
        auc=float(roc_auc_score(labels, probabilities)),
        f1_at_05=float(f1_score(labels, hard, zero_division=0)),
        log_loss=float(log_loss(labels, probabilities, labels=[0, 1])),
        token_count=len(labels),
        positive_count=positive_count,
        positive_prevalence=positive_count / len(labels),
    )
