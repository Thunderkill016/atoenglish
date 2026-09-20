from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Mapping, Sequence

import numpy as np
from sklearn.metrics import roc_auc_score

LOG_LOSS_EPSILON = 1e-15
CALIBRATION_BIN_COUNT = 5


@dataclass(frozen=True)
class CalibrationBin:
    lower: float
    upper: float
    count: int
    mean_probability: float | None
    observed_error_rate: float | None


@dataclass(frozen=True)
class BinaryMetricBundle:
    row_count: int
    positive_count: int
    log_loss: float
    brier: float
    auc: float | None
    auc_unavailable_reason: str | None
    clipped_probability_count: int
    calibration_bins: tuple[CalibrationBin, ...]


@dataclass(frozen=True)
class RowOutcomeBinding:
    row_id: str
    participant_id: str
    label: int


@dataclass(frozen=True)
class LearnerMetricBundle:
    learner_count: int
    learner_with_outcome_count: int
    planned_learner_ids: tuple[str, ...]
    planned_row_count: int
    planned_row_ids: tuple[str, ...] | None
    observed_row_count: int
    observed_row_bindings: tuple[RowOutcomeBinding, ...] | None
    learner_outcome_coverage: float | None
    row_outcome_coverage: float | None
    mean_per_learner_log_loss: float | None
    mean_per_learner_brier: float | None
    attempt_weighted: BinaryMetricBundle | None
    by_learner: Mapping[str, BinaryMetricBundle]


def _validate(labels: Sequence[int], probabilities: Sequence[float]) -> None:
    if len(labels) != len(probabilities):
        raise ValueError("labels and probabilities must have equal length")
    if any(label not in {0, 1} for label in labels):
        raise ValueError("labels must be binary 0/1")
    for probability in probabilities:
        if not math.isfinite(probability) or probability < 0.0 or probability > 1.0:
            raise ValueError("probabilities must be finite and within [0, 1]")


def _validate_row_ids(row_ids: Sequence[str], field: str) -> tuple[str, ...]:
    normalized = tuple(str(row_id).strip() for row_id in row_ids)
    if any(not row_id for row_id in normalized):
        raise ValueError(f"{field} must contain only non-empty row ids")
    if len(set(normalized)) != len(normalized):
        raise ValueError(f"{field} must contain unique row ids")
    return normalized


def evaluate_binary_probabilities(
    labels: Sequence[int], probabilities: Sequence[float]
) -> BinaryMetricBundle:
    _validate(labels, probabilities)
    if not labels:
        raise ValueError("cannot evaluate an empty prediction set")

    label_array = np.asarray(labels, dtype=np.int64)
    probability_array = np.asarray(probabilities, dtype=np.float64)
    clipped = np.clip(probability_array, LOG_LOSS_EPSILON, 1.0 - LOG_LOSS_EPSILON)
    clipped_probability_count = int(np.count_nonzero(clipped != probability_array))
    row_losses = -(label_array * np.log(clipped) + (1 - label_array) * np.log(1 - clipped))
    row_brier = np.square(probability_array - label_array)

    if len(set(labels)) < 2:
        auc = None
        auc_reason = "one-class-subset"
    else:
        auc = float(roc_auc_score(label_array, probability_array))
        auc_reason = None

    bins: list[CalibrationBin] = []
    for bin_index in range(CALIBRATION_BIN_COUNT):
        lower = bin_index / CALIBRATION_BIN_COUNT
        upper = (bin_index + 1) / CALIBRATION_BIN_COUNT
        if bin_index == CALIBRATION_BIN_COUNT - 1:
            mask = (probability_array >= lower) & (probability_array <= upper)
        else:
            mask = (probability_array >= lower) & (probability_array < upper)
        count = int(np.count_nonzero(mask))
        bins.append(
            CalibrationBin(
                lower=lower,
                upper=upper,
                count=count,
                mean_probability=float(np.mean(probability_array[mask])) if count else None,
                observed_error_rate=float(np.mean(label_array[mask])) if count else None,
            )
        )

    return BinaryMetricBundle(
        row_count=len(labels),
        positive_count=int(np.sum(label_array)),
        log_loss=float(np.mean(row_losses)),
        brier=float(np.mean(row_brier)),
        auc=auc,
        auc_unavailable_reason=auc_reason,
        clipped_probability_count=clipped_probability_count,
        calibration_bins=tuple(bins),
    )


def evaluate_by_learner(
    participant_ids: Sequence[str],
    labels: Sequence[int],
    probabilities: Sequence[float],
    *,
    row_ids: Sequence[str] | None = None,
    planned_learner_ids: Sequence[str] | None = None,
    planned_row_count: int | None = None,
    planned_row_ids: Sequence[str] | None = None,
) -> LearnerMetricBundle:
    if not (len(participant_ids) == len(labels) == len(probabilities)):
        raise ValueError("participant_ids, labels and probabilities must have equal length")
    if row_ids is not None and len(row_ids) != len(labels):
        raise ValueError("row_ids, labels and probabilities must have equal length")
    _validate(labels, probabilities)

    normalized_row_ids = _validate_row_ids(row_ids, "row_ids") if row_ids is not None else None
    normalized_planned_row_ids = (
        _validate_row_ids(planned_row_ids, "planned_row_ids")
        if planned_row_ids is not None
        else None
    )

    grouped: dict[str, tuple[list[int], list[float]]] = {}
    for participant_id, label, probability in zip(participant_ids, labels, probabilities, strict=True):
        learner_labels, learner_probabilities = grouped.setdefault(participant_id, ([], []))
        learner_labels.append(label)
        learner_probabilities.append(probability)

    planned_learners = (
        set(planned_learner_ids) if planned_learner_ids is not None else set(grouped)
    )
    unexpected_learners = set(grouped) - planned_learners
    if unexpected_learners:
        raise ValueError(
            f"observed outcomes include learners outside the frozen plan: {sorted(unexpected_learners)}"
        )

    if normalized_planned_row_ids is not None:
        resolved_planned_row_count = len(normalized_planned_row_ids)
        if planned_row_count is not None and planned_row_count != resolved_planned_row_count:
            raise ValueError("planned_row_count must equal the number of planned_row_ids")
    else:
        resolved_planned_row_count = len(labels) if planned_row_count is None else planned_row_count

    if resolved_planned_row_count < 0:
        raise ValueError("planned_row_count must be nonnegative")
    if len(labels) > resolved_planned_row_count:
        raise ValueError("observed outcome rows cannot exceed planned_row_count")

    observed_row_bindings: tuple[RowOutcomeBinding, ...] | None = None
    if normalized_row_ids is not None:
        if normalized_planned_row_ids is not None:
            planned_row_id_set = set(normalized_planned_row_ids)
            unexpected_rows = set(normalized_row_ids) - planned_row_id_set
            if unexpected_rows:
                raise ValueError(
                    f"observed outcomes include rows outside the frozen plan: {sorted(unexpected_rows)}"
                )
        observed_row_bindings = tuple(
            sorted(
                (
                    RowOutcomeBinding(
                        row_id=row_id,
                        participant_id=participant_id,
                        label=label,
                    )
                    for row_id, participant_id, label in zip(
                        normalized_row_ids, participant_ids, labels, strict=True
                    )
                ),
                key=lambda binding: binding.row_id,
            )
        )

    by_learner = {
        participant_id: evaluate_binary_probabilities(learner_labels, learner_probabilities)
        for participant_id, (learner_labels, learner_probabilities) in sorted(grouped.items())
    }
    planned_learner_tuple = tuple(sorted(planned_learners))
    learner_count = len(planned_learner_tuple)

    if by_learner:
        mean_log_loss = float(np.mean([bundle.log_loss for bundle in by_learner.values()]))
        mean_brier = float(np.mean([bundle.brier for bundle in by_learner.values()]))
        attempt_weighted = evaluate_binary_probabilities(labels, probabilities)
    else:
        mean_log_loss = None
        mean_brier = None
        attempt_weighted = None

    learner_coverage = len(by_learner) / learner_count if learner_count > 0 else None
    row_coverage = (
        len(labels) / resolved_planned_row_count
        if resolved_planned_row_count > 0
        else None
    )

    return LearnerMetricBundle(
        learner_count=learner_count,
        learner_with_outcome_count=len(by_learner),
        planned_learner_ids=planned_learner_tuple,
        planned_row_count=resolved_planned_row_count,
        planned_row_ids=(
            tuple(sorted(normalized_planned_row_ids))
            if normalized_planned_row_ids is not None
            else None
        ),
        observed_row_count=len(labels),
        observed_row_bindings=observed_row_bindings,
        learner_outcome_coverage=learner_coverage,
        row_outcome_coverage=row_coverage,
        mean_per_learner_log_loss=mean_log_loss,
        mean_per_learner_brier=mean_brier,
        attempt_weighted=attempt_weighted,
        by_learner=by_learner,
    )


@dataclass(frozen=True)
class Interval:
    lower: float
    upper: float


@dataclass(frozen=True)
class PairedContrastInterval:
    learner_count: int
    log_loss: Interval | None
    brier: Interval | None
    descriptive_log_loss_difference: float | None
    descriptive_brier_difference: float | None


def _assert_paired_metric_alignment(
    target: LearnerMetricBundle,
    control: LearnerMetricBundle,
    control_name: str,
) -> None:
    if target.planned_learner_ids != control.planned_learner_ids:
        raise ValueError(
            f"paired comparison requires identical planned learners: {control_name}"
        )
    if target.planned_row_count != control.planned_row_count:
        raise ValueError(
            f"paired comparison requires identical planned row count: {control_name}"
        )
    if target.planned_row_ids is None or control.planned_row_ids is None:
        raise ValueError(
            f"paired comparison requires explicit frozen planned row ids: {control_name}"
        )
    if target.planned_row_ids != control.planned_row_ids:
        raise ValueError(
            f"paired comparison requires identical planned row ids: {control_name}"
        )
    if target.observed_row_count != control.observed_row_count:
        raise ValueError(
            f"paired comparison refuses complete-case row selection: {control_name}"
        )
    if target.observed_row_bindings is None or control.observed_row_bindings is None:
        raise ValueError(
            f"paired comparison requires explicit observed row ids: {control_name}"
        )
    if target.observed_row_bindings != control.observed_row_bindings:
        raise ValueError(
            f"paired comparison requires identical observed row identity, learner and label bindings: {control_name}"
        )

    target_ids = set(target.by_learner)
    control_ids = set(control.by_learner)
    if target_ids != control_ids:
        raise ValueError(
            f"paired comparison refuses complete-case learner selection: {control_name}"
        )

    for learner_id in sorted(target_ids):
        target_metric = target.by_learner[learner_id]
        control_metric = control.by_learner[learner_id]
        if target_metric.row_count != control_metric.row_count:
            raise ValueError(
                f"paired comparison requires identical rows per learner: {control_name}:{learner_id}"
            )
        if target_metric.positive_count != control_metric.positive_count:
            raise ValueError(
                f"paired comparison requires identical labels per learner: {control_name}:{learner_id}"
            )


def paired_learner_bootstrap(
    target: LearnerMetricBundle,
    controls: Mapping[str, LearnerMetricBundle],
    *,
    draws: int = 2000,
    seed: int = 143,
) -> Mapping[str, PairedContrastInterval]:
    if draws <= 0:
        raise ValueError("draws must be positive")

    control_names = tuple(sorted(controls))
    for name in control_names:
        _assert_paired_metric_alignment(target, controls[name], name)

    learner_ids = tuple(sorted(target.by_learner))
    if not learner_ids:
        return {
            name: PairedContrastInterval(0, None, None, None, None)
            for name in control_names
        }

    descriptive: dict[str, tuple[np.ndarray, np.ndarray]] = {}
    for name in control_names:
        control = controls[name]
        log_differences = np.asarray(
            [target.by_learner[learner_id].log_loss - control.by_learner[learner_id].log_loss for learner_id in learner_ids],
            dtype=np.float64,
        )
        brier_differences = np.asarray(
            [target.by_learner[learner_id].brier - control.by_learner[learner_id].brier for learner_id in learner_ids],
            dtype=np.float64,
        )
        descriptive[name] = (log_differences, brier_differences)

    if len(learner_ids) < 2:
        return {
            name: PairedContrastInterval(
                learner_count=1,
                log_loss=None,
                brier=None,
                descriptive_log_loss_difference=float(np.mean(values[0])),
                descriptive_brier_difference=float(np.mean(values[1])),
            )
            for name, values in descriptive.items()
        }

    rng = np.random.default_rng(seed)
    sampled_indices = rng.integers(0, len(learner_ids), size=(draws, len(learner_ids)))
    result: dict[str, PairedContrastInterval] = {}

    for name, (log_differences, brier_differences) in descriptive.items():
        boot_log = np.mean(log_differences[sampled_indices], axis=1)
        boot_brier = np.mean(brier_differences[sampled_indices], axis=1)
        log_lower, log_upper = np.percentile(boot_log, [2.5, 97.5])
        brier_lower, brier_upper = np.percentile(boot_brier, [2.5, 97.5])
        result[name] = PairedContrastInterval(
            learner_count=len(learner_ids),
            log_loss=Interval(float(log_lower), float(log_upper)),
            brier=Interval(float(brier_lower), float(brier_upper)),
            descriptive_log_loss_difference=float(np.mean(log_differences)),
            descriptive_brier_difference=float(np.mean(brier_differences)),
        )

    return result
